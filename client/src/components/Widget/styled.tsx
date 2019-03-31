import styled from "styled-components";
import { media, minWidth } from "@theme";

export const Outer = styled.div`
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-shadow: 3px 3px 50px 6px rgba(0, 0, 0, 0.2);
    margin: 10vh auto;

    width: 95vw;
    @media ${minWidth(media.tablet)} {
        width: 75vw;
    }
    @media ${minWidth(media.laptop)} {
        width: 55vw;
    }
    @media ${minWidth(media.laptopL)} {
        width: 35vw;
    }
    @media ${minWidth(media.desktop)} {
        width: 35vw;
    }
`;
export const Inner = styled.div`
    width: 90%;
    margin: 5%;
    margin-top: 30px;
    margin-bottom: 30px;
`;
