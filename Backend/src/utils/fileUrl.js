exports.buildFileUrl = (req, path) => {
  if (!path) return null;

  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}${path}`;
};
