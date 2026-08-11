exports.health = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "admitbridge-server",
  });
};
