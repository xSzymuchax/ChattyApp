const authService = require("./auth.service");
const AuthInfoResponse = require("./dto/auth-info.response");
const { UniqueConstraintError } = require("sequelize");

// changePassword

const register = async (req, res) => {
    try {
        const data = req.body;
        const result = await authService.createCredential(data);

        if (result == false)
            return res.status(400).json({message: "Bad request." });

        if (result == null)
            return res.status(409).json({message: "Account exists." });

        return res.status(201).json({message: "User registered."});
    } catch (error){
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                message: "Account exists."
            });
        }
        console.log(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const token = await authService.generateToken(email, password);

        if (!token) return res.status(404).json({message: "User not found." });

        return res.status(200).json({token: token});
    } catch (error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};


module.exports = {
    register,
    login
};