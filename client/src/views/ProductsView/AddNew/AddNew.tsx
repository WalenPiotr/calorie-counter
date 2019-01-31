import * as React from "react";
import styled from "styled-components";
import { Plus } from "styled-icons/boxicons-regular/Plus";

interface AddNewControlsProps {
    onClick: () => void;
}

const AddNewBox = styled.div`
    display: flex;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid grey;
`;
const TextLabel = styled.div`
    flex: 80% 1 1;
    font-size: 12px;
    text-align: center;
    vertical-align: middle;
    line-height: 20px;
`;
const Button = styled.button`
    color: white;
    background-color: rgba(30, 100, 200, 1);
    border: none;
    flex: 50px 0 0;
    height: 50px;
    border-radius: 25px;
`;
const PlusIcon = styled(Plus)`
    width: 25px;
    height: 25px;
`;
class AddNew extends React.Component<AddNewControlsProps, any> {
    render() {
        return (
            <AddNewBox>
                <TextLabel>
                    Didn't find what you're looking for? <br /> Add new product!
                </TextLabel>
                <Button onClick={this.props.onClick}>
                    <PlusIcon />
                </Button>
            </AddNewBox>
        );
    }
}
export default AddNew;
