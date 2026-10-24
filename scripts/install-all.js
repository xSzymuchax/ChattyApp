const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const walk = (dir, found = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".git")
            continue;

        const full = path.join(dir, entry.name);

        if (entry.isDirectory())
            walk(full, found);
        else if (entry.name === "package.json")
            found.push(dir);
    }

    return found;
};

const dirs = walk(root).sort((a, b) => {
    if (a === root)
        return -1;
    if (b === root)
        return 1;
    return a.localeCompare(b);
});

for (const dir of dirs) {
    const label = path.relative(root, dir) || ".";
    console.log(`\nnpm install ${label}`);

    const result = spawnSync(npm, ["install"], { cwd: dir, stdio: "inherit" });

    if (result.status !== 0)
        process.exit(result.status ?? 1);
}
