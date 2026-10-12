import { GAME_INVITE_CTA } from "./gameInviteMessage";

const URL_PATTERN = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/gi;

const trailingPunctuation = /[.,;:!?)]+$/;

export const splitMessageLinks = (text) => {
    if (!text) {
        return [];
    }

    const parts = [];
    const matcher = new RegExp(URL_PATTERN);
    let lastIndex = 0;
    let match;

    while ((match = matcher.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                value: text.slice(lastIndex, match.index),
            });
        }

        parts.push({
            type: "link",
            value: match[0].replace(trailingPunctuation, ""),
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: "text",
            value: text.slice(lastIndex),
        });
    }

    return parts;
};

const splitInviteCta = (part) => {
    if (part.type !== "text") {
        return [part];
    }

    const pieces = [];
    let remaining = part.value;
    let index = remaining.indexOf(GAME_INVITE_CTA);

    while (index !== -1) {
        if (index > 0) {
            pieces.push({
                type: "text",
                value: remaining.slice(0, index),
            });
        }

        pieces.push({
            type: "invite-cta",
            value: GAME_INVITE_CTA,
        });
        remaining = remaining.slice(index + GAME_INVITE_CTA.length);
        index = remaining.indexOf(GAME_INVITE_CTA);
    }

    if (remaining) {
        pieces.push({
            type: "text",
            value: remaining,
        });
    }

    return pieces;
};

export const splitMessageContent = (text) => {
    return splitMessageLinks(text).flatMap(splitInviteCta);
};

export const toSafeHttpUrl = (raw) => {
    if (!raw) {
        return null;
    }

    const trimmed = raw.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    try {
        const url = new URL(withProtocol);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        return url.href;
    } catch {
        return null;
    }
};
