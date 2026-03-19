// Atlassian Design System Tokens
// Source: https://atlassian.design/foundations/tokens/design-tokens/

export const T = {
  // Surfaces
  surface:          "#FFFFFF",
  surfaceSunken:    "#F7F8F9",
  surfaceHovered:   "#F1F2F4",
  surfacePressed:   "#DCDFE4",
  surfaceOverlay:   "#FFFFFF",
  surfaceRaised:    "#FFFFFF",

  // Sidebar (Atlassian dark nav)
  navBg:            "#0C1929",
  navBorder:        "rgba(255,255,255,0.08)",
  navHover:         "rgba(255,255,255,0.06)",
  navActive:        "rgba(255,255,255,0.12)",
  navTextMuted:     "rgba(255,255,255,0.45)",
  navText:          "rgba(255,255,255,0.75)",
  navTextBright:    "#FFFFFF",

  // Text
  text:             "#1D2125",
  textSubtle:       "#44546F",
  textSubtlest:     "#626F86",
  textDisabled:     "#8993A5",
  textInverse:      "#FFFFFF",

  // Brand
  brandBold:        "#0C66E4",
  brandBoldHover:   "#0055CC",
  brandBoldPress:   "#09326C",
  brandSubtle:      "#E9F2FF",
  brandText:        "#0C66E4",

  // Borders
  border:           "#091E4224",
  borderBold:       "#758195",
  borderFocused:    "#388BFF",
  borderSelected:   "#0C66E4",
  borderSubtle:     "#091E420F",

  // Status backgrounds (lozenge)
  bgNeutral:        "#091E420F",
  bgNeutralBold:    "#44546F",
  bgSuccessSubtle:  "#DFFCF0",
  bgSuccessBold:    "#1F845A",
  bgInfoSubtle:     "#E9F2FF",
  bgInfoBold:       "#0C66E4",
  bgWarningSubtle:  "#FFF7D6",
  bgWarningBold:    "#CF9F02",
  bgDangerSubtle:   "#FFEDEB",
  bgDangerBold:     "#C9372C",

  // Status text
  textSuccess:      "#216E4E",
  textInfo:         "#0055CC",
  textWarning:      "#7F5F01",
  textDanger:       "#AE2A19",
} as const;

export const FONT_STACK = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, system-ui, "Helvetica Neue", sans-serif';

export const ISSUE_TYPE_COLORS: Record<string, string> = {
  Epic: "#9F8FEF",
  Story: "#4BCE97",
  Task: "#579DFF",
  Bug: "#F87462",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Highest: "#C9372C",
  High:    "#E2483D",
  Medium:  "#E2740F",
  Low:     "#1F845A",
  Lowest:  "#388BFF",
};

export const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  "To Do":       { bg: T.bgNeutral,      text: T.textSubtle },
  "In Progress": { bg: T.bgInfoSubtle,   text: T.textInfo },
  Done:          { bg: T.bgSuccessSubtle, text: T.textSuccess },
};
