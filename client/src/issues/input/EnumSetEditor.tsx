import * as React from 'react';
import { action, ObservableSet } from 'mobx';
import { observer } from 'mobx-react';
import { FieldType } from '../../../../common/types/json';
import styled from 'styled-components';
import { CheckBox } from 'skyhook-ui';

interface Props {
  field: FieldType;
  value: ObservableSet;
}

const EnumSetLayout = styled.div`
  display: grid;
  grid-template-rows: auto;
  grid-auto-flow: column;

  > label {
    margin: 4px 1em 4px 0 !important;
  }
`;

@observer
export class EnumSetEditor extends React.Component<Props> {
  public render() {
    const { field, value } = this.props;
    return (
      <EnumSetLayout>
        {field.values.map(v => (
          <CheckBox key={v} data-id={v} checked={value.has(v)} onChange={this.onChange}>
            {v}
          </CheckBox>))}
      </EnumSetLayout>
    );
  }

  @action.bound
  private onChange(e: any) {
    const { value } = this.props;
    if (e.target.checked) {
      value.add(e.target.dataset.id);
    } else {
      value.delete(e.target.dataset.id);
    }
  }
}
