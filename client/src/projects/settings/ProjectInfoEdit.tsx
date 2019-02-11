import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { PublicAccount, Project, ProjectInput } from '../../../../common/types/graphql';
import {
  Button,
  FormLabel,
  TextInput,
  TextArea,
  CheckBox,
  Form,
  FormControlGroup,
  Dialog,
} from '../../controls';
import { Role, Errors } from '../../../../common/types/json';
import { SettingsPane, SettingsPaneContent } from '../../layout/SettingsPane';
import gql from 'graphql-tag';
import { client, decodeError } from '../../graphql/client';
import { toast } from 'react-toastify';
import { RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { Spacer } from '../../layout';

const updateProjectMutation = gql`
  mutation UpdateProjectMutation($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      id, owner, name, title, description, template, createdAt, updatedAt
    }
  }
`;

const removeProjectMutation = gql`
  mutation RemoveProjectMutation($id: ID!) {
    removeProject(id: $id) { id }
  }
`;

const ProjectLabel = styled.span`
  margin-right: .5rem;
`;

const ProjectTitle = styled.span`
  font-weight: bold;
`;

interface Props extends RouteComponentProps<{}> {
  account: PublicAccount;
  project: Project;
}

@observer
export class ProjectInfoEdit extends React.Component<Props> {
  @observable private description: string;
  @observable private title: string;
  @observable private isPublic = false;
  @observable private openDelete = false;
  @observable private confirmName: string;

  public componentWillMount() {
    this.reset(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.project !== this.props.project) {
      this.reset(nextProps);
    }
  }

  public render() {
    const { project } = this.props;
    const modified =
        project.title !== this.title ||
        project.description !== this.description ||
        project.isPublic !== this.isPublic;
    return (
      <SettingsPane>
        <header>
          <ProjectLabel>Project:</ProjectLabel>
          <ProjectTitle>{project.title} [{project.ownerName}/{project.name}]</ProjectTitle>
          <Spacer />
          <Button
              kind="action"
              onClick={this.onShowDelete}
          >
            Delete Project
          </Button>
        </header>
        <SettingsPaneContent>
          <Form onSubmit={this.onSave}>
            <FormLabel>Title:</FormLabel>
            <TextInput
                style={{ width: '24rem' }}
                placeholder="title of the project"
                disabled={project.role < Role.MANAGER}
                value={this.title}
                onChange={this.onChangeTitle}
            />
            <FormLabel>Description:</FormLabel>
            <TextArea
                style={{ width: '24rem', height: '4rem' }}
                placeholder="description of the project"
                disabled={project.role < Role.MANAGER}
                value={this.description}
                onChange={this.onChangeDescription}
            />
            <FormControlGroup>
              <CheckBox
                  checked={this.isPublic}
                  onChange={this.onChangePublic}
                  disabled={project.role < Role.MANAGER}
              >
                Public
              </CheckBox>
            </FormControlGroup>
              {/*<tr>
                <th className="header"><FormLabel>Owner:</FormLabel></th>
                <td className="owner single-static">
                  {project.owningUser}
                </td>
              </tr>*/}
            <FormControlGroup>
              <Button
                  kind="primary"
                  type="submit"
                  disabled={!modified || project.role < Role.MANAGER}
              >
                Save
              </Button>
            </FormControlGroup>
          </Form>
        </SettingsPaneContent>
        <Dialog open={this.openDelete} onClose={this.onHideDelete} style={{ width: '25rem' }}>
          <Dialog.Header>Delete Project</Dialog.Header>
          <Dialog.Body style={{ textAlign: 'center' }}>
            <p>Are you absolutely sure you want to delete
            project &quot;{project.ownerName}/{project.name}&quot;? <b>This change
            cannot be undone.</b></p>
            <p>Type the name of the project to confirm:</p>
            <TextInput
                value={this.confirmName}
                onChange={this.onChangeConfirmName}
            />
          </Dialog.Body>
          <Dialog.Footer>
            <Button kind="secondary" onClick={this.onHideDelete}>Cancel</Button>
            <Button
                kind="action"
                onClick={this.onConfirmDelete}
                disabled={this.confirmName !== `${project.ownerName}/${project.name}`}
            >
              Delete
            </Button>
          </Dialog.Footer>

        </Dialog>

      </SettingsPane>
    );
  }

  @action.bound
  private onChangeTitle(e: any) {
    this.title = e.target.value;
  }

  @action.bound
  private onChangeDescription(e: any) {
    this.description = e.target.value;
  }

  @action.bound
  private onChangePublic(e: any) {
    this.isPublic = e.target.checked;
  }

  @action.bound
  private onChangeConfirmName(e: any) {
    this.confirmName = e.target.value;
  }

  @action.bound
  private onSave(e: any) {
    const { project } = this.props;
    e.preventDefault();
    e.stopPropagation();

    const input: ProjectInput = {
      title: this.title,
      description: this.description,
      isPublic: this.isPublic,
    };

    client.mutate({
      mutation: updateProjectMutation,
      variables: {
        id: project.id,
        input,
      },
    }).then(result => {
      toast.success(`Project ${project.ownerName}/${project.name} updated successfully.`);
    }, error => {
      const [code] = decodeError(error);
      switch (code) {
        case Errors.FORBIDDEN:
          toast.error('You do not have permission to edit the info for this project.');
          break;
        case Errors.NOT_FOUND:
          toast.error('Could not access the record for this project.');
          break;
        default:
          toast.error(`Unknown error: ${code}.`);
          console.error(error);
          break;
      }
    });
  }

  @action.bound
  private onShowDelete(e: any) {
    this.openDelete = true;
    this.confirmName = '';
  }

  @action.bound
  private onHideDelete() {
    this.openDelete = false;
  }

  @action.bound
  private onConfirmDelete(e: any) {
    const { project, history } = this.props;
    e.preventDefault();
    e.stopPropagation();

    this.openDelete = false;
    client.mutate({
      mutation: removeProjectMutation,
      variables: {
        id: this.props.project.id,
      },
    }).then(result => {
      toast.success(`Project ${project.ownerName}/${project.name} deleted.`);
      history.push('/');
    }, error => {
      const [code] = decodeError(error);
      switch (code) {
        case Errors.FORBIDDEN:
          toast.error('You do not have permission to edit the info for this project.');
          break;
        case Errors.NOT_FOUND:
          toast.error('Could not access the record for this project.');
          break;
        default:
          toast.error(`Unknown error: ${code}.`);
          console.error(error);
          break;
      }
    });
  }

  private reset(props: Props) {
    const { project } = props;
    this.title = project.title;
    this.description = project.description;
    this.isPublic = project.isPublic;
  }
}
