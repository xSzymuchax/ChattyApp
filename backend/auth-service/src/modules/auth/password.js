function isPasswordStrong(password) {
    if (typeof password !== "string" || password.length < 8)
        return false;

    return (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

module.exports = {
    isPasswordStrong,
};
