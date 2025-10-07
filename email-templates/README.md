# Candescent Email Templates

## Overview

Custom branded email templates for Supabase authentication flows.

## Templates Included

1. **magic-link.html** - Magic link / Sign in email
2. **confirm-signup.html** - Welcome / Email confirmation
3. **reset-password.html** - Password reset request
4. **invite-user.html** - Team invitation

## Design Features

✨ **Professional Styling**
- Gradient headers with emojis
- Branded color scheme (blue primary, green accents)
- Responsive design
- Mobile-friendly

📋 **Content-Rich**
- Clear call-to-action buttons
- Application context and benefits
- Security notes and best practices
- Feature highlights
- Getting started guides

🎨 **Brand Identity**
- Candescent Win Room Dashboard branding
- Consistent visual style
- Professional footer
- Security-conscious messaging

## How to Apply in Supabase

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. You'll see different template types

### Step 2: Update Each Template

#### For Magic Link (Sign In)

1. Select "Magic Link" template
2. Click "Edit"
3. Replace the entire HTML with content from `magic-link.html`
4. Click "Save"

#### For Confirm Signup

1. Select "Confirm signup" template
2. Click "Edit"
3. Replace with content from `confirm-signup.html`
4. Click "Save"

#### For Reset Password

1. Select "Reset Password" template
2. Click "Edit"
3. Replace with content from `reset-password.html`
4. Click "Save"

#### For Invite User

1. Select "Invite user" template
2. Click "Edit"
3. Replace with content from `invite-user.html`
4. Click "Save"

## Template Variables

Supabase provides these variables that are automatically replaced:

| Variable | Description | Used In |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | The action link | All templates |
| `{{ .Token }}` | Verification token | All templates |
| `{{ .TokenHash }}` | Token hash | All templates |
| `{{ .SiteURL }}` | Your site URL | All templates |
| `{{ .Email }}` | User's email | All templates |

These are already integrated in the templates - no changes needed!

## Testing

### Send Test Email

In Supabase Dashboard:
1. Go to Authentication → Email Templates
2. Select a template
3. Click "Send test email"
4. Enter your email
5. Check your inbox

### What to Verify

- ✅ Emails arrive (check spam folder)
- ✅ Links work and redirect properly
- ✅ Styling displays correctly
- ✅ Mobile rendering looks good
- ✅ All content is readable

## Customization

### Colors

Current color scheme:
- **Primary Blue**: `#3b82f6` (Sign In)
- **Success Green**: `#10b981` (Confirm Signup)
- **Warning Red**: `#ef4444` (Reset Password)
- **Purple**: `#8b5cf6` (Invite)

To change, find and replace hex codes in templates.

### Branding

Update these sections:
- **Company Name**: "Candescent Win Room Dashboard"
- **Tagline**: "Customer Success Management Platform"
- **Logo**: Add `<img>` tag in header
- **Footer**: Update copyright and links

### Content

Modify:
- **Feature lists**: Add/remove bullet points
- **Call-to-actions**: Change button text
- **Security notes**: Adjust messaging
- **Instructions**: Customize steps

## Best Practices

✅ **Keep it concise** - Users scan, don't read  
✅ **Clear CTA** - One primary action  
✅ **Mobile-first** - Most users check on phones  
✅ **Security-conscious** - Mention expiry and safety  
✅ **Brand consistent** - Match your app's design  

## Troubleshooting

### Links Don't Work

**Issue**: `{{ .ConfirmationURL }}` not being replaced

**Fix**: 
- Make sure you're editing in Supabase Dashboard
- Don't test locally (variables only work in Supabase)
- Use "Send test email" feature

### Styling Issues

**Issue**: Emails look plain in some clients

**Fix**:
- Use inline CSS (already done)
- Test in multiple email clients
- Keep layout simple (tables, no flex/grid)

### Emails Go to Spam

**Fix**:
- Configure SPF/DKIM in Supabase settings
- Use custom domain for emails
- Avoid spam trigger words

## Support

For Supabase email configuration help:
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/auth-smtp

---

*Templates designed for Candescent Win Room Dashboard*  
*Compatible with Supabase Auth*
