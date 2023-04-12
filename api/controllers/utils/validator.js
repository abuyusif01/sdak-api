exports.validateAlphanumeric = (...args) => {
    const alphanumericPattern = /^[a-zA-Z0-9]+$/;
    for (const arg of args) {
        if (!alphanumericPattern.test(arg.toString())) {
            return false;
        }
    }
    return true;
}