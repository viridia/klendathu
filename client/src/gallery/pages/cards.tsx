import * as React from 'react';
import { register } from '../registry';
import { Card, Button } from '../../controls';

function Cards() {
  return (
    <React.Fragment>
      <header>Cards</header>
      <Card>
        <header>
          Card Header
          <Button>Done</Button>
        </header>
        <div style={{ padding: '32px 12px '}}>
          Card Content
        </div>
      </Card>
      <header>Card With Footer</header>
      <Card>
        <header>
          Card Header
        </header>
        <div style={{ padding: '32px 12px '}}>
          Card Content
        </div>
        <footer>
          Card Footer
          <Button>Done</Button>
        </footer>
      </Card>
    </React.Fragment>
  );
}

register('cards', Cards);
