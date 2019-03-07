import * as React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Dialog, Button, Form, FormLabel, TextInput } from '../../../controls';
import { Mutation, WebhookInput } from '../../../../../common/types/graphql';
import { fragments } from '../../../graphql';
import gql from 'graphql-tag';
import { client } from '../../../graphql/client';
import { decodeErrorAsException } from '../../../graphql/__mocks__/client';
import { WebhookServiceSelector } from './WebhookServiceSelector';

const AddWebhookMutation = gql`
  mutation AddWebhookMutation($input: WebhookInput!) {
    addWebhook(input: $input) { ...WebhookFields }
  }
  ${fragments.webhook}
`;

type AddWebhookMutationResult = Pick<Mutation, 'addWebhook'>;

interface Props {
  env: ViewContext;
  open: boolean;
  onHide: () => void;
}

@observer
export class AddWebhookDialog extends React.Component<Props> {
  @observable private serviceId: string = null;
  @observable private secret: string = '';
  @observable private busy = false;

  public render() {
    const { env, open, onHide } = this.props;
    const { project } = env;
    console.log(project.id);
    return (
      <Dialog
          open={open}
          onShow={this.onShow}
          onClose={onHide}
          className="add-member"
      >
        <Dialog.Header hasClose={true}>Create Incoming Webhook</Dialog.Header>
        <Dialog.Body>
          <Form layout="ledger" onSubmit={this.onAddWebhook}>
            <FormLabel>Service:</FormLabel>
            <WebhookServiceSelector serviceId={this.serviceId} onSelect={this.onSelectService} />
            <FormLabel>Secret:</FormLabel>
            <TextInput value={this.secret} onChange={this.onChangeSecret} />
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onHide}>Cancel</Button>
          <Button
              onClick={this.onAddWebhook}
              disabled={this.serviceId === null || this.busy}
              kind="primary"
          >
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @action.bound
  private onShow() {
    this.serviceId = null;
  }

  @action.bound
  private onChangeSecret(e: any) {
    this.secret = e.target.value;
  }

  @action.bound
  private onSelectService(serviceId: string) {
    this.serviceId = serviceId;
  }

  @action.bound
  private onAddWebhook() {
    const { onHide, env } = this.props;
    this.busy = true;
    const input: WebhookInput = {
      project: env.project.id,
      serviceId: this.serviceId,
      secret: this.secret,
    };
    client.mutate<AddWebhookMutationResult>({
      mutation: AddWebhookMutation,
      variables: {
        input,
      }
    }).then(({ data, errors }) => {
      this.busy = false;
      onHide();
      if (errors) {
        decodeErrorAsException(errors);
      }
      return data.addWebhook;
    }, error => {
      env.mutationError = error;
      this.busy = false;
      onHide();
    });
  }
}
