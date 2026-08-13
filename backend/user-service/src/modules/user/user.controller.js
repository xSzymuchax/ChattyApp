const userService = require("./user.service");

const getUsers = async (req, res) => {
    try{
        const result = await userService.getUsers();
        res.status(200).json(result);
    } catch (error){
        console.log(error);
        res.status(500).json({
            message: "Internal server error."
        });
    }
    
};
// CRUD

//C
const createUser = async (req, res) => {
    try {
        const { username, email, description, password, confirmPassword } = req.body;

        if (!username || !email)
            return res.status(400).json({message: "Bad request."});

        const result = await userService.createUser({username, email, description});
    
        // TODO - send email+hashpsswd to auth-service

        if (!result)
            return res.status(409).json({message: "Account with that username/email exists."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

//R
const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || Number.isNaN(id) || id <= 0) 
            return res.status(400).json({message: "Bad request."});

        const result = await userService.getUserById(id);

        if (!result) 
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error){
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

//U
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        if (!id || Number.isNaN(id) || id <= 0) 
            return res.status(400).json({message: "Bad request."});

        const result = await userService.updateUser(id, {description});
    
        if (!result)
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."})
    }
};

//D
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || Number.isNaN(id) || id <= 0) 
            return res.status(400).json({message: "Bad request."});

        const result = await userService.deleteUser(id);
    
        if (!result)
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."})
    }
};

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};