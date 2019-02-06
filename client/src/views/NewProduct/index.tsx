import * as React from "react";
import Input from "@components/Input";
import * as requests from "@requests";
import * as Styled from "./styled";
import { Status } from "@status";
import Widget from "@elements/Widget";

export interface NewProductProps {
    setStatus: (status: Status, message: string) => void;
}
interface NewProductState {
    product: {
        name: string;
        description: string;
        portions: {
            energy: string;
            unit: string;
        }[];
    };
}

class NewProduct extends React.PureComponent<NewProductProps, NewProductState> {
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
        try {
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
                        throw Error("Parsing error");
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
            const res = await requests.productNew({ product });
            if (res.error) {
                this.props.setStatus(Status.Error, res.error);
                return;
            }
            if (res.product) {
                this.props.setStatus(
                    Status.Success,
                    "Product successfully added"
                );
                return;
            }
        } catch (e) {
            this.props.setStatus(Status.Error, "Invalid input data");
        }
    };
    onBaseInputChange = (field: string) => (
        e: React.FormEvent<HTMLInputElement>
    ) => {
        const value = e.currentTarget.value;
        this.props.setStatus(Status.None, "");
        this.setState((prevState: NewProductState) => ({
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
        this.setState((prevState: NewProductState) => {
            this.props.setStatus(Status.None, "");
            const newPortions = [...prevState.product.portions];
            newPortions[index] = { ...newPortions[index], [field]: value };
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
        this.setState((prevState: NewProductState) => {
            this.props.setStatus(Status.None, "");
            const oldPortions = prevState.product.portions;
            const newPortions = [...oldPortions, { energy: "", unit: "" }];
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
        this.setState((prevState: NewProductState) => {
            this.props.setStatus(Status.None, "");
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
            <Widget>
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
            </Widget>
        );
    }
}

export default NewProduct;
