export const routes = {
    login: () => "/login",
    products: () => "/product/search",
    productNew: () => "/product/new",
    product: (id: string = ":id") => `/product/${id}`,
    productUpdate: (id: string = ":id") => `/product/${id}/update`,
    users: () => "/user/search",
    userProducts: (id: string = ":id") => `/user/${id}/products`
};
