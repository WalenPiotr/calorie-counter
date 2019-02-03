import * as React from "react";
import styled from "styled-components";
import { Gear } from "styled-icons/octicons/Gear";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";

import Widget from "@elements/Widget";
import BlockButton from "@elements/BlockButton";

import Input from "@components/Input";
import Select from "@components/Select";
import Calendar from "@components/Calendar";

import * as requests from "@requests";
import Spinner from "@elements/Spinner";

import { Status } from "@status";

interface Entry {
    id: number;
    userID: number;
    productID: number;
    portionID: number;
    quantity: number;
    date: string;
    product: Product;
}
interface Portion {
    id: number;
    productID: number;
    unit: string;
    energy: number;
}
interface Product {
    id: number;
    name: string;
    creator: number;
    portions: Portion[];
}

const CalendarBox = styled.div`
    width: 85%;
    margin-bottom: 20px;
    border: 1px solid grey;
`;
const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 10px;
    margin-bottom: 20px;
`;
const SpinnerBox = styled.div`
    width: 50px;
    height: 50px;
    color: rgba(30, 100, 200, 1);
    margin: 10px auto;
`;

interface EntriesState {
    entries: Entry[];
    loggedDates: Date[];
    date: Date;
    isLoading: boolean;
}
interface EntriesProps {
    setStatus: (status: Status, message: string) => void;
}

class Entries extends React.PureComponent<EntriesProps, EntriesState> {
    state = {
        entries: [],
        date: new Date(),
        loggedDates: [],
        isLoading: false
    };
    componentDidMount = () => {
        this.fetchData();
    };
    onDateChange = async (date: Date) => {
        await this.setState((prevState: EntriesState) => ({
            ...prevState,
            isLoading: true,
            date
        }));
        this.props.setStatus(Status.None, "");
        this.fetchData();
    };
    fetchData = async () => {
        await this.setState((prevState: EntriesState) => ({
            ...prevState,
            isLoading: true
        }));
        const date = this.state.date.toISOString();
        const resView = await requests.entriesView({ date });
        if (resView.error) {
            this.props.setStatus(Status.Error, resView.error);
            this.setState({ isLoading: false });
            return;
        }
        const resDates = await requests.getDates();
        if (resDates.error) {
            this.props.setStatus(Status.Error, resDates.error);
            this.setState({ isLoading: false });
            return;
        }
        if (resDates.dates != undefined && resView.entries != undefined) {
            this.setState({
                loggedDates: resDates.dates.map((val: string) => new Date(val)),
                entries: resView.entries,
                isLoading: false
            });
            return;
        }
        this.setState({ isLoading: false });
    };

    updateEntry = async (id: number, entry: any) => {
        await this.setState((prevState: EntriesState) => ({
            ...prevState,
            isLoading: true
        }));
        const res = await requests.updateEntry({ id, entry });
        if (res.error) {
            this.props.setStatus(Status.Error, res.error);
            return;
        }
        const date = this.state.date.toISOString();
        const resEntries = await requests.entriesView({ date });
        if (resEntries.error) {
            this.props.setStatus(Status.Error, resEntries.error);
            this.setState({ isLoading: false });
            return;
        }
        const resLoggedDates = await requests.getDates();
        if (resLoggedDates.error) {
            this.props.setStatus(Status.Error, resLoggedDates.error);
            this.setState({ isLoading: false });
            return;
        }
        if (resLoggedDates.dates && resEntries.entries) {
            this.props.setStatus(Status.Success, "Entry successfully updated");
            await this.setState({
                entries: resEntries.entries,
                loggedDates: resLoggedDates.dates.map(
                    (val: string) => new Date(val)
                ),
                isLoading: false
            });
        }
        this.setState({ isLoading: false });
    };

    deleteEntry = async (id: number) => {
        await this.setState((prevState: EntriesState) => ({
            ...prevState,
            isLoading: true
        }));
        const res = await requests.deleteEntry({ id });
        if (res.error) {
            this.props.setStatus(Status.Error, res.error);
            return;
        }
        const date = this.state.date.toISOString();
        const resEntries = await requests.entriesView({ date });
        if (resEntries.error) {
            this.props.setStatus(Status.Error, resEntries.error);
            this.setState({ isLoading: false });
            return;
        }
        const resLoggedDates = await requests.getDates();
        if (resLoggedDates.error) {
            this.props.setStatus(Status.Error, resLoggedDates.error);
            this.setState({ isLoading: false });
            return;
        }
        if (resLoggedDates.dates && resEntries.entries) {
            this.props.setStatus(Status.Success, "Entry successfully deleted");
            await this.setState({
                entries: resEntries.entries,
                loggedDates: resLoggedDates.dates.map(
                    (val: string) => new Date(val)
                ),
                isLoading: false
            });
        }
        this.setState({ isLoading: false });
    };

    onCalendarClick = () => {
        this.props.setStatus(Status.None, "");
    };
    render() {
        const rows =
            this.state.entries.length == 0 ? (
                <div>Nothing found</div>
            ) : (
                this.state.entries
                    .sort((a: Entry, b: Entry) => a.id - b.id)
                    .map((entry: Entry) => {
                        return (
                            <Row
                                setStatus={this.props.setStatus}
                                updateEntry={this.updateEntry}
                                deleteEntry={this.deleteEntry}
                                key={entry.id}
                                entry={entry}
                                loggedDates={this.state.loggedDates}
                            />
                        );
                    })
            );
        return (
            <Widget>
                <Label>Entries</Label>
                <CalendarBox>
                    <Calendar
                        date={this.state.date}
                        logged={this.state.loggedDates}
                        onDateChange={this.onDateChange}
                        onCollapseClick={this.onCalendarClick}
                    />
                </CalendarBox>

                {!this.state.isLoading ? (
                    rows
                ) : (
                    <SpinnerBox>
                        <Spinner />
                    </SpinnerBox>
                )}
            </Widget>
        );
    }
}

interface ElementProps {
    width: string;
}

const RowBox = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 50px;
    border-top: 1px solid grey;
    width: 100%;
`;
const Element = styled.div`
    width: ${(props: ElementProps) => props.width};
    text-align: left;
    vertical-align: middle;
    font-size: 14px;
`;
const ExpandButton = styled.button`
    width: 50px;
    height: 50px;
    background-color: none;
    color: rgba(30, 100, 200, 1);
    border: none;
    background-color: transparent;
    height: 50px;
    width: 50px;
    padding: 10px;
    font-size: 20px;
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
    /* border-bottom: 1px solid grey; */
    padding: 10px;
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
const Box = styled.div`
    width: 85%;
`;
const BlockButtonGroup = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-around;
`;

const SmallBlockButton = styled(BlockButton)`
    width: 35%;
`;
const RowCalendarBox = styled.div`
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid grey;
`;
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
    unit: string;
    date: Date;
}
class Row extends React.Component<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: this.props.entry.quantity.toString(),
        unit: this.props.entry.product.portions.filter(
            (portion: Portion) => this.props.entry.portionID == portion.id
        )[0].unit,
        date: new Date(this.props.entry.date)
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
        this.setState((prevState: RowState) => ({
            ...prevState,
            collapsed: !this.state.collapsed,
            quantity: this.props.entry.quantity.toString(),
            unit: this.props.entry.product.portions.filter(
                (portion: Portion) => this.props.entry.portionID == portion.id
            )[0].unit
        }));
        this.props.setStatus(Status.None, "");
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
        const entry = {
            productID: this.props.entry.product.id,
            portionID: portionID,
            quantity: parseFloat(this.state.quantity),
            date: this.state.date.toISOString()
        };
        try {
            await this.props.updateEntry(id, entry);
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
            date
        }));
    };
    getEnergy = (): number => {
        var portionEnergy = 0;
        for (const portion of this.props.entry.product.portions) {
            if (portion.unit == this.state.unit) {
                portionEnergy = portion.energy;
                break;
            }
        }
        const parsedQuantity = parseFloat(this.state.quantity);
        const quantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;
        return portionEnergy * quantity;
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
        return (
            <Box>
                <RowBox>
                    <Element width={"35%"}>{name}</Element>
                    <Element width={"15%"}>{quantity}</Element>
                    <Element width={"15%"}>{unit}</Element>
                    <Element width={"30%"}>
                        {this.getEnergy().toFixed()} kcal
                    </Element>
                    <ExpandButton onClick={this.onCollapseClick}>
                        {this.state.collapsed ? <Gear /> : <ChevronUp />}
                    </ExpandButton>
                </RowBox>
                <ControlBox hidden={this.state.collapsed}>
                    <RowCalendarBox>
                        <Calendar
                            date={this.state.date}
                            logged={this.props.loggedDates}
                            onDateChange={this.onDateChange}
                            onCollapseClick={this.onCalendarClick}
                        />
                    </RowCalendarBox>
                    <Input
                        label={"Enter Amount"}
                        value={this.state.quantity}
                        onChange={this.onInputChange}
                    />
                    <Select
                        label={"Select unit"}
                        options={this.props.entry.product.portions.map(
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
                    <BlockButtonGroup>
                        <SmallBlockButton onClick={this.onUpdateClick}>
                            Update
                        </SmallBlockButton>
                        <SmallBlockButton onClick={this.onDeleteClick}>
                            Delete
                        </SmallBlockButton>
                    </BlockButtonGroup>
                </ControlBox>
            </Box>
        );
    }
}

const findPortion = (portions: Portion[], portionID: number) => {
    portions.filter((portion: Portion) => {
        return portion.id == portionID;
    });
    return portions[0];
};

export default Entries;
