import * as React from 'react';
import { OperandType } from '../../models/OperandType';
import { FieldType } from '../../../../common/types/json';
import { UserAutocomplete } from '../../controls';
import { StateSetEditor } from './StateSetEditor';
import { TypeSetEditor } from './TypeSetEditor';
import { LabelSelector } from './LabelSelector';
import { EnumSetEditor } from './EnumSetEditor';
import { ProjectEnv } from '../../models';
import { Observer } from 'mobx-react-lite';
import { RelationSelector } from './RelationSelector';
import { DropdownButton, ButtonVariant, MenuItem, TextInput } from 'skyhook-ui';

interface Props {
  type: OperandType;
  value: any;
  kind?: ButtonVariant;
  customField: FieldType;
  onChange: (value: any) => void;
}

/** Component which allows the user to enter a value for the filter and mass edit functions. */
export function EditOperand(props: Props) {
  const env = React.useContext(ProjectEnv);
  return (
    <Observer>
      {() => {
        const { project, template } = env;
        const { type, customField, onChange, value, kind } = props;
        if (!type || value === undefined) {
          return null;
        }
        switch (type) {
          case OperandType.SEARCH_TEXT:
            return (
              <TextInput
                containerClassName="match-text operand-value"
                placeholder="text to match"
                value={value}
                onChange={(e: any) => onChange(e.target.value)}
              />
            );
          case OperandType.TEXT:
            return (
              <TextInput
                containerClassName="match-text operand-value"
                placeholder="text to find"
                value={value}
                onChange={(e: any) => onChange(e.target.value)}
              />
            );
          case OperandType.STATE_SET: {
            return <StateSetEditor template={template} value={value} />;
          }
          case OperandType.TYPE_SET: {
            return <TypeSetEditor template={template} value={value} />;
          }
          case OperandType.STATE: {
            const items = template.states.map(st => (
              <MenuItem eventKey={st.id} key={st.id}>{st.caption}</MenuItem>
            ));
            const selectedState = template.states.find(st => st.id === value);
            return (
              <DropdownButton
                size="small"
                variant={kind}
                title={selectedState ? selectedState.caption : 'Choose state...'}
                onSelect={onChange}
              >
                {items}
              </DropdownButton>);
          }
          case OperandType.TYPE: {
            const items = template.types.map(t => (
              !t.abstract && <MenuItem eventKey={t.id} key={t.id}>{t.caption}</MenuItem>
            ));
            const selectedType = template.types.find(t => t.id === value);
            return (
              <DropdownButton
                size="small"
                variant={kind}
                title={selectedType ? selectedType.caption : 'Choose type...'}
                onSelect={onChange}
              >
                {items}
              </DropdownButton>);
          }
          case OperandType.LABEL: {
            return (
              <LabelSelector
                className="operand-value"
                project={project}
                selection={value.slice()}
                onSelectionChange={onChange}
              />);
          }
          case OperandType.USER: {
            return (
              <UserAutocomplete
                className="operand-value"
                placeholder="(none)"
                selection={value}
                onSelectionChange={onChange}
              />);
          }
          case OperandType.USERS: {
            return (
              <UserAutocomplete
                className="operand-value"
                placeholder="(none)"
                selection={value ? value.slice() : []}
                multiple={true}
                onSelectionChange={onChange}
              />);
          }
          case OperandType.ENUM: {
            return <EnumSetEditor field={customField} value={value} />;
          }
          case OperandType.RELATION: {
            return <RelationSelector value={value} onChange={onChange} />;
          }
          default:
            return null;
        }
      }}
    </Observer>
  );
}
