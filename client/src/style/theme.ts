import { Theme as SHTheme } from 'skyhook-ui';
import { shade, tint } from 'polished';

/** Function to compute a lighter or darker variant of a base color. An amount of 0.5
    returns the base color unmodified; 1.0 returns pure white and 0.0 returns pure black. */
export const dye = (amount: number, base: string) =>
    amount > 0.5 ? tint((amount - 0.5) * 2, base) : shade(1.0 - amount * 2, base);

export interface ThemeInterface extends SHTheme {
  // General
  primaryColor: string;
  dilutedColor: string;

  // Text colors
  textAccented: string;
  textMuted: string;
  textExtraMuted: string;

  // Page
  scrollbarThumbColor: string;
  scrollbarInactiveThumbColor: string;

  // Header
  headerBgColor: string;
  headerTitleColor: string;
  headerSubTitleColor: string;

  // Left Nav
  leftNavBgColor: string;
  leftNavTextColor: string;

  // Tabs
  tabTextColor: string;
  tabBgColor: string;
  tabBorderColor: string;
  tabActiveTextColor: string;
  tabActiveBgColor: string;
  tabActiveBorderColor: string;

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
}

export interface ThemeProps {
  theme: ThemeInterface;
}
