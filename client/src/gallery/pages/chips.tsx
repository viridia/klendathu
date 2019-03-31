import * as React from 'react';
import { register } from '../registry';
import { Chip } from 'skyhook-ui';

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
        <Chip size="small">Hello</Chip>
        <Chip size="small" onClose={onClose}>Hello</Chip>
        <Chip size="small" color="#ff0">Yellow</Chip>
        <Chip size="small" onClose={onClose} color="#fff">White</Chip>
        <Chip size="small" onClose={onClose} color="#000">Black</Chip>
        <Chip size="small" onClose={onClose} color="lightblue">Light Blue</Chip>
      </div>
    </React.Fragment>
  );
}

register('chips', Chips);
