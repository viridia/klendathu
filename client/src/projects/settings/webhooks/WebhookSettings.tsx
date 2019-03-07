import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { CardTitle, Button } from '../../../controls';
import { SettingsPane, Spacer } from '../../../layout';
import { AddWebhookDialog } from './AddWebhookDialog';
import { WebhooksList } from './WebhooksList';
import { Webhook } from '../../../../../common/types/graphql';
// import { Mutation } from '../../../../../common/types/graphql';
// import { client, decodeErrorAsException } from '../../../graphql/client';
// import bind from 'bind-decorator';
// import gql from 'graphql-tag';

interface Props {
  env: ViewContext;
}

/** Component which allows editing the list of columns. */
@observer
export class WebhookSettings extends React.Component<Props> {
  @observable private openAdd = false;
  // constructor(props: Props) {
  //   super(props);
  //   const { prefs } = props.env;
  // }

  public render() {
    const { env } = this.props;
    const { prefs } = env;
    if (!prefs) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <SettingsPane>
        <header>
          <CardTitle>Webhooks configuration</CardTitle>
          <Spacer />
          <Button kind="action" onClick={this.onAdd}>
            Add Hook&hellip;
          </Button>
        </header>
        <WebhooksList onShowDelete={this.onShowDelete} onShowEdit={this.onShowEdit} />
        <AddWebhookDialog env={env} open={this.openAdd} onHide={this.onCloseAdd} />
      </SettingsPane>);
  }

  @action.bound
  private onAdd(e: any) {
  //   const { env } = this.props;
    e.preventDefault();
    this.openAdd = true;
  //   client.mutate<SetPrefsColumnsMutationResult>({
  //     mutation: SetPrefsColumnsMutation,
  //     variables: {
  //       project: env.project.id,
  //       columns: this.visible.slice(),
  //     }
  //   }).then(({ data, errors }) => {
  //     this.busy = false;
  //     if (errors) {
  //       decodeErrorAsException(errors);
  //     }
  //     return data.setPrefColumns;
  //   }, error => {
  //     env.mutationError = error;
  //     this.busy = false;
  //   });
  }

  @action.bound
  private onShowEdit(wh: Webhook) {
  //   const { env } = this.props;
    // this.openAdd = true;
  }

  @action.bound
  private onShowDelete(wh: Webhook) {
  //   const { env } = this.props;
    // e.preventDefault();
    // this.openAdd = true;
  }

  @action.bound
  private onCloseAdd() {
    this.openAdd = false;
  }
  // @bind
  // private onSave(e: any) {
  //   const { env } = this.props;
  //   e.preventDefault();
  //   this.busy = true;
  //   client.mutate<SetPrefsColumnsMutationResult>({
  //     mutation: SetPrefsColumnsMutation,
  //     variables: {
  //       project: env.project.id,
  //       columns: this.visible.slice(),
  //     }
  //   }).then(({ data, errors }) => {
  //     this.busy = false;
  //     if (errors) {
  //       decodeErrorAsException(errors);
  //     }
  //     return data.setPrefColumns;
  //   }, error => {
  //     env.mutationError = error;
  //     this.busy = false;
  //   });
  // }
}
