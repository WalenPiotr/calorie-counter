import * as React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom";

import VerifyAccount from "@views/VerifyAccount";
import Login from "@views/Login";
import Products from "@views/Products";
import Entries from "@views/Entries";
import Register from "@views/Register";
import Navbar from "@views/Navbar";
import StatusBar from "@views/StatusBar";
import * as requests from "@requests";
import * as storage from "@storage";
import { Status } from "@status";
import NewProduct from "@views/NewProduct";
import { withRouter, RouteComponentProps } from "react-router-dom";
import NewPassword from "@views/NewPassword";
import RemindPassword from "@views/RemindPassword";
import Main from "@views/Main/Main";

const GlobalStyle = createGlobalStyle`
    body,html {
        padding: 0;
        margin: 0;
        font-family: 'Roboto', sans-serif;
        background-color: rgba(245, 245, 245, 1)
    }
    button {
        border: 1px solid black;
        font-family: 'Roboto', sans-serif;
        background-color: lightgray;
    }
    select {
        font-family: 'Roboto', sans-serif;
        border: 1px solid black;
        background-color: lightgray;
    }
    input {
        font-family: 'Roboto', sans-serif;
        border: 1px solid black;
    }
`;

interface AppProps extends RouteComponentProps {}
interface AppState {
    isLoggedIn: boolean;
    status: Status;
    message: string;
}

class App extends React.PureComponent<AppProps, AppState> {
    state = {
        isLoggedIn: false,
        status: Status.None,
        message: "",
    };
    componentDidMount = async () => {
        const token = storage.retrieveToken();
        if (token != "") {
            const res = await requests.checkToken({ token });
            if (res.error) {
                this.setStatus(Status.Error, res.error);
                return;
            }
            if (res.authenticated) {
                this.setState((prevState: AppState) => {
                    return {
                        ...prevState,
                        isLoggedIn: true,
                    };
                });
                this.props.history.push("/products");
                this.setStatus(Status.Success, "Successfully logged in");
                return;
            }
        }
    };
    logIn = async (
        email: string,
        password: string,
    ): Promise<{ error?: string }> => {
        const res = await requests.login({ email, password });
        if (res.error) {
            this.setStatus(Status.Error, res.error);
            return { error: res.error };
        }
        if (res.token) {
            storage.persistToken(res.token);
            this.setState((prevState: AppState) => {
                return {
                    ...prevState,
                    isLoggedIn: true,
                };
            });
            this.props.history.push("/products");
            this.setStatus(Status.Success, "Successfully logged in");
            return {};
        }
        return { error: "Something went horribly wrong" };
    };
    logOut = () => {
        storage.invalidateToken();
        this.setState((prevState: AppState) => {
            return {
                ...prevState,
                isLoggedIn: false,
            };
        });
    };
    register = async (
        email: string,
        password: string,
    ): Promise<{ error?: string }> => {
        storage.invalidateToken();
        const res = await requests.register({ email, password });
        if (res.error) {
            this.setStatus(Status.Error, res.error);
            return { error: res.error };
        }
        this.setStatus(
            Status.Success,
            "Please check your email and verify your account",
        );
        this.props.history.push("/");
        return {};
    };
    setStatus = (status: Status, message: string) => {
        this.setState({ status, message });
    };
    render = () => {
        return (
            <div>
                <div>
                    <GlobalStyle />
                    <Navbar
                        isLogged={this.state.isLoggedIn}
                        logOut={this.logOut}
                        setStatus={this.setStatus}
                    />
                    <StatusBar
                        status={this.state.status}
                        message={this.state.message}
                    />
                    <div>
                        <Switch>
                            <Route
                                path="/register"
                                render={props => (
                                    <Register
                                        {...props}
                                        register={this.register}
                                    />
                                )}
                            />
                            <Route
                                path="/login"
                                render={props => (
                                    <Login {...props} logIn={this.logIn} />
                                )}
                            />
                            <Route
                                path="/products/new/"
                                render={props =>
                                    this.state.isLoggedIn ? (
                                        <NewProduct
                                            {...props}
                                            setStatus={this.setStatus}
                                        />
                                    ) : (
                                        <Redirect to={"/login"} />
                                    )
                                }
                            />
                            <Route
                                path="/products"
                                render={props =>
                                    this.state.isLoggedIn ? (
                                        <Products
                                            {...props}
                                            setStatus={this.setStatus}
                                        />
                                    ) : (
                                        <Redirect to={"/login"} />
                                    )
                                }
                            />
                            <Route
                                path="/entries"
                                render={props =>
                                    this.state.isLoggedIn ? (
                                        <Entries
                                            {...props}
                                            setStatus={this.setStatus}
                                        />
                                    ) : (
                                        <Redirect to={"/login"} />
                                    )
                                }
                            />
                            <Route
                                path="/verify/:token"
                                render={props => <VerifyAccount {...props} />}
                            />
                            <Route
                                path="/change-password/:token"
                                render={props => (
                                    <NewPassword
                                        {...props}
                                        setStatus={this.setStatus}
                                    />
                                )}
                            />
                            <Route
                                path="/remind-password"
                                render={props => (
                                    <RemindPassword
                                        {...props}
                                        setStatus={this.setStatus}
                                    />
                                )}
                            />
                            <Route
                                path="/"
                                render={props => <Main {...props} />}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    };
}

export default withRouter(App);
