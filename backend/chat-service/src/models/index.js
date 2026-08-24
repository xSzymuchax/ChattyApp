const sequelize = require("../config/database");

const Health = require("../modules/health/models/health.model");
const HealthModel = Health(sequelize);

const Chat = require("../modules/chat/models/chat.model");
const ChatModel = Chat(sequelize);

const Message = require("../modules/chat/models/message.model");
const MessageModel = Message(sequelize);

ChatModel.hasMany(MessageModel, { foreignKey: "chatId" });
MessageModel.belongsTo(ChatModel, { foreignKey: "chatId" });

module.exports = {
    sequelize,
    Health: HealthModel,
    Chat: ChatModel,
    Message: MessageModel
}
