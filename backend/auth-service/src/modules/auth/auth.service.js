const { Credential } = require("../../models");
const createAuthRepository = require("./auth.repository");
const authRepository = createAuthRepository(Credential);

const jwt = require("jsonwebtoken");

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
console.log("AAA");
        const userData = await userResponse.json();
        const userId = userData.id;

        data.passwordHash = password;
        data.userId = userId;

console.log("AAA");
        return authRepository.createCredential(data);
        // create userdata
    },

    async updateCredential(email, password){
        return authRepository.updatePassword(email, password);
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