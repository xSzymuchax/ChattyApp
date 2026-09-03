const handleAuth = require('../handlers/authHandler');
const handleMessage = require('../handlers/messageHandler');

function handleConnection(ws) {
    console.log('New Connection!');

    const authTimeout = setTimeout(() => {
        if (!ws.userId) {
            console.log('Closing WS - not authenticated');
            ws.close();
        }
    }, 5000);

    ws.on('message', (message) => {
        try {
            console.log('Received:', message.toString());

            const data = JSON.parse(message);

            switch (data.type) {
                case 'auth':
                    handleAuth(ws, data);
                    break;

                case 'message':
                    handleMessage(ws, data);
                    break;

                default:
                    console.log(
                        `Unknown message type: ${data.type}`
                    );
            }
        } catch (error) {
            console.error(error);
            ws.close();
        }
    });

    ws.on('close', () => {
        clearTimeout(authTimeout);

        console.log('WS disconnected');
    });
}

module.exports = handleConnection;