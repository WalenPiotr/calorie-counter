import * as React from "react";
import styled from "styled-components";
import * as storage from "./storage";
import { withRouter } from "react-router-dom";
import { RouteProps, RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import AuthForm from "./components/AuthForm";

interface LoginWidgetProps extends RouteComponentProps {}
interface LoginWidgetState {
    email: string;
    password: string;
    redirect: boolean;
}

class Register extends React.Component<
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
                "http://localhost:8080/api/user/register",
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
        if (this.state.redirect) {
            return <Redirect to="/products" />;
        }
        return (
            <AuthForm
                title={"Register"}
                emailValue={this.state.email}
                onEmailChange={this.onEmailChange}
                passwordValue={this.state.password}
                onPasswordChange={this.onPasswordChange}
                buttonParams={{ text: "Register!", onClick: this.login }}
                linkParams={[
                    {
                        text: "Already registered?",
                        onClick: () => {
                            this.props.history.push("/login");
                        }
                    }
                ]}
            />
        );
    }
}

export default withRouter(Register);
