import * as React from 'react';
import * as qs from 'qs';
import { RouteComponentProps } from 'react-router';
import { ErrorListDisplay } from '../graphql/ErrorDisplay';
import { ViewContext } from '../models';
import { LoadingIndicator, Card, CheckBox, ColumnSort } from '../controls';
import { observer } from 'mobx-react';
import { computed, action, observable, ObservableSet } from 'mobx';
import { EmptyList, Table, TableHead, TableBody } from '../layout';
import { styled } from '../style';
import { Role } from '../../../common/types/json';
import bind from 'bind-decorator';
import {
  ColumnRenderer,
  StateColumnRenderer,
  TypeColumnRenderer,
  UserColumnRenderer,
  DateColumnRenderer,
  CustomColumnRenderer,
} from './columns';
import { IssueListEntry } from './IssueListEntry';
import { keyframes } from 'styled-components';

const highlightNew = (color: string) => keyframes`
  from {
    background-color: ${color};
  }
`;

const IssueListViewTable = styled(Table)`
  tr.added {
    animation: ${props => highlightNew(props.theme.buttonColors.secondary.bg)} 1s ease-in;
  }

  th {
    white-space: nowrap;
  }

  .selected {
    text-align: center;
  }
`;

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
  // milestones: MilestoneListQuery;
}

/** Contains the table of issues for a project.
    Handles the mechanics of selection, filtering and column layout. Actual rendering is delegated
    to a sub-component.
 */
@observer
export class IssueList extends React.Component<Props> {
  private selectAllEl = React.createRef<HTMLInputElement>();

  public componentWillMount() {
    this.updateSelectAll();
  }

  public componentDidUpdate() {
    this.updateSelectAll();
  }

  public render() {
    const { issues } = this.props.env;
    const { errors, loading, list } = issues;
    if (errors) {
      return <ErrorListDisplay errors={errors} />;
    } else if (list && list.length > 0) {
      return <Card>{this.renderIssues()}</Card>;
    } else if (loading) {
      return <LoadingIndicator>Loading&hellip;</LoadingIndicator>;
    } else {
      return <EmptyList>No issues found</EmptyList>;
    }
  }

  private renderIssues() {
    return this.renderIssueTable();
  }

  private renderIssueTable() {
    const { issues, selection } = this.props.env;
    return (
      <IssueListViewTable>
        {this.renderTableHeader()}
        <TableBody>
          {issues.list.map(issue => (
            <IssueListEntry
                {...this.props}
                key={issue.id}
                issue={issue}
                columnRenderers={this.columnRenderers}
                selection={selection}
            />))}
        </TableBody>
      </IssueListViewTable>
    );
  }

  private renderTableHeader() {
    const { project, issues, selection } = this.props.env;
    return (
      <TableHead>
        <tr>
          {project.role >= Role.UPDATER && (<th className="selected">
            <CheckBox
                checked={selection.size > 0}
                ref={this.selectAllEl}
                onChange={this.onChangeSelectAll}
            />
          </th>)}
          <th className="id">
            <ColumnSort
                column="id"
                className="sort"
                sortKey={issues.sort}
                descending={issues.descending}
                onChangeSort={this.onChangeSort}
            >
              #
            </ColumnSort>
          </th>
          {this.columns.map(cname => {
            const cr = this.columnRenderers.get(cname);
            if (cr) {
              return cr.renderHeader(issues.sort, issues.descending, this.onChangeSort);
            }
            return <th className="custom center" key={cname}>--</th>;
          })}
          <th className="summary">
            <section>
              <ColumnSort
                  column="summary"
                  className="sort"
                  sortKey={issues.sort}
                  descending={issues.descending}
                  onChangeSort={this.onChangeSort}
              >
                Summary
              </ColumnSort>
              {/* <Dropdown id="issue-menu" pullRight={true}>
                <Dropdown.Toggle noCaret={true}>
                  <MenuIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <MenuItem
                      className={classNames({ checked: query.subtasks !== undefined })}
                      onClick={this.onToggleSubtasks}>Show Subtasks</MenuItem>

                  <NavContainer to={`/${account.uname}/${project.uname}/settings/columns`}>
                    <MenuItem>Arrange Columns&hellip;</MenuItem>
                  </NavContainer>
                </Dropdown.Menu>
              </Dropdown> */}
            </section>
          </th>
        </tr>
      </TableHead>
    );
  }

  @bind
  private onChangeSort(column: string, descending: boolean) {
    const { history } = this.props;
    const sort = `${descending ? '-' : ''}${column}`;
    history.replace({
      ...this.props.location,
      search: qs.stringify({ ...this.props.env.issues.searchParams, sort }, {
        addQueryPrefix: true,
        encoder: encodeURI,
        arrayFormat: 'repeat',
      }),
    });
  }

  @action.bound
  private onChangeSelectAll(e: any) {
    const { issues, selection } = this.props.env;
    if (e.target.checked) {
      for (const issue of issues.list) {
        selection.add(issue.id);
      }
    } else {
      selection.clear();
    }
  }

  @computed
  private get columnRenderers(): Map<string, ColumnRenderer> {
    const { template } = this.props.env;
    const columnRenderers = new Map<string, ColumnRenderer>();
    columnRenderers.set('reporter',
        new UserColumnRenderer('Reporter', 'reporter', 'reporter pad'));
    columnRenderers.set('owner', new UserColumnRenderer('Owner', 'owner', 'owner pad'));
    columnRenderers.set('created', new DateColumnRenderer('Created', 'created', 'created pad'));
    columnRenderers.set('updated', new DateColumnRenderer('Updated', 'updated', 'updated pad'));
    columnRenderers.set('state', new StateColumnRenderer(template));
    columnRenderers.set('type', new TypeColumnRenderer(template));
    for (const type of template.types) {
      if (type.fields) {
        for (const field of type.fields) {
          columnRenderers.set(`custom.${field.id}`, new CustomColumnRenderer(field));
        }
      }
    }
    return columnRenderers;
  }

  @computed
  private get columns(): string[] {
    const { prefs } = this.props.env;
    return prefs.columns;
  }

  // Checkbox 'indeterminate' state can only be set programmatically.
  private updateSelectAll() {
    if (this.selectAllEl.current) {
      const { issues, selection } = this.props.env;
      const noneSelected = selection.size === 0;
      let allSelected = true;
      for (const issue of issues.list) {
        if (!selection.has(issue.id)) {
          allSelected = false;
          break;
        }
      }
      this.selectAllEl.current.indeterminate = !allSelected && !noneSelected;
    }
  }
}
