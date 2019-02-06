import * as storage from "@storage";

const base = "http://" + location.hostname + ":8080/";

const endpoints = {
    login: base + "api/user/login",
    productSearch: base + "api/product/search",
    productView: base + "api/product/view",
    productDelete: base + "api/product/delete",
    productNew: base + "api/product/new",
    productUpdate: base + "api/product/update",
    userSearch: base + "api/user/search",
    userBan: base + "api/user/ban",
    userUnban: base + "api/user/unban",
    getUserProducts: base + "api/user/products"
};

export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
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

export interface Portion {
    id: number;
    productID: number;
    unit: string;
    energy: number;
}

export interface Product {
    id: number;
    name: string;
    creator: number;
    portions: Portion[];
}

interface SearchProductRequest {
    name: string;
}
interface SearchProductResponse {
    error?: string;
    products?: Product[];
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

interface GetProductRequest {
    id: number;
}
interface GetProductResponse {
    product?: Product;
    error?: string;
}

export const getProduct = async (
    req: GetProductRequest
): Promise<GetProductResponse> => {
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
        const response = await fetch(endpoints.productView, request);
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

interface DeleteProductRequest {
    id: number;
}
interface DeleteProductResponse {
    error?: string;
}

export const deleteProduct = async (
    req: DeleteProductRequest
): Promise<DeleteProductResponse> => {
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
        const response = await fetch(endpoints.productDelete, request);
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

export const productNew = async (
    req: ProductNewRequest
): Promise<ProductNewResponse> => {
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

interface ProductUpdateRequest {
    id: number;
    product: {
        name: string;
        description: string;
        portions: {
            energy: number;
            unit: string;
        }[];
    };
}
interface ProductUpdateResponse {
    error?: string;
}

export const productUpdate = async (
    req: ProductUpdateRequest
): Promise<ProductUpdateResponse> => {
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
        const response = await fetch(endpoints.productUpdate, request);
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

interface SearchUserRequest {
    email: string;
}
interface SearchUserResponse {
    users?: {
        id: number;
        email: string;
        accessLevel: number;
    }[];
    error?: string;
}
export const searchUsers = async (
    req: SearchUserRequest
): Promise<SearchUserResponse> => {
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
        const response = await fetch(endpoints.userSearch, request);
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

interface BanUserRequest {
    id: number;
}
interface BanUserResponse {
    error?: string;
}
export const banUser = async (
    req: BanUserRequest
): Promise<BanUserResponse> => {
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
        const response = await fetch(endpoints.userBan, request);
        const parsed = await response.json();
        console.log(parsed);
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

interface UnbanUserRequest {
    id: number;
}
interface UnbanUserResponse {
    error?: string;
}
export const unbanUser = async (
    req: UnbanUserRequest
): Promise<UnbanUserResponse> => {
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
        const response = await fetch(endpoints.userUnban, request);
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

interface GetUserProductsRequest {
    id: number;
}
interface GetUserProductsResponse {
    products?: Product[];
    error?: string;
}

export const getUserProducts = async (
    req: GetUserProductsRequest
): Promise<GetUserProductsResponse> => {
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
    console.log(req);
    try {
        const response = await fetch(endpoints.getUserProducts, request);
        const parsed = await response.json();
        console.log(parsed);
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
