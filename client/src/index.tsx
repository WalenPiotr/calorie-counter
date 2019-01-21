import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { createGlobalStyle } from "styled-components";
import LoginWidget from "./LoginWidget";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
import ProductsView from "./ProductsView";
import styled from "styled-components";
import * as storage from "./storage";
import AddNew from "./AddNew";

const GlobalStyle = createGlobalStyle`
    body {
        padding: 0;
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
    }
    button {
        border: 1px solid black;
        background-color: lightgray;
    }
    select {
        border: 1px solid black;
        background-color: lightgray;
    }
    input {
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

ReactDOM.render(
    <BrowserRouter>
        <div>
            <GlobalStyle />
            <Links>
                <Link to="/login">LOGIN</Link>
                <Link to="/products">PRODUCTS</Link>
            </Links>
            <div>
                <Route path="/login" component={LoginWidget} />
                <Route path="/add-new" component={AddNew} />
                <Route path="/products" component={ProductsView} />
            </div>
        </div>
    </BrowserRouter>,
    document.getElementById("root")
);
