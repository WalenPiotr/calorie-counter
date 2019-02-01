import * as React from "react";
import * as storage from "@storage";
import { withRouter } from "react-router-dom";
import { RouteProps, RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import AuthForm from "@components/AuthForm";

export interface RegisterProps extends RouteComponentProps {
    register: (email: string, password: string) => void;
}
interface RegisterState {
    email: string;
    password: string;
    redirect: boolean;
}

class Register extends React.Component<
    RegisterProps & RouteProps,
    RegisterState
> {
    state = {
        email: "",
        password: "",
        redirect: false
    };
    onEmailChange = (e: React.FormEvent<HTMLInputElement>) => {
        const email = e.currentTarget.value;
        this.setState((prevState: RegisterState) => ({
            ...prevState,
            email
        }));
    };
    onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
        const password = e.currentTarget.value;
        this.setState((prevState: RegisterState) => ({
            ...prevState,
            password
        }));
    };
    register = () => {
        this.props.register(this.state.email, this.state.password);
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
                buttonParams={{
                    text: "Register!",
                    onClick: this.register
                }}
                linkParams={[
                    {
                        text: "Already registered?",
                        onClick: () => {
                            this.props.history.push("/register");
                        }
                    }
                ]}
            />
        );
    }
}

export default withRouter(Register);
