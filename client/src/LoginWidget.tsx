import * as React from "react";
import styled from "styled-components";
import * as storage from "./storage";
import { withRouter } from "react-router-dom";
import { RouteProps, RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";

interface LoginWidgetProps extends RouteComponentProps {}
interface LoginWidgetState {
    email: string;
    password: string;
    redirect: boolean;
}

class LoginWidget extends React.Component<
    LoginWidgetProps & RouteProps,
    LoginWidgetState
> {
    state = {
        email: "",
        password: "",
        redirect: false
    };
    onEmailChange = (e: React.FormEvent<HTMLInputElement>) => {
        const email = e.currentTarget.value;
        this.setState((prevState: LoginWidgetState) => ({
            ...prevState,
            email
        }));
    };
    onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
        const password = e.currentTarget.value;
        this.setState((prevState: LoginWidgetState) => ({
            ...prevState,
            password
        }));
    };
    login = async () => {
        const request = {
            body: JSON.stringify({
                email: this.state.email,
                password: this.state.password
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
            this.setState(prevState => ({
                ...prevState,
                redirect: true
            }));
        } catch (err) {
            console.log(err);
        }
    };
    render() {
        const Input = styled.input`
            height: 60px;
            width: 80vw;
            box-sizing: border-box;
            text-indent: 10px;
            font-size: 36px;
            font-family: Arial, Helvetica, sans-serif;
        `;
        const Button = styled.button`
            height: 60px;
            width: 80vw;
            margin: 10px;
            font-size: 36px;
            background-color: rgba(50, 50, 220, 1);
            color: white;
            font-family: Arial, Helvetica, sans-serif;
        `;
        const Widget = styled.div`
            background-color: white;
            height: 80vh;
            width: 95vw;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 1px solid black;
            border-radius: 5px;
            margin: 10vh auto;
        `;
        const Label = styled.div`
            font-size: 36px;
            margin: 36px;
        `;
        if (this.state.redirect) {
            return <Redirect to="/products" />;
        }
        return (
            <Widget>
                <Label>Login</Label>
                <Input placeholder="email" onChange={this.onEmailChange} />
                <Input
                    placeholder="password"
                    onChange={this.onPasswordChange}
                />
                <Button onClick={this.login}>OK</Button>
            </Widget>
        );
    }
}

export default withRouter(LoginWidget);
