import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";

import AddNew from "@views/NewProduct";
import Login, { LoginProps } from "@views/Login";
import ProductsView from "@views/ProductsView";
import Entries from "@views/Entries";
import Register, { RegisterProps } from "@views/Register";
import Navbar from "@views/Navbar";

import * as requests from "@requests";
import * as storage from "@storage";

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
storage.persistToken(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsIkFjY2Vzc0xldmVsIjozfQ.rzug3QU316dXIhIegdJZM8Lj3vw4QH4UU908jZarbN0"
);

interface AppProps {}
interface AppState {
    isLoggedIn: boolean;
}

class App extends React.Component<AppProps, AppState> {
    state = {
        isLoggedIn: true
    };
    logIn = async (email: string, password: string) => {
        try {
            await requests.login(email, password);
            this.setState((prevState: AppState) => {
                return {
                    ...prevState,
                    isLoggedIn: true
                };
            });
        } catch (e) {
            console.log(e);
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
        try {
            await requests.register(email, password);
            this.setState((prevState: AppState) => {
                return {
                    ...prevState,
                    isLoggedIn: true
                };
            });
        } catch (e) {
            console.log(e);
        }
    };
    render = () => {
        return (
            <div>
                <BrowserRouter>
                    <div>
                        <GlobalStyle />
                        <Navbar
                            isLogged={this.state.isLoggedIn}
                            logOut={this.logOut}
                        />
                        <div>
                            <Switch>
                                <Route
                                    path="/register"
                                    render={(props: RegisterProps) => (
                                        <Register
                                            {...props}
                                            register={this.register}
                                        />
                                    )}
                                />
                                <Route
                                    path="/login"
                                    render={(props: LoginProps) => (
                                        <Login {...props} logIn={this.logIn} />
                                    )}
                                />
                                <Route
                                    path="/products/new/"
                                    component={AddNew}
                                />
                                <Route
                                    path="/products"
                                    component={ProductsView}
                                />
                                <Route path="/entries" component={Entries} />
                            </Switch>
                        </div>
                    </div>
                </BrowserRouter>
            </div>
        );
    };
}

ReactDOM.render(<App />, document.getElementById("root"));
