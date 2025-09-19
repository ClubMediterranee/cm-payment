export default function (schema) {
  Object.values(schema.paths).forEach((path) => {
    Object.values(path).forEach((operation) => {
      if (operation.parameters) {
        operation.parameters = operation.parameters.filter(
          (param) => param.name !== "api_key"
        );
      }
    });
  });

  return schema;
}
