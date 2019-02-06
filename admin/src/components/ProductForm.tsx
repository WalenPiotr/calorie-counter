import * as React from "react";
import * as Elements from "@elements/index";
import { css } from "styled-components";

interface ProductFormProps {
    product: {
        name: string;
        portions: {
            energy: string;
            unit: string;
        }[];
        description: string;
    };
    removePortionClick: (index: number) => () => void;
    onPortionInputChange: (
        index: number,
        field: string
    ) => (event: React.FormEvent<HTMLInputElement>) => void;
    newPortionClick: () => void;
    proceedClick: () => void;
    proceedText: string;
    nameChange: (event: React.FormEvent<HTMLInputElement>) => void;
    descriptionChange: (event: React.FormEvent<HTMLInputElement>) => void;
}

class ProductForm extends React.PureComponent<ProductFormProps> {
    render() {
        const { product } = this.props;
        console.log(this.state);
        const portionsInputs = product.portions.map(
            (portion: { energy: string; unit: string }, index: number) => (
                <Elements.FormBox key={index}>
                    {product.portions.length > 1 ? (
                        <Elements.Button
                            red
                            small
                            onClick={this.props.removePortionClick(index)}
                        >
                            X
                        </Elements.Button>
                    ) : null}
                    <Elements.Input
                        placeholder="unit"
                        value={portion.unit}
                        onChange={this.props.onPortionInputChange(
                            index,
                            "unit"
                        )}
                    />
                    <Elements.Input
                        placeholder="energy"
                        value={portion.energy}
                        onChange={this.props.onPortionInputChange(
                            index,
                            "energy"
                        )}
                    />
                </Elements.FormBox>
            )
        );
        return (
            <Elements.Widget>
                <Elements.FormBox>
                    <Elements.Input
                        placeholder="name"
                        value={product.name}
                        onChange={this.props.nameChange}
                    />
                    <Elements.Input
                        placeholder="description"
                        value={product.description}
                        onChange={this.props.descriptionChange}
                    />
                </Elements.FormBox>
                {portionsInputs}
                <Elements.FlexBox
                    css={css`
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: flex-start;
                        height: 100px;
                    `}
                >
                    <Elements.Button onClick={this.props.newPortionClick}>
                        New Portion
                    </Elements.Button>
                    <Elements.Button
                        green
                        block
                        onClick={this.props.proceedClick}
                    >
                        {this.props.proceedText}
                    </Elements.Button>
                </Elements.FlexBox>
            </Elements.Widget>
        );
    }
}
export default ProductForm;
