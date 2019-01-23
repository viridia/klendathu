import { shade, tint } from 'polished';

/** Function to compute a lighter or darker variant of a base color. An amount of 0.5
    returns the base color unmodified; 1.0 returns pure white and 0.0 returns pure black. */
export const dye = (amount: number, base: string) =>
    amount > 0.5 ? tint((amount - 0.5) * 2, base) : shade(1.0 - amount * 2, base);

export interface ThemeInterface {

  // General
  primaryColor: string;
  dilutedColor: string;

  // Text colors
  textDark: string;
  textDarkDisabled: string;
  textDarkAccent: string;

  // Page
  pageBgColor: string;
  headerTextColor: string;
  headerBgColor: string;

  // Left Nav
  leftNavBgColor: string;
  leftNavTextColor: string;

  // Default button style
  buttonDefaultBgColor: string;
  buttonDefaultTextColor: string;
  buttonDefaultBorderColor?: string;

  // Action button
  buttonActionBgColor: string;
  buttonActionTextColor: string;
  buttonActionBorderColor?: string;

  // Primary button
  buttonPrimaryBgColor: string;
  buttonPrimaryTextColor: string;
  buttonPrimaryBorderColor?: string;

  // Secondary button
  buttonSecondaryBgColor: string;
  buttonSecondaryTextColor: string;
  buttonSecondaryBorderColor?: string;

  // Dialogs
  dialogBackdropColor: string;
  dialogBgColor: string;
  dialogBorder: string;
  dialogHeaderBgColor: string;
  dialogHeaderTextColor: string;
  dialogShadow: string;

// contentBgColor: string;

// // Cards
// // cardBgColor: string;
// cardBgAlt: string;
  cardBgColor: string;
  cardBorderColor: string;
  cardShadowColor: string;

  cardHeaderBgColor: string;
  cardHeaderDividerColor: string;

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
