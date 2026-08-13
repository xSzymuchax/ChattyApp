const { Credential } = require("../../models");
const createAuthRepository = require("./auth.repository");
const authRepository = createAuthRepository(Credential);

const jwt = require("jsonwebtoken");

const authService = {
    async createCredential(data) {
        // TODO - password check, hash
        if (data.password != data.passwordConfirm || !data.password) 
            return false;

        data.passwordHash = data.password;
        return authRepository.createCredential(data);
    },

    async updateCredential(email, password){
        return authRepository.updatePassword(email, password);
    },

    async deleteCredential(email) {
        return authRepository.deleteCredential(email);
    },

    // TODO
    async generateToken(email, password){
        const userData = await fetch(`${process.env.USER_SERVICE_URL}/userOfEmailActive`, {
            method: "post",
              headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        //console.log(userData);
        if (!userData) return null; 

        const result = await authRepository.checkCredential(email, password);

        //console.log(result);
        if (!result) return null;

        const token = 
            jwt.sign({
                userId: userData.id,
                username: userData.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return token;
    }
};

module.exports = authService;