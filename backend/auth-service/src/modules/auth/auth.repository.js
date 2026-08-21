const authRepository = (Credential) => ({
    async createCredential(data){
        return Credential.create(data);
    },

    async updatePassword(email, passwordHash){
        const credential = await Credential.findOne({
            where: {
                email: email
            }
        });
        
        if (!credential) return null;

        await credential.update({passwordHash: passwordHash});
        return true;
    },

    async deleteCredential(email){
        const credential = await Credential.findOne({
            where: {
                email: email
            },
        });

        if (!credential)
            return false;

        await credential.update({isActive: false});
        return true;
    },

    async checkCredential(email, password){
        const credential = await Credential.findOne({
            where: {
                email: email,
                passwordHash: password // TODO
            }
        });

        if (!credential)
            return false;

        return true;
    }
})

module.exports = authRepository;