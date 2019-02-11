import bind from 'bind-decorator';
import * as React from 'react';
import { ObservableSet, Template } from '../../../models';
import { CheckBox } from '../../controls';

interface Props {
  template: Template;
  value: ObservableSet;
}

export class TypeSetEditor extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    return (
      <div className="select-types">
        {template.types.map(t => (
          !t.abstract &&
            <CheckBox key={t.id} data-id={t.id} checked={value.has(t.id)} onChange={this.onChange}>
              {t.caption}
            </CheckBox>))}
      </div>
    );
  }

  @bind
  private onChange(e: any) {
    const { value } = this.props;
    if (e.target.checked) {
      value.add(e.target.dataset.id);
    } else {
      value.delete(e.target.dataset.id);
    }
  }
}
