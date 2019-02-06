export const colors = {
    button: {
        blue: {
            background: "rgb(20, 20, 190)",
            text: "rgb(250, 250, 250)"
        },
        red: {
            background: "rgb(190, 20, 20)",
            text: "rgb(250, 250, 250)"
        },
        green: {
            background: "rgb(20, 120, 20)",
            text: "rgb(250, 250, 250)"
        }
    },
    background: "rgb(210, 210, 255)",
    text: {
        weak: "rgb(50, 50, 50)",
        base: "rgb(30, 30, 30)",
        strong: "rgb(30, 30, 30)"
    },
    border: "rgb(150, 150, 150)",
    shadow: "rgba(150, 150, 150, 0.25)"
};
export const fonts = {
    size: {
        small: "12px",
        medium: "16px",
        large: "24px",
        xlarge: "32px",
        xxlarge: "48px"
    },
    weight: {
        light: 300,
        regular: 400,
        bold: 500
    },
    fontFamily: "Roboto, sans-serif"
};
export const media = {
    mobileS: 320,
    mobileM: 375,
    mobileL: 425,
    tablet: 768,
    laptop: 1024,
    laptopL: 1440,
    desktop: 2560
};

export const minWidth = (size: number) => `(min-width: ${size}px)`;
