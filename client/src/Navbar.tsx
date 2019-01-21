import * as React from "react";
import styled from "@styled-components";
import { RouteComponentProps } from "react-router-dom";
import { withRouter } from "react-router-dom";
import * as storage from "./storage";
import { Menu } from "styled-icons/boxicons-regular/Menu";

const MyMenu = styled(Menu)`
    width: 30px;
    height: 30px;
`;
const NavbarBox = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: mediumblue;
    color: white;
    display: flex;
    flex-direction: column;
`;
const ExpandButton = styled.button`
    height: 50px;
    background: none;
    color: white;
    border: none;
    :focus {
        outline: none;
    }
    font-size: 18px;
`;

interface LinkProps {
    current: boolean;
}
const Link = styled.a`
    font-size: 18px;
    height: 45px;
    width: 100%;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid grey;
    background-color: ${(props: LinkProps) =>
        props.current ? "navy" : "transparent"};
`;

interface NavbarState {
    collapsed: boolean;
}
interface NavbarProps extends RouteComponentProps {
    isLogged: boolean;
    logOut: () => void;
}

class Navbar extends React.Component<NavbarProps, NavbarState> {
    state = {
        collapsed: true
    };
    onExpandClick = () => {
        this.setState((prevState: NavbarState) => {
            return {
                ...prevState,
                collapsed: !prevState.collapsed
            };
        });
    };
    onLinkClick = (url: string) => () => {
        this.props.history.push(url);
        this.setState((prevState: NavbarState) => ({
            ...prevState,
            collapsed: false
        }));
    };
    onLogoutClick = () => {
        this.props.logOut();
        this.props.history.push("/");
    };
    render = () => {
        const isLoggedIn = !(storage.retrieveToken() == "");
        const authLinks = [
            <Link
                current={this.props.history.location.pathname == "/register"}
                onClick={this.onLinkClick("/register")}
            >
                Register
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/login"}
                onClick={this.onLinkClick("/login")}
            >
                Login
            </Link>
        ];
        const links = [
            <Link
                current={this.props.history.location.pathname == "/products"}
                onClick={this.onLinkClick("/products")}
            >
                Products
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/entries"}
                onClick={this.onLinkClick("/entries")}
            >
                Entries
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/logout"}
                onClick={this.onLogoutClick}
            >
                Logout
            </Link>
        ];

        return (
            <NavbarBox>
                <ExpandButton onClick={this.onExpandClick}>
                    <MyMenu />
                </ExpandButton>
                {this.state.collapsed ? (
                    isLoggedIn ? (
                        links
                    ) : (
                        authLinks
                    )
                ) : (
                    <div />
                )}
            </NavbarBox>
        );
    };
}

export default withRouter(Navbar);
