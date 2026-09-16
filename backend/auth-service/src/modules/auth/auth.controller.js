const authService = require("./auth.service");
const { UniqueConstraintError } = require("sequelize");

const register = async (req, res) => {
    try {
        console.log("REGISTER HIT");
        const data = req.body;
        const result = await authService.createCredential(data);

        if (result?.error === "weak_password")
            return res.status(400).json({ code: "WEAK_PASSWORD" });

        if (result?.error === "mismatch")
            return res.status(400).json({ code: "PASSWORD_MISMATCH" });

        if (result?.error === "exists")
            return res.status(409).json({ code: "ACCOUNT_EXISTS" });

        if (result?.error)
            return res.status(400).json({ code: "BAD_REQUEST" });

        return res.status(201).json({message: "User registered."});
    } catch (error){
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                code: "ACCOUNT_EXISTS"
            });
        }
        console.log(error);
        return res.status(500).json({
            code: "SERVER_ERROR"
        });
    }
};

const refresh = async (req, res) => {
    try {
        const token = authService.refreshToken(req.user);

        if (!token)
            return res.status(401).json({ code: "INVALID_TOKEN" });

        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: "SERVER_ERROR"
        });
    }
};

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const token = await authService.generateToken(email, password);

        if (!token)
            return res.status(401).json({ code: "INVALID_CREDENTIALS" });

        return res.status(200).json({token: token});
    } catch (error){
        console.log(error);
        return res.status(500).json({
            code: "SERVER_ERROR"
        });
    }
};


module.exports = {
    register,
    login,
    refresh
};
