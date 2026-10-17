require("dotenv").config();

const { OpenApiGeneratorV3 } = require("@asteasolutions/zod-to-openapi");

const registries = require("../docs");

const definitions = registries.flatMap((registry) => registry.definitions);
const generator = new OpenApiGeneratorV3(definitions);

const swaggerDocument = generator.generateDocument({
    openapi: "3.0.0",

    info: {
        title: "API gateway",
        version: "1.0.0",
        description:
            "Routes browser HTTP calls to auth, user, chat, and game. " +
            "The gateway does not define those contracts. " +
            "Allowed browser origins are localhost, 127.0.0.1, ngrok hosts, and FRONTEND_ORIGIN.",
    },

    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}`,
        },
    ],
});

module.exports = swaggerDocument;
