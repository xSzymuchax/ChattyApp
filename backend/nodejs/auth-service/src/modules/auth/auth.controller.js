const authService = require("./auth.service");
const { UniqueConstraintError } = require("sequelize");
const { LoginRequestDto } = require("./dto/login.request");

const badRequest = (res) => res.status(400).json({ message: "Bad request." });

const hasAnyRegisterField = (data) =>
    ["username", "email", "password", "passwordConfirm"].some(
        (key) => typeof data?.[key] === "string" && data[key].length > 0
    );

const register = async (req, res) => {
    try {
        console.log("REGISTER HIT");
        const data = req.body;

        if (!hasAnyRegisterField(data))
            return badRequest(res);

        const result = await authService.createCredential(data);

        if (result?.error === "exists")
            return res.status(409).json({ message: "Account exists." });

        if (result?.error)
            return badRequest(res);

        return res.status(201).json({ message: "User registered." });
    } catch (error) {
        if (error instanceof UniqueConstraintError)
            return res.status(409).json({ message: "Account exists." });

        console.log(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const refresh = async (req, res) => {
    try {
        const token = authService.refreshToken(req.user);

        if (!token)
            return res.status(401).json({ message: "Invalid or expired token." });

        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const login = async (req, res) => {
    try {
        const parsed = LoginRequestDto.safeParse(req.body);

        if (!parsed.success)
            return badRequest(res);

        const token = await authService.generateToken(parsed.data.email, parsed.data.password);

        if (!token)
            return res.status(401).json({ message: "Invalid credentials." });

        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    register,
    login,
    refresh
};
