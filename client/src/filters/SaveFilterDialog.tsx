import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import AddBoxIcon from '../svg-compiled/icons/IcAddBox';
import { addPrefsFilter } from '../graphql/mutations';
import { ViewContext } from '../models';
import { Button, Dialog, Form, FormLabel, TextInput } from 'skyhook-ui';

interface Props {
  env: ViewContext;
  queryString: string;
  view: string;
  onClose: () => void;
}

@observer
export class SaveFilterDialog extends React.Component<Props> {
  @observable private filterName = '';
  @observable private filterNameError: string = null;
  @observable private busy = false;

  constructor(props: Props, context: any) {
    super(props, context);
    this.onSave = this.onSave.bind(this);
    this.onChangeFilterName = this.onChangeFilterName.bind(this);
    this.state = {
      busy: false,
    };
  }

  public render() {
    return (
      <Dialog
          open={true}
          onClose={this.props.onClose}
      >
        <Dialog.Header hasClose={true}>Create Filter</Dialog.Header>
        <Dialog.Body>
          <Form className="save-filter-form" onSubmit={this.onSave}>
            <FormLabel>Filter Name</FormLabel>
            <TextInput
                autoFocus={true}
                type="text"
                placeholder="Project Name"
                value={this.filterName}
                onChange={this.onChangeFilterName}
                validationStatus={this.filterNameError ? 'error' : null}
                validationMsg={this.filterNameError}
            />
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={this.props.onClose}>Cancel</Button>
          <Button
              onClick={this.onSave}
              disabled={this.filterName.length === 0 || this.busy}
              variant="primary"
          >
            <AddBoxIcon />
            Save
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @action.bound
  private onSave(ev: any) {
    const { project } = this.props.env;
    ev.preventDefault();
    addPrefsFilter({
      project: project.id,
      input: {
        name: this.filterName,
        view: this.props.view,
        value: this.props.queryString.slice(1),
      }
    }).then(() => {
      this.busy = false;
      this.props.onClose();
    }, error => {
      this.props.env.mutationError = error;
      this.props.onClose();
    });
  }

  @action.bound
  private onChangeFilterName(e: any) {
    this.filterName = e.target.value;
  }
}
