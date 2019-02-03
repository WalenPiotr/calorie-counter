import * as React from "react";
import { withRouter } from "react-router-dom";
import { RouteProps, RouteComponentProps } from "react-router";
import AuthForm from "@components/AuthForm";
import { Status } from "@status";

export interface RegisterProps extends RouteComponentProps {
    register: (email: string, password: string) => void;
    setStatus: (status: Status, message: string) => void;
}
interface RegisterState {
    email: string;
    password: string;
}

class Register extends React.PureComponent<
    RegisterProps & RouteProps,
    RegisterState
> {
    state = {
        email: "",
        password: ""
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
