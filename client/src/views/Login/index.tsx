import * as React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import AuthForm from "@components/AuthForm";
import { Status } from "@status";
import * as requests from "@requests";
import {
    validateEmailWhenLogin,
    validatePasswordWhenLogin
} from "@inputValidation";
export interface LoginProps extends RouteComponentProps {
    logIn: (email: string, password: string) => Promise<{ error?: string }>;
}
interface LoginState {
    email: string;
    emailError: string | null;
    password: string;
    passwordError: string | null;
}

class Login extends React.PureComponent<LoginProps, LoginState> {
    state = {
        email: "",
        emailError: null,
        password: "",
        passwordError: null
    };
    onEmailChange = (e: React.FormEvent<HTMLInputElement>) => {
        const email = e.currentTarget.value;
        this.setState((prevState: LoginState) => ({
            ...prevState,
            email,
            emailError: null
        }));
    };
    onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
        const password = e.currentTarget.value;
        this.setState((prevState: LoginState) => ({
            ...prevState,
            password,
            passwordError: null
        }));
    };
    login = async () => {
        const emailError = validateEmailWhenLogin(this.state.email);
        if (emailError) {
            this.setState({ emailError });
        }
        const passwordError = validatePasswordWhenLogin(this.state.password);
        if (passwordError) {
            this.setState({ passwordError });
        }
        if (!emailError && !passwordError) {
            const res = await this.props.logIn(
                this.state.email,
                this.state.password
            );
            if (res.error) {
                this.setState({
                    emailError: "",
                    passwordError: ""
                });
            }
        }
    };
    render() {
        return (
            <AuthForm
                title={"Login"}
                emailValue={this.state.email}
                onEmailChange={this.onEmailChange}
                emailError={this.state.emailError}
                passwordValue={this.state.password}
                onPasswordChange={this.onPasswordChange}
                passwordError={this.state.passwordError}
                buttonParams={{ text: "Login!", onClick: this.login }}
                linkParams={[
                    {
                        text: "Not registered?",
                        onClick: () => this.props.history.push("register")
                    },
                    {
                        text: "Forgot password?",
                        onClick: () =>
                            this.props.history.push("/remind-password")
                    }
                ]}
            />
        );
    }
}

export default Login;
