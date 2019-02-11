import * as React from 'react';
import bind from 'bind-decorator';
import { ObservableSet, Template } from '../../../models';
import { Checkbox } from 'react-bootstrap';
import { observer } from 'mobx-react';

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
          <Checkbox key={st.id} data-id={st.id} checked={value.has(st.id)} onChange={this.onChange}>
            {st.caption}
          </Checkbox>))}
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
