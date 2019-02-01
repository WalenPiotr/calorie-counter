import * as React from "react";
import styled from "styled-components";
import * as storage from "@storage";
import Input from "@components/Input";
import * as requests from "@requests";
import * as Styled from "./styled";

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

class NewProduct extends React.Component<AddNewProps, AddNewState> {
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
        const product = {
            name: this.state.product.name,
            description: this.state.product.description,
            portions: parsedPortions
        };
        try {
            await requests.productNew(product);
        } catch (e) {
            console.log(e);
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
            <Styled.MainBox>
                <Styled.Label>Add new product</Styled.Label>
                <Styled.BaseGroup>
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
                </Styled.BaseGroup>
                {this.state.product.portions.map(
                    (
                        portion: { energy: string; unit: string },
                        index: number
                    ) => (
                        <Styled.PortionGroup
                            key={index}
                            single={this.state.product.portions.length == 1}
                        >
                            {renderClose ? (
                                <Styled.XButton
                                    onClick={this.deleteCurrentPortion(index)}
                                >
                                    x
                                </Styled.XButton>
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
                        </Styled.PortionGroup>
                    )
                )}
                <Styled.Button onClick={this.addAnotherUnit}>
                    Add another unit
                </Styled.Button>
                <Styled.Spacer />
                <Styled.Button onClick={this.onAddClick}>
                    Add product
                </Styled.Button>
            </Styled.MainBox>
        );
    }
}

export default NewProduct;
