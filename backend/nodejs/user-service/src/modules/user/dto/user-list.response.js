const z = require("../../../config/zod");
const { UserInfoResponseDto } = require("./user-info.response");

const UserListResponseDto =
    z.array(UserInfoResponseDto).openapi("UserListResponse");

module.exports = { UserListResponseDto };
