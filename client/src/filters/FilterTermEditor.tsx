import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { Predicate } from '../../../common/types/graphql';
import { FilterTerm } from '../models/FilterTerm';
import { descriptors, getDescriptor } from '../models/FilterTermDescriptor';
import { OperandType, defaultOperandValue } from '../models/OperandType';
import { EditOperand } from '../issues/input/EditOperand';
import { ViewContext } from '../models';
import styled from 'styled-components';
import { DismissButton } from 'skyhook-ui';
import { Menu, MenuButton, MenuList, MenuItem } from '../controls/widgets/Menu';

type PredicateList = Array<[Predicate, string]>;

const FilterTermSection = styled.section`
  align-self: stretch;
  display: flex;
  flex-direction: row;
  margin: 4px;
  > * {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }

  .filter-field {
    min-width: 12rem;
  }

  .filter-value {
    display: flex;
    flex: 1;
    justify-content: flex-start;
    margin-right: 0;
  }

  .operand-value, .label-selector {
    flex: 1;
  }

  .remove {
    align-self: center;
    margin-right: 2px;
  }
`;

const STRING_PREDICATES: PredicateList = [
  [Predicate.Contains, 'contains'],
  [Predicate.Equals, 'is exactly'],
  [Predicate.NotContains, 'does not contain'],
  [Predicate.NotEquals, 'is not exactly'],
  [Predicate.StartsWith, 'starts with'],
  [Predicate.EndsWith, 'ends with'],
  // REGEX: 'matches regex',
  // NOT_REGEX: 'does not match regex',
  // MATCH = 'MATCH',
  // NOT_MATCH = 'NOT_MATCH',
  // GREATER = 'GREATER',
  // GREATER_EQUAL = 'GREATER_EQUAL',
  // LESS = 'LESS',
  // LESS_EQUAL = 'LESS_EQUAL',
];

interface Props {
  term?: FilterTerm;
  termsUsed: Set<string>;
  index?: number;
  env: ViewContext;
  children?: React.ReactNode;
  onChange: (index: number, term: any) => void;
  onRemove: (index: number) => void;
  // updateFilterTerm: PropTypes.func.isRequired,
}

/** Class which edits a single term of a filter expression. */
@observer
export class FilterTermEditor extends React.Component<Props> {
  public render() {
    const { index, term, termsUsed, env, children } = this.props;
    const items: React.ReactNode[] = [];
    Object.getOwnPropertyNames(descriptors).forEach(id => {
      const desc = descriptors[id];
      items.push(
        <MenuItem
          // eventKey={id}
          key={id}
          disabled={termsUsed.has(id)}
          onSelect={() => this.onSelectField(id)}
        >
          {desc.caption}
        </MenuItem>);
    });
    env.fields.forEach(field => {
      const customId = `custom.${field.id}`;
      items.push(
        <MenuItem
          // eventKey={customId}
          key={customId}
          disabled={termsUsed.has(field.id)}
          onSelect={() => this.onSelectField(customId)}
        >
          {field.caption}
        </MenuItem>);
    });
    const caption = (term && term.descriptor.caption) || 'Search by...';

    return (
      <FilterTermSection className="filter-term">
        <Menu>
          <MenuButton
            size="small"
            className="filter-field"
          >
            <span>{caption}</span>
          </MenuButton>
          <MenuList align="justify">
            {items}
          </MenuList>
        </Menu>
        {/* <DropdownButton
          size="small"
          title={caption}
          className="filter-field"
          onSelect={this.onSelectField}
        >
          {items}
        </DropdownButton> */}
        {this.renderOpSelector(term)}
        <section className="filter-value">
          {term && (
            <EditOperand
              type={term.descriptor.type}
              value={term.value}
              customField={term.descriptor.customField}
              onChange={this.onChangeValue}
            />)}
        </section>
        {children}
        {index !== undefined &&
          <DismissButton className="remove" onClick={this.onRemove} />}
      </FilterTermSection>
    );
  }

  private renderPredicateSelector(preds: PredicateList, defaultPred: Predicate): JSX.Element {
    const selected = (this.props.term && this.props.term.predicate) || defaultPred;
    const selectedInfo = preds.find(p => p[0] === selected);
    return (
      <Menu>
        <MenuButton
          size="small"
          id="term-field"
        >
          {selectedInfo[1]}
        </MenuButton>
        <MenuList>
          {preds.map(([p, caption]) => (
            <MenuItem
              key={p}
              onSelect={() => this.onSelectPredicate(p)}
            >
              {caption}
            </MenuItem>))}
        </MenuList>
      </Menu>
    );
  }

  private renderOpSelector(term: FilterTerm) {
    if (!term) {
      return null;
    }
    switch (term.descriptor.type) {
      case OperandType.SEARCH_TEXT:
        return this.renderPredicateSelector(STRING_PREDICATES, Predicate.Contains);
      default:
        return null;
    }
  }

  @action.bound
  private onSelectField(fieldId: any) {
    const { index, term, env } = this.props;
    const descriptor = getDescriptor(env, fieldId);
    if (!descriptor) {
      throw new Error(`Invalid field id: ${fieldId}`);
    }
    if (!term || descriptor !== term.descriptor) {
      const newTerm: FilterTerm = {
        fieldId,
        descriptor,
        value: defaultOperandValue(env.template, descriptor.type, descriptor.customField),
        predicate: null,
      };
      this.props.onChange(index, newTerm);
    } else {
      this.props.onChange(index, { ...term, fieldId, value: term.value });
    }
  }

  @action.bound
  private onSelectPredicate(pred: any) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, predicate: pred });
  }

  @action.bound
  private onChangeValue(value: any) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, value });
  }

  @action.bound
  private onRemove(e: any) {
    e.preventDefault();
    this.props.onRemove(this.props.index);
  }
}
