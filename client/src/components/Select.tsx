import * as React from "react";
import styled from "styled-components";
import { ChevronDown } from "styled-icons/fa-solid/ChevronDown";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";

const Styled = {
    Box: styled.div`
        position: relative;
        width: 100%;
        border: 1px solid grey;
        display: flex;
        justify-content: space-between;
        height: 65px;
    `,
    Label: styled.div`
        padding-top: 10px;
        font-weight: 500;
        font-size: 12px;
        text-transform: uppercase;
        margin-left: 10px;
        margin-bottom: 8px;
        color: rgba(30, 100, 200, 1);
    `,
    Value: styled.div`
        margin-left: 10px;
        font-size: 16px;
    `,
    Button: styled.button`
        border: none;
        color: rgba(30, 100, 200, 1);
        background-color: transparent;
        height: 65px;
        width: 72px;
        padding-top: 20px;
        padding-left: 32px;
        padding-right: 12px;
        font-size: 30px;
        color: rgba(30, 100, 200, 1);
    `,
    Collapsable: styled.div`
        display: ${(props: { collapse: boolean }) =>
            props.collapse ? "none" : "block"};
        position: absolute;
        top: 66px;
        left: -1px;
        width: 100%;
        background-color: red;
        z-index: 10;
    `,
    Option: styled.div`
        background-color: white;
        border-bottom: 1px solid grey;
        border-left: 1px solid grey;
        border-right: 1px solid grey;
        height: 50px;
        width: calc(100% - 10px);
        padding-left: 10px;
        display: flex;
        align-items: center;
    `
};

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
    onSelect = (value: string) => () => {
        this.setState((prev: SelectState) => ({
            ...prev,
            collapsed: true
        }));
        this.props.onSelectChange(value);
    };
    render() {
        return (
            <Styled.Box>
                <div>
                    <Styled.Label>{this.props.label}</Styled.Label>
                    <Styled.Value>{this.props.value}</Styled.Value>
                </div>
                <Styled.Button onClick={this.onClick}>
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
