import styled from "styled-components";
import { Plus } from "styled-icons/boxicons-regular/Plus";

export const AddNewBox = styled.div`
    display: flex;
    padding-top: 10px;
`;
export const TextLabel = styled.div`
    flex: 80% 1 1;
    font-size: 12px;
    text-align: center;
    vertical-align: middle;
    line-height: 20px;
`;
export const Button = styled.button`
    color: white;
    background-color: rgba(30, 100, 200, 1);
    border: none;
    flex: 50px 0 0;
    height: 50px;
    border-radius: 25px;
`;
export const PlusIcon = styled(Plus)`
    width: 25px;
    height: 25px;
`;
