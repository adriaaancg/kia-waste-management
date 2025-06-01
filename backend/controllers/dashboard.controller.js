exports.getDashboard = (req, res) => {
  res.json({
    message: "Dashboard data accessible",
    user: req.user
  });
};