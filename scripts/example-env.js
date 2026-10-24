const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const walk = (dir, found = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".git")
            continue;

        const full = path.join(dir, entry.name);

        if (entry.isDirectory())
            walk(full, found);
        else if (entry.name === ".env.example")
            found.push(full);
    }

    return found;
};

for (const example of walk(root)) {
    const target = path.join(path.dirname(example), ".env");
    const from = path.relative(root, example);
    const to = path.relative(root, target);

    if (fs.existsSync(target)) {
        console.log(`skip ${to}`);
        continue;
    }

    fs.copyFileSync(example, target);
    console.log(`copy ${from} -> ${to}`);
}
