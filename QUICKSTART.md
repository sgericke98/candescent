# 🚀 Quick Start Guide

Welcome to the Candescent Win Room Dashboard! This guide will get you up and running in 5 minutes.

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/your-username/candescent.git
cd candescent
npm install
```

### 2. Run Setup Script
```bash
npm run setup
```
This will:
- ✅ Create `.env.local` file
- ✅ Check dependencies
- ✅ Verify environment variables
- ✅ Run accessibility checks
- ✅ Show next steps

### 3. Configure Supabase
**Check Microsoft Teams for shared credentials:**
- Supabase Project URL
- Supabase Anon Key
- Supabase Service Role Key

Copy the credentials to your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key
```

### 4. Cursor MCP Setup (Optional)
```bash
# Create MCP configuration
mkdir .cursor
touch .cursor/mcp.json
# Add content from Teams chat
# Restart Cursor
```

### 5. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000

## 🎯 What You'll See

- **Dashboard**: Main account management interface
- **Design System**: Visit `/app/_theme` for component showcase
- **Authentication**: Secure login system
- **Responsive**: Works on all screen sizes

## 🔧 Key Commands

```bash
npm run dev          # Start development
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check code quality
npm run verify:contrast  # Check accessibility
```

## 📁 Key Files

- `app/globals.css` - Design system tokens
- `components/` - React components
- `lib/` - Utilities and configurations
- `scripts/` - Setup and verification scripts

## 🆘 Need Help?

1. **Check the full README.md** for detailed instructions
2. **Run `npm run setup`** to verify your setup
3. **Visit `/app/_theme`** to see the design system
4. **Check console** for any error messages

## ✨ Features Ready to Use

- 🎨 **Design System**: Token-driven components
- ♿ **Accessibility**: WCAG AA compliant
- 📱 **Responsive**: Dynamic layouts
- 🔐 **Authentication**: Supabase Auth
- 📊 **Charts**: Recharts integration
- 🧪 **Testing**: Unit and E2E tests

Happy coding! 🚀
