import styled from "styled-components";
import { size, minWidth } from "@media";

const Widget = styled.div`
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-shadow: 3px 3px 50px 6px rgba(0, 0, 0, 0.2);
    margin: 10vh auto;
    padding-top: 30px;
    padding-bottom: 30px;

    width: 95vw;
    @media ${minWidth(size.tablet)} {
        width: 75vw;
    }
    @media ${minWidth(size.laptop)} {
        width: 55vw;
    }
    @media ${minWidth(size.laptopL)} {
        width: 35vw;
    }
    @media ${minWidth(size.desktop)} {
        width: 35vw;
    }
`;

export default Widget;
