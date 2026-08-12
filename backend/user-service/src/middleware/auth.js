const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Authorization header missing",
        });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme != "Bearer" || !token) {
        return res.status(401).json({
            error: "Invalid authorization format",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
};

module.exports = checkAuth;