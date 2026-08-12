const userService = require("./user.service");

const getUsers = (req, res) => {
    const result = userService.getUsers();
    res.status(200).json(result);
}

module.exports = {
    getUsers,
};