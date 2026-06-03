export class ExternalRefResolver {
  private static cache = new Map<string, any>();

  static async resolve(spec: any): Promise<any> {
    const refs = this.findRefs(spec, 'http');
    if (refs.size === 0) return spec;

    const byUrl = new Map<string, string[]>();
    for (const ref of refs) {
      const [url, path] = ref.split('#');
      if (!byUrl.has(url)) byUrl.set(url, []);
      byUrl.get(url)!.push(`#${path}`);
    }

    for (const [url, paths] of byUrl) {
      const external = await this.fetch(url);
      if (!external) continue;

      for (const path of paths) {
        this.inject(spec, this.extract(external, path.slice(1)));
      }
    }

    this.replace(spec);
    return spec;
  }

  private static findRefs(obj: any, prefix: string, refs = new Set<string>()): Set<string> {
    if (typeof obj !== 'object' || !obj) return refs;
    if (obj.$ref?.startsWith(prefix)) refs.add(obj.$ref);
    for (const key in obj) this.findRefs(obj[key], prefix, refs);
    return refs;
  }

  private static async fetch(url: string): Promise<any | null> {
    if (this.cache.has(url)) return this.cache.get(url);
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      this.cache.set(url, data);
      return data;
    } catch {
      return null;
    }
  }

  private static extract(
    external: any,
    path: string,
    result = new Map<string, any>(),
  ): Map<string, any> {
    const name = path.split('/').pop()!;
    if (result.has(name)) return result;

    const schema = path
      .split('/')
      .filter(Boolean)
      .reduce((acc, k) => acc?.[k], external);
    if (!schema) return result;

    result.set(name, schema);

    for (const ref of this.findRefs(schema, '#')) {
      if (ref.startsWith('#/components/schemas/')) {
        this.extract(external, ref.slice(1), result);
      }
    }

    return result;
  }

  private static inject(spec: any, schemas: Map<string, any>): void {
    spec.components ||= {};
    spec.components.schemas ||= {};
    for (const [name, schema] of schemas) {
      spec.components.schemas[name] ||= schema;
    }
  }

  private static replace(obj: any): void {
    if (typeof obj !== 'object' || !obj) return;
    if (obj.$ref?.startsWith('http')) {
      obj.$ref = `#/components/schemas/${obj.$ref.split('/').pop()}`;
    }
    for (const key in obj) this.replace(obj[key]);
  }
}
