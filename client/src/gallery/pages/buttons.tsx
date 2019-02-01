import * as React from 'react';
import { styled } from '../../style';
import { register } from '../registry';
import { Button, ButtonGroup, LinkButton, NavLink, NavContainer } from '../../controls';
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
        <Button kind="primary">Primary</Button>
        <Button kind="action">Action</Button>
        <Button kind="secondary">Secondary</Button>
      </DisplayGroup>
      <header>Disabled Buttons</header>
      <DisplayGroup className="row">
        <Button disabled={true}>Default</Button>
        <Button kind="primary" disabled={true}>Primary</Button>
        <Button kind="action" disabled={true}>Action</Button>
        <Button kind="secondary" disabled={true}>Secondary</Button>
      </DisplayGroup>
      <header>Small Buttons</header>
      <DisplayGroup className="row">
        <Button small={true}>Default</Button>
        <Button kind="primary" small={true}>Primary</Button>
        <Button kind="action" small={true}>Action</Button>
        <Button kind="secondary" small={true}>Secondary</Button>
      </DisplayGroup>
      <header>Buttons With Icons</header>
      <DisplayGroup className="row">
        <Button><IconAddBox /> Default</Button>
        <Button kind="primary"><IconAddBox /> Primary</Button>
        <Button kind="action"><IconAddBox /> Action</Button>
        <Button kind="secondary"><IconAddBox /> Secondary</Button>
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
        <LinkButton href="https://www.github.com" kind="primary">GitHub</LinkButton>
        <LinkButton href="https://www.twitter.com" kind="action">Twitter</LinkButton>
        <LinkButton href="https://www.medium.com" kind="secondary" disabled={true}>
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
          <Button kind="primary">Buttons</Button>
        </NavContainer>
        <NavContainer to="/cards">
          <Button kind="primary">Cards</Button>
        </NavContainer>
        <NavContainer to="/toggle" disabled={true}>
          <Button kind="primary">Toggle</Button>
        </NavContainer>
      </DisplayGroup>
    </React.Fragment>
  );
}

register('buttons', Buttons);
