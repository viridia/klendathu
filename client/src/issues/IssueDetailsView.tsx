import * as React from 'react';
import { IssueLinks } from './input/IssueLinks';
import { IssueChanges } from './IssueChanges';
import { CommentEdit } from './input/CommentEdit';
import { WorkflowActions } from './workflow/WorkflowActions';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import * as marked from 'marked';
import { Project, Issue, IssueInput, CustomField } from '../../../common/types/graphql';
import {
  Dialog,
  Button,
  NavContainer,
  ButtonGroup,
  AccountName,
  RelativeDate,
  CopyLink,
  LabelName,
  Card,
  FormLabel,
  FormControlGroup,
} from '../controls';
import { Role, IssueType, DataType, WorkflowAction } from '../../../common/types/json';
import { ViewContext } from '../models';
import { Query } from 'react-apollo';
import { fragments, ErrorDisplay } from '../graphql';
import gql from 'graphql-tag';

// import './IssueDetailsView.scss';

import ArrowUpIcon from '../svg-compiled/icons/IcArrowUpward';
import { IssueTypeDisplay } from './details';
import { IssueNavigator } from './details/IssueNavigator';
import { Spacer } from '../layout';
import styled from 'styled-components';
import { idToIndex } from '../lib/idToIndex';

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

const LeftPanel = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: [labels] auto [controls] 1fr;
  justify-items: flex-start;
  margin: 1rem 0 0 1rem;
  padding-right: 0.5rem;
  overflow-y: auto;

  > .fill {
    justify-self: stretch;
  }
`;

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  context: ViewContext;
  issue: Issue;
  loading: boolean;
}

@observer
export class IssueDetails extends React.Component<Props> {
  @observable private showDelete = false;
  @observable private busy = false;
  // private issueLinks: ObservableIssueLinks;
  // private comments: ObservableComments;
  // private changes: ObservableChanges;
  // private issueId: string;

  public componentWillMount() {
    // this.issueId = this.props.issue.id;
    // this.issueLinks = new ObservableIssueLinks(this.issueId);
    // this.comments = new ObservableComments(this.issueId);
    // this.changes = new ObservableChanges(this.issueId);
  }

  public componentWillReceiveProps(nextProps: Props) {
    // if (nextProps.issue.id !== this.issueId) {
      // this.issueLinks.release();
      // this.comments.release();
      // this.changes.release();
      // this.issueId = nextProps.issue.id;
      // this.issueLinks = new ObservableIssueLinks(this.issueId);
      // this.comments = new ObservableComments(this.issueId);
      // this.changes = new ObservableChanges(this.issueId);
    // }
  }

  public componentWillUnmount() {
    // this.issueLinks.release();
    // this.comments.release();
    // this.changes.release();
  }

  public render() {
    return (
      <Card>
        {this.renderHeader()}
        {this.renderContent()}
        <Dialog open={this.showDelete} onClose={this.onCancelDelete} className="confirm-dialog">
          <Dialog.Header hasClose={true}>
              Are you sure you want to delete issue #{this.issueIndex}?
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
      </Card>
    );
  }

  private renderHeader() {
    const { location, context, issue } = this.props;
    const { account, project } = context;
    const backLink = (location.state && location.state.back) || { pathname: './issues' };
    return (
      <header>
        <NavContainer to={backLink} exact={true}>
          <Button title="Back to issue list" className="issue-up">
            <ArrowUpIcon />
          </Button>
        </NavContainer>
        <div className="issue-id">Issue #{this.issueIndex}: </div>
        <div className="summary">{issue && issue.summary}</div>
        <IssueTypeDisplay issue={issue} />
        <Spacer />
        <CopyLink url={window.location.toString()} title="Copy issue link to clipboard" />
        <ButtonGroup className="issue-actions">
          <NavContainer
              to={{
                pathname: `/${account.accountName}/${project.name}/edit/${this.issueIndex}`,
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
        <IssueNavigator issue={issue} />
      </header>
    );
  }

  private renderContent() {
    const { context, issue, loading } = this.props;
    if (!issue) {
      return (
        <section className="content">
          <div className="left" />
        </section>
      );
    }
    const { project, template } = context;
    const issueType = context.getInheritedIssueType(issue.type);
    const issueState = template.states.find(st => st.id === issue.state);
    return (
      <section className="content">
        <LeftPanel>
          {!loading && (
            <React.Fragment>
              <FormLabel>State:</FormLabel>
              <div className="state">{issueState && issueState.caption}</div>

              {issue.summary.length > 0 &&
                <>
                  <FormLabel>Summary:</FormLabel>
                  <div>{issue.summary}</div>
                </>
              }

              {issue.description.length > 0 &&
                <>
                  <FormLabel>Description:</FormLabel>
                  {this.renderDescription(issue.description)}
                </>
              }

              <FormLabel>Created:</FormLabel>
              <RelativeDate date={issue.createdAt} withPrefix={true} />

              <FormLabel>Reporter:</FormLabel>
              {issue.reporter
                    ? <AccountName id={issue.reporter} />
                    : <span className="unassigned">unassigned</span>}

              <FormLabel>Owner:</FormLabel>
              {issue.owner
                    ? <AccountName id={issue.owner} />
                    : <span className="unassigned">unassigned</span>}

              {issue.cc.length > 0 && (
                <>
                  <FormLabel>CC:</FormLabel>
                  <div>{issue.cc.map(cc => <AccountName id={cc} key={cc} />)}</div>
                </>
              )}

              {this.renderTemplateFields(issueType, issue.custom)}

              {issue.labels.length > 0 && (
                <>
                  <FormLabel>Labels:</FormLabel>
                  <div>
                    {issue.labels.map(label =>
                      <LabelName id={label} key={label} />)}
                  </div>
                </>
              )}

              {/* {issue.attachments.length > 0 && (
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
              </tr>} */}

              <FormControlGroup>
                <CommentEdit onAddComment={this.onAddComment} />
              </FormControlGroup>
            </React.Fragment>)
          }
        </LeftPanel>
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

  private renderTemplateFields(issueType: IssueType, custom: CustomField[]) {
    const result: JSX.Element[] = [];
    if (issueType) {
      for (const field of issueType.fields) {
      //   const value = custom[field.id];
      //   if (value) {
      //     switch (field.type) {
      //       case DataType.TEXT:
      //         result.push(
      //           <tr key={field.id}>
      //             <th>{field.caption}:</th>
      //             <td>{value}</td>
      //           </tr>);
      //         break;
      //       case DataType.ENUM:
      //         result.push(
      //           <tr key={field.id}>
      //             <th>{field.caption}:</th>
      //             <td>{value}</td>
      //           </tr>);
      //         break;
      //       default:
      //         console.error('invalid field type:', field.type);
      //         break;
      //     }
      //   }
      }
    }
    return result;
  }

  @action.bound
  private onAddComment(newComment: string) {
    // const { issue } = this.props;
    // updateIssue(issue.id, {
    //   comments: [newComment],
    // });
  }

  @action.bound
  private onDeleteIssue() {
    this.showDelete = true;
    this.busy = false;
  }

  @action.bound
  private onConfirmDelete() {
    // const { context, location, history, issue } = this.props;
    // const { account, project } = context;
    this.busy = true;
    // return deleteIssue(issue.id).then(() => {
    //   const [prevIssue, nextIssue] = this.adjacentIssueIds(issue.id);
    //   this.showDelete = false;
    //   this.busy = false;
    //   if (prevIssue) {
    //     history.replace({
    //       ...location,
    //       pathname: `/${account.accountName}/${project.name}/${prevIssue}`,
    //     });
    //   } else if (nextIssue) {
    //     history.replace({
    //       ...location,
    //       pathname: `/${account.accountName}/${project.name}/${nextIssue}`,
    //     });
    //   } else if (location.state && location.state.back) {
    //     history.replace(location.state.back);
    //   } else {
    //     history.replace({
    //       ...location,
    //       pathname: `/${account.accountName}/${project.name}/issues`,
    //     });
    //   }
    // }, displayErrorToast);
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
    // return updateIssue(issue.id, updates).then(() => {
    //   // this.props.data.refetch();
    // });
  }

  @computed
  private get issueIndex(): string {
    const { issue } = this.props;
    if (issue) {
      return idToIndex(issue.id);
    }
    return '';
  }
}

const IssueQuery = gql`
  query IssueQuery($id: ID!) {
    issue(id: $id) { ...IssueFields }
  }
  ${fragments.issue}
`;

export interface IssueProviderProps extends RouteComponentProps<{ project: string, id: string }> {
  context: ViewContext;
}

export const IssueDetailsView = (props: IssueProviderProps) => {
  const { id } = props.match.params;
  const { project } = props.context;
  if (!project) {
    return null;
  }
  return (
    <Query query={IssueQuery} variables={{ id: `${project.id}.${id}` }} >
      {({ data, error, loading }) => {
        if (error) {
          return <ErrorDisplay error={error} />;
        }
        const { issue } = data;
        return <IssueDetails {...props} issue={issue} loading={loading} />;
      }}
    </Query>
  );
};
