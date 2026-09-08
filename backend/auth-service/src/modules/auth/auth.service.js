const { Credential } = require("../../models");
const createAuthRepository = require("./auth.repository");
const authRepository = createAuthRepository(Credential);

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const authService = {
    async createCredential(data) {
        const {username, email, password, passwordConfirm } = data;

        // console.log(data);
        console.log("AAA");
        // TODO 
        if (password != passwordConfirm || !password) 
            return false;

        console.log("AAA");

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

        console.log("AAA");

        // console.log(userResponse);

        if (userResponse.status == 409) return null;

        if (!userResponse.ok)
            return false;

        const userData = await userResponse.json();
        const userId = userData.id;

        if (!userId)
            return false;

        data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        data.userId = userId;

console.log("AAA");
        return authRepository.createCredential(data);
        // create userdata
    },

    async updateCredential(email, password){
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        return authRepository.updatePassword(email, passwordHash);
    },

    async deleteCredential(email) {
        return authRepository.deleteCredential(email);
    },

    // TODO
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

        //console.log(userResponse);
        if (!userResponse.ok) return null; 

        
        const userData = await userResponse.json();
        // console.log(userData);
        // console.log("AAAAAAAAAAA");

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