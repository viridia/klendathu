import { shade, tint } from 'polished';

/** Function to compute a lighter or darker variant of a base color. An amount of 0.5
    returns the base color unmodified; 1.0 returns pure white and 0.0 returns pure black. */
export const dye = (amount: number, base: string) =>
    amount > 0.5 ? tint((amount - 0.5) * 2, base) : shade(1.0 - amount * 2, base);

export interface ButtonColors {
  bg: string;
  text: string;
  border?: string;
}

export interface ThemeInterface {

  // General
  primaryColor: string;
  dilutedColor: string;
  focusColor: string;

  // Text colors
  textDark: string;
  textDarkDisabled: string;
  textDarkAccent: string;

  // Page
  pageBgColor: string;

  // Header
  headerBgColor: string;
  headerTitleColor: string;
  headerSubTitleColor: string;

  // Left Nav
  leftNavBgColor: string;
  leftNavTextColor: string;

  // Button styles
  buttonColors: {
    default: ButtonColors;
    action: ButtonColors;
    primary: ButtonColors;
    secondary: ButtonColors;
  };

  // Tabs
  tabTextColor: string;
  tabBgColor: string;
  tabBorderColor: string;
  tabActiveTextColor: string;
  tabActiveBgColor: string;
  tabActiveBorderColor: string;

  // Dialogs
  dialogBackdropColor: string;
  dialogBgColor: string;
  dialogBorder: string;
  dialogHeaderBgColor: string;
  dialogHeaderTextColor: string;
  dialogShadow: string;

  // Menus
  menuBgColor: string;
  menuTextColor: string;
  menuBorderColor: string;
  menuFocusBgColor: string;
  menuFocusTextColor: string;
  menuHoverBgColor: string;
  menuHoverTextColor: string;

  // Forms
  inputBorderColor: string;
  inputBgColor: string;

// contentBgColor: string;

  // Cards
  cardBgColor: string;
  cardBorderColor: string;
  cardShadowColor: string;

  cardHeaderBgColor: string;
  cardHeaderDividerColor: string;
// cardBgAlt: string;

// accentedCardHeaderBgColor: bg2;

// internalCardBgColor: lighten(bg0, 15%);
// internalCardBorder: lighten(cardBorder, 10%);

// // Mass edit
// massEditBgColor: string;

// // Menus
// dropdownLinkActiveBgColor: bg1;

// // Scrollbars
// scrollbarThumbColor: rgba(bg7, .5);
// scrollbarInactiveThumbColor: rgba(bg7, .3);

// // Social login buttons
// buttonLoginGoogleBgColor: string;
// buttonLoginGitHubBgColor: string;
// buttonLoginFacebookBgColor: string;

// // Labels
// labelText: string;
}

export interface ThemeProps {
  theme: ThemeInterface;
}
