const findSchemaRefs = (node) => {
  const refs = JSON.stringify(node).match(/#\/components\/schemas\/[^"]+/g) ?? [];
  return refs.map((ref) => ref.replace('#/components/schemas/', ''));
};

const keepReferencedSchemas = (schemas, paths, extraSchemas) => {
  const reached = new Set();
  const toVisit = [...findSchemaRefs(paths), ...extraSchemas];

  while (toVisit.length) {
    const name = toVisit.pop();
    if (reached.has(name) || !schemas[name]) continue;
    reached.add(name);
    toVisit.push(...findSchemaRefs(schemas[name]));
  }

  return Object.fromEntries(Object.entries(schemas).filter(([name]) => reached.has(name)));
};

const filterPaths = (schemaPaths, endpoints, pathPrefix) => {
  const paths = {};

  Object.entries(schemaPaths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (!endpoints.includes(`${method.toUpperCase()} ${path}`)) return;

      const targetPath = `${pathPrefix}${path}`;
      paths[targetPath] = paths[targetPath] || {};
      paths[targetPath][method] = operation;

      if (operation.parameters) {
        operation.parameters = operation.parameters.filter((param) => param.name !== 'api_key');
      }
    });
  });

  return paths;
};

export const createTransformer = ({
  endpoints,
  pathPrefix = '',
  overrideSchemas = (schemas) => schemas,
  extraSchemas = [],
}) => {
  return (schema) => {
    const paths = filterPaths(schema.paths, endpoints, pathPrefix);
    const schemas = overrideSchemas(schema.components.schemas);

    return {
      ...schema,
      components: {
        ...schema.components,
        schemas: keepReferencedSchemas(schemas, paths, extraSchemas),
      },
      paths,
    };
  };
};
