// Enzyme setup file
import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';
import { JSDOM } from 'jsdom';

configure({ adapter: new Adapter() });

export const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;
(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = jsdom.window.navigator;
// (global as any).document = doc;
// (global as any).window = doc.defaultView;
