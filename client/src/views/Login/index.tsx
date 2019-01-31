import * as React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import AuthForm from "@components/AuthForm";

export interface LoginProps extends RouteComponentProps {
    logIn: (email: string, password: string) => void;
}
interface LoginState {
    email: string;
    password: string;
    redirect: boolean;
}

class Login extends React.Component<LoginProps, LoginState> {
    state = {
        email: "",
        password: "",
        redirect: false
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
        this.setState(prevState => ({
            ...prevState,
            redirect: true
        }));
    };
    render() {
        if (this.state.redirect) {
            return <Redirect to="/products" />;
        }
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

export default withRouter(Login);
