import * as React from 'react';
import { register } from '../registry';
import { Chip } from 'skyhook-ui';
import { Autocomplete, SearchCallback } from '../../controls';

const { useState } = React;

const states = [
  'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia',
  'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
  'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania',
  'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
  'Utah', 'Vermont', 'Virgin Islands', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin',
  'Wyoming',
];

let activeSearch: string;

// Simple async search function.
function searchStates(token: string, callback: SearchCallback<string>) {
  activeSearch = token;
  setTimeout(() => {
    // Don't call callback if there's a more recent query,
    if (token === activeSearch) {
      if (token.length < 2) {
        callback([]);
      } else {
        callback(states.filter(st => st.toLowerCase().startsWith(token.toLowerCase())));
      }
    }
  }, 100);
}

class StringAutocomplete extends Autocomplete<string> {}

function AcOneState(props: any) {
  const [selection, setSelection] = useState<string>(null);
  return (
    <StringAutocomplete
      selection={selection}
      onSearch={searchStates}
      onSelectionChange={(s: string) => setSelection(s)}
      onRenderSelection={s => <Chip color="#9cc">{s}</Chip>}
    />
  );
}

function AcOneStateSuggest(props: any) {
  const [selection, setSelection] = useState<string>('California');
  return (
    <StringAutocomplete
      selection={selection}
      suggest={true}
      onSearch={searchStates}
      onSelectionChange={(s: string) => setSelection(s)}
      onRenderSelection={s => <span>{s}</span>}
    />
  );
}

function AcMultipleStates(props: any) {
  const [selection, setSelection] = useState<string[]>(['Nevada']);
  return (
    <StringAutocomplete
      selection={selection}
      onSearch={searchStates}
      onSelectionChange={(s: string[]) => setSelection(s)}
      onRenderSelection={s => <Chip color="#cc9">{s}</Chip>}
      multiple={true}
    />
  );
}

function AutocompleteDemo() {
  return (
    <React.Fragment>
      <header>Choose One</header>
      <div style={{ width: '20rem' }}>
        <AcOneState />
      </div>
      <header>Suggest One</header>
      <div style={{ width: '20rem' }}>
        <AcOneStateSuggest />
      </div>
      <header>Choose Several</header>
      <div style={{ width: '20rem' }}>
        <AcMultipleStates />
      </div>
    </React.Fragment>
  );
}

register('autocomplete', AutocompleteDemo);
