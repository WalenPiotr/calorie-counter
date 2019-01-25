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
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    background-color: rgba(30, 100, 200, 1);
    color: white;
    display: flex;
    flex-direction: column;
`;
const Spacer = styled.div`
    height: 50px;
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
    text-decoration: none;
    display: flex;
    justify-content: left;
    align-items: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    font-weight: ${(props: LinkProps) => (props.current ? 500 : 300)};
    border-top: 1px solid grey;
    :hover {
        color: rgba(255, 255, 255, 1);
    }
`;
const LinkWrapper = styled.div`
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
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
        collapsed: false
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
                current={this.props.history.location.pathname == "/"}
                onClick={this.onLinkClick("/")}
            >
                Home
            </Link>,
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
                current={this.props.history.location.pathname == "/"}
                onClick={this.onLinkClick("/")}
            >
                Home
            </Link>,
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

        return [
            <>
                <NavbarBox>
                    <ExpandButton onClick={this.onExpandClick}>
                        <MyMenu />
                    </ExpandButton>

                    {this.state.collapsed ? (
                        isLoggedIn ? (
                            links.map(link => <LinkWrapper>{link}</LinkWrapper>)
                        ) : (
                            authLinks.map(link => (
                                <LinkWrapper>{link}</LinkWrapper>
                            ))
                        )
                    ) : (
                        <div />
                    )}
                </NavbarBox>
                <Spacer />
            </>
        ];
    };
}

export default withRouter(Navbar);
