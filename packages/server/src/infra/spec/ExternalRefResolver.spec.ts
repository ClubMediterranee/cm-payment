import { ExternalRefResolver } from './ExternalRefResolver.js';

const clearCache = () => {
  (ExternalRefResolver as any).cache.clear();
};

describe('ExternalRefResolver', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  it('returns the spec untouched when no http $ref is found', async () => {
    const spec = {
      paths: { '/foo': { get: { responses: { 200: { $ref: '#/components/schemas/Foo' } } } } },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(result).toBe(spec);
  });

  it('inlines an external schema and rewrites the $ref to a local one', async () => {
    const external = {
      components: {
        schemas: {
          Foo: { type: 'object', properties: { id: { type: 'string' } } },
        },
      },
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => external,
    } as Response);

    const spec: any = {
      paths: {
        '/foo': {
          get: {
            responses: { 200: { $ref: 'http://api.example.com/spec#/components/schemas/Foo' } },
          },
        },
      },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(fetchSpy).toHaveBeenCalledWith('http://api.example.com/spec');
    expect(result.components.schemas.Foo).toEqual(external.components.schemas.Foo);
    expect(result.paths['/foo'].get.responses[200].$ref).toBe('#/components/schemas/Foo');
  });

  it('recursively resolves transitive local refs found in the external schema', async () => {
    const external = {
      components: {
        schemas: {
          Foo: { type: 'object', properties: { bar: { $ref: '#/components/schemas/Bar' } } },
          Bar: { type: 'string' },
        },
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => external,
    } as Response);

    const spec: any = {
      definitions: { Ref: { $ref: 'http://api.example.com/spec#/components/schemas/Foo' } },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(result.components.schemas.Foo).toBeDefined();
    expect(result.components.schemas.Bar).toEqual({ type: 'string' });
  });

  it('caches external fetches across calls', async () => {
    const external = { components: { schemas: { Foo: { type: 'string' } } } };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => external,
    } as Response);

    await ExternalRefResolver.resolve({
      a: { $ref: 'http://api.example.com/spec#/components/schemas/Foo' },
    });
    await ExternalRefResolver.resolve({
      b: { $ref: 'http://api.example.com/spec#/components/schemas/Foo' },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('skips a url when the fetch responds with a non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    const spec: any = {
      a: { $ref: 'http://api.example.com/missing#/components/schemas/Foo' },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(result.components?.schemas?.Foo).toBeUndefined();
  });

  it('skips a url when fetch throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));

    const spec: any = {
      a: { $ref: 'http://api.example.com/down#/components/schemas/Foo' },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(result.components?.schemas?.Foo).toBeUndefined();
  });

  it('does not overwrite an existing local schema with the same name', async () => {
    const external = {
      components: {
        schemas: {
          Foo: { type: 'object', properties: { external: { type: 'string' } } },
        },
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => external,
    } as Response);

    const existing = { type: 'string', description: 'pre-existing' };
    const spec: any = {
      components: { schemas: { Foo: existing } },
      ref: { $ref: 'http://api.example.com/spec#/components/schemas/Foo' },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(result.components.schemas.Foo).toEqual(existing);
  });

  it('skips refs whose path does not exist in the external document', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ components: { schemas: {} } }),
    } as Response);

    const spec: any = {
      a: { $ref: 'http://api.example.com/spec#/components/schemas/Missing' },
    };

    const result = await ExternalRefResolver.resolve(spec);

    expect(result.components?.schemas?.Missing).toBeUndefined();
  });
});
