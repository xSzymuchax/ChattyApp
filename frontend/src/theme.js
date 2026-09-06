export const THEMES = ["blue", "green", "pink", "red"];

const STORAGE_KEY = "chatty.theme";

export function applyTheme(theme) {
    const nextTheme = THEMES.includes(theme) ? theme : "blue";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
}

export function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "blue";
}

const storedTheme = localStorage.getItem(STORAGE_KEY);
applyTheme(storedTheme || "blue");
