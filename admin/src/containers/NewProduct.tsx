import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import * as Elements from "@elements/index";
import { css } from "styled-components";
import ProductForm from "@components/ProductForm";

interface NewProductProps extends RouteComponentProps {
    new: (product: {
        name: string;
        description: string;
        portions: { energy: number; unit: string }[];
    }) => Promise<void>;
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
    isLoading: boolean;
}

class NewProduct extends React.Component<NewProductProps, NewProductState> {
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
        },
        isLoading: true
    };
    removePortion = (index: number) => () => {
        const newPortions = [...this.state.product.portions];
        newPortions.splice(index, 1);
        this.setState((prevState: NewProductState) => ({
            ...prevState,
            product: {
                ...prevState.product,
                portions: newPortions
            }
        }));
    };
    newPortion = () => {
        const portions = this.state.product.portions;
        const newPortions = [...portions, portions[portions.length - 1]];
        this.setState((prevState: NewProductState) => ({
            ...prevState,
            product: {
                ...prevState.product,
                portions: newPortions
            }
        }));
    };
    addClick = () => {
        const { product } = this.state;
        try {
            const parsedPortions = product.portions.map(
                (portion: { energy: string; unit: string }) => {
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
            const newProduct = {
                ...product,
                portions: parsedPortions
            };
            this.props.new(newProduct);
            this.props.history.push(routes.products());
        } catch (e) {
            console.log(e);
        }
    };
    nameChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        this.setState((prevState: NewProductState) => {
            return {
                ...prevState,
                product: {
                    ...prevState.product,
                    name: value
                }
            };
        });
    };
    descriptionChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        this.setState((prevState: NewProductState) => {
            return {
                ...prevState,
                product: {
                    ...prevState.product,
                    description: value
                }
            };
        });
    };
    onPortionInputChange = (index: number, field: string) => (
        e: React.FormEvent<HTMLInputElement>
    ) => {
        const value = e.currentTarget.value;
        this.setState((prevState: NewProductState) => {
            const newPortions = [...prevState.product.portions];
            console.log(prevState);
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
    render() {
        return (
            <ProductForm
                product={this.state.product}
                onPortionInputChange={this.onPortionInputChange}
                removePortionClick={this.removePortion}
                proceedClick={this.addClick}
                proceedText={"ADD"}
                newPortionClick={this.newPortion}
                nameChange={this.nameChange}
                descriptionChange={this.descriptionChange}
            />
        );
    }
}

export default withRouter(NewProduct);
