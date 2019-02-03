import * as storage from "@storage";

const base = "http://" + location.hostname + ":8080/";

const endpoints = {
    login: base + "api/user/login",
    register: base + "api/user/new",
    productNew: base + "api/product/new",
    productSearch: base + "api/product/search",
    entriesCreate: base + "api/user/entries/create",
    entriesView: base + "api/user/entries/view",
    entriesDates: base + "api/user/entries/dates",
    entriesUpdate: base + "api/user/entries/update",
    entriesDelete: base + "api/user/entries/delete"
};

interface LoginRequest {
    email: string;
    password: string;
}
interface LoginResponse {
    error?: string;
    token?: string;
}

export const login = async (req: LoginRequest): Promise<LoginResponse> => {
    const request = {
        body: JSON.stringify(req),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        type: "cors"
    };
    try {
        const response = await fetch(endpoints.login, request);
        const parsed = await response.json();
        console.log(parsed);
        if (parsed.error) {
            return { error: parsed.error };
        }
        if (parsed.token) {
            return { token: parsed.token };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};
