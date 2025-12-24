/**
 * Responsive Design Utilities
 * Mobile-first responsive helper functions and constants
 */

/**
 * Breakpoint values (matching Tailwind CSS defaults)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Common responsive padding combinations
 */
export const RESPONSIVE_PADDING = {
  // Mobile-friendly padding (smaller on mobile, larger on desktop)
  container: 'px-4 sm:px-6 md:px-8',
  section: 'px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10',
  card: 'p-4 sm:p-6',
  modal: 'p-4 sm:p-6',
  
  // Vertical spacing
  verticalSection: 'py-6 sm:py-8 md:py-10',
  verticalCard: 'py-4 sm:py-6',
  
  // Horizontal spacing
  horizontalSection: 'px-4 sm:px-6 md:px-8',
  horizontalCard: 'px-4 sm:px-6',
} as const;

/**
 * Common responsive gap sizes
 */
export const RESPONSIVE_GAP = {
  form: 'gap-4 sm:gap-6',
  grid: 'gap-3 sm:gap-4 md:gap-6',
  list: 'gap-2 sm:gap-3',
  section: 'gap-6 sm:gap-8',
} as const;

/**
 * Common responsive grid columns
 */
export const RESPONSIVE_GRID = {
  // Two columns on desktop, one on mobile
  two: 'grid-cols-1 sm:grid-cols-2',
  
  // Three columns on desktop, two on tablet, one on mobile
  three: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  
  // Four columns on desktop
  four: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  
  // Auto-responsive grid
  auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;

/**
 * Common responsive font sizes
 */
export const RESPONSIVE_TEXT = {
  heading: 'text-2xl sm:text-3xl md:text-4xl',
  subheading: 'text-lg sm:text-xl md:text-2xl',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
} as const;

/**
 * Mobile detection hook configuration
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Dialog/Modal responsive sizing
 */
export const RESPONSIVE_MODAL = {
  small: 'w-[calc(100%-2rem)] max-w-sm',
  default: 'w-[calc(100%-2rem)] max-w-md sm:max-w-lg',
  large: 'w-[calc(100%-2rem)] max-w-lg sm:max-w-2xl',
  extraLarge: 'w-[calc(100%-2rem)] max-w-2xl sm:max-w-4xl',
} as const;

/**
 * Common max-height for scrollable containers
 */
export const RESPONSIVE_HEIGHT = {
  modal: 'max-h-[85vh]',
  dialog: 'max-h-[90vh]',
  container: 'max-h-[calc(100vh-10rem)]',
} as const;

/**
 * Responsive display classes
 */
export const RESPONSIVE_DISPLAY = {
  // Hide on mobile, show on tablet and up
  tabletUp: 'hidden sm:block',
  
  // Show only on mobile
  mobileOnly: 'sm:hidden',
  
  // Hide on mobile, show on desktop
  desktopUp: 'hidden lg:block',
  
  // Show only on desktop
  desktopOnly: 'lg:block hidden',
  
  // Responsive flex direction
  flexCol: 'flex flex-col sm:flex-row',
} as const;

/**
 * Generate responsive classes for common patterns
 */
export const getResponsiveClasses = {
  /**
   * Get classes for a responsive container with standard padding
   */
  container: (additionalClasses = '') =>
    `${RESPONSIVE_PADDING.container} ${additionalClasses}`.trim(),
  
  /**
   * Get classes for a responsive section with padding and gap
   */
  section: (additionalClasses = '') =>
    `${RESPONSIVE_PADDING.section} ${RESPONSIVE_GAP.section} ${additionalClasses}`.trim(),
  
  /**
   * Get classes for a responsive grid card
   */
  gridCard: (columns = 'two', additionalClasses = '') =>
    `grid ${RESPONSIVE_GRID[columns as keyof typeof RESPONSIVE_GRID]} ${additionalClasses}`.trim(),
  
  /**
   * Get classes for a responsive modal dialog
   */
  modal: (size = 'default', additionalClasses = '') =>
    `${RESPONSIVE_MODAL[size as keyof typeof RESPONSIVE_MODAL]} ${RESPONSIVE_HEIGHT.modal} overflow-y-auto p-4 sm:p-6 ${additionalClasses}`.trim(),
  
  /**
   * Get classes for a responsive form container
   */
  form: (additionalClasses = '') =>
    `space-y-6 ${RESPONSIVE_PADDING.modal} ${additionalClasses}`.trim(),
} as const;

/**
 * Media query helper strings for CSS-in-JS or Tailwind escaping
 */
export const MEDIA_QUERIES = {
  mobile: '(max-width: 639px)',
  tablet: '(min-width: 640px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  smallScreen: '(max-width: 768px)',
  largeScreen: '(min-width: 1024px)',
} as const;

/**
 * Common responsive button layouts
 */
export const RESPONSIVE_BUTTON_GROUP = {
  // Stack on mobile, horizontal on desktop
  flex: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
  
  // Responsive button sizing
  sizeResponsive: 'w-full sm:w-auto',
} as const;
