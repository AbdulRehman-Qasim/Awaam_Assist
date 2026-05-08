const checkAdminToken = (req, res, next) => {
  // Authentication removed - allow all requests
  next();
};

module.exports = checkAdminToken;