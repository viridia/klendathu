import * as React from 'react';
import { register } from '../registry';
import { Card, Form, FormLabel, TextInput, TextArea } from '../../controls';

function Forms() {
  return (
    <React.Fragment>
      <header>Form (ledger)</header>
      <Card>
        <div style={{ padding: '12px'}}>
          <Form>
            <FormLabel>First Name:</FormLabel>
            <TextInput />
            <FormLabel>Last Name:</FormLabel>
            <TextInput />
            <FormLabel>Address:</FormLabel>
            <TextInput />
            <FormLabel>City:</FormLabel>
            <TextInput />
            <FormLabel>Zip:</FormLabel>
            <TextArea rows={4} />
          </Form>
        </div>
      </Card>
      <header>Form (inline)</header>
      <Card>
        <div style={{ padding: '12px'}}>
          <Form layout="inline">
            <FormLabel>First Name:</FormLabel>
            <TextInput />
            <FormLabel>Last Name:</FormLabel>
            <TextInput />
            <FormLabel>Address:</FormLabel>
            <TextInput />
          </Form>
        </div>
      </Card>
      <header>Form (stacked)</header>
      <Card>
        <div style={{ padding: '12px'}}>
          <Form layout="stacked">
            <FormLabel>First Name:</FormLabel>
            <TextInput />
            <FormLabel>Last Name:</FormLabel>
            <TextInput />
            <FormLabel>Address:</FormLabel>
            <TextInput />
            <FormLabel>City:</FormLabel>
            <TextInput />
            <FormLabel>Zip:</FormLabel>
            <TextArea rows={4} />
          </Form>
        </div>
      </Card>
    </React.Fragment>
  );
}

register('forms', Forms);
