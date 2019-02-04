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
import Login from "@views/Login";
import Products from "@views/Products";
import Product from "@views/Product";
import NewProduct from "@views/NewProduct";
import Users from "@views/Users";

const GlobalStyle = createGlobalStyle`

`;

interface AppProps extends RouteComponentProps {}
interface AppState {
    status: Status;
    message: string;
    isLoggedIn: boolean;
}

class App extends React.PureComponent<AppProps, AppState> {
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
            this.props.history.push(routes.users);
            return;
        }
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
    render = () => {
        return (
            <div>
                <div>
                    <Link to={routes.login}>login</Link>
                </div>
                <div>
                    <Link to={routes.users}>users</Link>
                </div>
                <div>
                    <Link to={routes.products}>products</Link>
                </div>
                <div>
                    <Link to={routes.productNew}>new</Link>
                </div>
                <Switch>
                    <Route
                        path={routes.login}
                        render={props => (
                            <Login {...props} login={this.login} />
                        )}
                    />
                    <Route
                        path={routes.products}
                        render={props => (
                            <Products {...props} search={this.searchProducts} />
                        )}
                    />
                    <Route
                        path={routes.product}
                        render={props => (
                            <Product
                                {...props}
                                get={this.getProduct}
                                delete={this.deleteProduct}
                            />
                        )}
                    />
                    <Route
                        path={routes.productNew}
                        render={props => (
                            <NewProduct {...props} new={this.newProduct} />
                        )}
                    />
                    <Route
                        path={routes.users}
                        render={props => (
                            <Users {...props} search={this.searchUser} />
                        )}
                    />
                </Switch>
            </div>
        );
    };
}

export default withRouter(App);
