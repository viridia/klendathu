import * as React from 'react';
import * as qs from 'qs';
// import {
//   IssueListQuery,
//   ObservableProjectPrefs,
//   ObservableSet,
//   Project,
// } from '../../models';
import { RouteComponentProps } from 'react-router-dom';
import { GroupHeader } from './GroupHeader';
import { IssueListEntry } from './IssueListEntry';
// import { MassEdit } from '../massedit/MassEdit';
// import { FilterParams } from '../filters/FilterParams';
import {
  ColumnRenderer,
  CustomColumnRenderer,
  DateColumnRenderer,
  StateColumnRenderer,
  TypeColumnRenderer,
  UserColumnRenderer,
} from './columns';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { NavContainer, MenuItem, CheckBox, ColumnSort } from '../controls';
import { Issue, PublicAccount } from '../../../common/types/graphql';
import { Role } from '../../../common/types/json';
import { ObservableSet } from '../lib/ObservableSet';
import bind from 'bind-decorator';

import MenuIcon from '../../../icons/ic_menu.svg';

interface Props extends RouteComponentProps<{}> {
  account: PublicAccount;
  // project: Project;
  // prefs: ObservableProjectPrefs;
  // issues: IssueListQuery;
}

interface QueryParams { [param: string]: string; }

@observer
export class IssueListView extends React.Component<Props> {
  private queryParams: QueryParams = {};
  private selectAllEl: HTMLInputElement;
  @observable private selection = new ObservableSet();

  public componentWillMount() {
    const { location, issues, project } = this.props;
    this.queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });
    issues.setFromQuery(project, this.queryParams);
    this.updateSelectAll();
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { location, issues, project } = nextProps;
    this.queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });
    issues.setFromQuery(project, this.queryParams);
  }

  public render() {
    const { account, issues, project } = this.props;
    if (!account) {
      return null;
    }
    if (!issues.loaded || !project.template.loaded) {
      return (
        <section className="kdt content issue-list">
          <div className="card issue">
            <div className="empty-list">Loading&hellip;</div>
          </div>
        </section>
      );
    } else if (issues.length === 0) {
      return (
        <section className="kdt content issue-list">
          {/* <FilterParams {...this.props} /> */}
          <div className="card issue">
            <div className="empty-list">No issues found</div>
          </div>
        </section>
      );
    } else {
      return (
        <section className="kdt content issue-list">
          {/* <FilterParams {...this.props} />
          <MassEdit project={project} selection={this.selection} /> */}
          {this.renderIssues()}
        </section>
      );
    }
  }

  private renderIssues() {
    const { issues, project } = this.props;
    if (issues.group) {
      return issues.grouped.map(gr => (
        <section className="issue-group" key={gr.value}>
          <header className="group-header">
            <GroupHeader group={gr} project={project} />
          </header>
          {this.renderIssueTable(gr.issues)}
        </section>
      ));
    }
    return this.renderIssueTable(issues.sorted);
  }

  private renderIssueTable(issues: Issue[]) {
    return (
      <div className="card issue">
        <table className="issue">
          {this.renderHeader()}
          <tbody>
            {issues.map(issue => (
              <IssueListEntry
                  {...this.props}
                  key={issue.id}
                  issue={issue}
                  columnRenderers={this.columnRenderers}
                  selection={this.selection}
              />))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderHeader() {
    const { account, project, issues } = this.props;
    return (
      <thead>
        <tr>
          {project.role >= Role.UPDATER && (<th className="selected">
            <label htmlFor="all-issues">
              <CheckBox
                  id="all-issues"
                  checked={this.selection.size > 0}
                  ref={el => { this.selectAllEl = el; }}
                  onChange={this.onChangeSelectAll}
              />
            </label>
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
              <Dropdown id="issue-menu" pullRight={true}>
                <Dropdown.Toggle noCaret={true}>
                  <MenuIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {/*<MenuItem
                      className={classNames({ checked: query.subtasks !== undefined })}
                      onClick={this.onToggleSubtasks}>Show Subtasks</MenuItem>*/}

                  <NavContainer to={`/${account.uname}/${project.uname}/settings/columns`}>
                    <MenuItem>Arrange Columns&hellip;</MenuItem>
                  </NavContainer>
                </Dropdown.Menu>
              </Dropdown>
            </section>
          </th>
        </tr>
      </thead>
    );
  }

  @bind
  private onChangeSort(column: string, descending: boolean) {
    const { history } = this.props;
    const sort = `${descending ? '-' : ''}${column}`;
    history.replace({
      ...this.props.location,
      search: qs.stringify({ ...this.queryParams, sort }, {
        addQueryPrefix: true,
        encoder: encodeURI,
        arrayFormat: 'repeat',
      }),
    });
  }

  @action.bound
  private onChangeSelectAll(e: any) {
    if (e.target.checked) {
      for (const issue of this.props.issues.asList) {
        this.selection.add(issue.id);
      }
    } else {
      this.selection.clear();
    }
  }

  @computed
  private get columns(): string[] {
    const { prefs } = this.props;
    return prefs.columns;
  }

  @computed
  private get columnRenderers(): Map<string, ColumnRenderer> {
    const { project } = this.props;
    const columnRenderers = new Map<string, ColumnRenderer>();
    columnRenderers.set('reporter',
        new UserColumnRenderer('Reporter', 'reporter', 'reporter pad'));
    columnRenderers.set('owner', new UserColumnRenderer('Owner', 'owner', 'owner pad'));
    columnRenderers.set('created', new DateColumnRenderer('Created', 'created', 'created pad'));
    columnRenderers.set('updated', new DateColumnRenderer('Updated', 'updated', 'updated pad'));
    const template = project.template;
    if (template && template.loaded) {
      columnRenderers.set('state', new StateColumnRenderer(template));
      columnRenderers.set('type', new TypeColumnRenderer(template));
      for (const type of template.types) {
        if (type.fields) {
          for (const field of type.fields) {
            columnRenderers.set(`custom.${field.id}`, new CustomColumnRenderer(field));
          }
        }
      }
    }
    return columnRenderers;
  }

  // Checkbox 'indeterminate' state can only be set programmatically.
  private updateSelectAll() {
    if (this.selectAllEl) {
      const noneSelected = this.selection.size === 0;
      let allSelected = true;
      for (const issue of this.props.issues.asList) {
        if (!this.selection.has(issue.id)) {
          allSelected = false;
          break;
        }
      }
      this.selectAllEl.indeterminate = !allSelected && !noneSelected;
    }
  }
}
