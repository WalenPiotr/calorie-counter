import * as React from "react";
import { Product, Portion } from "../../";
import * as Styled from "./styled";
import * as storage from "@storage";

import Input from "@components/Input";
import BlockButton from "@elements/BlockButton";
import Select from "@components/Select";
import Calendar from "@components/Calendar";
import { ShoppingBasket } from "styled-icons/material/ShoppingBasket";
import { ChevronUp } from "styled-icons/boxicons-regular/ChevronUp";
import * as requests from "@requests";

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
        var portionID = -1;
        for (const portion of this.props.product.portions) {
            if (portion.unit == this.state.unit) {
                portionID = portion.id;
                break;
            }
        }
        const token = storage.retrieveToken();
        const entry = {
            productID: this.props.product.id,
            portionID: portionID,
            quantity: parseFloat(this.state.quantity),
            date: this.state.date.toISOString()
        };
        try {
            await requests.createEntry(entry);
            this.setState({ collapsed: true });
        } catch (e) {
            console.log(e);
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
                <Styled.LineBox>
                    <div>
                        <Styled.BigLabel>
                            {this.props.product.name}
                        </Styled.BigLabel>
                        <div>
                            <Styled.SmallLabel>
                                Energy:{" "}
                                <label>
                                    {this.props.product.portions[0].energy.toFixed()}
                                </label>{" "}
                                kcal
                            </Styled.SmallLabel>
                            <Styled.SmallLabel>
                                Unit:
                                <label>
                                    {this.props.product.portions[0].unit}
                                </label>
                            </Styled.SmallLabel>
                        </div>
                    </div>

                    <Styled.CollapseButton onClick={this.onCollapseClick}>
                        {this.state.collapsed ? (
                            <ShoppingBasket />
                        ) : (
                            <ChevronUp />
                        )}
                    </Styled.CollapseButton>
                </Styled.LineBox>
                <Styled.ControlBox hidden={this.state.collapsed}>
                    <Styled.CalendarBox>
                        <Calendar
                            date={this.state.date}
                            logged={[]}
                            onDateChange={this.onDateChange}
                        />
                    </Styled.CalendarBox>
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
                    <Styled.NutrientDiv>
                        <Styled.NutrientLabel>Calories</Styled.NutrientLabel>
                        <Styled.NutrientValue>
                            {this.getEnergy().toFixed()}
                        </Styled.NutrientValue>
                    </Styled.NutrientDiv>
                    <BlockButton onClick={this.onAddClick}>ADD</BlockButton>
                </Styled.ControlBox>
            </div>
        );
    }
}
export default Row;
