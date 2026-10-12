const soundPlayers = new Map();

const playSound = (src) => {
    let sound = soundPlayers.get(src);

    if (!sound) {
        sound = new Audio(src);
        sound.preload = "auto";
        soundPlayers.set(src, sound);
    }

    sound.currentTime = 0;
    sound.play().catch(() => {});
};

export const playIncomingMessageSound = () => {
    playSound("/sounds/messageReceived.mp3");
};

export const playGameInviteSound = () => {
    playSound("/sounds/gameInvite.mp3");
};
