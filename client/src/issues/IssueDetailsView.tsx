import * as React from 'react';
import { IssueProvider } from './IssueProvider';
import { IssueLinks } from './IssueLinks';
import { IssueChanges } from './IssueChanges';
import { CommentEdit } from './input/CommentEdit';
import { WorkflowActions } from './workflow/WorkflowActions';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import * as marked from 'marked';

// import './IssueDetailsView.scss';

import ArrowBackIcon from '../../../icons/ic_arrow_back.svg';
import ArrowForwardIcon from '../../../icons/ic_arrow_forward.svg';
import ArrowUpIcon from '../../../icons/ic_arrow_upward.svg';
import { Project, Issue, IssueInput, PublicAccount } from '../../../common/types/graphql';
import {
  Dialog,
  Button,
  NavContainer,
  ButtonGroup,
  AccountName,
  RelativeDate,
  CopyLink,
  LabelName,
} from '../controls';
import { Role, IssueType, DataType, WorkflowAction } from '../../../common/types/json';
import { IssueQueryModel } from '../models';

// Global options for marked.
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  account: PublicAccount;
  project: Project;
  issues: IssueQueryModel;
  issue: Issue;
}

@observer
export class IssueDetails extends React.Component<Props> {
  @observable private showDelete = false;
  @observable private busy = false;
  // private issueLinks: ObservableIssueLinks;
  // private comments: ObservableComments;
  // private changes: ObservableChanges;
  private issueId: string;

  public componentWillMount() {
    this.issueId = this.props.issue.id;
    // this.issueLinks = new ObservableIssueLinks(this.issueId);
    // this.comments = new ObservableComments(this.issueId);
    // this.changes = new ObservableChanges(this.issueId);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.issue.id !== this.issueId) {
      // this.issueLinks.release();
      // this.comments.release();
      // this.changes.release();
      this.issueId = nextProps.issue.id;
      // this.issueLinks = new ObservableIssueLinks(this.issueId);
      // this.comments = new ObservableComments(this.issueId);
      // this.changes = new ObservableChanges(this.issueId);
    }
  }

  public componentWillUnmount() {
    // this.issueLinks.release();
    // this.comments.release();
    // this.changes.release();
  }

  public render() {
    return (
      <section className="kdt issue-details">
        <section className="card">
          {this.renderHeader()}
          {this.renderContent()}
          {this.showDelete && (
            <Dialog open={true} onClose={this.onCancelDelete} className="confirm-dialog">
              <Dialog.Header hasClose={true}>
                  Are you sure you want to delete issue #{this.props.issue.index}?
              </Dialog.Header>
              <Dialog.Body>
                This action cannot be undone.
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={this.onCancelDelete}>Cancel</Button>
                <Button onClick={this.onConfirmDelete} disabled={this.busy} kind="primary">
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog>
          )}
        </section>
      </section>
    );
  }

  private renderHeader() {
    const { location, account, project, issue } = this.props;
    const template = project.template;
    const issueType = template.types.find(t => t.id === issue.type);
    const backLink = (location.state && location.state.back) || { pathname: './issues' };
    const [prevIssue, nextIssue] = this.adjacentIssueIds(issue.id);
    return (
      <header>
        <NavContainer to={backLink} exact={true}>
          <Button title="Back to issue list" className="issue-up">
            <ArrowUpIcon />
          </Button>
        </NavContainer>
        <div className="issue-id">Issue #{issue.index}: </div>
        <div className="summary">{issue.summary}</div>
        <div className="stretch">
          {issueType && (
            <div className="issue-type" style={{ backgroundColor: issueType.bg }}>
              {issueType.caption}
            </div>)}
        </div>
        <CopyLink url={window.location.toString()} title="Copy issue link to clipboard" />
        <ButtonGroup className="issue-actions">
          <NavContainer
              to={{
                pathname: `/${account.accountName}/${project.name}/edit/${issue.index}`,
                state: { ...location.state, back: this.props.location },
              }}
          >
            <Button title="Edit issue" disabled={project.role < Role.UPDATER}>Edit</Button>
          </NavContainer>
          <Button
              title="Delete issue"
              kind="default"
              disabled={project.role < Role.MANAGER}
              onClick={this.onDeleteIssue}
          >
            Delete
          </Button>
        </ButtonGroup>
        <ButtonGroup className="issue-nav">
          <NavContainer
              to={{
                ...location,
                pathname: `/${account.accountName}/${project.name}/${prevIssue}` }}
          >
            <Button title="Previous issue" disabled={prevIssue === null}>
              <ArrowBackIcon />
            </Button>
          </NavContainer>
          <NavContainer
              to={{
                ...location,
                pathname: `/${account.accountName}/${project.uname}/${nextIssue}` }}
          >
            <Button title="Next issue" disabled={nextIssue === null}>
              <ArrowForwardIcon />
            </Button>
          </NavContainer>
        </ButtonGroup>
      </header>
    );
  }

  private renderContent() {
    const { account, project, issue } = this.props;
    const template = project.template;
    const issueType = template.getInheritedIssueType(issue.type);
    const issueState = template.states.find(st => st.id === issue.state);
    return (
      <section className="content">
        <div className="left">
          {issue.loaded && (<table className="create-issue-table form-table">
            <tbody>
              <tr>
                <th className="header">State:</th>
                <td className="state">{issueState && issueState.caption}</td>
              </tr>
              {issue.summary.length > 0 && (
                <tr>
                  <th className="header">Summary:</th>
                  <td>{issue.summary}</td>
                </tr>
              )}
              {issue.description.length > 0 && (
                <tr>
                  <th className="header">Description:</th>
                  {this.renderDescription(issue.description)}
                </tr>
              )}
              <tr>
                <th className="header">Created:</th>
                <td className="changes">
                  <RelativeDate date={issue.createdAt} withPrefix={true} />
                </td>
              </tr>
              <tr>
                <th className="header">Reporter:</th>
                <td className="reporter">
                  {issue.reporter
                    ? <AccountName id={issue.reporter} />
                    : <span className="unassigned">unassigned</span>}
                </td>
              </tr>
              <tr>
                <th className="header">Owner:</th>
                <td>
                  {issue.owner
                    ? <AccountName id={issue.owner} />
                    : <span className="unassigned">unassigned</span>}
                </td>
              </tr>
              {issue.cc.length > 0 && (
                <tr>
                  <th className="header">CC:</th>
                  <td>{issue.cc.map(cc => <AccountName id={cc} key={cc} />)}
                  </td>
                </tr>
              )}
              {this.renderTemplateFields(issueType, issue.custom)}
              {issue.labels.length > 0 && (
                <tr>
                  <th className="header labels">Labels:</th>
                  <td>
                    {issue.labels.map(label =>
                      <LabelName id={label} key={label} />)}
                  </td>
                </tr>
              )}
              {issue.attachments.length > 0 && (
                <tr>
                  <th className="header">Attachments:</th>
                  <td><ShowAttachments attachments={issue.attachments} /></td>
                </tr>
              )}
              {this.issueLinks.size > 0 && <tr>
                <th className="header linked">Linked Issues:</th>
                <td>
                  <IssueLinks
                      account={account}
                      project={project}
                      issues={this.props.issues}
                      links={this.issueLinks.linkMap}
                  />
                </td>
              </tr>}
              {(this.comments.length > 0 || this.changes.length > 0) && <tr>
                <th className="header history">Issue History:</th>
                <td>
                  <IssueChanges
                      issue={issue}
                      comments={this.comments.comments}
                      changes={this.changes.changes}
                      project={project}
                      account={account}
                  />
                </td>
              </tr>}
              <tr>
                <th className="header" />
                <td>
                  <CommentEdit onAddComment={this.onAddComment} />
                </td>
              </tr>
            </tbody>
          </table>)}
        </div>
        {project.role >= Role.UPDATER && (<aside className="right">
          {/* <WorkflowActions
              template={template}
              changes={this.changes}
              issue={issue}
              onExecAction={this.onExecAction}
          /> */}
        </aside>)}
      </section>
    );
  }

  private renderDescription(description: string) {
    return <td className="descr" dangerouslySetInnerHTML={{ __html: marked(description) }} />;
  }

  private adjacentIssueIds(id: string): [string, string] {
    const list = this.props.issues.sorted;
    const index = list.findIndex(issue => issue.id === id);
    if (index < 0) {
      return [null, null];
    }
    return [
      index > 0 ? this.idToIndex(list[index - 1]) : null,
      index < list.length - 1 ? this.idToIndex(list[index + 1]) : null,
    ];
  }

  private idToIndex(issue: Issue): string {
    return issue.id.split('/')[2];
  }

  private renderTemplateFields(issueType: IssueType, custom: CustomValues) {
    const result = [];
    if (issueType) {
      for (const field of issueType.fields) {
        const value = custom[field.id];
        if (value) {
          switch (field.type) {
            case DataType.TEXT:
              result.push(
                <tr key={field.id}>
                  <th>{field.caption}:</th>
                  <td>{value}</td>
                </tr>);
              break;
            case DataType.ENUM:
              result.push(
                <tr key={field.id}>
                  <th>{field.caption}:</th>
                  <td>{value}</td>
                </tr>);
              break;
            default:
              console.error('invalid field type:', field.type);
              break;
          }
        }
      }
    }
    return result;
  }

  @action.bound
  private onAddComment(newComment: string) {
    const { issue } = this.props;
    updateIssue(issue.id, {
      comments: [newComment],
    });
  }

  @action.bound
  private onDeleteIssue() {
    this.showDelete = true;
    this.busy = false;
  }

  @action.bound
  private onConfirmDelete() {
    const { account, location, history, project, issue } = this.props;
    this.busy = true;
    return deleteIssue(issue.id).then(() => {
      const [prevIssue, nextIssue] = this.adjacentIssueIds(issue.id);
      this.showDelete = false;
      this.busy = false;
      if (prevIssue) {
        history.replace({
          ...location,
          pathname: `/${account.accountName}/${project.name}/${prevIssue}`,
        });
      } else if (nextIssue) {
        history.replace({
          ...location,
          pathname: `/${account.accountName}/${project.name}/${nextIssue}`,
        });
      } else if (location.state && location.state.back) {
        history.replace(location.state.back);
      } else {
        history.replace({
          ...location,
          pathname: `/${account.accountName}/${project.name}/issues`,
        });
      }
    }, displayErrorToast);
  }

  @action.bound
  private onCancelDelete() {
    this.showDelete = false;
    this.busy = false;
  }

  @bind
  private onExecAction(act: WorkflowAction) {
    const { issue } = this.props;
    const updates: Partial<IssueInput> = {
      state: act.state,
      owner: act.owner,
    };
    return updateIssue(issue.id, updates).then(() => {
      // this.props.data.refetch();
    });
  }
}

export interface IssueProviderProps extends RouteComponentProps<{ project: string, id: string }> {
  account: Account;
  project: Project;
  issues: IssueListQuery;
}

export const IssueDetailsView = (props: IssueProviderProps) => {
  return (
    <IssueProvider {...props}>
      {issue => <IssueDetails {...props} issue={issue} />}
    </IssueProvider>
  );
};
