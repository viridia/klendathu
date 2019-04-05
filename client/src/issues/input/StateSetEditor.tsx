import * as React from 'react';
import bind from 'bind-decorator';
import { observer } from 'mobx-react';
import { ObservableSet } from 'mobx';
import { Template } from '../../../../common/types/json';
import { styled } from '../../style';
import { CheckBox } from 'skyhook-ui';

interface Props {
  template: Template;
  value: ObservableSet;
}

const SelectStatesLayout = styled.div`
  display: grid;
  grid-template-rows: auto auto auto auto;
  grid-auto-flow: column;
  > label {
    margin: 4px 1em 4px 0 !important;
  }
`;

@observer
export class StateSetEditor extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    return (
      <SelectStatesLayout>
        {template.states.map(st => (
          <CheckBox key={st.id} data-id={st.id} checked={value.has(st.id)} onChange={this.onChange}>
            {st.caption}
          </CheckBox>))}
      </SelectStatesLayout>
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
