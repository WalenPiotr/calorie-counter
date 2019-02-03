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
import { Status } from "@status";

interface RowProps {
    product: Product;
    setStatus: (status: Status, message: string) => void;
}
interface RowState {
    collapsed: boolean;
    quantity: string;
    unit: string;
    date: Date;
}

class Row extends React.PureComponent<RowProps, RowState> {
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
        this.props.setStatus(Status.None, "");
    };
    onSelectChange = (value: string) => {
        this.setState((prevState: RowState) => ({
            ...prevState,
            unit: value
        }));
        this.props.setStatus(Status.None, "");
    };
    onCollapseClick = () => {
        this.setState({ collapsed: !this.state.collapsed });
        this.props.setStatus(Status.None, "");
    };
    onAddClick = async () => {
        var portionID = -1;
        for (const portion of this.props.product.portions) {
            if (portion.unit == this.state.unit) {
                portionID = portion.id;
                break;
            }
        }
        const entry = {
            productID: this.props.product.id,
            portionID: portionID,
            quantity: parseFloat(this.state.quantity),
            date: this.state.date.toISOString()
        };
        const res = await requests.createEntry({ entry });
        this.setState({ collapsed: true });
        if (res.entry) {
            this.props.setStatus(Status.Success, "Entry added");
            return;
        }
        if (res.error) {
            this.props.setStatus(Status.Error, res.error);
            return;
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
        this.props.setStatus(Status.None, "");
    };
    onCalendarClick = () => {
        this.props.setStatus(Status.None, "");
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
                            onCollapseClick={this.onCalendarClick}
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
