import * as React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import * as requests from "@requests";
import { Status } from "@status";
import * as storage from "@storage";
import { routes } from "@routes";
import {
    withRouter,
    RouteComponentProps,
    Route,
    Switch,
    Link
} from "react-router-dom";
import Login from "@containers/Login";
import Products from "@containers/Products";
import ProductView from "@containers/ProductView";
import NewProduct from "@containers/NewProduct";
import Users from "@containers/Users";
import UserProducts from "@containers/UserProducts";
import UpdateProduct from "@containers/UpdateProducts";

import { fonts } from "@theme";
const GlobalStyle = createGlobalStyle`
    body {
        padding: 0;
        margin: 0;
        font-family: ${fonts.fontFamily};
    }
`;

interface AppProps extends RouteComponentProps {}
interface AppState {
    status: Status;
    message: string;
    isLoggedIn: boolean;
}

class App extends React.PureComponent<AppProps, AppState> {
    state = {
        isLoggedIn: storage.retrieveToken() !== "",
        message: "",
        status: Status.None
    };
    setStatus = (status: Status, message: string) => {
        this.setState({ status, message });
    };
    login = async (email: string, password: string) => {
        const { token, error } = await requests.login({ email, password });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        if (token !== undefined) {
            this.setStatus(Status.Success, "Successfully logged in");
            this.setState({ isLoggedIn: true });
            storage.persistToken(token);
            this.props.history.push(routes.users());
            return;
        }
    };
    logout = () => {
        storage.invalidateToken();
        this.setState({ isLoggedIn: false });
        this.props.history.push("/login");
    };
    searchProducts = async (
        name: string
    ): Promise<requests.Product[] | undefined> => {
        const { products, error } = await requests.searchProducts({
            name
        });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        if (products !== undefined) {
            return products;
        }
        this.setStatus(Status.Error, "Unexpected error");
        return;
    };
    getProduct = async (id: number): Promise<requests.Product | undefined> => {
        const { product, error } = await requests.getProduct({ id });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        if (product !== undefined) {
            return product;
        }
        this.setStatus(Status.Error, "Unexpected error");
        return;
    };
    deleteProduct = async (id: number): Promise<void> => {
        const { error } = await requests.deleteProduct({ id });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        return;
    };
    newProduct = async (product: {
        name: string;
        description: string;
        portions: { energy: number; unit: string }[];
    }): Promise<void> => {
        const { error } = await requests.productNew({ product });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        return;
    };
    updateProduct = async (
        id: number,
        product: {
            name: string;
            description: string;
            portions: { energy: number; unit: string }[];
        }
    ): Promise<void> => {
        const { error } = await requests.productUpdate({ id, product });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        return;
    };
    searchUser = async (
        email: string
    ): Promise<
        { email: string; id: number; accessLevel: number }[] | undefined
    > => {
        const { users, error } = await requests.searchUsers({
            email
        });
        console.log(users);
        console.log(error);

        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        if (users !== undefined) {
            return users;
        }
        this.setStatus(Status.Error, "Unexpected error");
        return;
    };
    ban = async (id: number) => {
        const { error } = await requests.banUser({ id });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        this.setStatus(Status.Error, "Unexpected error");
        return;
    };
    unban = async (id: number) => {
        const { error } = await requests.unbanUser({ id });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        this.setStatus(Status.Error, "Unexpected error");
        return;
    };
    getUserProducts = async (id: number) => {
        const { products, error } = await requests.getUserProducts({
            id
        });
        console.log({ products, error });
        if (error !== undefined) {
            this.setStatus(Status.Error, error);
            return;
        }
        if (products !== undefined) {
            return products;
        }
        this.setStatus(Status.Error, "Unexpected error");
        return;
    };
    render = () => {
        const links = this.state.isLoggedIn
            ? [
                  <a onClick={this.logout} href="">
                      logout
                  </a>,
                  <div>
                      <Link to={routes.users()}>users</Link>
                  </div>,
                  <div>
                      <Link to={routes.products()}>products</Link>
                  </div>
              ]
            : [
                  <div>
                      <Link to={routes.login()}>login</Link>
                  </div>
              ];
        const standardRoutes = [
            <Route
                path={routes.login()}
                render={props => <Login {...props} login={this.login} />}
            />
        ];
        const protectedRoutes = [
            <Route
                path={routes.products()}
                render={props => (
                    <Products {...props} search={this.searchProducts} />
                )}
            />,
            <Route
                path={routes.productNew()}
                render={props => (
                    <NewProduct {...props} new={this.newProduct} />
                )}
            />,
            <Route
                path={routes.productUpdate()}
                render={props => (
                    <UpdateProduct
                        {...props}
                        get={this.getProduct}
                        update={this.updateProduct}
                    />
                )}
            />,
            <Route
                path={routes.product()}
                render={props => (
                    <ProductView
                        {...props}
                        get={this.getProduct}
                        delete={this.deleteProduct}
                    />
                )}
            />,
            <Route
                path={routes.users()}
                render={props => (
                    <Users
                        {...props}
                        search={this.searchUser}
                        ban={this.ban}
                        unban={this.unban}
                    />
                )}
            />,
            <Route
                path={routes.userProducts()}
                render={props => (
                    <UserProducts {...props} get={this.getUserProducts} />
                )}
            />
        ];
        return (
            <div>
                <GlobalStyle />
                {links}
                <Switch>
                    {standardRoutes}
                    {this.state.isLoggedIn ? protectedRoutes : null}
                </Switch>
            </div>
        );
    };
}

export default withRouter(App);
