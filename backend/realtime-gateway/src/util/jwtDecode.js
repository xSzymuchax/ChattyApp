const jwt = require('jsonwebtoken');

const decodeUserId = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return jwt.decode(token).userId;
}

module.exports = decodeUserId;