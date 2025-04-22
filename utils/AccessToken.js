const jwt = require("jsonwebtoken");

const secret = process.env.ADMIN_SECRET_KEY || "secret_key"; 

const GenerateAdminToken = (email) => {
  const token = jwt.sign({ data: email }, secret, { expiresIn: "1d" });
  return token;
};


const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      console.warn("Access denied: No token provided");
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, secret);
    req.admin = decoded.data;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ message: "Access denied. Invalid or expired token." });
  }
};



module.exports = {
  GenerateAdminToken,
  verifyAdminToken,
};
