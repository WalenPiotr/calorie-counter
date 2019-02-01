import * as React from "react";
import { ChevronDown } from "styled-icons/fa-solid/ChevronDown";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";
import * as Styled from "./styled";

interface SelectProps {
    onSelectChange: (value: string) => void;
    options: string[];
    value: string;
    label: string;
}
interface SelectState {
    collapsed: boolean;
}

class Select extends React.Component<SelectProps, SelectState> {
    state = {
        collapsed: true
    };
    onClick = () => {
        this.setState((prev: SelectState) => ({
            ...prev,
            collapsed: !prev.collapsed
        }));
    };
    onSelect = (value: string) => (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        this.setState((prev: SelectState) => ({
            ...prev,
            collapsed: true
        }));
        this.props.onSelectChange(value);
    };
    render() {
        return (
            <Styled.Box onClick={this.onClick}>
                <div>
                    <Styled.Label>{this.props.label}</Styled.Label>
                    <Styled.Value>{this.props.value}</Styled.Value>
                </div>
                <Styled.Button>
                    {this.state.collapsed ? <ChevronDown /> : <ChevronUp />}
                </Styled.Button>
                <Styled.Collapsable collapse={this.state.collapsed}>
                    {this.props.options.map((option: string) => (
                        <Styled.Option
                            key={option}
                            onClick={this.onSelect(option)}
                        >
                            {option}
                        </Styled.Option>
                    ))}
                </Styled.Collapsable>
            </Styled.Box>
        );
    }
}

export default Select;
