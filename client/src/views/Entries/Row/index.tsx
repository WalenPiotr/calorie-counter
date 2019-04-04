import * as React from "react";
import { Portion, Product, Entry } from "../index";
import { Status } from "@status";
import { Gear } from "styled-icons/octicons/Gear";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";
import Input from "@components/Input";
import Select from "@components/Select";
import Calendar from "@components/Calendar";
import * as Styled from "./styled";

interface RowProps {
    updateEntry: (id: number, entry: any) => Promise<void>;
    deleteEntry: (id: number) => Promise<void>;
    setStatus: (status: Status, message: string) => void;
    entry: Entry;
    loggedDates: Date[];
}
interface RowState {
    collapsed: boolean;
    quantity: string;
    quantityError: string | null;
    unit: string;
    date: Date;
}
class Row extends React.Component<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: this.props.entry.quantity.toString(),
        unit: this.props.entry.product.portions.filter(
            (portion: Portion) => this.props.entry.portionID == portion.id,
        )[0].unit,
        date: new Date(this.props.entry.date),
        quantityError: null,
    };

    onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: RowState) => ({
            ...prevState,
            quantity: newValue,
        }));
        this.props.setStatus(Status.None, "");
    };
    onSelectChange = (value: string) => {
        this.setState((prevState: RowState) => ({
            ...prevState,
            unit: value,
        }));
        this.props.setStatus(Status.None, "");
    };
    onCollapseClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.persist();
        await this.setState((prevState: RowState) => ({
            ...prevState,
            collapsed: !this.state.collapsed,
            quantity: this.props.entry.quantity.toString(),
            unit: this.props.entry.product.portions.filter(
                (portion: Portion) => this.props.entry.portionID == portion.id,
            )[0].unit,
        }));
        await this.props.setStatus(Status.None, "");
        window.scrollTo({
            top: event.clientY - 100,
            left: 0,
            behavior: "smooth",
        });
        event.preventDefault();
        event.stopPropagation();
    };
    onUpdateClick = async () => {
        var portionID = -1;
        for (const portion of this.props.entry.product.portions) {
            if (portion.unit == this.state.unit) {
                portionID = portion.id;
                break;
            }
        }
        const id = this.props.entry.id;
        const parsedQuantity = parseFloat(this.state.quantity);
        if (isNaN(parsedQuantity)) {
            this.setState({ quantityError: "Please enter valid value" });
            return;
        }
        if (parsedQuantity < 0) {
            this.setState({ quantityError: "Please enter positive value" });
            return;
        }
        const entry = {
            productID: this.props.entry.product.id,
            portionID: portionID,
            quantity: parsedQuantity,
            date: this.state.date.toISOString(),
        };
        try {
            await this.setState({ quantityError: null });
            const res = await this.props.updateEntry(id, entry);
        } catch (e) {
            console.log(e);
        }
    };
    onDeleteClick = async () => {
        const id = this.props.entry.id;
        await this.props.deleteEntry(id);
    };
    onDateChange = (date: Date) => {
        this.setState((prevState: RowState) => ({
            ...prevState,
            date,
        }));
    };
    getEnergy = (): string => {
        var portionEnergy = 0;
        for (const portion of this.props.entry.product.portions) {
            if (portion.unit == this.state.unit) {
                portionEnergy = portion.energy;
                break;
            }
        }
        const parsedQuantity = parseFloat(this.state.quantity);
        if (isNaN(parsedQuantity)) {
            return "X";
        }
        if (parsedQuantity <= 0) {
            return "X";
        }
        return (portionEnergy * parsedQuantity).toFixed().toString();
    };
    onCalendarClick = () => {
        this.props.setStatus(Status.None, "");
    };
    render() {
        const { entry } = this.props;
        const name = entry.product.name;
        const quantity = entry.quantity;
        const portion = findPortion(entry.product.portions, entry.portionID);
        const unit = portion.unit;
        const controlBox = (
            <Styled.ControlBox hidden={this.state.collapsed}>
                <Styled.RowCalendarBox>
                    <Calendar
                        date={this.state.date}
                        logged={this.props.loggedDates}
                        onDateChange={this.onDateChange}
                        onCollapseClick={this.onCalendarClick}
                    />
                </Styled.RowCalendarBox>
                <Input
                    label={"Enter Amount"}
                    value={this.state.quantity}
                    onChange={this.onInputChange}
                    error={this.state.quantityError}
                />
                <Select
                    label={"Select unit"}
                    options={this.props.entry.product.portions.map(
                        (portion: Portion) => portion.unit,
                    )}
                    value={this.state.unit}
                    onSelectChange={this.onSelectChange}
                />
                <Styled.NutrientDiv>
                    <Styled.NutrientLabel>Calories</Styled.NutrientLabel>
                    <Styled.NutrientValue>
                        {this.getEnergy()}
                    </Styled.NutrientValue>
                </Styled.NutrientDiv>
                <Styled.BlockButtonGroup>
                    <Styled.SmallBlockButton onClick={this.onUpdateClick}>
                        Update
                    </Styled.SmallBlockButton>
                    <Styled.SmallBlockButton onClick={this.onDeleteClick}>
                        Delete
                    </Styled.SmallBlockButton>
                </Styled.BlockButtonGroup>
            </Styled.ControlBox>
        );
        const rowBox = (
            <Styled.RowBox>
                <Styled.Element width={"30%"}>{name}</Styled.Element>
                <Styled.Element width={"15%"}>{quantity}</Styled.Element>
                <Styled.Element width={"15%"}>{unit}</Styled.Element>
                <Styled.Element width={"25%"} grow>
                    {this.getEnergy()} kcal
                </Styled.Element>
                <Styled.ExpandButton onClick={this.onCollapseClick}>
                    {this.state.collapsed ? <Gear /> : <ChevronUp />}
                </Styled.ExpandButton>
            </Styled.RowBox>
        );
        return (
            <Styled.Box>
                {rowBox}
                {this.state.collapsed ? null : controlBox}
            </Styled.Box>
        );
    }
}
export default Row;

const findPortion = (portions: Portion[], portionID: number) => {
    portions.filter((portion: Portion) => {
        return portion.id == portionID;
    });
    return portions[0];
};
