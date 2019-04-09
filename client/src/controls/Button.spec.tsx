import * as React from 'react';
import { mount } from 'enzyme';
import { themeDefault } from '../style';
import { Button } from 'skyhook-ui';

describe('controls.Button', () => {
  test('render', () => {
    const wrapper = mount(<Button theme={themeDefault}>Caption</Button>);
    expect(wrapper).toHaveDisplayName('Styled(Component)');
    expect(wrapper).toHaveText('Caption');
    expect(wrapper.find('button')).toHaveLength(1);
    // expect(wrapper.find('button')).toHaveClassName('default');
    // expect(wrapper.find('button')).not.toHaveClassName('small');
    // expect(wrapper.find('button')).not.toHaveClassName('mini');
  });

  // test('variant.default', () => {
  //   const wrapper = mount(<Button theme={themeDefault}>Caption</Button>);
  //   expect(wrapper.find('button')).toHaveClassName('default');
  // });

  // test('variant.action', () => {
  //   const wrapper = mount(<Button theme={themeDefault} variant="action">Caption</Button>);
  //   expect(wrapper.find('button')).toHaveClassName('action');
  // });

  // test('variant.primary', () => {
  //   const wrapper = mount(<Button theme={themeDefault} variant="primary">Caption</Button>);
  //   expect(wrapper.find('button')).toHaveClassName('primary');
  // });

  // test('size.small', () => {
  //   const wrapper = mount(<Button theme={themeDefault} size="small">Caption</Button>);
  //   expect(wrapper.find('button')).toHaveClassName('small');
  // });

  // test('size.mini', () => {
  //   const wrapper = mount(<Button theme={themeDefault} size="mini">Caption</Button>);
  //   expect(wrapper.find('button')).toHaveClassName('mini');
  // });
});
