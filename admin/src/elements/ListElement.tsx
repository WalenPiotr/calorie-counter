import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { fonts } from "@theme";
interface ListElementProps {
    css?: FlattenSimpleInterpolation;
}

export const ListElement = styled.div`
    display: flex;
    width: 100%;
    margin-top: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
    ${({ css }: ListElementProps) => {
        return css;
    }}
    font-size: ${fonts.size.small};
`;
