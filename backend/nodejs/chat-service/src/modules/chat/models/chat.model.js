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
            memberIds: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                allowNull: false,
            },
            adminIds: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(80),
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "chats",
            timestamps: true,
        }
    );
};

module.exports = Chat;
