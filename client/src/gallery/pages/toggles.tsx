import * as React from 'react';
import { register } from '../registry';
import { CheckBox, RadioButton } from '../../controls';

function onClick() {
  console.log('clicked');
}

function Toggles() {
  return (
    <React.Fragment>
      <header>Checkbox</header>
      <div>
        <CheckBox onClick={onClick}>Hello</CheckBox>
        &nbsp;
        <CheckBox disabled={true} onClick={onClick}>Hello</CheckBox>
      </div>
      <header>Radio Button</header>
      <div>
        <RadioButton onClick={onClick}>Hello</RadioButton>
        &nbsp;
        <RadioButton disabled={true} onClick={onClick}>Hello</RadioButton>
      </div>
    </React.Fragment>
  );
}

register('toggles', Toggles);
