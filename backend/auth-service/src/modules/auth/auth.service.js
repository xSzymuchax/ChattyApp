const { Credential } = require("../../models");
const createAuthRepository = require("./auth.repository");
const authRepository = createAuthRepository(Credential);

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { isPasswordStrong } = require("./password");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = "1h";

const signAccessToken = (userId, username) => {
    if (!userId) {
        return null;
    }

    return jwt.sign(
        {
            userId,
            username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: TOKEN_EXPIRES_IN,
        }
    );
};

const authService = {
    async createCredential(data) {
        const {username, email, password, passwordConfirm } = data;

        if (password != passwordConfirm)
            return { error: "mismatch" };

        if (!isPasswordStrong(password))
            return { error: "weak_password" };

        const userResponse = await fetch(`${process.env.USER_SERVICE_URL}/`, {
            method: "post",
              headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                username: username,
            }),
        });

        if (userResponse.status == 409) return { error: "exists" };

        if (!userResponse.ok)
            return { error: "failed" };

        const userData = await userResponse.json();
        const userId = userData.id;

        if (!userId)
            return { error: "failed" };

        data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        data.userId = userId;

        return authRepository.createCredential(data);
    },

    async updateCredential(email, password){
        if (!isPasswordStrong(password))
            return { error: "weak_password" };

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        return authRepository.updatePassword(email, passwordHash);
    },

    async deleteCredential(email) {
        return authRepository.deleteCredential(email);
    },

    async generateToken(email, password){
        const userResponse = await fetch(`${process.env.USER_SERVICE_URL}/userOfEmailActive`, {
            method: "post",
              headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        if (!userResponse.ok) return null; 

        
        const userData = await userResponse.json();
        const result = await authRepository.checkCredential(email, password);

        if (!result) return null;

        return signAccessToken(userData.id, userData.username);
    },

    refreshToken(user) {
        return signAccessToken(user?.userId, user?.username);
    },
};

module.exports = authService;