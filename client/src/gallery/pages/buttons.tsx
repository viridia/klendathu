import * as React from 'react';
import { styled } from '../../style';
import { register } from '../registry';
import { Button, ButtonGroup } from 'skyhook-ui';
import { LinkButton, NavLink, NavContainer } from '../../controls';
import IconAddBox from '../../svg-compiled/icons/IcAddBox';

const DisplayGroup = styled.section`
  border: 1px solid black;
  padding: 8px;
  margin-bottom: 8px;
  display: flex;

  &.row {
    flex-direction: row;
  }

  &.column {
    flex-direction: column;
  }

  > * {
    margin-right: 8px;
  }
`;

function Buttons() {
  return (
    <React.Fragment>
      <header>Buttons</header>
      <DisplayGroup className="row">
        <Button>Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="action">Action</Button>
      </DisplayGroup>
      <header>Disabled Buttons</header>
      <DisplayGroup className="row">
        <Button disabled={true}>Default</Button>
        <Button variant="primary" disabled={true}>Primary</Button>
        <Button variant="action" disabled={true}>Action</Button>
      </DisplayGroup>
      <header>Small Buttons</header>
      <DisplayGroup className="row">
        <Button size="small">Default</Button>
        <Button variant="primary" size="small">Primary</Button>
        <Button variant="action" size="small">Action</Button>
      </DisplayGroup>
      <header>Buttons With Icons</header>
      <DisplayGroup className="row">
        <Button><IconAddBox /> Default</Button>
        <Button variant="primary"><IconAddBox /> Primary</Button>
        <Button variant="action"><IconAddBox /> Action</Button>
      </DisplayGroup>
      <header>Button Groups</header>
      <DisplayGroup className="column">
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      </DisplayGroup>
      <header>LinkButton</header>
      <DisplayGroup className="row">
        <LinkButton href="https://www.google.com">Google</LinkButton>
        <LinkButton href="https://www.github.com" variant="primary">GitHub</LinkButton>
        <LinkButton href="https://www.twitter.com" variant="action">Twitter</LinkButton>
        <LinkButton href="https://www.medium.com" variant="action" disabled={true}>
          Medium
        </LinkButton>
      </DisplayGroup>
      <header>NavLink</header>
      <DisplayGroup className="row">
        <NavLink to="/cards">Cards</NavLink>
        <NavLink to="/toggle" disabled={true}>Toggle</NavLink>
      </DisplayGroup>
      <header>NavLinkContainer</header>
      <DisplayGroup className="row">
        <NavContainer to="/buttons">
          <Button variant="primary">Buttons</Button>
        </NavContainer>
        <NavContainer to="/cards">
          <Button variant="primary">Cards</Button>
        </NavContainer>
        <NavContainer to="/toggle" disabled={true}>
          <Button variant="primary">Toggle</Button>
        </NavContainer>
      </DisplayGroup>
    </React.Fragment>
  );
}

register('buttons', Buttons);
