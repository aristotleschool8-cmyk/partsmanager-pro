/**
 * Responsive Component Patterns
 * Common component patterns with full mobile responsiveness
 */

export const responsivePatterns = {
  /**
   * Modal Dialog - responsive sizing and positioning
   * Usage: <div className={responsivePatterns.modal.container}>
   */
  modal: {
    container: 'fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] max-h-[85vh] overflow-y-auto rounded-lg',
    padding: 'p-4 sm:p-6',
    fullClass: 'fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] max-h-[85vh] overflow-y-auto rounded-lg p-4 sm:p-6',
  },

  /**
   * Alert Dialog - responsive sizing
   * Usage: <div className={responsivePatterns.alertDialog.container}>
   */
  alertDialog: {
    container: 'fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg',
    padding: 'p-4 sm:p-6',
    fullClass: 'fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg p-4 sm:p-6',
  },

  /**
   * Form Section - responsive layout for form content
   * Usage: <div className={responsivePatterns.formSection.container}>
   */
  formSection: {
    container: 'space-y-6 p-4 sm:p-6',
    gridTwo: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    gridThree: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    fullClass: 'space-y-6 p-4 sm:p-6',
  },

  /**
   * Page Header - responsive title layout
   * Usage: <div className={responsivePatterns.pageHeader.container}>
   */
  pageHeader: {
    container: 'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b',
    title: 'text-2xl sm:text-3xl font-bold font-headline',
    description: 'text-sm sm:text-base text-muted-foreground',
    fullClass: 'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b',
  },

  /**
   * Card Grid - responsive card layout
   * Usage: <div className={responsivePatterns.cardGrid.two}>
   */
  cardGrid: {
    one: 'grid grid-cols-1 gap-4 sm:gap-6',
    two: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    three: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    four: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  },

  /**
   * Flex Layout - responsive flex directions
   * Usage: <div className={responsivePatterns.flex.row}>
   */
  flex: {
    row: 'flex flex-col sm:flex-row gap-4',
    rowReverse: 'flex flex-col-reverse sm:flex-row gap-4',
    between: 'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4',
    center: 'flex flex-col-reverse sm:flex-row sm:items-center gap-4',
  },

  /**
   * Button Group - responsive button layouts
   * Usage: <div className={responsivePatterns.buttonGroup.footer}>
   */
  buttonGroup: {
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 sm:gap-0',
    horizontal: 'flex gap-2 sm:gap-3',
    vertical: 'flex flex-col gap-2 sm:gap-3',
    fullWidth: 'w-full sm:w-auto',
  },

  /**
   * Table Wrapper - responsive table container
   * Usage: <div className={responsivePatterns.tableWrapper.container}>
   */
  tableWrapper: {
    container: 'relative w-full overflow-x-auto -mx-4 sm:mx-0',
    responsive: 'text-xs sm:text-sm',
  },

  /**
   * Input Group - responsive input container
   * Usage: <div className={responsivePatterns.inputGroup.container}>
   */
  inputGroup: {
    container: 'space-y-2 sm:space-y-3',
    label: 'text-sm font-medium',
    input: 'w-full',
    fullClass: 'space-y-2 sm:space-y-3',
  },

  /**
   * Tabs - responsive tabs layout
   * Usage: <div className={responsivePatterns.tabs.container}>
   */
  tabs: {
    container: 'w-full',
    list: 'grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    listTwoCol: 'grid w-full grid-cols-2',
    listThreeCol: 'grid w-full grid-cols-3',
    content: 'mt-4 sm:mt-6 p-4 sm:p-6',
  },

  /**
   * Sidebar with Content - responsive layout
   * Usage: <div className={responsivePatterns.sidebarLayout.container}>
   */
  sidebarLayout: {
    container: 'flex flex-col sm:flex-row gap-4 sm:gap-6',
    sidebar: 'w-full sm:w-64 lg:w-80',
    content: 'flex-1',
  },

  /**
   * Breadcrumb - responsive breadcrumb navigation
   * Usage: <nav className={responsivePatterns.breadcrumb.container}>
   */
  breadcrumb: {
    container: 'flex items-center gap-2 text-xs sm:text-sm overflow-x-auto',
    separator: 'text-muted-foreground',
  },

  /**
   * Stat Card - responsive stat display
   * Usage: <div className={responsivePatterns.statCard.container}>
   */
  statCard: {
    container: 'p-4 sm:p-6 rounded-lg border bg-card',
    title: 'text-xs sm:text-sm font-medium text-muted-foreground',
    value: 'text-lg sm:text-2xl font-bold mt-2',
    description: 'text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2',
  },

  /**
   * List Item - responsive list item
   * Usage: <div className={responsivePatterns.listItem.container}>
   */
  listItem: {
    container: 'p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors',
    title: 'text-sm sm:text-base font-medium',
    description: 'text-xs sm:text-sm text-muted-foreground mt-1',
  },

  /**
   * Empty State - responsive empty state display
   * Usage: <div className={responsivePatterns.emptyState.container}>
   */
  emptyState: {
    container: 'p-6 sm:p-8 md:p-12 text-center rounded-lg bg-secondary',
    icon: 'h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground',
    title: 'mt-4 text-lg sm:text-xl font-medium',
    description: 'mt-2 text-sm sm:text-base text-muted-foreground',
  },

  /**
   * Loading Skeleton - responsive skeleton loader
   * Usage: <div className={responsivePatterns.skeleton.card}>
   */
  skeleton: {
    card: 'p-4 sm:p-6 rounded-lg bg-skeleton animate-pulse',
    line: 'h-4 rounded bg-skeleton',
    circle: 'h-10 w-10 rounded-full bg-skeleton',
  },

  /**
   * Badge - responsive badge sizing
   * Usage: <span className={responsivePatterns.badge.container}>
   */
  badge: {
    container: 'inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium',
    lg: 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base',
  },

  /**
   * Tooltip - responsive tooltip positioning
   * Usage: {(responsivePatterns.tooltip.trigger)}
   */
  tooltip: {
    trigger: 'cursor-help border-b border-dotted',
    content: 'max-w-xs sm:max-w-sm text-xs sm:text-sm p-2 sm:p-3 rounded bg-popover',
  },
};

/**
 * Helper function to combine multiple responsive patterns
 */
export const combineResponsivePatterns = (...patterns: string[]): string => {
  return patterns.filter(Boolean).join(' ');
};

/**
 * Create responsive variant class
 */
export const createResponsiveVariant = (
  mobile: string,
  tablet?: string,
  desktop?: string,
  large?: string
): string => {
  const classes = [mobile];
  if (tablet) classes.push(`sm:${tablet}`);
  if (desktop) classes.push(`md:${desktop}`);
  if (large) classes.push(`lg:${large}`);
  return classes.join(' ');
};

/**
 * Check if screen size matches breakpoint
 */
export const matchesBreakpoint = (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean => {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
};
