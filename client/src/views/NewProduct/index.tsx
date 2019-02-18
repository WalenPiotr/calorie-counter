import * as React from "react";
import Input from "@components/Input";
import * as requests from "@requests";
import * as Styled from "./styled";
import { Status } from "@status";
import Widget from "@elements/Widget";
import { RouteComponentProps, withRouter } from "react-router";

export interface NewProductProps extends RouteComponentProps {
    setStatus: (status: Status, message: string) => void;
}
interface NewProductState {
    product: {
        name: string;
        nameError: string | null;
        description: string;
        descriptionError: string | null;
        portions: {
            energy: string;
            energyError: string | null;
            unit: string;
            unitError: string | null;
        }[];
    };
}

class NewProduct extends React.PureComponent<NewProductProps, NewProductState> {
    state = {
        product: {
            name: "",
            nameError: null,
            description: "",
            descriptionError: null,
            portions: [
                {
                    energy: "",
                    energyError: null,
                    unit: "",
                    unitError: null
                }
            ]
        }
    };
    onAddClick = async () => {
        try {
            var parsingError = false;
            var newPortions: {
                energy: string;
                energyError: string | null;
                unit: string;
                unitError: string | null;
            }[] = [];
            for (const portion of this.state.product.portions) {
                var energyError = null;
                var unitError = null;
                const energy = parseFloat(portion.energy);
                if (isNaN(energy)) {
                    energyError = "Enter valid energy value";
                    parsingError = true;
                }
                if (energy <= 0) {
                    energyError = "Enter positive energy value";
                    parsingError = true;
                }
                if (portion.unit === "") {
                    unitError = "Enter unit";
                    parsingError = true;
                }
                newPortions = [
                    ...newPortions,
                    {
                        ...portion,
                        energyError: energyError,
                        unitError: unitError
                    }
                ];
            }
            var nameError: string | null = null;
            var descriptionError: string | null = null;
            if (this.state.product.name === "") {
                nameError = "Enter products name";
                parsingError = true;
            } else if (this.state.product.name.length > 30) {
                nameError = "Product name have to be max 30 character long";
                parsingError = true;
            }
            if (parsingError) {
                this.setState((prevState: NewProductState) => {
                    return {
                        ...prevState,
                        product: {
                            ...prevState.product,
                            nameError,
                            descriptionError,
                            portions: newPortions
                        }
                    };
                });
            } else {
                const parsedPortions = this.state.product.portions.map(
                    (portion: {
                        energy: string;
                        unit: string;
                    }): {
                        energy: number;
                        unit: string;
                    } => {
                        return {
                            energy: parseFloat(portion.energy),
                            unit: portion.unit
                        };
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
                    this.props.history.push("/products");
                    return;
                }
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
            const newPortions = [
                ...oldPortions,
                { energy: "", energyError: null, unit: "", unitError: null }
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
                        error={this.state.product.nameError}
                    />
                    <Input
                        label={"description"}
                        value={this.state.product.description}
                        onChange={this.onBaseInputChange("description")}
                        error={this.state.product.descriptionError}
                    />
                </Styled.BaseGroup>
                {this.state.product.portions.map(
                    (
                        portion: {
                            energy: string;
                            unit: string;
                            energyError: string | null;
                            unitError: string | null;
                        },
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
                                error={portion.unitError}
                            />
                            <Input
                                label={"Enter energy [kcal]"}
                                value={portion.energy}
                                onChange={this.onPortionInputChange(
                                    index,
                                    "energy"
                                )}
                                error={portion.energyError}
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

export default withRouter(NewProduct);
