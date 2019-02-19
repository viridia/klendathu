import { createGlobalStyle } from '.';

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Ubuntu', sans-serif;
  }

  ::-webkit-scrollbar {
    background-color: transparent;
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: none;
    box-shadow: none;
    border-radius: 0;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: ${props => props.theme.scrollbarThumbColor};
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  ::-webkit-scrollbar-thumb:window-inactive {
    background: ${props => props.theme.scrollbarInactiveThumbColor};
  }

  div.Toastify__toast {
    border-radius: 6px;
    padding: 8px 20px;
  }

  div.Toastify__toast--success {
    background-color: #bd77e8;
  }
`;
