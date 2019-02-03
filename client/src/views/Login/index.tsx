import * as React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import AuthForm from "@components/AuthForm";
import { Status } from "@status";

export interface LoginProps extends RouteComponentProps {
    logIn: (email: string, password: string) => void;
    setStatus: (status: Status, message: string) => void;
}
interface LoginState {
    email: string;
    password: string;
}

class Login extends React.PureComponent<LoginProps, LoginState> {
    state = {
        email: "",
        password: ""
    };
    onEmailChange = (e: React.FormEvent<HTMLInputElement>) => {
        const email = e.currentTarget.value;
        this.setState((prevState: LoginState) => ({
            ...prevState,
            email
        }));
    };
    onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
        const password = e.currentTarget.value;
        this.setState((prevState: LoginState) => ({
            ...prevState,
            password
        }));
    };
    login = async () => {
        this.props.logIn(this.state.email, this.state.password);
    };
    render() {
        return (
            <AuthForm
                title={"Login"}
                emailValue={this.state.email}
                onEmailChange={this.onEmailChange}
                passwordValue={this.state.password}
                onPasswordChange={this.onPasswordChange}
                buttonParams={{ text: "Login!", onClick: this.login }}
                linkParams={[
                    {
                        text: "Not registered?",
                        onClick: () => this.props.history.push("register")
                    },
                    {
                        text: "Forgot password?",
                        onClick: () => this.props.history.push("/")
                    }
                ]}
            />
        );
    }
}

export default Login;
