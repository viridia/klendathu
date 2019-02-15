import * as React from 'react';
import bind from 'bind-decorator';
import { observer } from 'mobx-react';
import { ObservableSet } from 'mobx';
import { CheckBox } from '../../controls';
import { Template } from '../../../../common/types/json';

interface Props {
  template: Template;
  value: ObservableSet;
}

@observer
export class StateSetEditor extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    return (
      <div className="select-states">
        {template.states.map(st => (
          <CheckBox key={st.id} data-id={st.id} checked={value.has(st.id)} onChange={this.onChange}>
            {st.caption}
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
