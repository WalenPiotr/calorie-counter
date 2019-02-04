import * as React from "react";

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
            <div>
                <input
                    placeholder="email"
                    value={this.state.email}
                    onChange={this.emailChange}
                />
                <input
                    placeholder="password"
                    value={this.state.password}
                    onChange={this.passwordChange}
                />
                <button onClick={this.buttonClick}>Login</button>
            </div>
        );
    }
}

export default Login;
