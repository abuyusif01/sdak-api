exports.validateAlphanumeric = (...args) => {
    const alphanumericPattern = /^[a-zA-Z0-9]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const arg of args) {
        if (!alphanumericPattern.test(arg.toString()) && !emailPattern.test(arg.toString())) {
            return false;
        }
    }
    return true;
}