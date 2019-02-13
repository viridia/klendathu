import * as React from 'react';
import { LabelDialog } from './LabelDialog';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Label } from '../../../common/types/graphql';
import { Dialog, Button, CheckBox, RelativeDate, AccountName, Card, Chip } from '../controls';
import { Role } from '../../../common/types/json';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { ErrorDisplay } from '../graphql/ErrorDisplay';
import {
  ModeContent,
  ModeContentHeader,
  ModeContentTitle,
  Spacer,
  Table,
  TableHead,
  TableBody,
  ActionButtonCell,
} from '../layout';
import { styled } from '../style';
import { ViewContext } from '../graphql/ProjectContextProvider';
import { client } from '../graphql/client';
import { fragments } from '../graphql';

const LabelListQuery = gql`
  query LabelListQuery($project: ID!) {
    labels(project: $project) { ...LabelFields }
  }
  ${fragments.label}
`;

const AddPrefsLabelMutation = gql`
  mutation AddPrefsLabelMutation($project: ID!, $label: ID!) {
    addPrefsLabel(project: $project, label: $label) { labels }
  }
`;

const RemovePrefsLabelMutation = gql`
  mutation RemovePrefsLabelMutation($project: ID!, $label: ID!) {
    removePrefsLabel(project: $project, label: $label) { labels }
  }
`;

const LabelChangeSubscription = gql`
  subscription LabelChangeSubscription($project: ID!) {
    labelChanged(project: $project) {
      action
      label { ...LabelFields }
    }
  }
  ${fragments.label}
`;

const EmptyList = styled.section`
  margin: 1rem;
  font-style: italic;
`;

interface Props {
  context: ViewContext;
}

@observer
export class LabelListView extends React.Component<Props> {
  @observable private showCreate = false;
  @observable private showDelete = false;
  @observable private labelToDelete?: Label = null;
  @observable private labelToUpdate: Label = null;
  @observable private busy = false;

  public render() {
    const { project, visibleLabels } = this.props.context;
    return (
      <ModeContent>
        <LabelDialog
            open={this.showCreate}
            project={project}
            label={this.labelToUpdate}
            visible={this.labelToUpdate && visibleLabels.has(this.labelToUpdate.id)}
            onClose={this.onHideCreate}
            onInsertLabel={this.onCreateLabel}
        />
        {this.showDelete && (
          <Dialog open={true} onClose={this.onHideDelete}>
            <Dialog.Header hasClose={true}>Delete Label</Dialog.Header>
            <Dialog.Body>
              Are you absolutely sure you want to label &apos;{this.labelToDelete.name}&apos;?
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button kind="primary" onClick={this.onDeleteLabel} disabled={this.busy}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog>
        )}
        <ModeContentHeader>
          <ModeContentTitle>Labels</ModeContentTitle>
          <Spacer />
          {project.role >= Role.DEVELOPER &&
              <Button kind="primary" onClick={this.onShowCreate}>New Label</Button>}
        </ModeContentHeader>
        {this.renderLabels()}
      </ModeContent>
    );
  }

  private renderLabels() {
    const { project } = this.props.context;
    return (
      <Query
          query={LabelListQuery}
          variables={{
            project: project.id,
          }}
          fetchPolicy="cache-and-network"
      >
        {({ loading, error, data, refetch, subscribeToMore }) => {
          if (loading && !(data && data.labels)) {
            // Only display loading indicator if nothing in cache.
            return <div>loading&hellip;</div>;
          } else if (error) {
            return <ErrorDisplay error={error} />;
          } else {
            subscribeToMore({
              document: LabelChangeSubscription,
              variables: {
                project: project.id,
              },
              updateQuery: (prev, { subscriptionData }) => {
                // For the moment we're just going to refresh.
                // console.log('subscriptionData', subscriptionData);
                refetch();
              },
            });
            const labels: Label[] = data.labels;
            if (labels.length === 0) {
              return (
                <Card>
                  <EmptyList>No labels defined</EmptyList>
                </Card>
              );
            }
            return (
              <Card>
                <Table>
                  <TableHead>
                    <tr>
                      <th className="label-id center">#</th>
                      <th className="visible center">Hotlist</th>
                      <th className="name center">Label</th>
                      <th className="owner center">Creator</th>
                      <th className="created center">Created</th>
                      {project.role >= Role.DEVELOPER && <th className="actions">Actions</th>}
                    </tr>
                  </TableHead>
                  <TableBody>
                    {labels.map(i => this.renderLabel(i))}
                  </TableBody>
                </Table>
              </Card>
            );
          }
        }}
      </Query>
    );
  }

  private renderLabel(label: Label) {
    const { project, visibleLabels } = this.props.context;
    const id = label.id.split('.', 2)[1];
    return (
      <tr key={label.id}>
        <td className="label-id center">{id}</td>
        <td className="visible center">
          <CheckBox
              data-id={label.id}
              checked={visibleLabels.has(label.id)}
              onChange={this.onChangeVisible}
          />
        </td>
        <td className="name center">
          <Chip color={label.color}>{label.name}</Chip>
        </td>
        <td className="creator center"><AccountName id={label.creator} /></td>
        <td className="created center"><RelativeDate date={label.created} /></td>
        {project.role >= Role.DEVELOPER && (<ActionButtonCell className="right">
          <Button
              kind="secondary"
              className="small"
              data-label={label.id}
              onClick={e => this.onShowUpdate(label)}
          >
            Edit
          </Button>
          <Button
              kind="action"
              className="small"
              data-label={label.id}
              onClick={e => this.onShowDelete(label)}
          >
            Delete
          </Button>
        </ActionButtonCell>)}
      </tr>);
  }

  @action.bound
  private onShowCreate() {
    this.showCreate = true;
    this.labelToUpdate = null;
  }

  @action.bound
  private onHideCreate() {
    this.showCreate = false;
  }

  @action.bound
  private onCreateLabel() {
    this.showCreate = false;
  }

  @action.bound
  private onShowDelete(label: Label) {
    this.showDelete = true;
    this.labelToDelete = label;
  }

  @action.bound
  private onHideDelete() {
    this.showDelete = false;
  }

  @action.bound
  private onDeleteLabel() {
    this.busy = true;
    // deleteLabel(this.labelToDelete.id).then(() => {
    //   this.showDelete = false;
    //   this.busy = false;
    // }, (error: any) => {
    //   displayErrorToast(error);
    //   this.showDelete = false;
    //   this.busy = false;
    // });
  }

  @action.bound
  private onShowUpdate(label: Label) {
    this.showCreate = true;
    this.labelToUpdate = label;
  }

  @action.bound
  private onChangeVisible(e: any) {
    const { project } = this.props.context;
    const id = e.target.dataset.id;
    if (e.target.checked) {
      client.mutate({
        mutation: AddPrefsLabelMutation,
        variables: { project: project.id, label: id }
      });
    } else {
      client.mutate({
        mutation: RemovePrefsLabelMutation,
        variables: { project: project.id, label: id }
      });
    }
  }
}
