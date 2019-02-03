import * as React from "react";
import * as Styled from "./styled";

interface AddNewProps {
    onClick: () => void;
}
class AddNew extends React.PureComponent<AddNewProps, any> {
    render() {
        return (
            <Styled.AddNewBox>
                <Styled.TextLabel>
                    Didn't find what you're looking for? <br /> Add new product!
                </Styled.TextLabel>
                <Styled.Button onClick={this.props.onClick}>
                    <Styled.PlusIcon />
                </Styled.Button>
            </Styled.AddNewBox>
        );
    }
}
export default AddNew;
