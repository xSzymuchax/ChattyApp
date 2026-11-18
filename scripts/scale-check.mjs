import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const base = process.env.SCALE_BASE_URL || "http://127.0.0.1:8081/api";
const wsBase = process.env.SCALE_WS_URL || "ws://127.0.0.1:8081/ws/v1";
const password = "Password1@";

const scaled = ["game-service", "realtime-gateway"];
const ceilings = [
    "api-gateway",
    "auth-service",
    "user-service",
    "chat-service",
    "game-service",
    "realtime-gateway",
];

const fail = (message) => {
    throw new Error(message);
};

const kubectl = async (args, input) => {
    const { stdout } = await exec("kubectl", args, {
        input,
        encoding: "utf8",
        timeout: 20000,
        maxBuffer: 4 * 1024 * 1024,
        windowsHide: true,
    });
    return stdout;
};

const json = async (args) => JSON.parse(await kubectl(args));

const patchMin = async (name, minReplicas) => {
    const dir = await mkdtemp(join(tmpdir(), "chatty-scale-"));
    const file = join(dir, "hpa.json");
    await writeFile(file, JSON.stringify({ spec: { minReplicas } }));
    await kubectl(["patch", "hpa", name, "--type", "merge", "--patch-file", file]);
};

const readyPods = async (app) => {
    const listed = await json(["get", "pods", "-l", `app=${app}`, "-o", "json"]);
    return listed.items.filter((pod) =>
        pod.status?.phase === "Running" &&
        (pod.status.containerStatuses || []).every((container) => container.ready)
    );
};

const waitForPods = async (app, count) => {
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
        const pods = await readyPods(app);
        if (pods.length >= count)
            return pods.map((pod) => pod.metadata.name);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    fail(`${app} did not reach ${count} ready pods`);
};

const checkCeilings = async () => {
    const listed = await json(["get", "hpa", "-o", "json"]);
    const byName = new Map(listed.items.map((item) => [item.metadata.name, item]));

    for (const name of ceilings) {
        const hpa = byName.get(name);
        if (!hpa)
            fail(`missing HPA ${name}`);
        if (hpa.spec.maxReplicas !== 2 || hpa.spec.minReplicas < 1 || hpa.spec.minReplicas > 2)
            fail(`${name} should allow at most 2 pods`);
    }

    for (const name of ["postgres", "redis"]) {
        if (byName.has(name))
            fail(`${name} should not autoscale`);
    }
};

const api = async (path, { method = "GET", token, body } = {}) => {
    const response = await fetch(base + path, {
        method,
        headers: {
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = null;
    }
    return { status: response.status, body: parsed, text };
};

const register = async (name) => {
    const username = name + Date.now().toString(36).slice(-6);
    const email = username + "@example.com";
    const created = await api("/v1/auth/register", {
        method: "POST",
        body: { username, email, password, passwordConfirm: password },
    });
    if (created.status !== 201)
        fail(`register ${username} returned ${created.status}`);
    const logged = await api("/v1/auth/login", {
        method: "POST",
        body: { email, password },
    });
    if (logged.status !== 200)
        fail(`login ${username} returned ${logged.status}`);
    const token = logged.body.token;
    const userId = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).userId;
    return { token, userId };
};

const inPod = async (pod, source) => {
    const stdout = await kubectl([
        "exec",
        pod,
        "--",
        "node",
        "--input-type=module",
        "-e",
        source,
    ]);
    return JSON.parse(stdout.trim().split("\n").at(-1));
};

const gameCall = (pod, token, method, path, body) => inPod(pod, `
const response = await fetch(${JSON.stringify("http://127.0.0.1:3004" + path)}, {
  method: ${JSON.stringify(method)},
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + ${JSON.stringify(token)},
  },
  ${body === undefined ? "" : `body: ${JSON.stringify(JSON.stringify(body))},`}
});
const text = await response.text();
let parsed = null;
try { parsed = JSON.parse(text); } catch {}
console.log(JSON.stringify({
  status: response.status,
  id: parsed && parsed.id,
  statusText: parsed && parsed.status,
  moves: parsed && parsed.moves ? parsed.moves.length : null,
  turn: parsed && parsed.gameState ? parsed.gameState.turn : null,
  move: parsed && parsed.gameState && parsed.gameState.legalMoves ? parsed.gameState.legalMoves[0] : null,
}));
`);

const connect = (token) => new Promise((resolve, reject) => {
    const socket = new WebSocket(wsBase);
    const timer = setTimeout(() => reject(new Error("socket auth timed out")), 5000);
    socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ type: "auth", token }));
        setTimeout(() => {
            clearTimeout(timer);
            resolve(socket);
        }, 400);
    });
    socket.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error("socket failed"));
    });
});

const podLogs = async (pod) => kubectl(["logs", pod, "--tail=200"]);

const homeOf = async (userId) => {
    const needle = `User ${userId} authenticated`;
    const names = await waitForPods("realtime-gateway", 2);
    const homes = [];
    for (const name of names) {
        if ((await podLogs(name)).includes(needle))
            homes.push(name);
    }
    return homes;
};

const checkGame = async (pods, first, second) => {
    const created = await gameCall(pods[0], first.token, "POST", "/", {
        gameName: "Checkers",
        firstUserId: first.userId,
        secondUserId: second.userId,
    });
    if (created.status !== 200)
        fail(`game create on ${pods[0]} returned ${created.status}`);

    const accepted = await gameCall(pods[1], second.token, "PATCH", "/" + created.id, { status: "active" });
    if (accepted.status !== 200 || accepted.statusText !== "active")
        fail(`game accept on ${pods[1]} did not see the room`);

    const played = await gameCall(pods[0], first.token, "POST", "/" + created.id + "/moves", {
        move: { from: created.move.from, to: created.move.to },
    });
    if (played.status !== 200 || played.moves !== 1)
        fail(`game move on ${pods[0]} was not stored`);

    const seen = await gameCall(pods[1], second.token, "GET", "/" + created.id);
    if (seen.status !== 200 || seen.moves !== 1 || seen.turn !== "red")
        fail(`game room on ${pods[1]} did not show the move from ${pods[0]}`);

    await gameCall(pods[1], first.token, "DELETE", "/" + created.id);
};

const checkRealtime = async (first, second, chatId) => {
    const sender = await connect(first.token);
    let receiver = null;
    let homes = [];

    try {
        for (let attempt = 0; attempt < 8; attempt += 1) {
            receiver = await connect(second.token);
            await new Promise((resolve) => setTimeout(resolve, 300));
            const homeA = await homeOf(first.userId);
            const homeB = await homeOf(second.userId);
            homes = [homeA, homeB];
            if (homeA.length === 1 && homeB.length === 1 && homeA[0] !== homeB[0])
                break;
            receiver.close();
            receiver = null;
        }

        if (!receiver)
            fail("both sockets stayed on one realtime pod");

        const marker = "scale-check-" + Date.now().toString(36);
        const received = new Promise((resolve) => {
            const timer = setTimeout(() => resolve(false), 5000);
            receiver.addEventListener("message", (event) => {
                const frame = JSON.parse(String(event.data));
                if (frame.type === "message" && frame.message?.content === marker) {
                    clearTimeout(timer);
                    resolve(true);
                }
            });
        });
        sender.send(JSON.stringify({ type: "message", chatId, content: marker }));
        if (!await received)
            fail("message did not reach the socket on the other realtime pod");

        const sentOn = [];
        for (const name of await waitForPods("realtime-gateway", 2)) {
            if ((await podLogs(name)).includes("POSZLO message " + second.userId))
                sentOn.push(name);
        }
        if (sentOn.length !== 1 || sentOn[0] !== homes[1][0])
            fail("the realtime pod without the recipient socket delivered the message");
    } finally {
        sender.close();
        receiver?.close();
    }
};

const main = async () => {
    await checkCeilings();
    const raised = [];

    try {
        for (const name of scaled) {
            await patchMin(name, 2);
            raised.push(name);
        }

        const gamePods = await waitForPods("game-service", 2);
        await waitForPods("realtime-gateway", 2);
        const first = await register("sa");
        const second = await register("sb");
        const chat = await api("/v1/chat", {
            method: "POST",
            token: first.token,
            body: { memberIds: [first.userId, second.userId] },
        });
        if (chat.status !== 200)
            fail(`chat create returned ${chat.status}`);

        await checkGame(gamePods, first, second);
        await checkRealtime(first, second, chat.body.id);
    } finally {
        for (const name of raised) {
            try {
                await patchMin(name, 1);
            } catch (error) {
                console.error(error.message);
            }
        }
    }

    const after = await json(["get", "hpa", "-o", "json"]);
    for (const name of scaled) {
        const hpa = after.items.find((item) => item.metadata.name === name);
        if (hpa?.spec.minReplicas !== 1)
            fail(`${name} minimum stayed above 1`);
    }
    console.log("scale check passed");
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
