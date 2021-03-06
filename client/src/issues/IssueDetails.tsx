import * as React from 'react';
import { IssueLinks } from './input/IssueLinks';
import { CommentEdit } from './input/CommentEdit';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Issue, CustomField, Relation } from '../../../common/types/graphql';
import {
  NavContainer,
  AccountName,
  RelativeDate,
  CopyLink,
  LabelName,
  Card,
  MarkdownText,
} from '../controls';
import { Role, IssueType, DataType } from '../../../common/types/json';
import { ViewContext } from '../models';
import { IssueTypeDisplay, IssueNavigator, IssueCommits, TimeboxName } from './details';
import { Spacer } from '../layout';
import { idToIndex } from '../lib/idToIndex';
import { IssueTimeline } from './IssueTimeline';
import styled from 'styled-components';
import ArrowUpIcon from '../svg-compiled/icons/IcArrowUpward';
import { WorkflowActionsView } from './workflow/WorkflowActionsView';
import { ShowAttachments } from '../files/ShowAttachments';
import { LocationState } from 'history';
import { Button, Dialog, ButtonGroup } from 'skyhook-ui';
import { DepGraph } from './details/DepGraph';
import { FormLabel } from '../controls/widgets';
import { SprintName } from '../controls/SprintName';

const IssueDetailsLayout = styled(Card)`
  flex: 1 0 0;
`;

const IssueDetailsHeader = styled.header`
  && {
    padding-left: 6px;
  }
  > * {
    margin-right: .5rem;

    &:last-child {
      margin-right: 0;
    }
  }
`;

const IssueDetailsContent = styled.section`
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 1rem;
`;

const LeftPanelScroll = styled.div`
  align-self: stretch;
  flex: 8 0 0;
  margin: 1rem 0 0 1rem;
  overflow-y: scroll;
`;

const LeftPanel = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: [labels] auto [controls] 1fr;
  justify-items: flex-start;
  padding: 0 0.5rem 0 1rem;

  > .fill {
    justify-self: stretch;
  }
`;

const RightPanel = styled.aside`
  align-self: stretch;
  border: 1px solid ${props => props.theme.cardHeaderDividerColor};
  width: 16rem;
  flex-basis: auto;
  margin: 1rem 1rem 1rem 0.5rem;
  overflow-y: auto;
  padding: .6rem;
`;

const IssueLinkGroup = styled.div`
  grid-column: controls;
  justify-self: stretch;
  margin: 0;
  min-width: 0;

  > ul {
    padding: 0 8px;
    > li {
      margin-bottom: 6px;
    }
  }
`;

const IssueDescription = styled(MarkdownText)`
  > p:first-child {
    margin-top: 0;
  }
  > p:last-child {
    margin-bottom: 0;
  }
`;

export const CommentGroup = styled.span`
  grid-column: controls;
  justify-self: stretch;
`;

const FormLabelCentered = styled(FormLabel)`
  align-self: center;
`;

interface Props extends RouteComponentProps<{ project: string; id: string }, LocationState> {
  env: ViewContext;
  issue: Issue;
  loading: boolean;
  onAddComment: (body: string) => any;
}

@observer
export class IssueDetails extends React.Component<Props> {
  @observable private showDelete = false;
  @observable private busy = false;

  public render() {
    return (
      <IssueDetailsLayout className="issue-details">
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
            <Button onClick={this.onConfirmDelete} disabled={this.busy} variant="primary">
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog>
      </IssueDetailsLayout>
    );
  }

  private renderHeader() {
    const { location, env, issue } = this.props;
    const { account, project } = env;
    const back: LocationState = (location.state && location.state.back) || { pathname: './issues' };
    const here: LocationState = {
      pathname: location.pathname,
      search: location.search,
    };
    return (
      <IssueDetailsHeader>
        <NavContainer to={back} exact={true}>
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
              state: { ...location.state, back: here },
            }}
          >
            <Button title="Edit issue" disabled={project.role < Role.UPDATER}>Edit</Button>
          </NavContainer>
          <Button
            title="Delete issue"
            variant="default"
            disabled={project.role < Role.MANAGER}
            onClick={this.onDeleteIssue}
          >
            Delete
          </Button>
        </ButtonGroup>
        <IssueNavigator {...this.props} issue={issue} />
      </IssueDetailsHeader>
    );
  }

  private renderContent() {
    const { env, issue, loading, onAddComment } = this.props;
    if (!issue) {
      return (
        <section className="content">
          <div className="left" />
        </section>
      );
    }
    const { project, template } = env;
    const issueType = env.types.get(issue.type);
    const issueState = template.states.find(st => st.id === issue.state);
    return (
      <IssueDetailsContent>
        <LeftPanelScroll>
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
                    <IssueDescription className="descr" content={issue.description} />
                  </>
                }

                <FormLabel>Created:</FormLabel>
                <RelativeDate date={issue.createdAt} withPrefix={true} />

                <FormLabel>Reporter:</FormLabel>
                <AccountName id={issue.reporter} />

                <FormLabel>Owner:</FormLabel>
                <AccountName id={issue.owner} />

                {issue.watchers.length > 0 && (
                  <>
                    <FormLabel>Watching:</FormLabel>
                    <div>{issue.watchers.map(w => <AccountName id={w} key={w} />)}</div>
                  </>
                )}

                {this.renderTemplateFields(issueType, issue.custom)}

                {issue.labels.length > 0 && (
                  <>
                    <FormLabelCentered>Labels:</FormLabelCentered>
                    <div>
                      {issue.labels.map(label =>
                        <LabelName id={label} key={label} />)}
                    </div>
                  </>
                )}

                {issue.sprints.length > 0 && (
                  <>
                    <FormLabelCentered>Sprints:</FormLabelCentered>
                    <div>
                      {issue.sprints.map(spId =>
                        <SprintName key={spId} sprint={spId} />
                      )}
                    </div>
                  </>
                )}

                {issue.milestone && (
                  <>
                    <FormLabel>Milestone:</FormLabel>
                    <TimeboxName timebox={issue.milestone} />
                  </>
                )}

                {issue.attachments.length > 0 && (
                  <>
                    <FormLabel>Attachments:</FormLabel>
                    <ShowAttachments attachments={issue.attachments} />
                  </>
                )}

                {issue.links.length > 0 && (
                  <>
                    <FormLabel>Linked Issues:</FormLabel>
                    <IssueLinkGroup>
                      <IssueLinks links={this.issueLinkMap} />
                      <DepGraph issue={this.props.issue} />
                    </IssueLinkGroup>
                  </>
                )}

                <IssueCommits issue={issue} />
                <IssueTimeline issue={issue} />

                <CommentGroup>
                  <CommentEdit onAddComment={onAddComment} />
                </CommentGroup>
              </React.Fragment>)
            }
          </LeftPanel>
        </LeftPanelScroll>

        {project.role >= Role.UPDATER && (
          <RightPanel>
            <WorkflowActionsView history={this.props.history} issue={issue} />
          </RightPanel>
        )}
      </IssueDetailsContent>
    );
  }

  private renderTemplateFields(issueType: IssueType, custom: CustomField[]) {
    const result: JSX.Element[] = [];
    if (issueType) {
      for (const field of issueType.fields) {
        const value = this.customFields.get(field.id);
        if (value) {
          switch (field.type) {
            case DataType.TEXT:
              result.push(<FormLabel key={`label-${field.id}`}>{field.caption}:</FormLabel>);
              result.push(<div>{value}</div>);
              break;
            case DataType.ENUM:
              result.push(<FormLabel key={`label-${field.id}`}>{field.caption}:</FormLabel>);
              result.push(<div>{value}</div>);
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
  private onDeleteIssue() {
    this.showDelete = true;
    this.busy = false;
  }

  @action.bound
  private onConfirmDelete() {
    // const { env, location, history, issue } = this.props;
    // const { account, project } = env;
    this.busy = true;
    // TODO: Implement
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

  @computed
  private get customFields() {
    return new Map<string, string | number | boolean>(
      this.props.issue.custom.map(entry => [entry.value, entry.value] as [string, any]));
  }

  @computed
  private get issueLinkMap(): Map<string, Relation> {
    const issueLinkMap = new Map<string, Relation>();
    for (const link of this.props.issue.links) {
      issueLinkMap.set(link.to, link.relation);
    }
    return issueLinkMap;
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
