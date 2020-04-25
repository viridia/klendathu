import React from 'react';
import { hot } from 'react-hot-loader';
import { themeDefault, ThemeProvider, GlobalStyle } from './style';
import { Normalize } from 'styled-normalize';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AccountPage } from './account/AccountPage';
import { MainPage } from './main/MainPage';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/client';
import { observer } from 'mobx-react';

import 'react-toastify/dist/ReactToastify.css';

@observer
class App extends React.Component<{}> {
  public render() {
    return (
      <ThemeProvider theme={themeDefault}>
        <React.Fragment>
          <Normalize />
          <GlobalStyle />
          <ApolloProvider client={client}>
            <Router>
              <Switch>
                <Route path="/account" component={AccountPage} />
                <Route path="/" component={MainPage} />
              </Switch>
            </Router>
          </ApolloProvider>
        </React.Fragment>
      </ThemeProvider>
    );
  }
}

export default hot(module)(App);
