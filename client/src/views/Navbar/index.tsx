import * as React from "react";
import styled from "styled-components";
import { RouteComponentProps } from "react-router-dom";
import { withRouter } from "react-router-dom";

import { Menu } from "styled-icons/boxicons-regular/Menu";
import { ShoppingBasket } from "styled-icons/material/ShoppingBasket";
import { Search } from "styled-icons/boxicons-regular/Search";

import * as storage from "@storage";

const MenuIcon = styled(Menu)`
    width: 30px;
    height: 30px;
`;

const ShoppingBasketIcon = styled(ShoppingBasket)`
    width: 30px;
    height: 30px;
`;

const SearchIcon = styled(Search)`
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
const IconButton = styled.button`
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
const BarGroup = styled.div`
    display: flex;
    justify-content: space-between;
`;
const NavGroup = styled.div`
    display: flex;
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
                key={"Home"}
            >
                Home
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/register"}
                onClick={this.onLinkClick("/register")}
                key={"Register"}
            >
                Register
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/login"}
                onClick={this.onLinkClick("/login")}
                key={"Login"}
            >
                Login
            </Link>
        ];
        const links = [
            <Link
                current={this.props.history.location.pathname == "/"}
                onClick={this.onLinkClick("/")}
                key={"Home"}
            >
                Home
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/products"}
                onClick={this.onLinkClick("/products")}
                key={"Products"}
            >
                Products
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/entries"}
                onClick={this.onLinkClick("/entries")}
                key={"Entries"}
            >
                Entries
            </Link>,
            <Link
                current={this.props.history.location.pathname == "/logout"}
                onClick={this.onLogoutClick}
                key={"Logout"}
            >
                Logout
            </Link>
        ];

        return (
            <div>
                <NavbarBox>
                    <BarGroup>
                        <IconButton onClick={this.onExpandClick}>
                            <MenuIcon />
                        </IconButton>
                        <NavGroup>
                            <IconButton
                                onClick={() =>
                                    this.props.history.push("/entries")
                                }
                            >
                                <ShoppingBasketIcon />
                            </IconButton>
                            <IconButton
                                onClick={() =>
                                    this.props.history.push("/products")
                                }
                            >
                                <SearchIcon />
                            </IconButton>
                        </NavGroup>
                    </BarGroup>
                    {this.state.collapsed ? (
                        isLoggedIn ? (
                            links.map(link => (
                                <LinkWrapper
                                    key={link.key != null ? link.key : 0}
                                >
                                    {link}
                                </LinkWrapper>
                            ))
                        ) : (
                            authLinks.map(link => (
                                <LinkWrapper
                                    key={link.key != null ? link.key : 0}
                                >
                                    {link}
                                </LinkWrapper>
                            ))
                        )
                    ) : (
                        <div />
                    )}
                </NavbarBox>
                <Spacer />
            </div>
        );
    };
}

export default withRouter(Navbar);
