import * as React from 'react';
import { mount } from 'enzyme';
import { Button } from './Button';
import { themeDefault } from '../style';

describe('controls.Button', () => {
  test('render', () => {
    const wrapper = mount(<Button theme={themeDefault}>Caption</Button>);
    expect(wrapper).toHaveDisplayName('Styled(ButtonImpl)');
    expect(wrapper).toHaveText('Caption');
    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('button')).toHaveClassName('default');
    expect(wrapper.find('button')).not.toHaveClassName('small');
    expect(wrapper.find('button')).not.toHaveClassName('mini');
  });

  test('kind.default', () => {
    const wrapper = mount(<Button theme={themeDefault}>Caption</Button>);
    expect(wrapper.find('button')).toHaveClassName('default');
  });

  test('kind.action', () => {
    const wrapper = mount(<Button theme={themeDefault} kind="action">Caption</Button>);
    expect(wrapper.find('button')).toHaveClassName('action');
  });

  test('kind.primary', () => {
    const wrapper = mount(<Button theme={themeDefault} kind="primary">Caption</Button>);
    expect(wrapper.find('button')).toHaveClassName('primary');
  });

  test('kind.secondary', () => {
    const wrapper = mount(<Button theme={themeDefault} kind="secondary">Caption</Button>);
    expect(wrapper.find('button')).toHaveClassName('secondary');
  });

  test('size.small', () => {
    const wrapper = mount(<Button theme={themeDefault} size="small">Caption</Button>);
    expect(wrapper.find('button')).toHaveClassName('small');
  });

  test('size.mini', () => {
    const wrapper = mount(<Button theme={themeDefault} size="mini">Caption</Button>);
    expect(wrapper.find('button')).toHaveClassName('mini');
  });
});
