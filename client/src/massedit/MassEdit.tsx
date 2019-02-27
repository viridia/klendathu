import * as React from 'react';
import { EditAction, MassAction } from './MassAction';
import { IObservableArray, observable } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';
import { Collapse } from '../controls/Collapse';
import { Button, Card } from '../controls';
import { ViewContext } from '../models';
import { UpdateIssueInput, Mutation } from '../../../common/types/graphql';
import bind from 'bind-decorator';
import { styled } from '../style';
import gql from 'graphql-tag';
import { fragments } from '../graphql';
import { client } from '../graphql/client';

const UpdateIssueMutation = gql`
  mutation UpdateIssueMutation($id: ID!, $input: UpdateIssueInput!) {
    updateIssue(id: $id, input: $input) {
      ...IssueFields
    }
  }
  ${fragments.issue}
`;

type UpdateIssueMutationResult = Pick<Mutation, 'updateIssue'>;

const DeleteIssueMutation = gql`
  mutation DeleteIssueMutation($id: ID!) {
    deleteIssue(id: $id) {
      ...IssueFields
    }
  }
  ${fragments.issue}
`;

type DeleteIssueMutationResult = Pick<Mutation, 'deleteIssue'>;

const MassEditCard = styled(Card)`
  background-color: ${props => props.theme.massEditBgColor};
  flex-shrink: 0;
  && {
    margin-bottom: 12px;
    border-color: ${props => props.theme.massEditBorderColor};
  }
  .expand-exit-done & {
    box-shadow: none;
  }
`;

const MassEditHeader = styled.header`
  && { background-color: ${props => props.theme.massEditHeaderBgColor}; }
`;

const MassEditActionList = styled.section`
  padding-top: 3px;
`;

interface Props {
  env: ViewContext;
}

@observer
export class MassEdit extends React.Component<Props> {
  @observable private actions = [] as IObservableArray<EditAction>;

  public render() {
    const { env } = this.props;
    return (
      <Collapse expanded={env.selection.size > 0}>
        <MassEditCard>
          <MassEditHeader>
            <div className="title">
              Mass Edit ({env.selection.size} issues selected)
            </div>
            <Button
                kind="alternate"
                size="small"
                disabled={this.actions.length === 0}
                onClick={this.onSave}
            >
              Apply Changes
            </Button>
          </MassEditHeader>
          <MassEditActionList>
            {this.actions.map((action, index) => (
              <MassAction
                  index={index}
                  key={index}
                  action={action}
                  env={env}
                  onRemove={this.onRemoveAction}
                  onChange={this.onChangeAction}
              />))}
            <MassAction
                env={env}
                onRemove={this.onRemoveAction}
                onChange={this.onChangeAction}
            />
          </MassEditActionList>
        </MassEditCard>
      </Collapse>);
  }

  @bind
  private onChangeAction(index: number, action: any) {
    if (index !== undefined) {
      this.actions[index] = action;
    } else {
      this.actions.push(action);
    }
  }

  @bind
  private onRemoveAction(index: number) {
    this.actions.splice(index, 1);
  }

  @bind
  private onSave(e: any) {
    e.preventDefault();
    const { env } = this.props;
    const promises: Array<Promise<any>> = [];
    let deleted = false;
    env.selection.forEach(issueId => {
      const updates: UpdateIssueInput = {};
      this.actions.forEach(action => {
        if (action.id === 'delete') {
          deleted = true;
        } else {
          action.apply(updates, action.value);
        }
      });
      if (deleted) {
        promises.push(client.mutate<DeleteIssueMutationResult>({
          mutation: DeleteIssueMutation,
          variables: {
            id: issueId,
          }
        }));
      } else {
        promises.push(client.mutate<UpdateIssueMutationResult>({
          mutation: UpdateIssueMutation,
          variables: {
            id: issueId,
            input: updates,
          }
        }));
      }
    });

    Promise.all(promises).then(() => {
      if (deleted) {
        toast.success(`${env.selection.size} issues deleted.`);
        env.selection.clear();
      } else {
        toast.success(`${env.selection.size} issues updated.`);
      }
    }, error => {
      env.mutationError = error;
    });
  }
}
