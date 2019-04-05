import bind from 'bind-decorator';
import * as React from 'react';
import { Template } from '../../../../common/types/json';
import { ObservableSet } from 'mobx';
import { styled } from '../../style';
import { CheckBox } from 'skyhook-ui';

interface Props {
  template: Template;
  value: ObservableSet;
}

const SelectTypesLayout = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  grid-auto-flow: column;

  > label {
    margin: 4px 1em 4px 0 !important;
  }
`;

export class TypeSetEditor extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    return (
      <SelectTypesLayout>
        {template.types.map(t => (
          !t.abstract &&
            <CheckBox key={t.id} data-id={t.id} checked={value.has(t.id)} onChange={this.onChange}>
              {t.caption}
            </CheckBox>))}
      </SelectTypesLayout>
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
