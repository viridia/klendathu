import * as React from 'react';
import { FieldType } from 'klendathu-json-types';
import { ObservableSet } from '../../../models';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { CheckBox } from '../../controls';

interface Props {
  field: FieldType;
  value: ObservableSet;
}

@observer
export class EnumSetEditor extends React.Component<Props> {
  public render() {
    const { field, value } = this.props;
    return (
      <div className="select-types">
        {field.values.map(v => (
          <CheckBox key={v} data-id={v} checked={value.has(v)} onChange={this.onChange}>
            {v}
          </CheckBox>))}
      </div>
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
