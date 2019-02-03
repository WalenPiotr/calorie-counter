import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom";

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

const GlobalStyle = createGlobalStyle`
    body {
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

// MOCK FOR TESTS!
// storage.persistToken(
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsIkFjY2Vzc0xldmVsIjozfQ.rzug3QU316dXIhIegdJZM8Lj3vw4QH4UU908jZarbN0"
// );

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
        message: "TEST MESSAGE"
    };
    logIn = async (email: string, password: string) => {
        const res = await requests.login({ email, password });
        if (res.error) {
            this.setStatus(Status.Error, res.error);
            return;
        }
        if (res.token) {
            storage.persistToken(res.token);
            this.setState((prevState: AppState) => {
                return {
                    ...prevState,
                    isLoggedIn: true
                };
            });
            this.props.history.push("/products");
            this.setStatus(Status.Success, "Successfully logged in");
            return;
        }
    };
    logOut = () => {
        storage.invalidateToken();
        this.setState((prevState: AppState) => {
            return {
                ...prevState,
                isLoggedIn: false
            };
        });
    };
    register = async (email: string, password: string) => {
        const res = await requests.register({ email, password });
        if (res.error) {
            this.setStatus(Status.Error, res.error);
            return;
        }
        if (res.token) {
            storage.persistToken(res.token);
            this.setState((prevState: AppState) => {
                return {
                    ...prevState,
                    isLoggedIn: true
                };
            });
            this.props.history.push("/products");
            this.setStatus(Status.Success, "Successfully registered");
            return;
        }
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
                                        setStatus={this.setStatus}
                                        register={this.register}
                                    />
                                )}
                            />
                            <Route
                                path="/login"
                                render={props => (
                                    <Login
                                        {...props}
                                        setStatus={this.setStatus}
                                        logIn={this.logIn}
                                    />
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
                        </Switch>
                    </div>
                </div>
            </div>
        );
    };
}

export default withRouter(App);
