import * as React from 'react';
import { styled } from '../../style';
import { register } from '../registry';
import { Button } from '../../controls';
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
        <Button type="primary">Primary</Button>
        <Button type="action">Action</Button>
        <Button type="secondary">Secondary</Button>
      </DisplayGroup>
      <header>Disabled Buttons</header>
      <DisplayGroup className="row">
        <Button disabled={true}>Default</Button>
        <Button type="primary" disabled={true}>Primary</Button>
        <Button type="action" disabled={true}>Action</Button>
        <Button type="secondary" disabled={true}>Secondary</Button>
      </DisplayGroup>
      <header>Small Buttons</header>
      <DisplayGroup className="row">
        <Button small={true}>Default</Button>
        <Button type="primary" small={true}>Primary</Button>
        <Button type="action" small={true}>Action</Button>
        <Button type="secondary" small={true}>Secondary</Button>
      </DisplayGroup>
      <header>Buttons With Icons</header>
      <DisplayGroup className="row">
        <Button><IconAddBox /> Default</Button>
        <Button type="primary"><IconAddBox /> Primary</Button>
        <Button type="action"><IconAddBox /> Action</Button>
        <Button type="secondary"><IconAddBox /> Secondary</Button>
      </DisplayGroup>
      <header>Button Groups</header>
    </React.Fragment>
  );
}

register('buttons', Buttons);
