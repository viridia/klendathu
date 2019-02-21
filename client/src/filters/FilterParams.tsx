import * as React from 'react';
import * as qs from 'qs';
import { RouteComponentProps } from 'react-router-dom';
import { FilterTerm, getDescriptor, ViewContext } from '../models';
import { FilterTermEditor } from './FilterTermEditor';
import { SaveFilterDialog } from './SaveFilterDialog';
import { action, computed, IObservableArray, observable } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import bind from 'bind-decorator';

import CloseIcon from '../svg-compiled/icons/IcClose';
import { DropdownButton, Button, Form, TextInput, MenuItem, Card, DiscloseButton, DismissButton } from '../controls';
import styled from 'styled-components';
import { Spacer } from '../layout';

interface GroupTerm {
  caption: string;
  field: string;
}

const GROUP_TERMS: GroupTerm[] = [
  { caption: '(none)', field: '' },
  { caption: 'Owner', field: 'owner' },
  { caption: 'Reporter', field: 'reporter' },
  { caption: 'Type', field: 'type' },
  { caption: 'State', field: 'state' },
];

const FilterParamsSection = styled(Card)`
  background-color: ${props => props.theme.filterParamsBgColor};
  margin-bottom: 12px;
`;

const FilterParamsHeader = styled.header`
  && {
    background-color: ${props => props.theme.filterParamsHeaderBgColor};
    border-bottom: 0;
  }
  /* color: $textDarkAccent; */
`;

const Collapse = styled.section`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  border-top: 1px solid ${props => props.theme.cardHeaderDividerColor};

  &.expanded {
    max-height: max-content;
    overflow: visible;
  }
`;

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
  // issues: IssueListQuery;
}

@observer
export class FilterParams extends React.Component<Props> {
  @observable private expanded = false;
  @observable private search = '';
  @observable private group = '';
  @observable private showSaveDialog = false;
  @observable private terms = [] as IObservableArray<FilterTerm>;

  public componentWillMount() {
    const { location } = this.props;
    this.parseQuery(location.search);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { location } = nextProps;
    if (location.search !== this.props.location.search) {
      this.parseQuery(location.search);
    }
  }

  public render() {
    return (
      <FilterParamsSection className="card filter-params">
        <FilterParamsHeader>
          <DiscloseButton checked={this.expanded} onClick={this.onChangeExpanded} />
          Filters
          <Spacer />
          <div className="search-group">
            <Form onSubmit={this.onSearch}>
              <TextInput
                  className="search"
                  placeholder="Search"
                  value={this.search}
                  onChange={this.onChangeSearch}
              >
                <DismissButton className="clear" onClick={this.onClearSearch} />
              </TextInput>
            </Form>
          </div>
        </FilterParamsHeader>
        {this.renderFilterTerms()}
      </FilterParamsSection>);
  }

  private renderFilterTerms() {
    const { env, location } = this.props;
    const selectedGroup = GROUP_TERMS.find(gr => gr.field === this.group);
    return (
      <Collapse className={classNames({ expanded: this.expanded })}>
        <section className="term-list">
          {this.terms.map((term, index) => (
            <FilterTermEditor
                index={index}
                key={index}
                term={term}
                termsUsed={this.termsUsed}
                env={env}
                onRemove={this.onRemoveTerm}
                onChange={this.onChangeTerm}
            />))}
          <FilterTermEditor
              env={env}
              termsUsed={this.termsUsed}
              onRemove={this.onRemoveTerm}
              onChange={this.onChangeTerm}
          >
            <Spacer />
            <DropdownButton
                size="small"
                title={selectedGroup && selectedGroup.field
                    ? `Group by ${selectedGroup.caption}` : 'Group by...'}
                id="group-by"
                onSelect={this.onSelectGroup}
            >
              {GROUP_TERMS.map(gt => (
                <MenuItem eventKey={gt.field} key={gt.field}>{gt.caption}</MenuItem>
              ))}
            </DropdownButton>
            <Button
                kind="default"
                size="small"
                onClick={this.onClearFilter}
                disabled={this.terms.length === 0}
            >
              Clear
            </Button>
            <Button
                kind="default"
                size="small"
                onClick={this.onSaveFilter}
                disabled={this.terms.length === 0}
            >
              Save Filter As&hellip;
            </Button>
            <Button
                kind="primary"
                size="small"
                onClick={this.onApplyFilter}
                disabled={location.search === this.queryString}
            >
              Apply Filter
            </Button>
          </FilterTermEditor>
          {this.showSaveDialog &&
            <SaveFilterDialog
                project={env.project}
                filter={this.queryString}
                onHide={this.onCloseSaveDialog}
            />}
        </section>
      </Collapse>
    );
  }

  @action.bound
  private onChangeSearch(e: any) {
    this.search = e.target.value;
  }

  @action.bound
  private onClearSearch(e: any) {
    e.preventDefault();
    this.search = '';
    this.onApplyFilter(e);
  }

  @action.bound
  private onChangeExpanded() {
    this.expanded = !this.expanded;
  }

  @action.bound
  private onChangeTerm(index: number | undefined, term: FilterTerm) {
    if (index !== undefined) {
      this.terms[index] = term;
    } else {
      this.terms.push(term);
    }
  }

  @action.bound
  private onSelectGroup(group: any) {
    this.group = group;
  }

  @action.bound
  private onRemoveTerm(index: number) {
    this.terms.splice(index, 1);
  }

  @bind
  private onSearch(e: any) {
    e.preventDefault();
    this.terms.clear();
    this.pushFilter();
  }

  @bind
  private onApplyFilter(e: any) {
    e.preventDefault();
    this.pushFilter();
  }

  @action.bound
  private onSaveFilter(e: any) {
    e.preventDefault();
    this.showSaveDialog = true;
  }

  @action.bound
  private onCloseSaveDialog() {
    this.showSaveDialog = false;
  }

  @action.bound
  private onClearFilter(e: any) {
    this.terms.clear();
    this.pushFilter();
  }

  @computed
  private get termsUsed() {
    const result = new Set<string>();
    for (const term of this.terms) {
      result.add(term.fieldId);
    }
    return result;
  }

  @computed
  private get queryString(): string {
    const { location } = this.props;
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const newQuery: { [key: string]: string } = {};
    if (query.sort) {
      newQuery.sort = query.sort;
    }
    if (this.search) {
      newQuery.search = this.search;
    }
    if (this.group) {
      newQuery.group = this.group;
    }
    // Add new terms
    this.terms.forEach(term => {
      term.descriptor.buildQuery(newQuery, term);
    });
    return qs.stringify(newQuery, {
      addQueryPrefix: true, encoder: encodeURI, arrayFormat: 'repeat' });
  }

  private pushFilter() {
    const { history } = this.props;
    history.push({ ...this.props.location, search: this.queryString });
  }

  private parseQuery(search: string) {
    const { env } = this.props;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    this.search = query.search || '';
    this.group = query.group || '';
    const terms: FilterTerm[] = [];
    for (const key of Object.getOwnPropertyNames(query)) {
      const descriptor = getDescriptor(env, key);
      if (descriptor) {
        const term: FilterTerm = observable({
          fieldId: key,
          descriptor,
          value: null,
          predicate: null,
        });
        descriptor.parseQuery(query, term, env);
        terms.push(term);
      }
    }
    this.terms.replace(terms);
  }
}
