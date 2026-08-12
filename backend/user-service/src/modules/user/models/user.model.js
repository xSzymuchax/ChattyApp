const { DataTypes } = require("sequelize");

const User = (sequelize) => {
    return sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: DataTypes.STRING(16),
                allowNull: false,
                unique: true,
                validate: {
                    len: [1,16],
                    is: /^[^\s]+$/,
                }
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                validate: {
                    isEmail: true
                },
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
    );
};

module.exports = User;