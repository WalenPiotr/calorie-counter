import * as React from "react";
import * as Elements from "@elements/index";
import AuthForm from "@components/AuthForm";
interface ProductsProps {
    login: (email: string, password: string) => void;
}
interface ProductsState {
    password: string;
    email: string;
}
class Login extends React.PureComponent<ProductsProps, ProductsState> {
    state = {
        password: "",
        email: ""
    };
    buttonClick = () => {
        const { email, password } = this.state;
        this.props.login(email, password);
    };
    passwordChange = (e: React.FormEvent<HTMLInputElement>) => {
        const password = e.currentTarget.value;
        this.setState({ password });
    };
    emailChange = (e: React.FormEvent<HTMLInputElement>) => {
        const email = e.currentTarget.value;
        this.setState({ email });
    };
    render() {
        return (
            <AuthForm
                email={this.state.email}
                password={this.state.password}
                onPasswordChange={this.passwordChange}
                onEmailChange={this.emailChange}
                buttonClick={this.buttonClick}
            />
        );
    }
}
export default Login;
