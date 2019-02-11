import * as React from 'react';
// import {
//   Account,
//   Attachment,
//   CustomValues,
//   DataType,
//   Errors,
//   Issue,
//   IssueInput,
//   IssueLink,
//   IssueType,
//   Relation,
//   Role,
//   Workflow,
//   Milestone,
// } from 'klendathu-json-types';
// import {
//   accounts,
//   IssueListQuery,
//   ObservableIssue,
//   ObservableIssueLinks,
//   Project,
//   session,
//   Template,
//   MilestoneListQuery,
// } from '../../models';
// import {
//   CommentEdit,
//   CustomEnumField,
//   CustomSuggestField,
//   IssueSelector,
//   LabelSelector,
//   MilestoneSelector,
//   TypeSelector,
//   StateSelector,
// } from './input';
// import { UserAutocomplete } from '../common/UserAutocomplete';
// import { IssueLinks } from './IssueLinks';
// import { relationNames } from '../common/relationNames';
// import { displayErrorToast } from '../common/displayErrorToast';
// import { RequestError } from '../../network';
// import { getFileInfoList } from '../../network/requests';
// import { RouteComponentProps } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
// import { UploadAttachments } from '../files/UploadAttachments';
import { action, computed, IObservableArray, observable, toJS, when } from 'mobx';
import { observer } from 'mobx-react';
// import { toast } from 'react-toastify';

// import './IssueCompose.scss';
import {
  Relation,
  IssueInput,
  Issue,
  Attachment,
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
} from '../controls';
import { ViewContext } from '../graphql/ProjectContextProvider';
import styled from 'styled-components';
import { TypeSelector, CommentEdit } from './input';
import { Role } from '../../../common/types/json';
import { session } from '../models';

const IssueComposeLayout = styled(Card)`
  flex: 1;
`;

const IssueComposeFooter = styled.footer`
  && { justify-content: flex-end; }
  > * {
    margin-left: 0.3rem;
  }
`;

const IssueComposeBody = styled(Form)`
  flex: 1;
`;

const LeftPanel = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: [labels] auto [controls] 1fr;
  margin: .5rem 0 1em 1em;
  justify-items: flex-start;

  > .fill {
    justify-self: stretch;
  }
`;

const RightPanel = styled.div`
  align-self: stretch;
  border: 1px solid ${props => props.theme.cardHeaderDividerColor};
  display: flex;
  flex-direction: column;
  margin: 1em;
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

// const RELATIONS: Relation[] = [
//   Relation.Blocks,
//   Relation.BlockedBy,
//   Relation.Duplicate,
//   Relation.HasPart,
//   Relation.PartOf,
//   Relation.Related,
// ];

interface Props extends RouteComponentProps<{}> {
  context: ViewContext;
  // issues: IssueListQuery;
  // milestones: MilestoneListQuery;
  // milestones?: any;
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
  // @observable private owner: Account = null;
  // @observable.shallow private cc = [] as IObservableArray<Account>;
  // @observable.shallow private labels = [] as IObservableArray<string>;
  // @observable private milestone: string = '';
  // @observable private relation: Relation = Relation.BlockedBy;
  // @observable private issueToLink: Issue = null;
  // @observable.shallow private issueLinkMap = new Map<string, Relation>();
  // @observable private custom = new Map<string, string | number | boolean>();
  @observable private comments = [] as IObservableArray<string>;
  @observable private busy = false;
  // @observable private attachments = [] as IObservableArray<Attachment>;
  // private prevState: string = '';

  public componentWillMount() {
    if (this.props.issue) {
      this.reset();
    } else {
      this.resetType();
    }
  }

  public componentWillUpdate() {
    this.resetType();
  }

  public render() {
    const { issue } = this.props;
    const { account, project, template } = this.props.context;
    if (!template) {
      return null;
    }
    const canSave = !this.busy && this.type && this.issueState && this.summary;
    return (
      <IssueComposeLayout>
        <header>
          {issue
            ? <span>Edit Issue #{issue.id}</span>
            : <span>New Issue: {account.accountName}/{project.name}</span>}
        </header>
        <IssueComposeBody
            name="lastpass-disable-search"
            layout="row"
            onSubmit={this.onSubmit}
        >
          <AutoNavigate />
          <LeftPanel className="ledger">
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
            <FormLabel>CC:</FormLabel>
            <FormLabel>Labels:</FormLabel>
                  {/* </td>
                <tr>
                  <th className="header"><ControlLabel>Owner:</ControlLabel></th>
                  <td className="owner">
                    <UserAutocomplete
                        className="assignee ac-single"
                        placeholder="(unassigned)"
                        selection={this.owner}
                        onSelectionChange={this.onChangeOwner}
                    />
                    <a className="assign-to-me action-link" onClick={this.onAssignToMe}>
                      Assign to me
                    </a>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>CC:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <UserAutocomplete
                          className="assignee ac-multi"
                          multiple={true}
                          selection={this.cc.slice()}
                          onSelectionChange={this.onChangeCC}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Labels:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <LabelSelector
                          className="labels ac-multi"
                          project={this.props.project}
                          selection={this.labels.slice()}
                          onSelectionChange={this.onChangeLabels}
                      />
                    </div>
                  </td>
                </tr>
                {milestones && (<tr>
                  <th className="header"><ControlLabel>Milestone:</ControlLabel></th>
                  <td>
                    <div className="ac-multi-group">
                      <MilestoneSelector
                          className="milestones ac-multi"
                          project={this.props.project}
                          milestones={milestones}
                          selection={this.milestone}
                          onSelectionChange={this.onChangeMilestone}
                      />
                    </div>
                  </td>
                </tr>)}
                {this.renderTemplateFields()}
                <tr>
                  <th className="header"><ControlLabel>Linked Issues:</ControlLabel></th>
                  <td>
                    <IssueLinks
                        project={this.props.project}
                        issues={this.props.issues}
                        links={this.issueLinkMap}
                        onRemoveLink={this.onRemoveIssueLink}
                    />
                    <div className="linked-group">
                      <DropdownButton
                          bsSize="small"
                          title={relationNames[this.relation]}
                          id="issue-link-type"
                          onSelect={this.onChangeRelation}
                      >
                        {RELATIONS.map(r => (
                          <MenuItem
                              eventKey={r}
                              key={r}
                              active={r === this.relation}
                          >
                            {relationNames[r]}
                          </MenuItem>))}
                      </DropdownButton>
                      <div className="ac-shim">
                        <IssueSelector
                            className="ac-issue"
                            project={this.props.project}
                            issues={this.props.issues}
                            placeholder="select an issue..."
                            exclude={issue && issue.id}
                            selection={this.issueToLink}
                            onSelectionChange={this.onChangeIssueToLink}
                            // onEnter={this.onAddIssueLink}
                        />
                      </div>
                      <Button
                          bsSize="small"
                          onClick={this.onAddIssueLink}
                          disabled={!this.issueToLink}
                      >
                        Add
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Attach files:</ControlLabel></th>
                  <td>
                    <UploadAttachments
                      attachments={this.attachments}
                      project={project}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Comments:</ControlLabel></th>
                  <td>
                    /> */}
            <FormLabel>Comments:</FormLabel>
            <CommentEdit
                disabled={project.role < Role.REPORTER}
                onAddComment={this.onAddComment}
            />
          </LeftPanel>
          <RightPanel>
            {/* <StateSelector
                template={template}
                workflow={this.workflow}
                state={this.issueState}
                prevState={this.prevState}
                onStateChanged={this.onChangeState}
            />
            {this.props.project.isPublic && <ControlLabel>Visbility</ControlLabel>} */}
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

  // private renderTemplateFields(): JSX.Element[] {
  //   const result: JSX.Element[] = [];
  //   if (this.issueType) {
  //     return this.renderCustomFields(this.issueType, result);
  //   }
  //   return result;
  // }

  // private renderCustomFields(issueType: IssueType, result: JSX.Element[]) {
  //   const { project } = this.props;
  //   for (const field of this.issueType.fields) {
  //     let component = null;
  //     const value = this.custom.get(field.id) || field.default || '';
  //     switch (field.type) {
  //       case DataType.TEXT:
  //         component = (
  //           <CustomSuggestField
  //               value={String(value)}
  //               field={field}
  //               project={project}
  //               onChange={this.onChangeCustomField}
  //           />
  //         );
  //         break;
  //       case DataType.ENUM:
  //         component = (
  //           <CustomEnumField
  //               value={String(value)}
  //               field={field}
  //               onChange={this.onChangeCustomField}
  //           />
  //         );
  //         break;
  //       default:
  //         console.error('invalid field type:', field.type);
  //         break;
  //     }
  //     if (component) {
  //       result.push(
  //         <tr key={field.id}>
  //           <th>{field.caption}:</th>
  //           <td>{component}</td>
  //         </tr>);
  //     }
  //   }
  //   return result;
  // }

  @action.bound
  private onChangeType(type: string) {
    this.type = type;
  }

  // @action.bound
  // private onChangeState(state: string) {
  //   this.issueState = state;
  // }

  @action.bound
  private onChangeSummary(e: any) {
    this.summary = e.target.value;
  }

  @action.bound
  private onChangeDescription(e: any) {
    this.description = e.target.value;
  }

  // @action.bound
  // private onChangeOwner(owner: Account) {
  //   this.owner = owner;
  // }

  // @action.bound
  // private onAssignToMe(e: any) {
  //   this.owner = session.account;
  // }

  // @action.bound
  // private onChangeCC(cc: Account[]) {
  //   this.cc.replace(cc);
  // }

  // @action.bound
  // private onChangeLabels(labels: string[]) {
  //   this.labels.replace(labels);
  // }

  // @action.bound
  // private onChangeMilestone(milestone: Milestone) {
  //   this.milestone = milestone ? milestone.id : null;
  // }

  // @action.bound
  // private onChangeIssueToLink(selection: Issue) {
  //   this.issueToLink =  selection;
  // }

  // @action.bound
  // private onChangeRelation(selection: any) {
  //   this.relation = selection;
  // }

  // @action.bound
  // private onChangeCustomField(id: string, value: any) {
  //   this.custom.set(id, value);
  // }

  @action.bound
  private onChangePublic(e: any) {
    this.public = e.target.checked;
  }

  @action.bound
  private onChangeAnother(e: any) {
    this.another = e.target.checked;
  }

  // @action.bound
  // private onAddIssueLink() {
  //   if (this.relation && this.issueToLink) {
  //     // Can't link an issue to itself.
  //     if (this.props.issue && this.issueToLink.id === this.props.issue.id) {
  //       return;
  //     }
  //     this.issueLinkMap.set(this.issueToLink.id, this.relation);
  //     this.issueToLink = null;
  //   }
  // }

  // @action.bound
  // private onRemoveIssueLink(id: string) {
  //   this.issueLinkMap.delete(id);
  // }

  @action.bound
  private onAddComment(commentText: string) {
    this.comments.push(commentText);
  }

  @action.bound
  private onSubmit(e: any) {
    e.preventDefault();
    // this.busy = true;
    // const custom: CustomValues = {};
    // for (const field of this.issueType.fields) {
    //   custom[field.id] = this.custom.has(field.id) ? this.custom.get(field.id) : field.default;
    // }
    // const linked: IssueLink[] = [];
    // this.issueLinkMap.forEach((value, key) => {
    //   linked.push({ to: key, relation: value });
    // });
    // const attachments: string[] = this.attachments.map(a => a.id);
    // const input: IssueInput = {
    //   type: this.type,
    //   state: this.issueState,
    //   summary: this.summary,
    //   description: this.description,
    //   owner: this.owner ? this.owner.uid : undefined,
    //   ownerSort: this.owner ? this.owner.uname : undefined,
    //   cc: this.cc.map(cc => cc.uid),
    //   labels: this.labels,
    //   milestone: this.milestone,
    //   linked,
    //   custom,
    //   comments: toJS(this.comments),
    //   attachments,
    // };
    // this.props.onSave(input).then(() => {
    //   const { history } = this.props;
    //   this.busy = false;
    //   this.reset();
    //   if (!this.another) {
    //     history.push(this.backLink);
    //   }
    // }, (error: RequestError) => {
    //   switch (error.code) {
    //     case Errors.SCHEMA:
    //       toast.error('Schema validation failure');
    //       break;
    //     default:
    //       displayErrorToast(error);
    //       break;
    //   }
    //   this.busy = false;
    // });
  }

  @action.bound
  private reset() {
    const { issue } = this.props;
    if (issue) {
    //   when('issue loaded', () => issue.loaded, () => {
        this.type = issue.type;
    //     this.issueState = issue.state;
        this.summary = issue.summary;
        this.description = issue.description;
    //     this.owner = issue.owner ? accounts.byId(issue.owner) : null;
    //     this.cc.replace((issue.cc || []).map(cc => accounts.byId(cc)));
    //     this.labels.replace(issue.labels);
    //     this.milestone = issue.milestone;
    //     this.custom.clear();
    //     for (const key of Object.getOwnPropertyNames(issue.custom)) {
    //       this.custom.set(key, issue.custom[key]);
    //     }
    //     if (issue.attachments) {
    //       getFileInfoList(issue.attachments.slice(), files => {
    //         this.attachments.replace(files);
    //       });
    //     }
    //   });
    //   const links = new ObservableIssueLinks(issue.id);
    //   when('links loaded', () => links.loaded, () => {
    //     (this.issueLinkMap as any).replace(links.linkMap);
    //   });
    } else {
    //   this.resetType();
      this.summary = '';
    //   this.description = '';
    //   this.owner = null;
    //   this.cc.replace([]);
    //   this.labels.replace([]);
    //   this.milestone = '';
    //   this.custom.clear();
    //   this.issueLinkMap.clear();
      this.comments.clear();
    //   this.attachments.clear();
      this.public = false;
    }
  }

  @action.bound
  private resetType() {
    // // If no type selected, choose the first available.
    // when('template loaded', () => this.template && this.template.loaded, () => {
    //   if (!this.type) {
    //     const defaultType = this.template.types.find(t => !t.abstract);
    //     if (defaultType) {
    //       this.type = defaultType.id;
    //     } else {
    //       this.type = '';
    //       this.issueState = '';
    //     }
    //   }
    //   if (this.type && !this.issueState) {
    //     const workflow = this.workflow;
    //     if (workflow) {
    //       this.issueState =
    //         (workflow.start && workflow.start[0]) ||
    //         (workflow.states && workflow.states[0]) || '';
    //     } else {
    //       this.issueState = '';
    //     }
    //   }
    // });
  }

  // get template(): Template {
  //   return this.props.project.template;
  // }

  // @computed
  // get issueType(): IssueType {
  //   const { project } = this.props;
  //   return project.template && project.template.getInheritedIssueType(this.type);
  // }

  // @computed
  // get workflow(): Workflow {
  //   const { project } = this.props;
  //   const iType = this.issueType;
  //   if (project.template && iType && iType.workflow) {
  //     return project.template.getWorkflow(iType.workflow);
  //   }
  //   return null;
  // }

  private get backLink(): string {
    return '';
    // const { account, location, issue, project } = this.props;
    // return (location.state && location.state.back)
    //     || (issue && `/${account.uname}/${project.uname}/${issue.index}`)
    //     || `/${account.uname}/${project.uname}/issues`;
  }
}
