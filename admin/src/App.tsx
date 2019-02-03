import * as React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
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

interface AppProps extends RouteComponentProps {}
interface AppState {}

class App extends React.PureComponent<AppProps, AppState> {
    render = () => {
        return (
            <div>
                <div />
            </div>
        );
    };
}

export default withRouter(App);
