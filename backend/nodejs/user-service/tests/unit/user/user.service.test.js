var mockRepository;

jest.mock("../../../src/modules/user/user.repository", () => {
    mockRepository = {
        getUsers: jest.fn(),
    };

    return jest.fn(() => mockRepository);
});

const userService = require("../../../src/modules/user/user.service");

describe("UserService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("searches with an empty username when none is given", async () => {
        mockRepository.getUsers.mockResolvedValue([]);

        await userService.getUsers();

        expect(mockRepository.getUsers).toHaveBeenCalledWith("");
    });
});
