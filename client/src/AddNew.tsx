import * as React from "react";
import styled from "@styled-components";
import * as storage from "./storage";

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
    margin: 10vh auto;
    padding-top: 40px;
    width: 95vw;
    box-shadow: 3px 3px 50px 6px rgba(0, 0, 0, 0.2);

    background-color: white;
`;
const PortionGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    padding-top: 30px;
    border-top: 1px solid grey;
    width: 85%;
`;
const BaseGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 85%;
`;

const Button = styled.button`
    width: 80%;
    height: 40px;
    margin: 10px auto;
`;
const XButton = styled.button`
    position: absolute;
    top: 15px;
    left: 15px;
    width: 30px;
    height: 30px;
`;

const Input = styled.input`
    box-sizing: border-box;
    text-indent: 10px;
    font-size: 20px;
    border: none;
    box-sizing: border-box;
    :focus {
        outline: none;
    }
`;
const InputLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
    margin-left: 10px;
    margin-bottom: 8px;
    color: mediumblue;
`;
const InputBox = styled.div`
    width: 100%;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 30px;
    box-sizing: border-box;
`;

const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 30px;
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
                <Label>Add new product</Label>
                <BaseGroup>
                    <InputBox>
                        <InputLabel>name</InputLabel>
                        <Input
                            placeholder=""
                            value={this.state.product.name}
                            onChange={this.onBaseInputChange("name")}
                        />
                    </InputBox>
                    <InputBox>
                        <InputLabel>description</InputLabel>
                        <Input
                            placeholder=""
                            value={this.state.product.description}
                            onChange={this.onBaseInputChange("description")}
                        />
                    </InputBox>
                </BaseGroup>
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

                            <InputBox>
                                <InputLabel>Enter unit</InputLabel>
                                <Input
                                    placeholder=""
                                    value={this.state.product.description}
                                    onChange={this.onBaseInputChange("unit")}
                                />
                            </InputBox>
                            <InputBox>
                                <InputLabel>Enter energy [kcal]</InputLabel>
                                <Input
                                    placeholder=""
                                    value={this.state.product.description}
                                    onChange={this.onBaseInputChange("energy")}
                                />
                            </InputBox>
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
