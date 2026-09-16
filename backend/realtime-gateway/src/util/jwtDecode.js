const jwt = require('jsonwebtoken');

const decodeUserId = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.userId ?? null;
    } catch {
        return null;
    }
};

module.exports = decodeUserId;
