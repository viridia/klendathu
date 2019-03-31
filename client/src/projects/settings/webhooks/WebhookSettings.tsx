import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Button } from 'skyhook-ui';
import { CardTitle } from '../../../controls';
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
          <Button variant="action" onClick={this.onAdd}>
            Add Hook&hellip;
          </Button>
        </header>
        <WebhooksList onShowDelete={this.onShowDelete} onShowEdit={this.onShowEdit} />
        <AddWebhookDialog env={env} open={this.openAdd} onClose={this.onCloseAdd} />
      </SettingsPane>);
  }

  @action.bound
  private onAdd(e: any) {
    e.preventDefault();
    this.openAdd = true;
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
}
