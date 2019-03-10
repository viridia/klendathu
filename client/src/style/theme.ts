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
  altColor: string;

  // Text colors
  textNormal: string;
  textAccented: string;
  textMuted: string;
  textExtraMuted: string;

  // Page
  pageBgColor: string;
  scrollbarThumbColor: string;
  scrollbarInactiveThumbColor: string;

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
    alternate: ButtonColors;
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
  menuActiveBgColor: string;
  menuActiveTextColor: string;
  menuDividerColor: string;

  // Forms
  inputBorderColor: string;
  inputBgColor: string;

  // Cards
  cardBgColor: string;
  cardBorderColor: string;
  cardShadowColor: string;
  cardHeaderBgColor: string;
  cardBgColorAltRow: string;
  cardHeaderDividerColor: string;

  // Draggable cards
  cardInnerBgColor: string;
  cardInnerBorderColor: string;

  // Comment Blocks
  commentBgColor: string;
  commentBorderColor: string;
  commentHeaderColor: string;

  // Filters
  filterParamsBgColor: string;
  filterParamsHeaderBgColor: string;

  // Mass edit
  massEditBgColor: string;
  massEditHeaderBgColor: string;
  massEditBorderColor: string;
  massEdithadowColor: string;
}

export interface ThemeProps {
  theme: ThemeInterface;
}
