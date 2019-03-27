import { ThemeInterface, dye } from './theme';
import { desaturate, transparentize } from 'polished';

// const text = '#222';
const primary = '#9c27b0';
const alt = '#4727c0';
const diluted = desaturate(0.2, primary);
const muted = desaturate(0.35, primary);

export const themeDefault: ThemeInterface = {
  primaryColor: primary,
  dilutedColor: diluted,
  focusColor: transparentize(0.7, primary),

  // Text colors
  textNormal: '#222',
  textAccented: dye(0.3, primary),
  textMuted: muted,
  textExtraMuted: dye(0.6, muted),

  // Page
  pageBgColor: dye(0.9, primary),
  scrollbarThumbColor: dye(0.7, diluted),
  scrollbarInactiveThumbColor: dye(0.8, diluted),

  // Header
  headerTitleColor: dye(0.9, primary),
  headerSubTitleColor: dye(0.85, primary),
  headerBgColor: dye(0.5, primary),

  // Left Nav
  leftNavBgColor: dye(0.8, muted),
  leftNavTextColor: dye(0.2, diluted),

  // Button styles
  buttonColors: {
    default: {
      bg: dye(0.9, primary),
      text: dye(0.2, primary),
      border: dye(0.7, muted),
    },
    action: {
      bg: dye(0.57, primary),
      text: dye(0.9, primary),
      border: dye(0.43, primary),
    },
    primary: {
      bg: dye(0.7, primary),
      text: dye(0.1, primary),
      border: dye(0.63, primary),
    },
  },

  // Progress Bars
  progressTrackColor: dye(0.8, diluted),
  progressThumbColor: dye(0.7, primary),
  progressTextColor: '#222',

  // Tabs
  tabTextColor: dye(0.4, diluted),
  tabBgColor: 'transparent',
  tabBorderColor: dye(0.8, primary),
  tabActiveTextColor: dye(0.3, primary),
  tabActiveBgColor: dye(0.85, primary),
  tabActiveBorderColor: dye(0.3, primary),

  // Dialogs
  dialogBackdropColor: dye(0.1, primary),
  dialogBgColor: dye(0.9, primary),
  dialogBorder: `1px solid ${dye(0.7, muted)}`,
  dialogHeaderBgColor: dye(0.8, primary),
  dialogHeaderTextColor: dye(0.1, primary),
  dialogShadow: `1px 2px 6px 6px ${dye(0.1, transparentize(0.9, muted))}`,

  // Menus
  menuBgColor: dye(1.0, primary),
  menuTextColor: '#222',
  menuBorderColor: dye(0.7, diluted),
  menuActiveBgColor: dye(0.5, primary),
  menuActiveTextColor: dye(0.9, primary),
  menuHoverBgColor: dye(0.95, diluted),
  menuHoverTextColor: '#222',
  menuFocusBgColor: dye(0.9, diluted),
  menuFocusTextColor: '#000',
  menuDividerColor: dye(0.9, muted),

  // Cards
  cardBgColor: dye(0.95, primary),
  cardBgColorAltRow: dye(0.92, primary),
  cardBorderColor: dye(0.7, diluted),
  cardShadowColor: transparentize(0.85, dye(0.3, primary)),
  cardHeaderBgColor: dye(0.88, primary),
  cardHeaderDividerColor: transparentize(0.8, dye(0.1, diluted)),

  // Draggable cards
  cardInnerBgColor: dye(0.98, primary),
  cardInnerBorderColor: dye(0.85, primary),

  // Comment blocks
  commentBgColor: dye(1.0, primary),
  commentBorderColor: dye(0.85, diluted),
  commentHeaderColor: dye(0.98, primary),

  // Forms
  inputBorderColor: dye(0.85, diluted),
  inputBgColor: dye(1, primary),

  // Filters
  filterParamsBgColor: dye(0.85, diluted),
  filterParamsHeaderBgColor: dye(0.75, diluted),
};

/** Alternate theme for Mass edit panel */
export const themeAlt: ThemeInterface = {
  ...themeDefault,
  buttonColors: {
    default: {
      bg: dye(0.9, alt),
      text: dye(0.2, alt),
      border: dye(0.7, desaturate(0.4, alt)),
    },
    action: {
      bg: dye(0.57, alt),
      text: dye(0.9, alt),
      border: dye(0.43, alt),
    },
    primary: {
      bg: dye(0.7, alt),
      text: dye(0.1, alt),
      border: dye(0.63, alt),
    },
  },

  // Cards
  cardBgColor: dye(0.85, alt),
  cardHeaderBgColor: dye(0.8, alt),
  cardBorderColor: dye(0.7, alt),
  cardShadowColor: transparentize(0.85, dye(0.3, alt)),
};
