import bind from 'bind-decorator';
import * as React from 'react';
import { observer } from 'mobx-react';
import { RadioButton } from '../../controls';
import { Template } from '../../../../common/types/json';
import { styled } from '../../style';

interface Props {
  value: string;
  template: Template;
  onChange: (value: string) => void;
}

const TypeSelectorLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  > label {
    height: 1.8rem;
    margin-right: 1rem;
  }
`;

/** Selects the type of the issue. */
@observer
export class TypeSelector extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    const concreteTypes = template.types.filter(t => !t.abstract);
    return (
      <TypeSelectorLayout>
        {concreteTypes.map(t => {
          return (
            <RadioButton
              key={t.id}
              data-type={t.id}
              checked={t.id === value}
              onChange={this.onChange}
            >
              {t.caption}
            </RadioButton>
          );
        })}
    </TypeSelectorLayout>);
  }

  @bind
  private onChange(e: any) {
    this.props.onChange(e.target.dataset.type);
  }
}
