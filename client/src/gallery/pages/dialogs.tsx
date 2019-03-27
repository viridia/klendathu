import * as React from 'react';
import { styled } from '../../style';
import { register } from '../registry';
import { Button, Dialog } from '../../controls';
import bind from 'bind-decorator';

const Row = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

class Dialogs extends React.Component<{}, { open: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { open: false };
  }

  public render() {
    return (
      <React.Fragment>
        <header>Dialog</header>
        <Row>
          <Button onClick={() => this.setState({ open: true })}>Open</Button>
        </Row>
        <Dialog open={this.state.open} onClose={this.onClose}>
          <Dialog.Header hasClose={true}>Header Text</Dialog.Header>
          <Dialog.Body>
            An example of some body text for this dialog.
          </Dialog.Body>
          <Dialog.Footer>
            <Button kind="default" onClick={this.onClose}>
              Cancel
            </Button>
            <Button kind="primary" autoFocus={true} onClick={this.onClose}>
              Done
            </Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>
    );
  }

  @bind
  private onClose() {
    this.setState({ open: false });
  }
}

register('dialogs', () => <Dialogs />);
