import * as React from 'react';
import { hot } from 'react-hot-loader';
import { dye, styled, ThemeProvider, GlobalStyle } from '../style';
import { Button } from '../controls';
import { Normalize } from 'styled-normalize';

const baseColor = '#9c27b0';

const Card = styled.section`
  border: 1px solid red;
`;

const Swatch = styled.div`
  width: 10em;
  height: 24px;
  background-color: ${(props: { color: string }) => props.color};
`;

// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import { AccountPage } from './account/AccountPage';
// import { MainPage } from './main/MainPage';

// import '../styles/bootstrap.scss';
// import '../styles/card.scss';
// import '../styles/form.scss';
// import '../styles/layout.scss';
// import '../styles/scrollbars.scss';
// import '../styles/table.scss';
// import './App.scss';

class App extends React.Component<{}> {
  public render() {
    return (
      <ThemeProvider theme={{ primaryColor: 'palevioletred' }}>
        <React.Fragment>
          <Normalize />
          <GlobalStyle />
          <Card>Hello
            <Button type="primary">Primary</Button>
            <Button type="action">Action</Button>
            <Button type="secondary">Secondary</Button>
            <Button>Default</Button>
            <Button disabled={true}>Disabled</Button>
            <Button small={true}>Small</Button>
            <div>
              Something
              <Swatch color={dye(1.0, baseColor)} />
              <Swatch color={dye(0.9, baseColor)} />
              <Swatch color={dye(0.8, baseColor)} />
              <Swatch color={dye(0.7, baseColor)} />
              <Swatch color={dye(0.6, baseColor)} />
              <Swatch color={dye(0.5, baseColor)} />
              <Swatch color={dye(0.4, baseColor)} />
              <Swatch color={dye(0.3, baseColor)} />
              <Swatch color={dye(0.2, baseColor)} />
              <Swatch color={dye(0.1, baseColor)} />
              <Swatch color={dye(0, baseColor)} />
            </div>
          </Card>
        </React.Fragment>
      </ThemeProvider>
    );
  }

  // public render() {
  //   return (
  //     <Router>
  //       <Switch>
  //         <Route path="/account" component={AccountPage} />
  //         <Route path="/" component={MainPage} />
  //       </Switch>
  //     </Router>
  //   );
  // }
}

export default hot(module)(App);
