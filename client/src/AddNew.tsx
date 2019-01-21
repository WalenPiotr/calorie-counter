import * as React from "react";
import styled from "@styled-components";
import * as storage from "./storage";
import { string } from "prop-types";

interface AddNewProps {}
interface AddNewState {
    product: {
        name: string;
        description: string;
        portions: {
            energy: string;
            unit: string;
        }[];
    };
}

const MainBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const PortionGroup = styled.div`
    width: 100%;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
    border-top: 1px solid grey;
`;
const InputGroup = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 80%;
    margin: 0 auto;
`;
const Label = styled.label`
    margin-top: 10px;
`;
const Input = styled.input`
    width: 100%;
    height: 40px;
    padding-left: 10px;
`;
const Button = styled.button`
    width: 80%;
    height: 40px;
    margin: 10px auto;
`;
const XButton = styled.button`
    width: 30px;
    height: 30px;
`;

interface Payload {
    product: {
        name: string;
        description: string;
        portions: {
            energy: number;
            unit: string;
        }[];
    };
}

class AddNew extends React.Component<AddNewProps, AddNewState> {
    state = {
        product: {
            name: "",
            description: "",
            portions: [
                {
                    energy: "",
                    unit: ""
                }
            ]
        }
    };
    onAddClick = async () => {
        const token = storage.retrieveToken();
        const parsedPortions = this.state.product.portions.map(
            (portion: {
                energy: string;
                unit: string;
            }): {
                energy: number;
                unit: string;
            } => {
                const energy = parseFloat(portion.energy);
                if (isNaN(energy)) {
                    throw Error("PARSING ERROR TO HANDLE");
                } else {
                    return {
                        energy: energy,
                        unit: portion.unit
                    };
                }
            }
        );
        const payload: Payload = {
            product: {
                name: this.state.product.name,
                description: this.state.product.description,
                portions: parsedPortions
            }
        };
        const request = {
            body: JSON.stringify(payload),
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
                "http://localhost:8080/api/product/new",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
        } catch (err) {
            console.log(err);
        }
    };
    onBaseInputChange = (field: string) => (
        e: React.FormEvent<HTMLInputElement>
    ) => {
        const value = e.currentTarget.value;
        this.setState((prevState: AddNewState) => ({
            ...prevState,
            product: {
                ...prevState.product,
                [field]: value
            }
        }));
    };
    onPortionInputChange = (index: number, field: string) => (
        e: React.FormEvent<HTMLInputElement>
    ) => {
        const value = e.currentTarget.value;
        this.setState((prevState: AddNewState) => {
            const newPortions = [...prevState.product.portions];
            newPortions[index][field] = value;
            return {
                ...prevState,
                product: {
                    ...prevState.product,
                    portions: newPortions
                }
            };
        });
    };
    addAnotherUnit = () => {
        this.setState((prevState: AddNewState) => {
            const oldPortions = prevState.product.portions;
            const newPortions = [
                ...oldPortions,
                oldPortions[oldPortions.length - 1]
            ];
            return {
                ...prevState,
                product: {
                    ...prevState.product,
                    portions: newPortions
                }
            };
        });
    };
    deleteCurrentPortion = (index: number) => () => {
        this.setState((prevState: AddNewState) => {
            const oldPortions = prevState.product.portions;
            const newPortions = [...oldPortions];
            newPortions.splice(index, 1);
            return {
                ...prevState,
                product: {
                    ...prevState.product,
                    portions: newPortions
                }
            };
        });
    };
    render() {
        const renderClose = this.state.product.portions.length > 1;
        return (
            <MainBox>
                <InputGroup>
                    <Label>Enter Name</Label>
                    <Input
                        placeholder="name"
                        value={this.state.product.name}
                        onChange={this.onBaseInputChange("name")}
                    />
                </InputGroup>
                <InputGroup>
                    <Label>Enter Description</Label>
                    <Input
                        placeholder="description"
                        value={this.state.product.description}
                        onChange={this.onBaseInputChange("description")}
                    />
                </InputGroup>

                {this.state.product.portions.map(
                    (
                        portion: { energy: string; unit: string },
                        index: number
                    ) => (
                        <PortionGroup key={index}>
                            {renderClose ? (
                                <XButton
                                    onClick={this.deleteCurrentPortion(index)}
                                >
                                    x
                                </XButton>
                            ) : (
                                <div />
                            )}
                            <InputGroup>
                                <Label>Enter energy [kcal]</Label>
                                <Input
                                    placeholder="energy"
                                    onChange={this.onPortionInputChange(
                                        index,
                                        "energy"
                                    )}
                                    value={portion.energy}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Enter unit</Label>
                                <Input
                                    placeholder="unit"
                                    onChange={this.onPortionInputChange(
                                        index,
                                        "unit"
                                    )}
                                    value={portion.unit}
                                />
                            </InputGroup>
                        </PortionGroup>
                    )
                )}
                <Button onClick={this.addAnotherUnit}>Add another unit</Button>
                <Button onClick={this.onAddClick}>Add product</Button>
            </MainBox>
        );
    }
}

export default AddNew;
