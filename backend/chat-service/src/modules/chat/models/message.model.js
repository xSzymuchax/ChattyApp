const { DataTypes } = require("sequelize");

const Message = (sequelize) => {
    return sequelize.define(
        "Message",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chatId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            tableName: "messages",
            timestamps: true,
        }
    );
};

module.exports = Message;
