import * as React from 'react';
import { register } from '../registry';
import { Menu, MenuItem, DropdownButton } from '../../controls';
import { styled } from '../../style';

const MenuPreview = styled.div`
  margin-bottom: 120px;
`;

const ScrollingRegion = styled.div`
  margin-top: 1em;
  border: 1px solid ${props => props.theme.cardBorderColor};
  background-color: ${props => props.theme.cardBgColor};
  width: 30em;
  height: 20em;
  overflow-y: scroll;
  > * {
    margin: 18em 1em;
  }
`;

function Dropdowns() {
  return (
    <React.Fragment>
      <header>Dropdowns</header>
      <MenuPreview>
        <Menu>
          <MenuItem>First</MenuItem>
          <MenuItem className="selected">Middle</MenuItem>
          <MenuItem>Last</MenuItem>
        </Menu>
      </MenuPreview>
      <DropdownButton title="Click me">
        <MenuItem onSelect={() => { console.log('Choose First'); }}>First</MenuItem>
        <MenuItem onSelect={() => { console.log('Choose Middle'); }}>Middle</MenuItem>
        <MenuItem onSelect={() => { console.log('Choose Last'); }}>Last</MenuItem>
      </DropdownButton>
      <ScrollingRegion>
        <DropdownButton title="Click me">
          <MenuItem onSelect={() => { console.log('Choose First'); }}>First</MenuItem>
          <MenuItem onSelect={() => { console.log('Choose Middle'); }}>Middle</MenuItem>
          <MenuItem onSelect={() => { console.log('Choose Last'); }}>Last</MenuItem>
        </DropdownButton>
      </ScrollingRegion>
    </React.Fragment>
  );
}

register('dropdowns', Dropdowns);
