import * as React from "react";
import styled from "styled-components";
import { ChevronDown } from "styled-icons/fa-solid/ChevronDown";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";
import { Product, Portion } from "..";

import * as storage from "@storage";
import Input from "@components/Input";
import BlockButton from "@elements/BlockButton";
import Select from "@components/Select";
import Calendar from "@components/Calendar";
import { ShoppingBasket } from "styled-icons/material/ShoppingBasket";

interface TableProps {
    products: Product[];
}
interface TableState {
    collapsed: boolean;
}
class Table extends React.Component<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);
        this.state = { collapsed: true };
    }
    async componentDidMount() {}

    render() {
        const components = this.props.products.map((product: Product) => {
            return <Row product={product} key={product.id} />;
        });
        return <div>{components}</div>;
    }
}

const LineBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid grey;
    height: 50px;
    padding-top: 5px;
    padding-bottom: 5px;

    padding-left: 5px;
`;
const CollapseButton = styled.button`
    border: none;
    color: rgba(30, 100, 200, 1);
    background-color: transparent;
    height: 50px;
    width: 50px;
    padding: 10px;
    font-size: 30px;
`;

interface ControlBoxProps {
    hidden: boolean;
}
const ControlBox = styled.div`
    display: ${(props: ControlBoxProps) => (props.hidden ? "none" : "flex")};
    width: 90%;
    margin: 20px auto;
    justify-content: center;
    flex-direction: column;
    align-items: center;
`;

const NutrientLabel = styled.label`
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
`;
const NutrientValue = styled.label`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 5px;
`;

const NutrientDiv = styled.div`
    width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const BigLabel = styled.label`
    font-size: 24px;
`;
const SmallLabel = styled.label`
    font-size: 12px;
    width: 100px;
    display: inline-block;
`;
const CalendarBox = styled.div`
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid grey;
`;

interface RowProps {
    product: Product;
}
interface RowState {
    collapsed: boolean;
    quantity: string;
    unit: string;
    date: Date;
}
class Row extends React.Component<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: "1",
        unit: this.props.product.portions[0].unit,
        date: new Date()
    };
    onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: RowState) => ({
            ...prevState,
            quantity: newValue
        }));
    };
    onSelectChange = (value: string) => {
        this.setState((prevState: RowState) => ({
            ...prevState,
            unit: value
        }));
    };
    onCollapseClick = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };
    onAddClick = async () => {
        var portionID = null;
        for (const portion of this.props.product.portions) {
            if (portion.unit == this.state.unit) {
                portionID = portion.id;
                break;
            }
        }
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({
                entry: {
                    productID: this.props.product.id,
                    portionID: portionID,
                    quantity: parseFloat(this.state.quantity),
                    date: this.state.date.toISOString()
                }
            }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            method: "POST",
            type: "cors"
        };
        console.log(request);
        try {
            const response = await fetch(
                "http://localhost:8080/api/user/entries/create",
                request
            );
            const parsed = await response.json();
            this.setState({ collapsed: true });
            console.log(parsed);
        } catch (err) {
            console.log(err);
        }
    };
    getEnergy = (): number => {
        var portionEnergy = 0;
        for (const portion of this.props.product.portions) {
            if (portion.unit == this.state.unit) {
                portionEnergy = portion.energy;
                break;
            }
        }
        const parsedQuantity = parseFloat(this.state.quantity);
        const quantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;
        return portionEnergy * quantity;
    };
    onDateChange = async (date: Date) => {
        console.log(date.toISOString());
        await this.setState((prevState: RowState) => ({
            ...prevState,
            date
        }));
    };
    render() {
        return (
            <div key={this.props.product.name}>
                <LineBox>
                    <div>
                        <BigLabel>{this.props.product.name}</BigLabel>
                        <div>
                            <SmallLabel>
                                Energy:{" "}
                                <label>
                                    {this.props.product.portions[0].energy.toFixed()}
                                </label>{" "}
                                kcal
                            </SmallLabel>
                            <SmallLabel>
                                Unit:
                                <label>
                                    {this.props.product.portions[0].unit}
                                </label>
                            </SmallLabel>
                        </div>
                    </div>

                    <CollapseButton onClick={this.onCollapseClick}>
                        {this.state.collapsed ? (
                            <ShoppingBasket />
                        ) : (
                            <ChevronUp />
                        )}
                    </CollapseButton>
                </LineBox>
                <ControlBox hidden={this.state.collapsed}>
                    <CalendarBox>
                        <Calendar
                            date={this.state.date}
                            logged={[]}
                            onDateChange={this.onDateChange}
                        />
                    </CalendarBox>
                    <Input
                        label={"Enter Amount"}
                        value={this.state.quantity}
                        onChange={this.onInputChange}
                    />
                    <Select
                        label={"Select Unit"}
                        options={this.props.product.portions.map(
                            (portion: Portion) => portion.unit
                        )}
                        value={this.state.unit}
                        onSelectChange={this.onSelectChange}
                    />
                    <NutrientDiv>
                        <NutrientLabel>Calories</NutrientLabel>
                        <NutrientValue>
                            {this.getEnergy().toFixed()}
                        </NutrientValue>
                    </NutrientDiv>
                    <BlockButton onClick={this.onAddClick}>ADD</BlockButton>
                </ControlBox>
            </div>
        );
    }
}

export default Table;
