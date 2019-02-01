const TOKEN_KEY = "TOKEN";
export function persistToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function retrieveToken(): string {
    const val = localStorage.getItem(TOKEN_KEY);
    if (val != null) {
        return val;
    }
    return "";
}

export function invalidateToken() {
    localStorage.setItem(TOKEN_KEY, "");
}
