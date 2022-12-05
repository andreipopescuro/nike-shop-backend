const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_PAS, (err, response) => {
      if (err) {
        res.status(403).json("Token is not valid");
      } else {
        req.response = response;
        next();
      }
    });
  } else {
    return res.status(401).json("You are not authentificated");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (
      req.response.id === req.params.id ||
      req.response.id === req.params.userId ||
      req.response.isAdmin
    ) {
      next();
    } else {
      res.status(403).json("Not allowed");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.response.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
