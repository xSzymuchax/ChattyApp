const { isPasswordStrong } = require("../../../src/modules/auth/password");

describe("isPasswordStrong", () => {
    it.each([null, undefined, 12345678, "Ab1!", "alllowercase1!", "ALLUPPERCASE1!", "NoDigits!", "NoSpecial1"])(
        "rejects %p",
        (password) => {
            expect(isPasswordStrong(password)).toBe(false);
        }
    );

    it("accepts a password with every required class", () => {
        expect(isPasswordStrong("ZAQ!2wsx")).toBe(true);
    });

    it("treats a space as a special character", () => {
        expect(isPasswordStrong("Abcdefg1 ")).toBe(true);
    });
});
