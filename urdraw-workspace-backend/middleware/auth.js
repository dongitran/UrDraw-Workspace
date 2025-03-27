const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (decoded.payload.exp && decoded.payload.exp < now) {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    req.user = {
      id: decoded.payload.sub,
      username: decoded.payload.preferred_username,
      email: decoded.payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = {
  verifyToken,
};
