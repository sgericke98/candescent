#!/usr/bin/env tsx

/**
 * Contrast verification script for design system tokens
 * Verifies WCAG AA compliance for key color combinations
 */

// Color values from our design tokens
const colors = {
  // Text colors
  foreground: '#0F172A', // slate-900
  mutedFg: '#475569',    // slate-600
  subtleFg: '#64748B',   // slate-500
  onInverse: '#FFFFFF',
  
  // Background colors
  background: '#F7F8FB',
  surface: '#FFFFFF',
  surface2: '#FAFBFF',
  surface3: '#F3F6FD',
  
  // Status colors
  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',
  
  // Chip colors
  chipGreenBg: '#EAF7EE',
  chipGreenFg: '#166534',
  chipYellowBg: '#FFF7E6',
  chipYellowFg: '#92400E',
  chipRedBg: '#FDECEC',
  chipRedFg: '#991B1B',
  
  // Brand colors
  brand: '#2662F0',
  brand600: '#1E55D6',
  brand700: '#1848B8',
  brand50: '#EEF4FF',
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) throw new Error(`Invalid hex color: ${hex}`)
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

// Helper function to calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Helper function to calculate contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Test cases for WCAG AA compliance
const testCases = [
  // Body text (≥4.5:1)
  { fg: colors.foreground, bg: colors.surface, minRatio: 4.5, description: 'Body text on surface' },
  { fg: colors.foreground, bg: colors.background, minRatio: 4.5, description: 'Body text on background' },
  { fg: colors.mutedFg, bg: colors.surface, minRatio: 4.5, description: 'Muted text on surface' },
  
  // UI elements (≥3:1)
  { fg: colors.mutedFg, bg: colors.background, minRatio: 3.0, description: 'Muted text on background' },
  { fg: colors.subtleFg, bg: colors.surface, minRatio: 3.0, description: 'Subtle text on surface' },
  
  // Status chips
  { fg: colors.chipGreenFg, bg: colors.chipGreenBg, minRatio: 4.5, description: 'Green chip text' },
  { fg: colors.chipYellowFg, bg: colors.chipYellowBg, minRatio: 4.5, description: 'Yellow chip text' },
  { fg: colors.chipRedFg, bg: colors.chipRedBg, minRatio: 4.5, description: 'Red chip text' },
  
  // Brand colors
  { fg: colors.onInverse, bg: colors.brand, minRatio: 4.5, description: 'Brand button text' },
  { fg: colors.brand700, bg: colors.brand50, minRatio: 4.5, description: 'Brand accent text' },
  
  // Status colors
  { fg: colors.onInverse, bg: colors.success, minRatio: 4.5, description: 'Success button text' },
  { fg: colors.onInverse, bg: colors.warning, minRatio: 4.5, description: 'Warning button text' },
  { fg: colors.onInverse, bg: colors.danger, minRatio: 4.5, description: 'Danger button text' },
]

// Run contrast tests
function runContrastTests(): void {
  console.log('🎨 Design System Contrast Verification\n')
  
  let passedCount = 0
  let failedCount = 0
  
  for (const test of testCases) {
    const ratio = getContrastRatio(test.fg, test.bg)
    const passed = ratio >= test.minRatio
    
    console.log(`${passed ? '✅' : '❌'} ${test.description}`)
    console.log(`   Ratio: ${ratio.toFixed(2)}:1 (required: ${test.minRatio}:1)`)
    console.log(`   Colors: ${test.fg} on ${test.bg}\n`)
    
    if (passed) {
      passedCount++
    } else {
      failedCount++
    }
  }
  
  console.log(`\n📊 Results: ${passedCount} passed, ${failedCount} failed`)
  
  if (failedCount === 0) {
    console.log('🎉 All contrast tests passed! Design system is WCAG AA compliant.')
  } else {
    console.log('⚠️  Some contrast tests failed. Please review the failing combinations.')
    process.exit(1)
  }
}

// Run the tests
if (require.main === module) {
  runContrastTests()
}

export { runContrastTests, getContrastRatio, colors }
