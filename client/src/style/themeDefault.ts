import { ThemeInterface, dye } from './theme';

const baseColor = '#9c27b0';

export const themeDefault: ThemeInterface = {
  themeColor: baseColor,

  buttonPrimaryTextColor: dye(0.5, baseColor),
  buttonActionTextColor: dye(0.5, baseColor),
};
