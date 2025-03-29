// client/src/lib/design-system.ts
// Global Design System: Typography, Spacing, and Component Styles

// ----- Typography -----
export const typography = {
  // Font sizes following a consistent typography scale
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
  },

  // Line heights
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Font weights
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// ----- Standardized Heading Styles -----
export const headings = {
  // Page title (h1)
  h1: "text-3xl font-bold tracking-tight text-foreground mb-2",

  // Section title (h2)
  h2: "text-2xl font-semibold text-foreground mb-2",

  // Subsection title (h3)
  h3: "text-xl font-semibold text-foreground",

  // Component title (h4)
  h4: "text-lg font-medium text-foreground",

  // Small title (h5)
  h5: "text-base font-medium text-foreground",

  // Smallest title (h6)
  h6: "text-sm font-medium text-foreground",
};

// ----- Text Styles -----
export const text = {
  default: "text-base text-foreground",
  sm: "text-sm text-foreground",
  xs: "text-xs text-foreground",

  muted: "text-sm text-muted-foreground",
  mutedXs: "text-xs text-muted-foreground",

  lead: "text-xl text-foreground",
  large: "text-lg font-semibold text-foreground",
};

// ----- Standardized Spacing -----
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
};

// ----- Filter Container Styles -----
export const filterContainers = {
  // Main filter container
  container: "flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap",

  // Filter buttons group
  buttonGroup: "flex items-center gap-2",

  // Filter controls group (search/select)
  controlGroup: "flex flex-col space-y-3 w-full md:space-y-0 md:flex-row md:items-center md:space-x-3 mt-3 sm:mt-0",

  // Wrapper for filters (background+padding)
  wrapper: "w-full bg-card/50 border border-border rounded-lg p-4 mb-6 shadow-sm",
};

// ----- Filter Button Styles -----
export const filterButtons = {
  // Base button style
  base: "h-9 shadow-sm hover:shadow transition-all duration-200",

  // Active/inactive states
  all: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 dark:hover:bg-primary/30",

  active: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 dark:bg-green-800/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/60",

  inactive: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800/60",

  pending: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/60",

  declined: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:text-red-800 dark:bg-red-800/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800/60",
};

// ----- Status Indicators -----
export const statusIndicators = {
  base: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",

  // Status variants
  active: "bg-green-500/20 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  inactive: "bg-gray-500/20 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
  pending: "bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  declined: "bg-red-500/20 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  draft: "bg-blue-500/20 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
};

// ----- Page Layouts -----
export const pageLayouts = {
  // Main page container with standardized opacity
  main: "w-full h-full overflow-y-auto bg-background/95 p-4 md:p-6 pb-20",

  // Page header wrapper
  header: "mb-6 md:mb-8",

  // Page title container
  titleContainer: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
};

// ----- Table Styles -----
export const tableStyles = {
  // Table wrapper with proper overflow
  wrapper: "overflow-x-auto overflow-y-auto rounded-md max-h-[calc(100vh-350px)] md:max-h-[calc(100vh-320px)]",

  // Table element
  table: "w-full border-collapse",

  // Table header
  thead: "bg-muted/40 border-b border-border text-xs uppercase tracking-wider sticky top-0 z-10",

  // Table header cell
  th: "px-4 py-3 text-left font-medium text-muted-foreground",

  // Table row
  tr: "border-b border-border last:border-0 hover:bg-accent/50 transition-colors duration-200",

  // Table cell
  td: "px-4 py-3",
};

// ----- Card Styles -----
export const cardStyles = {
  // Card base
  base: "shadow-sm border-border/60",

  // Card header
  header: "px-5 py-4",

  // Card title
  title: "text-lg flex items-center",
};

// ----- Responsive Breakpoints -----
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};