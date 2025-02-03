const issuers = ["gm", "go", "partners"];

export const getParams = () => {
  const [issuer, type, id, locale = "fr-FR"] = new URL(
    window.location.href
  ).pathname
    .split("/")
    .filter(Boolean);

  return {
    issuer: issuers.includes(issuer) ? issuer : "gm",
    type,
    id,
    locale,
  };
};
