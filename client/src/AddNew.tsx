import * as React from "react";
import styled from "styled-components";
import * as storage from "./storage";
import Input from "./blocks/Input";
import BlockButton from "./elements/BlockButton";
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
    padding-bottom: 40px;

    width: 95vw;
    box-shadow: 3px 3px 50px 6px rgba(0, 0, 0, 0.2);

    background-color: white;
`;

interface PortionGroupProps {
    single: boolean;
}
const PortionGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    padding-top: ${(props: PortionGroupProps) =>
        props.single ? "10px" : "40px"};
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

const Button = styled(BlockButton)`
    width: 85%;
`;
const XButton = styled.button`
    position: absolute;
    background-color: rgba(30, 100, 200, 1);
    color: white;
    border: none;
    top: 5px;
    left: 0px;
    width: 60px;
    height: 30px;
    font-weight: 500;
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

const Spacer = styled.div`
    border-bottom: 1px solid grey;
    width: 85%;
    height: 10px;
    margin-bottom: 10px;
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
            newPortions[index][field] += value;
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
                    <Input
                        label={"name"}
                        value={this.state.product.name}
                        onChange={this.onBaseInputChange("name")}
                    />
                    <Input
                        label={"description"}
                        value={this.state.product.description}
                        onChange={this.onBaseInputChange("description")}
                    />
                </BaseGroup>
                {this.state.product.portions.map(
                    (
                        portion: { energy: string; unit: string },
                        index: number
                    ) => (
                        <PortionGroup
                            key={index}
                            single={this.state.product.portions.length == 1}
                        >
                            {renderClose ? (
                                <XButton
                                    onClick={this.deleteCurrentPortion(index)}
                                >
                                    x
                                </XButton>
                            ) : (
                                <div />
                            )}

                            <Input
                                label={"Enter unit"}
                                value={portion.unit}
                                onChange={this.onPortionInputChange(
                                    index,
                                    "unit"
                                )}
                            />
                            <Input
                                label={"Enter energy [kcal]"}
                                value={portion.energy}
                                onChange={this.onPortionInputChange(
                                    index,
                                    "energy"
                                )}
                            />
                        </PortionGroup>
                    )
                )}
                <Button onClick={this.addAnotherUnit}>Add another unit</Button>
                <Spacer />
                <Button onClick={this.onAddClick}>Add product</Button>
            </MainBox>
        );
    }
}

export default AddNew;
