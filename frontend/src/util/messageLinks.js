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
