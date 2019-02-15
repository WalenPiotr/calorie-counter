import * as React from "react";
import { Product, Portion } from "../../";
import * as Styled from "./styled";
import * as storage from "@storage";

import Input from "@components/Input";
import BlockButton from "@elements/BlockButton";
import Select from "@components/Select";
import Calendar from "@components/Calendar";
import { ShoppingBasket } from "styled-icons/material/ShoppingBasket";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";
import * as requests from "@requests";
import { Status } from "@status";
import { Like } from "styled-icons/boxicons-solid/Like";
import { Dislike } from "styled-icons/boxicons-solid/Dislike";

interface RowProps {
    product: Product;
    userID: number;
    setStatus: (status: Status, message: string) => void;
}
interface RowState {
    collapsed: boolean;
    quantity: string;
    quantityError: string | null;
    unit: string;
    date: Date;
    tempVote: number;
}

class Row extends React.PureComponent<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: "1",
        quantityError: null,
        unit: this.props.product.portions[0].unit,
        date: new Date(),
        tempVote: -2
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
            productID: this.props.product.id,
            portionID: portionID,
            quantity: parsedQuantity,
            date: this.state.date.toISOString()
        };
        const res = await requests.createEntry({ entry });
        this.setState({ collapsed: true });
        if (res.entry) {
            this.props.setStatus(Status.Success, "Entry added");
            this.setState({ quantityError: null });
            return;
        }
        if (res.error) {
            this.props.setStatus(Status.Error, res.error);
            return;
        }
    };
    getEnergy = (): string => {
        var portionEnergy = 0;
        for (const portion of this.props.product.portions) {
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
    rateProduct = (vote: number) => async () => {
        if (this.state.tempVote === vote) {
            this.setState({ tempVote: 0 });
            const res = await requests.rateProduct({
                id: this.props.product.id,
                vote: 0
            });
            return;
        }
        if (
            this.state.tempVote === -2 &&
            this.hasBeenDownvoted() &&
            vote === -1
        ) {
            this.setState({ tempVote: 0 });
            const res = await requests.rateProduct({
                id: this.props.product.id,
                vote: 0
            });
            return;
        }
        if (this.state.tempVote === -2 && this.hasBeenUpvoted() && vote === 1) {
            this.setState({ tempVote: 0 });
            const res = await requests.rateProduct({
                id: this.props.product.id,
                vote: 0
            });
            return;
        }
        this.setState({ tempVote: vote });
        const res = await requests.rateProduct({
            id: this.props.product.id,
            vote: vote
        });
        return;
    };
    findVotesSum = (): number => {
        const val = this.props.product.ratings.reduce(
            (prev: number, curr: { userID: number; vote: number }) => {
                return prev + curr.vote;
            },
            0
        );
        if (this.state.tempVote === -1 && this.hasBeenUpvoted()) {
            return val - 2;
        }
        if (this.state.tempVote === 1 && this.hasBeenDownvoted()) {
            return val + 2;
        }
        if (this.state.tempVote === 0 && this.hasBeenDownvoted()) {
            return val + 1;
        }
        if (this.state.tempVote === 0 && this.hasBeenUpvoted()) {
            return val - 1;
        }
        return val;
    };
    hasBeenDownvoted = (): boolean => {
        const userID = this.props.userID;
        const db = this.props.product.ratings.reduce(
            (prev: boolean, curr: { userID: number; vote: number }) => {
                console.log({ ...curr });
                return curr.vote === -1 && (prev || curr.userID === userID);
            },
            false
        );
        return db;
    };
    hasBeenUpvoted = (): boolean => {
        const userID = this.props.userID;
        const db = this.props.product.ratings.reduce(
            (prev: boolean, curr: { userID: number; vote: number }) => {
                console.log({ ...curr });
                return curr.vote === 1 && (prev || curr.userID === userID);
            },
            false
        );
        return db;
    };
    render() {
        return (
            <div key={this.props.product.name}>
                <Styled.LineBox>
                    <Styled.InfoBox>
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
                    </Styled.InfoBox>
                    <Styled.VoteBox>
                        <Styled.Votes>{this.findVotesSum()}</Styled.Votes>
                        <Styled.VoteButton
                            onClick={this.rateProduct(1)}
                            green={
                                (this.state.tempVote == -2 &&
                                    this.hasBeenUpvoted()) ||
                                this.state.tempVote == 1
                            }
                        >
                            <Like />
                        </Styled.VoteButton>
                        <Styled.VoteButton
                            onClick={this.rateProduct(-1)}
                            red={
                                (this.state.tempVote == -2 &&
                                    this.hasBeenDownvoted()) ||
                                this.state.tempVote == -1
                            }
                        >
                            <Dislike />
                        </Styled.VoteButton>
                    </Styled.VoteBox>
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
                        error={this.state.quantityError}
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
                            {this.getEnergy()}
                        </Styled.NutrientValue>
                    </Styled.NutrientDiv>
                    <BlockButton onClick={this.onAddClick}>ADD</BlockButton>
                </Styled.ControlBox>
            </div>
        );
    }
}
export default Row;
