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
            attachmentName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attachmentMime: {
                type: DataTypes.STRING(127),
                allowNull: true,
            },
            attachmentSize: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            attachmentKind: {
                type: DataTypes.STRING(16),
                allowNull: true,
            },
        },
        {
            tableName: "messages",
            timestamps: true,
        }
    );
};

module.exports = Message;
