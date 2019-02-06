import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import ProductForm from "@components/ProductForm";
import * as requests from "@requests";

interface UpdateProductProps extends RouteComponentProps<{ id: string }> {
    update: (
        id: number,
        product: {
            name: string;
            description: string;
            portions: { energy: number; unit: string }[];
        }
    ) => Promise<void>;
    get: (id: number) => Promise<requests.Product | undefined>;
}
interface UpdateProductState {
    product: {
        name: string;
        portions: {
            energy: string;
            unit: string;
        }[];
    };
    isLoading: boolean;
}

class UpdateProduct extends React.PureComponent<
    UpdateProductProps,
    UpdateProductState
> {
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
    componentDidMount = async () => {
        console.log("from componentDidMount");
        const { id } = this.props.match.params;
        const product = await this.props.get(parseInt(id));
        if (product) {
            this.setState({
                product: {
                    name: product.name,
                    description: "",
                    portions: product.portions.map(({ energy, unit }) => ({
                        energy: energy.toString(),
                        unit
                    }))
                }
            });
        }
    };

    removePortion = (index: number) => () => {
        const newPortions = [...this.state.product.portions];
        newPortions.splice(index, 1);
        this.setState((prevState: UpdateProductState) => ({
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
        this.setState((prevState: UpdateProductState) => ({
            ...prevState,
            product: {
                ...prevState.product,
                portions: newPortions
            }
        }));
    };
    updateClick = () => {
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
            const { id } = this.props.match.params;
            this.props.update(parseInt(id), newProduct);
        } catch (e) {
            console.log(e);
        }
    };
    nameChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        this.setState((prevState: UpdateProductState) => {
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
        this.setState((prevState: UpdateProductState) => {
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
        this.setState((prevState: UpdateProductState) => {
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
    render() {
        return (
            <ProductForm
                product={this.state.product}
                onPortionInputChange={this.onPortionInputChange}
                removePortionClick={this.removePortion}
                proceedClick={this.updateClick}
                proceedText={"Update"}
                newPortionClick={this.newPortion}
                nameChange={this.nameChange}
                descriptionChange={this.descriptionChange}
            />
        );
    }
}

export default withRouter(UpdateProduct);
