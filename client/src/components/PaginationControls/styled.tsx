import styled from "styled-components";
import { ChevronRight } from "styled-icons/fa-solid/ChevronRight";
import { ChevronLeft } from "styled-icons/fa-solid/ChevronLeft";
import { fonts } from "@theme";
export const ArrowRight = styled(ChevronRight)`
    width: 60%;
    height: 60%;
`;
export const ArrowLeft = styled(ChevronLeft)`
    width: 60%;
    height: 60%;
`;
export const Box = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 10px;
`;
export const Text = styled.div`
    margin-right: 10px;
    margin-left: 10px;
    margin-bottom: 8px;
    font-size: ${fonts.size.medium};
`;
