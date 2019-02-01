import * as storage from "@storage";

const base = "http://localhost:8080/";

const endpoints = {
    login: base + "api/user/login",
    register: base + "api/user/register",
    productNew: base + "api/product/new",
    productSearch: base + "api/product/search",
    entriesView: base + "api/user/entries/view",
    entriesDates: base + "api/user/entries/dates",
    entriesUpdate: base + "api/user/entries/update",
    entriesDelete: base + "api/user/entries/delete"
};

export const login = async (email: string, password: string) => {
    const request = {
        body: JSON.stringify({
            email,
            password
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        type: "cors"
    };
    const response = await fetch(endpoints.login, request);
    const parsed = await response.json();
    storage.persistToken(parsed["token"]);
};

export const register = async (email: string, password: string) => {
    const request = {
        body: JSON.stringify({
            email,
            password
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        type: "cors"
    };
    const response = await fetch(endpoints.register, request);
    const parsed = await response.json();
    console.log(parsed);
    storage.persistToken(parsed["token"]);
};

export const productNew = async (product: {
    name: string;
    description: string;
    portions: {
        energy: number;
        unit: string;
    }[];
}) => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify({ product }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    const response = await fetch(endpoints.productNew, request);
    const parsed = await response.json();
};

interface SearchProductResponse {
    id: number;
    name: string;
    creator: number;
    portions: { id: number; productID: number; unit: string; energy: number }[];
}

export const searchProducts = async (
    name: string
): Promise<SearchProductResponse[]> => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify({
            name
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    const response = await fetch(endpoints.productSearch, request);
    const parsed = await response.json();
    return parsed["products"];
};

export const createEntry = async (entry: {
    productID: number;
    portionID: number;
    quantity: number;
    date: string;
}) => {
    const token = storage.retrieveToken();

    const request = {
        body: JSON.stringify({
            entry
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    console.log(request);
    try {
        const response = await fetch(
            "http://localhost:8080/api/user/entries/create",
            request
        );
        const parsed = await response.json();
    } catch (err) {
        console.log(err);
    }
};

interface GetEntriesResponse {
    id: number;
    userID: number;
    productID: number;
    portionID: number;
    quantity: number;
    date: string;
    product: {
        id: number;
        name: string;
        creator: number;
        portions: {
            id: number;
            productID: number;
            unit: string;
            energy: number;
        }[];
    };
}

export const entriesView = async (
    date: string
): Promise<GetEntriesResponse[]> => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify({
            date
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    console.log(request);
    const response = await fetch(endpoints.entriesView, request);
    const parsed = await response.json();
    console.log(parsed);
    return parsed["entries"];
};

export const getDates = async (): Promise<Date[]> => {
    const token = storage.retrieveToken();

    const request = {
        body: JSON.stringify({}),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    console.log(request);
    const response = await fetch(endpoints.entriesDates, request);
    const parsed = await response.json();
    console.log(parsed);
    return parsed.dates.map((date: string) => {
        return new Date(date);
    });
};

export const updateEntry = async (
    id: number,
    entry: {
        productID: number;
        portionID: number;
        quantity: number;
        date: string;
    }
) => {
    const token = storage.retrieveToken();

    const request = {
        body: JSON.stringify({
            id,
            entry
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    console.log(request);
    const response = await fetch(endpoints.entriesUpdate, request);
    const parsed = await response.json();
};

export const deleteEntry = async (id: number) => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify({
            id
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    console.log(request);
    try {
        const response = await fetch(endpoints.entriesDelete, request);
        const parsed = await response.json();
    } catch (err) {
        console.log(err);
    }
};
