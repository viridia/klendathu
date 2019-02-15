import * as React from 'react';
import { register } from '../registry';
import { Chip } from '../../controls';

function onClose() {
  console.info('close clicked');
}

function Chips() {
  return (
    <React.Fragment>
      <header>Chips</header>
      <div>
        <Chip>Hello</Chip>
        <Chip onClose={onClose}>Hello</Chip>
        <Chip color="#ff0">Yellow</Chip>
        <Chip onClose={onClose} color="#fff">White</Chip>
        <Chip onClose={onClose} color="#000">Black</Chip>
        <Chip onClose={onClose} color="lightblue">Light Blue</Chip>
      </div>
      <header>Chips (small)</header>
      <div>
        <Chip small={true}>Hello</Chip>
        <Chip small={true} onClose={onClose}>Hello</Chip>
        <Chip small={true} color="#ff0">Yellow</Chip>
        <Chip small={true} onClose={onClose} color="#fff">White</Chip>
        <Chip small={true} onClose={onClose} color="#000">Black</Chip>
        <Chip small={true} onClose={onClose} color="lightblue">Light Blue</Chip>
      </div>
    </React.Fragment>
  );
}

register('chips', Chips);
