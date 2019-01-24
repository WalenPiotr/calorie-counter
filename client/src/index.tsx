import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
import ProductsView from "./ProductsView";
import styled from "styled-components";
import * as storage from "./storage";
import AddNew from "./AddNew";
import Login, { LoginProps } from "./Login";
import Entries from "./Entries";
import Register from "./Register";
import Navbar from "./Navbar";

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

const theme = {};

const Links = styled.div`
    display: flex;
    flex-direction: column;
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
        try {
            const response = await fetch(
                "http://localhost:8080/api/user/login",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
            storage.persistToken(parsed["token"]);
            this.setState((prevState: AppState) => {
                return {
                    ...prevState,
                    isLoggedIn: true
                };
            });
        } catch (err) {
            console.log(err);
        }
    };
    logOut = () => {
        storage.persistToken("");
        this.setState((prevState: AppState) => {
            return {
                ...prevState,
                isLoggedIn: false
            };
        });
    };

    render = () => {
        return (
            <BrowserRouter>
                <div>
                    <GlobalStyle />
                    <Navbar
                        isLogged={this.state.isLoggedIn}
                        logOut={this.logOut}
                    />
                    <div>
                        <Route path="/register" component={Register} />
                        <Route
                            path="/login"
                            render={(props: LoginProps) => (
                                <Login {...props} logIn={this.logIn} />
                            )}
                        />
                        <Route path="/add-new" component={AddNew} />
                        <Route path="/products" component={ProductsView} />
                        <Route path="/entries" component={Entries} />
                    </div>
                </div>
            </BrowserRouter>
        );
    };
}

ReactDOM.render(<App />, document.getElementById("root"));
