require("dotenv").config();

const { OpenApiGeneratorV3 } = require("@asteasolutions/zod-to-openapi");

const registries = require("../docs");

const definitions = registries.flatMap((registry) => registry.definitions);
const generator = new OpenApiGeneratorV3(definitions);

const swaggerDocument = generator.generateDocument({
    openapi: "3.0.0",

    info: {
        title: "Realtime gateway",
        version: "1.0.0",
        description:
            "HTTP entry points of the realtime gateway. " +
            "WebSocket frames are documented at /asyncapi.",
    },

    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3300}`,
        },
    ],
});

module.exports = swaggerDocument;
