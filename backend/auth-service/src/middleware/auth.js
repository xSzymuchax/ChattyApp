const jwt = require("jsonwebtoken");

const unauthorized = (res) =>
    res.status(401).json({ message: "Invalid or expired token." });

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return unauthorized(res);

    const [scheme, token] = authHeader.split(" ");

    if (scheme != "Bearer" || !token)
        return unauthorized(res);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return unauthorized(res);
    }
};

module.exports = checkAuth;
