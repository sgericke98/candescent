# Candescent Win Room Dashboard

A modern, enterprise-grade account management and risk monitoring dashboard built with Next.js 15, TypeScript, and Supabase. Features a comprehensive design system with semantic tokens, WCAG AA compliance, and responsive layouts.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS v4, Supabase
- **Design System**: Token-driven components with semantic color variables
- **Accessibility**: WCAG AA compliant with automated contrast verification
- **Responsive**: Fully dynamic layouts that adapt to any screen size
- **Authentication**: Secure user authentication with Supabase Auth
- **Real-time Data**: Live account monitoring and risk assessment
- **Charts Integration**: Recharts-ready with semantic color tokens

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/candescent.git

# Navigate to the project directory
cd candescent

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Add the following environment variables to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### 3. Supabase Database Setup

**Credentials will be shared via Microsoft Teams** - Check your Teams chat for:
- Supabase Project URL
- Supabase Anon Key  
- Supabase Service Role Key

Once you receive the credentials:
1. Copy them to your `.env.local` file
2. The database is already set up with the required tables
3. You can start development immediately



### 4. Database Schema

The application uses the following main tables:

- `accounts` - Account information and health scores
- `users` - User authentication and profile data
- `activities` - Account activities and follow-ups
- `win_rooms` - Win room scheduling and results

### 5. Cursor MCP Server Setup (Optional but Recommended)

To enable Cursor to connect directly with Supabase for database operations:

1. **Create the MCP configuration folder:**
   ```bash
   mkdir .cursor
   ```

2. **Create the MCP configuration file:**
   ```bash
   touch .cursor/mcp.json
   ```

3. **Add the MCP configuration content:**
   - Check Microsoft Teams for the MCP configuration content
   - This enables Cursor to connect with Supabase for:
     - Creating tables
     - Applying migrations
     - Reading table schemas
     - Managing database operations directly from the IDE

4. **Restart Cursor** after adding the configuration


## 🚀 Development

### Start the Development Server

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests

# Database
npm run seed         # Seed database with sample data
npm run setup:env    # Setup environment variables

# Linting
npm run lint         # Run ESLint
```

## 🎨 Design System

This project uses a comprehensive design system with semantic tokens:

### Color Tokens

```css
/* Brand Colors */
--brand: #2662F0
--brand-600: #1E55D6
--brand-700: #1848B8
--brand-50: #EEF4FF

/* Status Colors */
--success: #15803D
--warning: #B45309
--danger: #DC2626

/* Surface Colors */
--background: #F7F8FB
--surface: #FFFFFF
--surface-2: #FAFBFF
--surface-3: #F3F6FD
```

### Component Usage

```tsx
// Using semantic tokens in components
<Card className="bg-surface border-border">
  <CardTitle className="text-foreground">Title</CardTitle>
  <CardContent className="text-muted-fg">Content</CardContent>
</Card>

// Status components
<HealthChip score={750} />
<StatusBadge status="green" />
```

### Accessibility

The design system is WCAG AA compliant. Verify contrast ratios:

```bash
# Run contrast verification
npx tsx scripts/verify-contrast.ts
```

## 📁 Project Structure

```
candescent/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── _theme/                   # Design system showcase
│   ├── globals.css               # Global styles & design tokens
│   └── layout.tsx                # Root layout
├── components/                    # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   ├── health-chip.tsx           # Health status component
│   └── stat-card.tsx             # Statistics card component
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configuration
│   ├── types/                    # TypeScript type definitions
│   ├── chart-colors.ts            # Chart color configuration
│   └── utils.ts                  # Utility functions
├── scripts/                      # Build and utility scripts
│   ├── seed.ts                   # Database seeding
│   ├── setup-env.ts              # Environment setup
│   └── verify-contrast.ts        # Accessibility verification
├── supabase/                     # Database schema and migrations
│   └── schema.sql                # Database schema
├── tests/                        # Test files
│   ├── e2e/                      # End-to-end tests
│   └── utils.test.ts             # Unit tests
└── public/                       # Static assets
```

## 🔧 Configuration

### Tailwind CSS v4

The project uses Tailwind CSS v4 with custom design tokens:

```css
/* Design tokens are automatically mapped to Tailwind classes */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... more tokens */
}
```

### Supabase Configuration

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed
```

### Accessibility Testing

```bash
# Verify contrast ratios
npx tsx scripts/verify-contrast.ts
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

Ensure these are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXTAUTH_URL=your_production_domain
NEXTAUTH_SECRET=your_production_secret
```

## 🎨 Design System Showcase

Visit `/app/_theme` to see the comprehensive design system showcase including:

- Color palette with semantic tokens
- Typography scale
- Component examples
- Interactive elements
- Accessibility demonstrations

## 🔍 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after adding variables

2. **Supabase Connection Issues**
   - Verify your Supabase URL and keys
   - Check if your Supabase project is active
   - Ensure RLS policies are properly configured

3. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check if design tokens are being applied
   - Run contrast verification script

### Getting Help

- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review [Supabase Documentation](https://supabase.com/docs)
- Consult [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Design System**: Token-driven architecture
- **Accessibility**: WCAG AA compliant

## 🔗 Links

- [Live Demo](https://your-demo-url.com)
- [Design System Documentation](https://your-design-system-url.com)
- [API Documentation](https://your-api-docs-url.com)

---

**Happy Coding! 🚀**

For any questions or issues, please open an issue in the repository or contact the development team.