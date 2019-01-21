import { shade, tint } from 'polished';

/** Function to compute a lighter or darker variant of a base color. An amount of 0.5
    returns the base color unmodified; 1.0 returns pure white and 0.0 returns pure black. */
export const dye = (amount: number, base: string) =>
    amount > 0.5 ? tint((amount - 0.5) * 2, base) : shade(1.0 - amount * 2, base);

export interface ThemeInterface {
  primaryColor: string;

  // General
  themeColor: string;
  focusOutlineColor: string;

  // Text colors
  textLight: string;
  textDark: string;
  textDarkDisabled: string;
  textDarkAccent: string;

  // Action button
  buttonActionBg: string;
  buttonActionTextColor: string;
  buttonActionBorderColor: string;

  // Primary button
  buttonPrimaryBg: string;
  buttonPrimaryTextColor: string;
  buttonPrimaryBorderColor: string;

  // Secondary button
  buttonSecondaryBg: string;
  buttonSecondaryTextColor: string;
  buttonSecondaryBorderColor: string;

  // Default button style
  buttonDefaultBg: string;
  buttonDefaultTextColor: string;
  buttonDefaultBorderColor: string;

// // Background colors
// bg0: string;
// bg1: string;
// bg2: string;
// bg3: string;
// bg4: string;
// bg5: string;
// bg6: string;
// bg7: string;
// bg8: string;
// bg9: string;

// leftNavBg: string;
// leftNavFg: string;

// contentBg: string;

// // Cards
// // cardBg: string;
// cardBgAlt: string;
// cardBorder: string;
// cardHeaderBg: lighten(bg1, 10%);

// cardBg: lighten(bg0, 5%);
// cardShadow: rgba(0,0,0,0.14);
// cardHeaderDividerColor: darken(bg1, 5%);
// cardFooterDividerColor: darken(bg1, 5%);

// accentedCardHeaderBg: bg2;

// internalCardBg: lighten(bg0, 15%);
// internalCardBorder: lighten(cardBorder, 10%);

// // Mass edit
// massEditBg: string;

// // Menus
// dropdownLinkActiveBg: bg1;

// // Scrollbars
// scrollbarThumbColor: rgba(bg7, .5);
// scrollbarInactiveThumbColor: rgba(bg7, .3);

// // Social login buttons
// buttonLoginGoogleBg: string;
// buttonLoginGitHubBg: string;
// buttonLoginFacebookBg: string;

// // Labels
// labelText: string;

}

export interface ThemeProps {
  theme: ThemeInterface;
}
