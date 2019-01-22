import { /* ThemeInterface, */ dye } from './theme';
import { desaturate, transparentize } from 'polished';

const primary = '#9c27b0';
const diluted = desaturate(0.2, primary);

export const themeDefault /*: ThemeInterface */ = {
  primaryColor: primary,
  dilutedColor: diluted,

  // Text colors
  // textLight: string;
  textDark: '#222',
  textDarkDisabled: dye(0.4, diluted),
  textDarkAccent: dye(0.4, primary),

  // Page
  pageBgColor: dye(0.9, primary),
  headerTextColor: '#fff',
  headerBgColor: dye(0.5, primary),

  // Left Nav
  leftNavBgColor: dye(0.7, diluted),
  leftNavTextColor: dye(0.1, diluted),

  // Default button style
  buttonDefaultBgColor: dye(0.9, primary),
  buttonDefaultTextColor: dye(0.2, primary),
  buttonDefaultBorderColor: dye(0.6, desaturate(0.4, primary)),

  // Action button
  buttonActionBgColor: primary,
  buttonActionTextColor: dye(0.9, primary),

  // Primary button
  buttonPrimaryBgColor: dye(0.7, primary),
  buttonPrimaryTextColor: dye(0.1, primary),

  // Secondary button
  buttonSecondaryBgColor: dye(0.8, primary),
  buttonSecondaryTextColor: dye(0.2, primary),

  // Dialogs
  dialogBackdropColor: dye(0.1, primary),
  dialogBgColor: dye(0.9, primary),
  dialogBorder: `1px solid ${dye(0.7, desaturate(0.2, primary))}`,
  dialogHeaderBgColor: dye(0.8, primary),
  dialogHeaderTextColor: dye(0.1, primary),
  dialogShadow: `1px 2px 6px 6px ${dye(0.1, transparentize(0.9, desaturate(0.3, primary)))}`,
};
