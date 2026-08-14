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
            userId: {
                type: DataTypes.INTEGER,
                unique: true,
                allowNull: false
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
        },
    );
};

module.exports = Credential;