#!/usr/bin/env tsx

/**
 * Project Setup Script
 * Helps new developers get started with the Candescent project
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath: string): boolean {
  return existsSync(join(process.cwd(), filePath))
}

function createEnvFile(): void {
  const envExample = `# Supabase Configuration
# Get these values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Development flags
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development`

  if (!checkFile('.env.local')) {
    writeFileSync('.env.local', envExample)
    log('✅ Created .env.local file', 'green')
  } else {
    log('⚠️  .env.local already exists', 'yellow')
  }
}

function checkDependencies(): void {
  log('\n🔍 Checking dependencies...', 'blue')
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const requiredDeps = [
      'next',
      'react',
      'typescript',
      '@supabase/supabase-js',
      'tailwindcss'
    ]
    
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep])
    
    if (missingDeps.length === 0) {
      log('✅ All required dependencies are installed', 'green')
    } else {
      log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, 'red')
      log('Run: npm install', 'yellow')
    }
  } catch (error) {
    log('❌ Could not read package.json', 'red')
  }
}

function checkEnvironmentVariables(): void {
  log('\n🔍 Checking environment variables...', 'blue')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName]
    return !value || value.includes('your_') || value.includes('_here')
  })
  
  if (missingVars.length === 0) {
    log('✅ All environment variables are configured', 'green')
  } else {
    log(`⚠️  Please configure these environment variables:`, 'yellow')
    missingVars.forEach(varName => {
      log(`   - ${varName}`, 'yellow')
    })
  }
}

function runContrastCheck(): void {
  log('\n🎨 Running design system contrast verification...', 'blue')
  
  try {
    // Import and run the contrast verification
    const { runContrastTests } = require('../scripts/verify-contrast.ts')
    runContrastTests()
  } catch (error) {
    log('⚠️  Could not run contrast verification', 'yellow')
    log('Run manually: npx tsx scripts/verify-contrast.ts', 'yellow')
  }
}

function showNextSteps(): void {
  log('\n🚀 Next Steps:', 'bold')
  log('1. Configure Supabase credentials:', 'blue')
  log('   - Check Microsoft Teams for shared credentials', 'blue')
  log('   - Copy project URL and keys to .env.local', 'blue')
  log('   - Database is already set up with required tables', 'blue')
  
  log('\n2. Setup Cursor MCP (Optional but Recommended):', 'blue')
  log('   mkdir .cursor', 'green')
  log('   touch .cursor/mcp.json', 'green')
  log('   - Add MCP configuration content from Teams chat', 'blue')
  log('   - Restart Cursor after configuration', 'blue')
  
  log('\n3. Start the development server:', 'blue')
  log('   npm run dev', 'green')
  
  log('\n4. Visit the application:', 'blue')
  log('   http://localhost:3000', 'green')
  
  log('\n5. Check the design system showcase:', 'blue')
  log('   http://localhost:3000/_theme', 'green')
  
  log('\n6. Run tests:', 'blue')
  log('   npm run test', 'green')
  log('   npm run test:e2e', 'green')
  
  log('\n7. Verify accessibility:', 'blue')
  log('   npx tsx scripts/verify-contrast.ts', 'green')
}

function main(): void {
  log('🎯 Candescent Project Setup', 'bold')
  log('============================', 'bold')
  
  // Check if we're in the right directory
  if (!checkFile('package.json')) {
    log('❌ Please run this script from the project root directory', 'red')
    process.exit(1)
  }
  
  // Create environment file
  createEnvFile()
  
  // Check dependencies
  checkDependencies()
  
  // Check environment variables
  checkEnvironmentVariables()
  
  // Run contrast check
  runContrastCheck()
  
  // Show next steps
  showNextSteps()
  
  log('\n✨ Setup complete! Happy coding! 🚀', 'green')
}

// Run the setup
if (require.main === module) {
  main()
}

export { main as setupProject }
