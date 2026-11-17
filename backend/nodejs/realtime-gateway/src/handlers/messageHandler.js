const axios = require('axios');

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
            `${process.env.CHAT_SERVICE_URL}/${data.chatId}/messages`,
            {
                content: data.content
            },
            {
                headers: ws.token
                    ? { Authorization: `Bearer ${ws.token}` }
                    : {},
            }
        );

        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
    

}

module.exports = handleMessage;