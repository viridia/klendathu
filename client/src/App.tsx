import * as React from 'react';
import { hot } from 'react-hot-loader';
import { themeDefault, ThemeProvider, GlobalStyle } from './style';
import { Normalize } from 'styled-normalize';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AccountPage } from './account/AccountPage';

// import { MainPage } from './main/MainPage';

// import '../styles/scrollbars.scss';
// import '../styles/table.scss';

class App extends React.Component<{}> {
  public render() {
    return (
      <ThemeProvider theme={themeDefault}>
        <React.Fragment>
          <Normalize />
          <GlobalStyle />
          <Router>
            <Switch>
              <Route path="/account" component={AccountPage} />
              {/* <Route path="/" component={MainPage} /> */}
            </Switch>
          </Router>
        </React.Fragment>
      </ThemeProvider>
    );
  }
}

export default hot(module)(App);
