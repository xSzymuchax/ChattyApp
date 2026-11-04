const z = require("../../../config/zod");

const ChatDataRequestDto =
    z.object({
        memberIds: z.array(z.int()).openapi({example: [1, 2]}),
        name: z.string().optional().openapi({example: "Team"}),
    })
    .openapi("ChatDataRequestDto");

module.exports = { ChatDataRequestDto };
