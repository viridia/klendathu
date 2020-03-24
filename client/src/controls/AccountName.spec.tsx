import * as React from 'react';
import { mount } from 'enzyme';
import { AccountName } from './AccountName';
import { MockedProvider } from '@apollo/react-testing';
import { PublicAccount, AccountType } from '../../../common/types/graphql';
import { AccountQuery } from '../graphql';

jest.mock('../graphql/client');

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const account: PublicAccount & { __typename: string } = {
  __typename: 'PublicAccount',
  id: 'test-01',
  accountName: 'corvette',
  display: 'Yvette Deladrier',
  type: AccountType.User,
  photo: null,
};

const mocks = [{
  request: {
    query: AccountQuery,
    variables: {
      id: 'test-user',
    },
  },
  result: {
    data: {
      account,
    }
  },
}];

describe('controls.AccountName', () => {
  test('render', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={true}>
        <AccountName id="test-user" />
      </MockedProvider>
    );
    await sleep(1);
    wrapper.update();
    expect(wrapper.find('span')).toExist();
    expect(wrapper).toHaveText('Yvette Deladrier');
    expect(wrapper.find('span')).toHaveClassName('account-name');
  });
});
