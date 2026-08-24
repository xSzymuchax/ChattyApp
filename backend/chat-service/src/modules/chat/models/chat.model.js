const { DataTypes } = require("sequelize");

const Chat = (sequelize) => {
    return sequelize.define(
        "Chat",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            firstUserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            secondUserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "chats",
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ["firstUserId", "secondUserId"],
                },
            ],
        }
    );
};

module.exports = Chat;
