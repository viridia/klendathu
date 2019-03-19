import * as React from 'react';
import * as qs from 'qs';
// import { getFileInfoList } from '../../network/requests';
// import { UploadAttachments } from '../files/UploadAttachments';

import {
  Relation,
  IssueInput,
  Issue,
  Attachment,
  PublicAccount,
  CustomFieldInput,
  IssueLink,
  Milestone,
} from '../../../common/types/graphql';
import { RouteComponentProps } from 'react-router';
import {
  AutoNavigate,
  CheckBox,
  Button,
  NavContainer,
  Card,
  Form,
  FormLabel,
  TextInput,
  TextArea,
  FormControlGroup,
  UserAutocomplete,
  ActionLink,
} from '../controls';
import {
  TypeSelector,
  CommentEdit,
  LabelSelector,
  CustomSuggestField,
  CustomEnumField,
} from './input';
import { Role, Workflow, IssueType, DataType } from '../../../common/types/json';
import { session, ViewContext } from '../models';
import { StateSelector } from './input/StateSelector';
import { action, computed, IObservableArray, observable, toJS, ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import { idToIndex } from '../lib/idToIndex';
import { IssueLinks } from './input/IssueLinks';
import { IssueLinkEdit } from './input/IssueLinkEdit';
import styled from 'styled-components';
import ArrowUpIcon from '../svg-compiled/icons/IcArrowUpward';
import { Spacer } from '../layout';
import { MilestoneSelector } from './input/MilestoneSelector';

const IssueComposeLayout = styled(Card)`
  flex: 1;
  > header {
    padding-left: 6px;

    > button {
      margin-right: .5rem;
    }
  }
`;

const IssueComposeFooter = styled.footer`
  && { justify-content: flex-end; }
  > * {
    margin-left: 0.3rem;
  }
`;

const IssueComposeBody = styled(Form)`
  flex: 1 0 0;
  align-items: flex-start;
  overflow: hidden;
`;

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
  padding: 0 0.5rem 1rem 0;
  overflow-y: scroll;

  > .fill {
    justify-self: stretch;
  }
`;

const RightPanel = styled.div`
  align-self: stretch;
  border: 1px solid ${props => props.theme.cardHeaderDividerColor};
  display: flex;
  flex-direction: column;
  margin: 1rem 1rem 1rem 0.5rem;
  padding: .6rem;
  width: 16em;
`;

const SummaryEdit = styled(TextInput)`
  justify-self: stretch;
`;

const DescriptionEdit = styled(TextArea)`
  height: 8em;
`;

const ReporterName = styled.div`
  margin-top: 6px;
`;

const OwnerEditGroup = styled.span`
  align-items: center;
  display: flex;
  flex-direction: row;
  grid-column: controls;

  > .assignee {
    width: 20rem;
    margin-right: .5rem;
  }
`;

const CcEditGroup = styled.span`
  grid-column: controls;

  > .assignee {
    width: 20rem;
  }
`;

const LabelEditGroup = styled.span`
  grid-column: controls;

  > .label-selector {
    width: 30rem;
  }
`;

const IssueLinkGroup = styled.div`
  grid-column: controls;
  justify-self: stretch;
  min-width: 0;
`;

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
  issue?: Issue;
  onSave: (input: IssueInput) => Promise<any>;
}

@observer
export class IssueCompose extends React.Component<Props> {
  @observable private type: string = '';
  @observable private issueState: string = '';
  @observable private summary: string = '';
  @observable private description: string = '';
  @observable private public: boolean = false;
  @observable private another: boolean = false;
  @observable private owner: PublicAccount = null;
  @observable.shallow private cc = [] as IObservableArray<PublicAccount>;
  @observable.shallow private labels = [] as IObservableArray<string>;
  @observable private milestone: string = '';
  @observable private issueLinkMap = new ObservableMap<string, Relation>();
  @observable private custom = new Map<string, string | number | boolean>();
  @observable private comments = [] as IObservableArray<string>;
  @observable private busy = false;
  @observable private attachments = [] as IObservableArray<Attachment>;
  private prevState: string = '';

  public componentWillMount() {
    if (this.props.issue) {
      this.reset();
    } else {
      this.resetType();
    }
    this.applyParams();
  }

  public componentWillUpdate() {
    this.resetType();
  }

  public render() {
    const { location, issue } = this.props;
    const { account, project, template, milestones } = this.props.env;
    if (!template) {
      return null;
    }
    const canSave = !this.busy && this.type && this.issueState && this.summary;
    const backLink = (location.state && location.state.back) || { pathname: './issues' };
    return (
      <IssueComposeLayout>
        <header>
          <NavContainer to={backLink} exact={true}>
            <Button title="Back to issue list" className="issue-up">
              <ArrowUpIcon />
            </Button>
          </NavContainer>
          {issue
            ? <span>Edit Issue #{idToIndex(issue.id)}</span>
            : <span>New Issue: {account.accountName}/{project.name}</span>}
          <Spacer />
        </header>
        <IssueComposeBody
            name="lastpass-disable-search"
            layout="row"
            onSubmit={this.onSubmit}
        >
          <AutoNavigate />
          <LeftPanel className="layout-ledger">
            <FormLabel>Issue Type:</FormLabel>
            <TypeSelector
                value={this.type}
                template={template}
                onChange={this.onChangeType}
            />

            <FormLabel>Summary:</FormLabel>
            <SummaryEdit
                containerClassName="fill"
                value={this.summary}
                placeholder="one-line summary of this issue"
                onChange={this.onChangeSummary}
            />

            <FormLabel>Description:</FormLabel>
            <DescriptionEdit
                containerClassName="fill"
                value={this.description}
                placeholder="description of this issue (markdown format supported)"
                onChange={this.onChangeDescription}
            />

            <FormLabel>Reporter:</FormLabel>
            <FormControlGroup>
              <ReporterName>{session.account && session.account.accountName}</ReporterName>
            </FormControlGroup>

            <FormLabel>Owner:</FormLabel>
            <OwnerEditGroup>
              <UserAutocomplete
                  className="assignee"
                  placeholder="(unassigned)"
                  selection={this.owner}
                  onSelectionChange={this.onChangeOwner}
              />
              <ActionLink onClick={this.onAssignToMe}>
                Assign to me
              </ActionLink>
            </OwnerEditGroup>

            <FormLabel>CC:</FormLabel>
            <CcEditGroup>
              <UserAutocomplete
                  className="assignee"
                  multiple={true}
                  selection={this.cc.slice()}
                  onSelectionChange={this.onChangeCC}
              />
            </CcEditGroup>

            <FormLabel>Labels:</FormLabel>
            <LabelEditGroup>
              <LabelSelector
                  className="labels"
                  project={project}
                  selection={this.labels.slice()}
                  onSelectionChange={this.onChangeLabels}
              />
            </LabelEditGroup>

            {milestones.length > 0 && (
              <React.Fragment>
                <FormLabel>Milestone:</FormLabel>
                <MilestoneSelector
                    env={this.props.env}
                    selection={this.milestone}
                    onSelectionChange={this.onChangeMilestone}
                />
              </React.Fragment>
            )}

            {this.renderTemplateFields()}

            <FormLabel>Linked Issues:</FormLabel>
            <IssueLinkGroup>
              <IssueLinks links={this.issueLinkMap} onRemoveLink={this.onRemoveIssueLink}/>
              <IssueLinkEdit
                  issue={issue}
                  exclude={this.excludeLinks}
                  onLink={this.onAddIssueLink}
              />
            </IssueLinkGroup>

            <FormLabel>Attach Files:</FormLabel>
            {/*
                <UploadAttachments
                  attachments={this.attachments}
                  project={project}
                />
                /> */}

            <FormLabel>Comments:</FormLabel>
            <CommentEdit
                disabled={project.role < Role.REPORTER}
                onAddComment={this.onAddComment}
            />
          </LeftPanel>
          <RightPanel>
            <StateSelector
                workflow={this.workflow}
                state={this.issueState}
                prevState={this.prevState}
                onStateChanged={this.onChangeState}
            />
            {project.isPublic && <FormLabel>Visbility</FormLabel>}
            {project.isPublic &&
              (<CheckBox checked={this.public} onChange={this.onChangePublic}>
                Public
              </CheckBox>)}
          </RightPanel>
        </IssueComposeBody>
        <IssueComposeFooter>
          {!issue && (
            <CheckBox checked={this.another} onChange={this.onChangeAnother}>
              Create another
            </CheckBox>)}
          <NavContainer to={this.backLink}>
            <Button>Cancel</Button>
          </NavContainer>
          {issue ? (
            <Button kind="primary" disabled={!canSave} onClick={this.onSubmit}>
              Save
            </Button>
          ) : (
            <Button kind="primary" disabled={!canSave} onClick={this.onSubmit}>
              Create
            </Button>
          )}
        </IssueComposeFooter>
      </IssueComposeLayout>
    );
  }

  private renderTemplateFields(): JSX.Element[] {
    if (this.issueType) {
      return this.renderCustomFields(this.issueType);
    }
    return [];
  }

  private renderCustomFields(issueType: IssueType) {
    const result: JSX.Element[] = [];
    const { project } = this.props.env;
    for (const field of this.issueType.fields) {
      let component = null;
      const value = this.custom.get(field.id) || field.default || '';
      switch (field.type) {
        case DataType.TEXT:
          component = (
            <CustomSuggestField
                key={field.id}
                value={String(value)}
                field={field}
                project={project}
                onChange={this.onChangeCustomField}
            />
          );
          break;
        case DataType.ENUM:
          component = (
            <CustomEnumField
                key={field.id}
                value={String(value)}
                field={field}
                onChange={this.onChangeCustomField}
            />
          );
          break;
        default:
          console.error('invalid field type:', field.type);
          break;
      }
      if (component) {
        result.push(<FormLabel key={`label-${field.id}`}>{field.caption}:</FormLabel>);
        result.push(component);
      }
    }
    return result;
  }

  @action.bound
  private onChangeType(type: string) {
    this.type = type;
  }

  @action.bound
  private onChangeState(state: string) {
    this.issueState = state;
  }

  @action.bound
  private onChangeSummary(e: any) {
    this.summary = e.target.value;
  }

  @action.bound
  private onChangeDescription(e: any) {
    this.description = e.target.value;
  }

  @action.bound
  private onChangeOwner(owner: PublicAccount) {
    this.owner = owner;
  }

  @action.bound
  private onAssignToMe(e: any) {
    this.owner = session.account;
  }

  @action.bound
  private onChangeCC(cc: PublicAccount[]) {
    this.cc.replace(cc);
  }

  @action.bound
  private onChangeLabels(labels: string[]) {
    this.labels.replace(labels);
  }

  @action.bound
  private onChangeMilestone(milestone: Milestone) {
    this.milestone = milestone ? milestone.id : null;
  }

  @action.bound
  private onChangeCustomField(id: string, value: any) {
    this.custom.set(id, value);
  }

  @action.bound
  private onChangePublic(e: any) {
    this.public = e.target.checked;
  }

  @action.bound
  private onChangeAnother(e: any) {
    this.another = e.target.checked;
  }

  @action.bound
  private onAddIssueLink(relation: Relation, target: Issue) {
    if (relation && target) {
      // Can't link an issue to itself.
      if (this.props.issue && target.id === this.props.issue.id) {
        return;
      }
      this.issueLinkMap.set(target.id, relation);
    }
  }

  @action.bound
  private onRemoveIssueLink(id: string) {
    this.issueLinkMap.delete(id);
  }

  @action.bound
  private onAddComment(commentText: string) {
    this.comments.push(commentText);
  }

  @action.bound
  private onSubmit(e: any) {
    e.preventDefault();
    this.busy = true;
    // Note that this preserves custom fields that are not in the current issue template.
    // I believe this is the preferred behavior so that you don't lose anything if you switch
    // the issue type back.
    const custom: CustomFieldInput[] = Array.from(this.custom, ([key, value]) => ({ key, value }));
    const linked: IssueLink[] = [];
    this.issueLinkMap.forEach((value, key) => {
      linked.push({ to: key, relation: value });
    });
    const input: IssueInput = {
      type: this.type,
      state: this.issueState,
      summary: this.summary,
      description: this.description,
      owner: this.owner ? this.owner.id : undefined,
      cc: this.cc.map(cc => cc.id),
      labels: this.labels,
      milestone: this.milestone,
      linked,
      custom,
      comments: toJS(this.comments),
      attachments: this.attachments.slice(),
    };
    this.props.onSave(input).then(issue => {
      const { history } = this.props;
      this.busy = false;
      this.reset();
      if (!this.another) {
        history.push(this.backLink);
      }
    }, error => {
      // TODO: Do a better job
      this.props.env.mutationError = error;
      console.error('save returned error');
      console.error(JSON.stringify(error, null, 2));
    //   switch (error.code) {
    //     case Errors.SCHEMA:
    //       toast.error('Schema validation failure');
    //       break;
    //     default:
    //       displayErrorToast(error);
    //       break;
    //   }
      this.busy = false;
    });
  }

  @action.bound
  private reset() {
    const { issue } = this.props;
    if (issue) {
      this.type = issue.type;
      this.prevState = this.issueState = issue.state;
      this.summary = issue.summary;
      this.description = issue.description;
      this.owner = issue.ownerAccount;
      this.cc.replace(issue.ccAccounts);
      this.labels.replace(issue.labels);
      this.milestone = issue.milestone;
      this.custom.clear();
      for (const { key, value } of issue.custom) {
        this.custom.set(key, value);
      }
      this.attachments.replace(issue.attachments || []);
      // if (issue.attachments) {
      //   getFileInfoList(issue.attachments.slice(), files => {
      //     this.attachments.replace(files);
      //   });
      // }
      this.issueLinkMap.clear();
      for (const link of issue.links) {
        this.issueLinkMap.set(link.to, link.relation);
      }
    } else {
      this.resetType();
      this.prevState = this.issueState;
      this.summary = '';
      this.description = '';
      this.owner = null;
      this.cc.replace([]);
      this.labels.replace([]);
      this.milestone = '';
      this.custom.clear();
      this.issueLinkMap.clear();
      this.comments.clear();
      this.attachments.clear();
      this.public = false;
    }
  }

  @action.bound
  private resetType() {
    // If no type selected, choose the first available.
    const { template } = this.props.env;
    if (template && !this.type) {
      const defaultType = (template.types || []).find(t => !t.abstract);
      if (defaultType) {
        this.type = defaultType.id;
      } else {
        this.type = '';
        this.issueState = '';
      }
    }
    if (this.type && !this.issueState) {
      const workflow = this.workflow;
      if (workflow) {
        this.issueState =
          (workflow.start && workflow.start[0]) ||
          (workflow.states && workflow.states[0]) || '';
      } else {
        this.issueState = '';
      }
    }
  }

  /** Add in the effects of query params (redirect from workflow UI) */
  private applyParams() {
    const params = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
    if (params.state) {
      this.prevState = this.issueState = params.state;
    }
    if (params.type) {
      this.type = params.type;
    }
    if (params.summary) {
      this.summary = params.summary;
    }
    if (params.description) {
      this.description = params.description;
    }
    if (params.owner) {
      this.owner = params.owner;
    }
    // TODO: Apply other issue attributes: cc, custom, attachments, milestone
    for (const key of Object.getOwnPropertyNames(params)) {
      const value = params[key];
      if (key.startsWith('addLinks_')) {
        const [, id] = key.split(/_/);
        this.issueLinkMap.set(id, value as Relation);
      }
    }
  }

  @computed
  get issueType(): IssueType {
    const { env: context } = this.props;
    return context.getInheritedIssueType(this.type);
  }

  @computed
  get workflow(): Workflow {
    const { template } = this.props.env;
    const issueType = this.issueType;
    if (template && issueType && issueType.workflow) {
      return this.props.env.getWorkflow(issueType.workflow);
    }
    return null;
  }

  private get backLink(): string {
    const { account, project } = this.props.env;
    const { location, issue } = this.props;
    return (location.state && location.state.back)
        || (issue && `/${account.accountName}/${project.name}/${idToIndex(issue.id)}`)
        || `/${account.accountName}/${project.name}/issues`;
  }

  @computed
  private get excludeLinks(): Set<string> {
    const result = new Set<string>(this.issueLinkMap.keys());
    if (this.props.issue) {
      result.add(this.props.issue.id);
    }
    return result;
  }
}
