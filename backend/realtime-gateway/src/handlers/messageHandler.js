const axios = require('axios');
const { sendToUser } = require('../websocket/connectionManager');

async function handleMessage(ws, data) {
    try{
        if (!ws.userId) {
            console.log('Unauthenticated user tried to send message');
            ws.close();
            return;
        }

        console.log(
            `Message from user ${ws.userId}:`,
            data.content
        );

        const response = await axios.post(
            `${process.env.CHAT_SERVICE_URL}/${data.chatId}/message`,
            {
                senderId: ws.userId,
                content: data.content
            }
        );

        console.log(response.data);

        if (response.status === 200) {
            sendToUser(
                response.data.recipientId, 
                response.data.message, 
                'message');
        }
    
    } catch (error) {
        console.log(error);
    }
    

}

module.exports = handleMessage;