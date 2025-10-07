import { writeFileSync } from 'fs'
import { join } from 'path'

const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

const envPath = join(process.cwd(), '.env.local')

try {
  writeFileSync(envPath, envTemplate)
  console.log('✅ Created .env.local file')
  console.log('📝 Please update the environment variables with your Supabase credentials')
} catch (error) {
  console.error('❌ Error creating .env.local file:', error)
}
