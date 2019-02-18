import * as React from 'react';
import { mount } from 'enzyme';
import { RelationName } from './RelationName';
import { Relation } from '../../../common/types/graphql';

describe('controls.RelationName', () => {
  test('blockedBy', () => {
    const wrapper = mount(<RelationName relation={Relation.BlockedBy} />);
    expect(wrapper).toHaveText('blocked by');
  });

  test('blocks', () => {
    const wrapper = mount(<RelationName relation={Relation.Blocks} />);
    expect(wrapper).toHaveText('blocks');
  });

  test('duplicates', () => {
    const wrapper = mount(<RelationName relation={Relation.Duplicate} />);
    expect(wrapper).toHaveText('duplicates');
  });
});
