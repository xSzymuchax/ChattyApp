const { Credential } = require("../../models");
const createAuthRepository = require("./auth.repository");
const authRepository = createAuthRepository(Credential);

const jwt = require("jsonwebtoken");

const authService = {
    async createCredential(data) {
        const {username, email, password, passwordConfirm } = data;

        
        // TODO 
        if (data.password != data.passwordConfirm || !data.password) 
            return false;

        const userResponse = await fetch(`${process.env.USER_SERVICE_URL}/user`, {
            method: "post",
              headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                username: username,
            }),
        });

        console.log(userResponse);

        if (userResponse.status == 409) return null;

        const userData = await userResponse.json();
        const userId = userData.id;

        data.passwordHash = password;
        data.userId = userId;


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
        const userResponse = await fetch(`${process.env.USER_SERVICE_URL}/user/userOfEmailActive`, {
            method: "post",
              headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        console.log(userResponse);
        if (!userResponse.ok) return null; 

        
        const userData = await userResponse.json();
        console.log(userData);
        console.log("AAAAAAAAAAA");

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