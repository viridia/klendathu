import { ThemeInterface, dye } from './theme';
import { desaturate, transparentize } from 'polished';

const primary = '#9c27b0';
const alt = '#4727c0';
const diluted = desaturate(0.2, primary);
const muted = desaturate(0.35, primary);
const textNormal = '#222';

export const themeDefault: ThemeInterface = {
  pageColor: '#222',
  primaryColor: primary,
  dilutedColor: diluted,
  focusColor: transparentize(0.7, primary),
  shadowColor: transparentize(0.8, '#000'),
  linkColor: primary,

  // Text colors
  textNormal,
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

  // Tabs
  tabTextColor: dye(0.4, diluted),
  tabBgColor: 'transparent',
  tabBorderColor: dye(0.8, primary),
  tabActiveTextColor: dye(0.3, primary),
  tabActiveBgColor: dye(0.85, primary),
  tabActiveBorderColor: dye(0.3, primary),

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

  // Buttons
  button: {
    default: {
      bgColor: dye(0.9, primary),
      borderColor: dye(0.7, muted),
      textColor: dye(0.2, primary),
    },
    action: {
      bgColor: dye(0.57, primary),
      borderColor: dye(0.43, primary),
      textColor: dye(0.9, primary),
    },
    primary: {
      bgColor: dye(0.7, primary),
      borderColor: dye(0.63, primary),
      textColor: dye(0.1, primary),
    },
    radio: {
      bgColor: dye(0.9, primary),
      borderColor: dye(0.7, muted),
      textColor: dye(0.5, primary),
    },
    checkbox: {
      bgColor: dye(0.9, primary),
      borderColor: dye(0.7, muted),
      textColor: dye(0.5, primary),
    },
    roundCorners: true,
  },

  dialog: {
    backdropColor: dye(0.1, primary),
    bgColor: dye(0.9, primary),
    borderColor: dye(0.7, muted),
    headerBgColor: dye(0.8, primary),
    headerTextColor: dye(0.1, primary),
  },

  menu: {
    bgColor: dye(1.0, primary),
    textColor: textNormal,
    borderColor: dye(0.7, diluted),
    focusBgColor: dye(0.9, diluted),
    focusTextColor: textNormal,
    hoverBgColor: dye(0.95, diluted),
    hoverTextColor: textNormal,
    dividerColor: dye(0.9, muted),
  },

  progress: {
    textColor: textNormal,
    thumbColor: dye(0.7, primary),
    trackColor: dye(0.8, diluted),
  },

  textField: {
    bgColor: '#fff',
    borderColor: dye(0.85, diluted),
    textColor: textNormal,
  },

  toggle: null,
  insetToggle: null,
  tooltip: null,
};

/** Alternate theme for Mass edit panel */
export const themeAlt: ThemeInterface = {
  ...themeDefault,
  button: {
    default: {
      bgColor: dye(0.9, alt),
      borderColor: dye(0.7, desaturate(0.4, alt)),
      textColor: dye(0.2, alt),
    },
    action: {
      bgColor: dye(0.57, alt),
      borderColor: dye(0.43, alt),
      textColor: dye(0.9, alt),
    },
    primary: {
      bgColor: dye(0.7, alt),
      borderColor: dye(0.63, alt),
      textColor: dye(0.1, alt),
    },
    radio: null,
    checkbox: null,
    roundCorners: true,
  },

  // Cards
  cardBgColor: dye(0.85, alt),
  cardHeaderBgColor: dye(0.8, alt),
  cardBorderColor: dye(0.7, alt),
  cardShadowColor: transparentize(0.85, dye(0.3, alt)),
};
