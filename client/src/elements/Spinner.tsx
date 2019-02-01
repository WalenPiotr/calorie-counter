import { LoaderAlt } from "styled-icons/boxicons-regular/LoaderAlt";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled(LoaderAlt)`
    animation: ${rotate} 2s linear infinite;
`;

export default Spinner;
