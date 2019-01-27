import * as React from "react";
import * as storage from "./storage";
import styled from "styled-components";
import Widget from "./elements/Widget";
import { ChevronDown } from "styled-icons/fa-solid/ChevronDown";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";
import { TrashAlt } from "styled-icons/boxicons-regular/TrashAlt";
import Input from "./blocks/Input";
import BlockButton from "./elements/BlockButton";
import Select from "./blocks/Select";

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

const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 15px;
`;

interface EntriesState {
    entries: Entry[];
}
interface EntriesProps {}

class Entries extends React.Component<EntriesProps, EntriesState> {
    state = {
        entries: []
    };
    fetchData = async () => {
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({}),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            method: "POST",
            type: "cors"
        };
        try {
            const response = await fetch(
                "http://localhost:8080/api/user/entries/view",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
            this.setState((prevState: EntriesState) => ({
                ...prevState,
                entries: parsed.entries
            }));
        } catch (err) {
            console.log(err);
        }
    };

    componentDidMount = () => {
        this.fetchData();
    };

    render() {
        return (
            <Widget>
                <Label>Entries</Label>
                {this.state.entries
                    .sort((a: Entry, b: Entry) => a.id - b.id)
                    .map((entry: Entry) => {
                        return (
                            <Row
                                key={entry.id}
                                fetchData={this.fetchData}
                                entry={entry}
                            />
                        );
                    })}
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

interface RowProps {
    fetchData: () => void;
    entry: Entry;
}
interface RowState {
    collapsed: boolean;
}

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
class Row extends React.Component<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: this.props.entry.quantity.toString(),
        unit: this.props.entry.product.portions.filter(
            (portion: Portion) => this.props.entry.portionID == portion.id
        )[0].unit
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
        this.setState((prevState: RowState) => ({
            ...prevState,
            collapsed: !this.state.collapsed,
            quantity: this.props.entry.quantity.toString(),
            unit: this.props.entry.product.portions.filter(
                (portion: Portion) => this.props.entry.portionID == portion.id
            )[0].unit
        }));
    };
    onUpdateClick = async () => {
        var portionID = null;
        for (const portion of this.props.entry.product.portions) {
            if (portion.unit == this.state.unit) {
                portionID = portion.id;
                break;
            }
        }
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({
                id: this.props.entry.id,
                entry: {
                    productID: this.props.entry.product.id,
                    portionID: portionID,
                    quantity: parseInt(this.state.quantity)
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
                "http://localhost:8080/api/user/entries/update",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
            await this.setState((prevState: RowState) => ({
                ...prevState,
                collapsed: true
            }));
            await this.props.fetchData();
        } catch (err) {
            console.log(err);
        }
    };
    onDeleteClick = async () => {
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({
                id: this.props.entry.id
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
                "http://localhost:8080/api/user/entries/delete",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
            await this.props.fetchData();
        } catch (err) {
            console.log(err);
        }
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

    render() {
        const { entry } = this.props;
        const id = entry.id;
        const name = entry.product.name;
        const quantity = entry.quantity;
        const portion = findPortion(entry.product.portions, entry.portionID);
        const energy = portion.energy * quantity;
        const unit = portion.unit;
        return (
            <Box>
                <RowBox>
                    <Element width={"35%"}>{name}</Element>
                    <Element width={"15%"}>{quantity}</Element>
                    <Element width={"15%"}>{unit}</Element>
                    <Element width={"30%"}>{energy} kcal</Element>
                    <ExpandButton onClick={this.onCollapseClick}>
                        {this.state.collapsed ? <ChevronDown /> : <ChevronUp />}
                    </ExpandButton>
                </RowBox>
                <ControlBox hidden={this.state.collapsed}>
                    <Input
                        label={"Amount"}
                        value={this.state.quantity}
                        onChange={this.onInputChange}
                    />
                    <Select
                        options={this.props.entry.product.portions.map(
                            (portion: Portion) => portion.unit
                        )}
                        value={this.state.unit}
                        onSelectChange={this.onSelectChange}
                    />
                    <NutrientDiv>
                        <NutrientLabel>Calories</NutrientLabel>
                        <NutrientValue>{this.getEnergy()}</NutrientValue>
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
