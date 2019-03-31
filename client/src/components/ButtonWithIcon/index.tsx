import * as React from "react";
import { Button } from "./styled";
interface ButtonWithIconProps {
    icon: JSX.Element;
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

class ButtonWithIcon extends React.Component<ButtonWithIconProps> {
    render() {
        const { icon, text, onClick, disabled } = this.props;
        return (
            <Button disabled={disabled} onClick={onClick}>
                {icon}
                {text}
            </Button>
        );
    }
}
export default ButtonWithIcon;
