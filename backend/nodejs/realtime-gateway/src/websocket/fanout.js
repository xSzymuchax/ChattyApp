const { createClient } = require('redis');
const { sendToUser } = require('./connectionManager');

const CHANNEL = 'rt:fanout';

// KUBERNETES
async function subscribeFanout() {
    if (!process.env.REDIS_URL)
        return;

    const subscriber = createClient({ url: process.env.REDIS_URL });
    subscriber.on('error', (error) => console.log(error));

    try {
        await subscriber.connect();
        await subscriber.subscribe(CHANNEL, (payload) => {
            try {
                const frame = JSON.parse(payload);

                if (!frame || !frame.userId || !frame.type)
                    return;

                sendToUser(frame.userId, frame.message, frame.type);
            } catch (error) {
                console.log(error);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = subscribeFanout;
