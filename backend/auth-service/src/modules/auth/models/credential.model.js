const { DataTypes } = require("sequelize");

const Credential = (sequelize) => {
    return sequelize.define(
        "Credential",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                validate: {
                    isEmail: true
                },
            },
            passwordHash: {
                type: DataTypes.STRING,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
    );
};

module.exports = Credential;