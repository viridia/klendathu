import { ThemeInterface, dye } from './theme';
import { desaturate, transparentize } from 'polished';

const primary = '#9c27b0';
const diluted = desaturate(0.2, primary);

export const themeDefault: ThemeInterface = {
  primaryColor: primary,
  dilutedColor: diluted,
  focusColor: transparentize(0.7, primary),

  // Text colors
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

  // Button styles
  buttonColors: {
    default: {
      bg: dye(0.9, primary),
      text: dye(0.2, primary),
      border: dye(0.6, desaturate(0.4, primary)),
    },
    action: {
      bg: primary,
      text: dye(0.9, primary),
    },
    primary: {
      bg: dye(0.7, primary),
      text: dye(0.1, primary),
    },
    secondary: {
      bg: dye(0.8, primary),
      text: dye(0.2, primary),
    }
  },

  // Dialogs
  dialogBackdropColor: dye(0.1, primary),
  dialogBgColor: dye(0.9, primary),
  dialogBorder: `1px solid ${dye(0.7, desaturate(0.2, primary))}`,
  dialogHeaderBgColor: dye(0.8, primary),
  dialogHeaderTextColor: dye(0.1, primary),
  dialogShadow: `1px 2px 6px 6px ${dye(0.1, transparentize(0.9, desaturate(0.3, primary)))}`,

  // Cards
  cardBgColor: dye(0.94, primary),
  cardBorderColor: dye(0.7, diluted),
  cardShadowColor: transparentize(0.86, dye(0.4, primary)),
  cardHeaderBgColor: dye(0.88, primary),
  cardHeaderDividerColor: transparentize(0.8, dye(0.1, diluted)),

  // Forms
  inputBorderColor: dye(0.85, diluted),
  inputBgColor: dye(1, primary),
};
