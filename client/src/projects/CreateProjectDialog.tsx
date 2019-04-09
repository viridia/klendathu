import bind from 'bind-decorator';
import * as React from 'react';
import {
  Button,
  CheckBox,
  Dialog,
  TextArea,
  FormLabel,
  Form,
  TextInput,
  FormControlGroup,
  AutoNavigate,
} from 'skyhook-ui';
import { session } from '../models';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { client, decodeError } from '../graphql/client';
import { Errors } from '../../../common/types/json';
import { ProjectInput } from '../../../common/types/graphql';
import { toast } from 'react-toastify';
import gql from 'graphql-tag';

import AddBoxIcon from '../svg-compiled/icons/IcAddBox';

const createProjectMutation = gql`
  mutation CreateProjectMutation($owner: ID!, $name: String!, $input: ProjectInput!) {
    createProject(owner: $owner, name: $name, input: $input) {
      id, owner, name, title, description, template, createdAt, updatedAt
    }
  }
`;

interface Props {
  show: boolean;
  onClose: () => void;
}

@observer
export class CreateProjectDialog extends React.Component<Props> {
  @observable private projectName: string = '';
  @observable private projectNameError: string = null;
  @observable private projectTitle: string = '';
  @observable private projectTitleError: string = null;
  @observable private projectDescription: string = '';
  @observable private public: boolean = false;
  @observable private busy: boolean = false;

  public render() {
    return (
      <Dialog
        open={this.props.show}
        onClose={this.props.onClose}
      >
        <Dialog.Header hasClose={true}>
          Create Project
        </Dialog.Header>
        <Dialog.Body>
          <Form onSubmit={this.onCreate}>
            <AutoNavigate />
            <FormLabel>Project Id</FormLabel>
            <TextInput
              autoFocus={true}
              type="text"
              placeholder="Project Name"
              value={this.projectName}
              onChange={this.onChangeProjectName}
              validationStatus={this.projectNameError ? 'error' : null}
              validationMsg={this.projectNameError}
              style={{ width: '20rem' }}
            />
            <FormLabel>Project Title</FormLabel>
            <TextInput
              type="text"
              placeholder="Project Title"
              value={this.projectTitle}
              onChange={this.onChangeProjectTitle}
              validationStatus={this.projectTitleError ? 'error' : null}
              validationMsg={this.projectTitle}
              style={{ width: '20rem' }}
            />
            <FormLabel>Project Description</FormLabel>
            <TextArea
              placeholder="Project Description"
              value={this.projectDescription}
              onChange={this.onChangeProjectDescription}
              style={{ width: '20rem', height: '5rem' }}
            />
            <FormControlGroup>
              <CheckBox checked={this.public} onChange={this.onChangePublic}>
                Public
              </CheckBox>
            </FormControlGroup>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={this.props.onClose}>Cancel</Button>
          <Button
            onClick={this.onCreate}
            disabled={this.projectName.length === 0 || this.busy}
            variant="primary"
          >
            <AddBoxIcon />
            Create Project
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @action.bound
  private onCreate(ev: any) {
    ev.preventDefault();
    this.busy = true;

    const input: ProjectInput = {
      title: this.projectTitle,
      description: this.projectDescription,
      isPublic: this.public,
    };

    client.mutate({
      mutation: createProjectMutation,
      variables: {
        owner: session.account.id,
        name: this.projectName,
        input,
      },
    }).then(() => {
      // console.log(result);
      this.busy = false;
      this.clearForm();
      this.props.onClose();
    }, error => {
      this.busy = false;
      const [code, field] = decodeError(error);
      switch (code) {
        case Errors.INVALID_ACCOUNT:
          toast.error('Invalid account name');
          break;
        case Errors.UNAUTHORIZED:
          toast.error('You can only create projects for yourself and your organization.');
          break;
        case Errors.NOT_IMPLEMENTED:
          toast.error('Function not implemented.');
          break;
        case Errors.CONFLICT:
          this.projectNameError = 'A project with that name already exists.';
          break;
        case Errors.TEXT_MISSING:
          if (field === 'name') {
            this.projectNameError = 'Project name cannot be empty.';
          }
          break;
        case Errors.TEXT_INVALID_CHARS:
          if (field === 'name') {
            this.projectNameError =
              'Project names must be lowercase letters, numbers, hypens or periods';
          }
          break;
        default:
          toast.error(`Unknown error: ${code}.`);
          console.error(error);
          // this.usernameError = code;
          break;
      }
    });
  }

  @bind
  private onChangeProjectName(e: any) {
    this.projectName = e.target.value;
  }

  @bind
  private onChangePublic(e: any) {
    this.public = e.target.checked;
  }

  @bind
  private onChangeProjectTitle(e: any) {
    this.projectTitle = e.target.value;
  }

  @bind
  private onChangeProjectDescription(e: any) {
    this.projectDescription = e.target.value;
  }

  @action.bound
  private clearForm() {
    this.busy = false;
    this.public = false;
    this.projectName = '';
    this.projectNameError = null;
    this.projectTitle = '';
    this.projectTitleError = null;
    this.projectDescription = '';
  }
}
