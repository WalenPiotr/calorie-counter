import styled, { css } from "styled-components";
import { Menu } from "styled-icons/boxicons-regular/Menu";
import { ShoppingBasket } from "styled-icons/material/ShoppingBasket";
import { Search } from "styled-icons/boxicons-regular/Search";

export const MenuIcon = styled(Menu)`
    width: 30px;
    height: 30px;
`;

export const ShoppingBasketIcon = styled(ShoppingBasket)`
    width: 30px;
    height: 30px;
`;

export const SearchIcon = styled(Search)`
    width: 30px;
    height: 30px;
`;

export const NavbarBox = styled.div`
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
export const Spacer = styled.div`
    height: 50px;
`;

interface IconButtonProps {
    current?: boolean;
}
export const IconButton = styled.button`
    height: 40px;
    background: none;
    color: white;
    border: none;
    :focus {
        outline: none;
    }
    font-size: 18px;
    border-bottom: 3px solid transparent;
    margin-top: 5px;
    margin-bottom: 5px;
    margin-right: 5px;
    ${({ current }: IconButtonProps) =>
        current &&
        css`
            border-bottom: 3px solid white;
        `}
`;

interface LinkProps {
    current: boolean;
}
export const Link = styled.a`
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
export const LinkWrapper = styled.div`
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
`;
export const BarGroup = styled.div`
    display: flex;
    justify-content: space-between;
    margin-right: 15px;
`;
export const NavGroup = styled.div`
    display: flex;
`;
