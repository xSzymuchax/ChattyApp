export const GAME_INVITE_CTA = "Sprawdź swoje zaproszenia!";

export const buildGameInviteMessage = (username, gameName) =>
    `${username} zaprosił cię do gry w ${gameName}. ${GAME_INVITE_CTA}`;
