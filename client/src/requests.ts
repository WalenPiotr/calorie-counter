import * as storage from "@storage";

const base = "http://" + location.hostname + ":8080/";

const endpoints = {
    login: base + "api/user/login",
    register: base + "api/user/new",
    verifyAccount: base + "api/user/verify",
    changePassword: base + "api/user/change-password",
    remindPassword: base + "api/user/remind-password",
    check: base + "api/user/check-token",
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

interface CheckRequest {
    token: string;
}
interface CheckResponse {
    error?: string;
    authenticated?: boolean;
}

export const checkToken = async (req: CheckRequest): Promise<CheckResponse> => {
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
        const response = await fetch(endpoints.check, request);
        const parsed = await response.json();
        console.log(parsed);
        if (parsed.error) {
            return { error: parsed.error };
        }
        if (parsed.authenticated) {
            return { authenticated: parsed.authenticated };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface RegisterRequest {
    email: string;
    password: string;
}
interface RegisterResponse {
    error?: string;
}
export const register = async (
    req: RegisterRequest
): Promise<RegisterResponse> => {
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
        const response = await fetch(endpoints.register, request);
        const parsed = await response.json();
        console.log(parsed);
        if (parsed.error) {
            return { error: parsed.error };
        }
        if (parsed) {
            return {};
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface ProductNewRequest {
    product: {
        name: string;
        description: string;
        portions: {
            energy: number;
            unit: string;
        }[];
    };
}
interface ProductNewResponse {
    error?: string;
}

export const productNew = async (req: ProductNewRequest) => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify(req),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    try {
        const response = await fetch(endpoints.productNew, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return parsed;
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface SearchProductRequest {
    name: string;
}
interface SearchProductResponse {
    error?: string;
    products?: {
        id: number;
        name: string;
        creator: number;
        portions: {
            id: number;
            productID: number;
            unit: string;
            energy: number;
        }[];
    }[];
}
export const searchProducts = async (
    req: SearchProductRequest
): Promise<SearchProductResponse> => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify(req),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    try {
        const response = await fetch(endpoints.productSearch, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return parsed;
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface CreateEntryRequest {
    entry: {
        productID: number;
        portionID: number;
        quantity: number;
        date: string;
    };
}
interface CreateEntryResponse {
    error?: string;
    entry?: {
        productID: number;
        portionID: number;
        quantity: number;
        date: string;
    };
}
export const createEntry = async (
    req: CreateEntryRequest
): Promise<CreateEntryResponse> => {
    const token = storage.retrieveToken();

    const request = {
        body: JSON.stringify(req),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    try {
        const response = await fetch(endpoints.entriesCreate, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return parsed;
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface GetEntriesRequest {
    date: string;
}
interface GetEntriesResponse {
    error?: string;
    entries?: {
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
    }[];
}
export const entriesView = async (
    req: GetEntriesRequest
): Promise<GetEntriesResponse> => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify(req),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    try {
        const response = await fetch(endpoints.entriesView, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return parsed;
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface GetDatesRequest {}
interface GetDatesResponse {
    error?: string;
    dates?: string[];
}
export const getDates = async (): Promise<GetDatesResponse> => {
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
    try {
        const response = await fetch(endpoints.entriesDates, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return parsed;
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface UpdateEntryRequest {
    id: number;
    entry: {
        productID: number;
        portionID: number;
        quantity: number;
        date: string;
    };
}
interface UpdateEntryResponse {
    error?: string;
}
export const updateEntry = async (
    req: UpdateEntryRequest
): Promise<UpdateEntryResponse> => {
    const token = storage.retrieveToken();

    const request = {
        body: JSON.stringify(req),
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
        const response = await fetch(endpoints.entriesUpdate, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return {};
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface DeleteEntryRequest {
    id: number;
}
interface DeleteEntryResponse {
    error?: string;
}

export const deleteEntry = async (
    req: DeleteEntryRequest
): Promise<DeleteEntryResponse> => {
    const token = storage.retrieveToken();
    const request = {
        body: JSON.stringify(req),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        method: "POST",
        type: "cors"
    };
    try {
        const response = await fetch(endpoints.entriesDelete, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return {};
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface VerifyAccountRequest {
    token: string;
}
interface VerifyAccountResponse {
    error?: string;
}

export const verifyAccount = async (
    req: VerifyAccountRequest
): Promise<VerifyAccountResponse> => {
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
        const response = await fetch(endpoints.verifyAccount, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return {};
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface ChangePasswordRequest {
    token: string;
    password: string;
}
interface ChangePasswordResponse {
    error?: string;
}
export const changePassword = async (
    req: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
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
        const response = await fetch(endpoints.changePassword, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return {};
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};

interface RemindPasswordRequest {
    email: string;
}
interface RemindPasswordResponse {
    error?: string;
}

export const remindPassword = async (
    req: RemindPasswordRequest
): Promise<RemindPasswordResponse> => {
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
        const response = await fetch(endpoints.remindPassword, request);
        const parsed = await response.json();
        if (response.status == 200) {
            return {};
        }
        if (parsed.error) {
            return { error: parsed.error };
        }
        return { error: "Something went wrong" };
    } catch (e) {
        return { error: "Connection error" };
    }
};
