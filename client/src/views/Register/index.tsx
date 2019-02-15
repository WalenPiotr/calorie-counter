import * as React from "react";
import { withRouter } from "react-router-dom";
import { RouteProps, RouteComponentProps } from "react-router";
import AuthForm from "@components/AuthForm";
import { Status } from "@status";
import { validateEmail, validatePassword } from "@inputValidation";

export interface RegisterProps extends RouteComponentProps {
    register: (email: string, password: string) => Promise<{ error?: string }>;
}
interface RegisterState {
    email: string;
    emailError: string | null;
    password: string;
    passwordError: string | null;
}

class Register extends React.PureComponent<
    RegisterProps & RouteProps,
    RegisterState
> {
    state = {
        email: "",
        emailError: null,
        password: "",
        passwordError: null
    };
    onEmailChange = (e: React.FormEvent<HTMLInputElement>) => {
        const email = e.currentTarget.value;
        this.setState((prevState: RegisterState) => ({
            ...prevState,
            email,
            emailError: null
        }));
    };
    onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
        const password = e.currentTarget.value;
        this.setState((prevState: RegisterState) => ({
            ...prevState,
            password,
            passwordError: null
        }));
    };
    register = async () => {
        const emailError = validateEmail(this.state.email);
        if (emailError) {
            this.setState({ emailError });
        }
        const passwordError = validatePassword(this.state.password);
        if (passwordError) {
            this.setState({ passwordError });
        }
        if (!emailError && !passwordError) {
            const res = await this.props.register(
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
                title={"Register"}
                emailValue={this.state.email}
                onEmailChange={this.onEmailChange}
                emailError={this.state.emailError}
                passwordValue={this.state.password}
                onPasswordChange={this.onPasswordChange}
                passwordError={this.state.passwordError}
                buttonParams={{
                    text: "Register!",
                    onClick: this.register
                }}
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
