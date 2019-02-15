export const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
        return "Password needs to be at least 8 characters long";
    }
    if (!/[a-z]/.test(password)) {
        return "Password have to contain at least one lowercase character";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password have to contain at least one uppercase character";
    }
    if (!/[0-9]/.test(password)) {
        return "Password have to contain at least one number";
    }
    return null;
};
export const validateEmail = (email: string): string | null => {
    const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (!re.test(email)) {
        return "Invalid email format";
    }
    return null;
};
export const validatePasswordWhenLogin = (password: string): string | null => {
    if (password.length == 0) {
        return "Please enter your password";
    }
    return null;
};
export const validateEmailWhenLogin = (email: string): string | null => {
    if (email.length == 0) {
        return "Please enter your email";
    }
    return null;
};
