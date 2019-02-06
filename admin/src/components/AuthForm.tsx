import * as React from "react";
import * as Elements from "@elements/index";

interface AuthFormProps {
    email: string;
    onEmailChange: (event: React.FormEvent<HTMLInputElement>) => void;
    password: string;
    onPasswordChange: (event: React.FormEvent<HTMLInputElement>) => void;
    buttonClick: () => void;
}

class AuthForm extends React.PureComponent<AuthFormProps> {
    render() {
        return (
            <Elements.Widget>
                <Elements.FormBox>
                    <Elements.TitleBox>Login</Elements.TitleBox>
                    <Elements.Input
                        placeholder="email"
                        type={"email"}
                        value={this.props.email}
                        onChange={this.props.onEmailChange}
                    />
                    <Elements.Input
                        placeholder="password"
                        type={"password"}
                        value={this.props.password}
                        onChange={this.props.onPasswordChange}
                    />
                    <Elements.Button onClick={this.props.buttonClick}>
                        Login
                    </Elements.Button>
                </Elements.FormBox>
            </Elements.Widget>
        );
    }
}

export default AuthForm;
