import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { Status } from "@status";
import * as storage from "@storage";
import * as Styled from "./styled";

interface NavbarState {
    collapsed: boolean;
}
interface NavbarProps extends RouteComponentProps {
    isLogged: boolean;
    logOut: () => void;
    setStatus: (status: Status, message: string) => void;
}

class Navbar extends React.PureComponent<NavbarProps, NavbarState> {
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
        this.props.setStatus(Status.None, "");
    };
    onLogoutClick = () => {
        this.setState((prevState: NavbarState) => ({
            ...prevState,
            collapsed: false
        }));
        this.props.logOut();
        this.props.setStatus(Status.Success, "Successfully logged out");
        this.props.history.push("/");
    };
    render = () => {
        const isLoggedIn = this.props.isLogged;
        const authLinks = [
            <Styled.Link
                current={this.props.history.location.pathname == "/"}
                onClick={this.onLinkClick("/")}
                key={"Home"}
            >
                Home
            </Styled.Link>,
            <Styled.Link
                current={this.props.history.location.pathname == "/register"}
                onClick={this.onLinkClick("/register")}
                key={"Register"}
            >
                Register
            </Styled.Link>,
            <Styled.Link
                current={this.props.history.location.pathname == "/login"}
                onClick={this.onLinkClick("/login")}
                key={"Login"}
            >
                Login
            </Styled.Link>
        ];
        const links = [
            <Styled.Link
                current={this.props.history.location.pathname == "/"}
                onClick={this.onLinkClick("/")}
                key={"Home"}
            >
                Home
            </Styled.Link>,
            <Styled.Link
                current={this.props.history.location.pathname == "/products"}
                onClick={this.onLinkClick("/products")}
                key={"Products"}
            >
                Products
            </Styled.Link>,
            <Styled.Link
                current={this.props.history.location.pathname == "/entries"}
                onClick={this.onLinkClick("/entries")}
                key={"Entries"}
            >
                Entries
            </Styled.Link>,
            <Styled.Link
                current={this.props.history.location.pathname == "/logout"}
                onClick={this.onLogoutClick}
                key={"Logout"}
            >
                Logout
            </Styled.Link>
        ];
        return (
            <div>
                <Styled.NavbarBox>
                    <Styled.BarGroup>
                        <Styled.IconButton onClick={this.onExpandClick}>
                            <Styled.MenuIcon />
                        </Styled.IconButton>
                        <Styled.NavGroup>
                            <Styled.IconButton
                                current={
                                    this.props.history.location.pathname ==
                                    "/entries"
                                }
                                onClick={this.onLinkClick("/entries")}
                            >
                                <Styled.ShoppingBasketIcon />
                            </Styled.IconButton>
                            <Styled.IconButton
                                current={
                                    this.props.history.location.pathname ==
                                    "/products"
                                }
                                onClick={this.onLinkClick("/products")}
                            >
                                <Styled.SearchIcon />
                            </Styled.IconButton>
                        </Styled.NavGroup>
                    </Styled.BarGroup>
                    {this.state.collapsed ? (
                        isLoggedIn ? (
                            links.map(link => (
                                <Styled.LinkWrapper
                                    key={link.key != null ? link.key : 0}
                                >
                                    {link}
                                </Styled.LinkWrapper>
                            ))
                        ) : (
                            authLinks.map(link => (
                                <Styled.LinkWrapper
                                    key={link.key != null ? link.key : 0}
                                >
                                    {link}
                                </Styled.LinkWrapper>
                            ))
                        )
                    ) : (
                        <div />
                    )}
                </Styled.NavbarBox>
                <Styled.Spacer />
            </div>
        );
    };
}

export default withRouter(Navbar);
