import * as React from "react";
import styled from "styled-components";
import * as storage from "./storage";
import { withRouter } from "react-router-dom";
import { RouteProps, RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";

interface LoginWidgetProps extends RouteComponentProps {}
interface LoginWidgetState {
    email: string;
    password: string;
    redirect: boolean;
}

const Inputs = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 85%;
`;
const Input = styled.input`
    box-sizing: border-box;
    text-indent: 10px;
    font-size: 20px;
    border: none;
    box-sizing: border-box;
    :focus {
        outline: none;
    }
`;
const InputLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
    margin-left: 10px;
    margin-bottom: 8px;
    color: rgba(30, 100, 200, 1);
`;
const InputBox = styled.div`
    width: 100%;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 30px;
    box-sizing: border-box;
`;
const Button = styled.button`
    width: 85%;
    height: 50px;
    font-size: 24px;
    background-color: rgba(30, 100, 200, 1);
    color: white;
    margin-bottom: 30px;
    border: none;
    text-transform: uppercase;
`;
const Widget = styled.div`
    background-color: white;
    width: 95vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-shadow: 3px 3px 50px 6px rgba(0, 0, 0, 0.2);
    margin: 10vh auto;
`;
const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 30px;
    margin-top: 30px;
`;
const Links = styled.div`
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    color: rgba(30, 100, 200, 1);
    width: 80%;
    margin-bottom: 20px;
`;

const Link = styled.a`
    text-decoration: none;
`;

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
            <Widget>
                <Label>Register</Label>
                <Inputs>
                    <InputBox>
                        <InputLabel>email</InputLabel>
                        <Input
                            placeholder=""
                            type="email"
                            onChange={this.onEmailChange}
                        />
                    </InputBox>
                    <InputBox>
                        <InputLabel>password</InputLabel>
                        <Input
                            type="password"
                            placeholder=""
                            onChange={this.onPasswordChange}
                        />
                    </InputBox>
                </Inputs>
                <Links>
                    <Link
                        onClick={() => {
                            this.props.history.push("/login");
                        }}
                    >
                        Already registered?
                    </Link>
                </Links>
                <Button onClick={this.login}>OK</Button>
            </Widget>
        );
    }
}

export default withRouter(Register);
