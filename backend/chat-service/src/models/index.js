const sequelize = require("../config/database");

const Chat = require("../modules/chat/models/chat.model");
const ChatModel = Chat(sequelize);

const Message = require("../modules/chat/models/message.model");
const MessageModel = Message(sequelize);

ChatModel.hasMany(MessageModel, { foreignKey: "chatId" });
MessageModel.belongsTo(ChatModel, { foreignKey: "chatId" });

module.exports = {
    sequelize,
    Chat: ChatModel,
    Message: MessageModel
}
