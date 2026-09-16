let incomingMessageSound = null;

const getIncomingMessageSound = () => {
    if (!incomingMessageSound) {
        incomingMessageSound = new Audio("/sounds/messageReceived.mp3");
        incomingMessageSound.preload = "auto";
    }

    return incomingMessageSound;
};

export const playIncomingMessageSound = () => {
    const sound = getIncomingMessageSound();
    sound.currentTime = 0;
    sound.play().catch(() => {});
};
