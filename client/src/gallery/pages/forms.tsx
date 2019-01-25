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
            <TextInput name="first-name" validationStatus="success" validationMsg="Good to go!" />
            <FormLabel>Last Name:</FormLabel>
            <TextInput validationStatus="error" validationMsg="Name must not be empty!" />
            <FormLabel>Address:</FormLabel>
            <TextInput name="street" validationStatus="warning" validationMsg="Weak password"  />
            <FormLabel>City:</FormLabel>
            <TextInput name="city" />
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
