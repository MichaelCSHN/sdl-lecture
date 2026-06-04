/**
 * Legacy App.tsx — replaced by route-based architecture.
 *
 * The old single-page section layout (HomeSection, BackgroundSection, etc.)
 * has been migrated to individual page components under src/pages/.
 *
 * Routing is now handled by src/app/router.tsx via react-router.
 *
 * Legacy sections are preserved under src/sections/ for content reuse
 * but are no longer rendered from this entry point.
 *
 * See: docs/02_Product_Spec.md for the new information architecture.
 */

// Re-export AppShell as default for backward compatibility with any remaining imports
export { default } from '@/layouts/AppShell';
