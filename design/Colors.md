
# Primary

const p00 = dye(0.00, primary);
const p01 = dye(0.20, primary);
const p02 = dye(0.50, primary);
const p03 = dye(0.70, primary);
const p04 = dye(0.80, primary);
const p05 = dye(0.85, primary);
const p06 = dye(0.88, primary);
const p07 = dye(0.90, primary);
const p08 = dye(0.95, primary);
const p09 = dye(0.98, primary);
const p11 = dye(1.00, primary);

const d00 = dye(0.00, diluted);
const d01 = dye(0.20, diluted);
const d02 = dye(0.50, diluted);
const d03 = dye(0.70, diluted);
const d04 = dye(0.80, diluted);
const d05 = dye(0.85, diluted);
const d06 = dye(0.88, diluted);
const d07 = dye(0.90, diluted);
const d08 = dye(0.95, diluted);
const d09 = dye(0.98, diluted);
const d10 = dye(1.00, diluted);


text: dye(0.2, primary),
text: dye(0.2, primary),

tabActiveTextColor: dye(0.3, primary),
textAccented: dye(0.3, primary),
tabActiveBorderColor: dye(0.3, primary),
cardShadowColor: dye(0.3, primary),

headerBgColor: dye(0.5, primary),
menuActiveBgColor: dye(0.5, primary),

progressThumbColor: dye(0.7, primary),
bg: dye(0.7, primary),

tabBorderColor: dye(0.8, primary),
dialogHeaderBgColor: dye(0.8, primary),
bg: dye(0.8, primary),

headerSubTitleColor: dye(0.85, primary),
tabActiveBgColor: dye(0.85, primary),
cardInnerBorderColor: dye(0.85, primary),

cardHeaderBgColor: dye(0.88, primary),

pageBgColor: dye(0.9, primary),
menuActiveTextColor: dye(0.9, primary),
dialogBgColor: dye(0.9, primary),
bg: dye(0.9, primary),
text: dye(0.9, primary),
headerTitleColor: dye(0.9, primary),

cardBgColorAltRow: dye(0.92, primary),

cardBgColor: dye(0.95, primary),

cardInnerBgColor: dye(0.98, primary),
commentHeaderColor: dye(0.98, primary),

menuBgColor: dye(1.0, primary),
commentBgColor: dye(1.0, primary),
dialogBackdropColor: dye(0.1, primary),
dialogHeaderTextColor: dye(0.1, primary),
inputBgColor: dye(1, primary),
text: dye(0.1, primary),

# Diluted

cardHeaderDividerColor: transparentize(0.8, dye(0.1, diluted)),

textMuted: desaturate(0.2, diluted),

tabTextColor: dye(0.4, diluted),

menuBorderColor: dye(0.7, diluted),
cardBorderColor: dye(0.7, diluted),

filterParamsHeaderBgColor: dye(0.75, diluted),

progressTrackColor: dye(0.8, diluted),

commentBorderColor: dye(0.85, diluted),
inputBorderColor: dye(0.85, diluted),
filterParamsBgColor: dye(0.85, diluted),

menuFocusBgColor: dye(0.9, diluted),

menuHoverBgColor: dye(0.95, diluted),

# Muted

textExtraMuted: desaturate(0.2, dye(0.6, diluted)),
dialogBorder: dye(0.7, desaturate(0.2, primary)),

# Desaturated

leftNavTextColor: dye(0.2, diluted),

leftNavBgColor: dye(0.8, desaturate(0.35, primary)),
border: dye(0.7, desaturate(0.4, primary)),
border: dye(0.7, desaturate(0.4, alt)),
menuDividerColor: dye(0.9, desaturate(0.5, primary)),

# Other

textNormal: '#222',
progressTextColor: '#222',
menuTextColor: '#222',
menuHoverTextColor: '#222',

menuFocusTextColor: '#000',

export const themeDefault: ThemeInterface = {
  focusColor: transparentize(0.7, primary),

  // Text colors

  // Page
  scrollbarThumbColor: dye(0.7, diluted),
  scrollbarInactiveThumbColor: dye(0.8, diluted),

  // Header

  // Left Nav

  // Button styles
  buttonColors: {
    action: {
      bg: dye(0.57, primary),
      border: dye(0.43, primary),
    },
    primary: {
      border: dye(0.63, primary),
    },
  },

  // Progress Bars
  dialogShadow: dye(0.1, transparentize(0.9, desaturate(0.3, primary))),
};
