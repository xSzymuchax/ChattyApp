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

const publicFile = (path) =>
    `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const playIncomingMessageSound = () => {
    playSound(publicFile("sounds/messageReceived.mp3"));
};

export const playGameInviteSound = () => {
    playSound(publicFile("sounds/gameInvite.mp3"));
};
