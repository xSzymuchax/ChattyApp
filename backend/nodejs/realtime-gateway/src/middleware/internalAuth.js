const crypto = require("crypto");

const unauthorized = (res) =>
    res.status(401).json({ message: "Invalid or expired token." });

const checkInternal = (req, res, next) => {
    const expected = process.env.INTERNAL_SERVICE_TOKEN;
    const provided = req.get("X-Internal-Token");

    if (!expected || typeof provided !== "string")
        return unauthorized(res);

    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided);

    if (
        expectedBuffer.length !== providedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    )
        return unauthorized(res);

    next();
};

module.exports = checkInternal;
