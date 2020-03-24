import * as React from 'react';
import { register } from '../registry';
import { Card, Tab, TabBar } from '../../controls';
import { Route, Switch } from 'react-router-dom';
import { styled } from '../../style';

const DemoCard = styled(Card)`
  padding: 16px;
  flex: 1;
`;

function Tabs() {
  return (
    <React.Fragment>
      <header>Tabs</header>
      <TabBar>
        <Tab to="/tabs/one">One</Tab>
        <Tab to="/tabs/two">Two</Tab>
        <Tab to="/tabs/three">Three</Tab>
      </TabBar>
      <Switch>
        <Route path="/tabs/two">
          <DemoCard>
            Route Two
          </DemoCard>
        </Route>
        <Route path="/tabs/three">
          <DemoCard>
            Route Three
          </DemoCard>
        </Route>
        <Route path="/tabs/one">
          <DemoCard>
            Route One
          </DemoCard>
        </Route>
        <Route path="/tabs">
          <DemoCard>
            No Tab Selected
          </DemoCard>
        </Route>
      </Switch>
    </React.Fragment>
  );
}

register('tabs', Tabs);
