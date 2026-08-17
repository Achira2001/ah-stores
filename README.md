
# Create a comprehensive setup instructions file
setup_instructions = '''# AH Store - Setup Instructions

## Quick Start Guide

### Step 1: Create Project
```bash
npx create-next-app@latest ah-store --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ah-store
```

### Step 2: Install All Dependencies
```bash
npm install mongoose next-auth@beta bcryptjs jsonwebtoken nodemailer cloudinary stripe react-hot-toast lucide-react zod
npm install -D @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/node @types/react @types/react-dom
```

### Step 3: Setup Environment Variables
Create `.env.local` in project root and fill in your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ah-store
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters-long

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM=AH Store <your-email@gmail.com>

STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key

ADMIN_SECRET_CODE=Admin12345
```

### Step 4: Create All Files
Use the code from the provided bundles to create each file in the correct location.

### Step 5: Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## External Service Setup

### MongoDB Atlas
1. Create account at mongodb.com
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist your IP (or 0.0.0.0/0 for all)
5. Copy connection string to MONGODB_URI

### Google OAuth
1. Go to Google Cloud Console
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google
6. Copy Client ID and Secret

### Cloudinary
1. Create account at cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret

### Gmail SMTP (for emails)
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password
3. Use that as SMTP_PASSWORD

### Stripe
1. Create account at stripe.com
2. Get test keys from Developers > API Keys
3. For webhooks, use Stripe CLI or set up endpoint

---

## Project File Structure (Complete)

```
ah-store/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── checkout/route.ts
│   │   ├── forgot-password/route.ts
│   │   ├── notifications/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── reset-password/route.ts
│   │   ├── signup/route.ts
│   │   ├── upload/route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── change-password/route.ts
│   │   └── verify-email/route.ts
│   ├── (admin)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── orders/
│   │       │   └── page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   └── add/
│   │       │       └── page.tsx
│   │       └── users/
│   │           └── page.tsx
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (shop)/
│   │   ├── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── loading.tsx
├── components/
│   ├── CategoryFilter.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── NotificationBell.tsx
│   ├── ProductCard.tsx
│   └── SortDropdown.tsx
├── context/
│   └── CartContext.tsx
├── lib/
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── mail.ts
│   ├── mongodb.ts
│   └── utils.ts
├── models/
│   ├── Notification.ts
│   ├── Order.ts
│   ├── Product.ts
│   └── User.ts
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.js
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## Features Checklist

### Authentication
- [x] Customer registration with email verification
- [x] Customer login with email/password
- [x] Google OAuth (customers only)
- [x] Admin registration with secret code (Admin12345)
- [x] Forgot password via email
- [x] Reset password with JWT token
- [x] Email verification with JWT token
- [x] Role-based access control
- [x] Protected routes with middleware

### Products
- [x] Admin add product with image upload
- [x] Admin update product
- [x] Admin delete product
- [x] Product categories
- [x] COD availability toggle per product
- [x] Featured products
- [x] Stock management
- [x] Compare price / discount display

### Shopping
- [x] Product listing with pagination
- [x] Category filtering
- [x] Price sorting (low/high)
- [x] Name sorting (A-Z/Z-A)
- [x] Product search
- [x] Product detail page
- [x] Image gallery
- [x] Add to cart
- [x] Cart quantity management
- [x] Remove from cart
- [x] Cart persistence (localStorage)

### Checkout
- [x] Shipping address form
- [x] Cash on Delivery option
- [x] Card payment via Stripe
- [x] COD availability validation
- [x] Order confirmation email
- [x] Stock deduction on order

### Admin Dashboard
- [x] Dashboard statistics
- [x] Product management (CRUD)
- [x] Order management with status updates
- [x] User management
- [x] Real-time notifications

### Customer Profile
- [x] View profile details
- [x] Update personal info
- [x] Upload profile image
- [x] View order history
- [x] Change password
- [x] Notification center

### Notifications
- [x] Order notifications for customers
- [x] New order notifications for admins
- [x] Order status update notifications
- [x] Unread count badge
- [x] Mark as read functionality

---

## Important Notes

1. **Image Uploads**: Uses Cloudinary for production-ready image storage. Images are automatically optimized.

2. **Payments**: Stripe is configured for test mode. Switch to live keys for production.

3. **Email**: Gmail SMTP is used. For production, consider SendGrid or AWS SES.

4. **Security**: 
   - Passwords are hashed with bcrypt (12 rounds)
   - JWT tokens for email verification and password reset
   - NextAuth.js handles session security
   - Middleware protects admin routes

5. **Database**: MongoDB with Mongoose ODM. Indexes are set up for performance.

6. **Responsive**: All pages are mobile-responsive using Tailwind CSS.

---

## Production Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Update environment variables in Vercel dashboard with production values.

---

## Troubleshooting

**MongoDB Connection Error**: Check MONGODB_URI format and network access settings.

**Email Not Sending**: Verify SMTP credentials and enable "Less secure app access" or use App Password.

**Google OAuth Error**: Ensure redirect URI matches exactly in Google Console.

**Image Upload Fails**: Check Cloudinary credentials and upload preset settings.

**Stripe Payment Fails**: Verify you're using test keys and Stripe CLI for webhooks locally.

---

## Support
For issues or questions, check:
- Next.js docs: https://nextjs.org/docs
- NextAuth docs: https://authjs.dev
- MongoDB docs: https://docs.mongodb.com
- Stripe docs: https://stripe.com/docs

---

Built with for AH Store Sri Lanka
'''

with open('/mnt/agents/output/10-SETUP-INSTRUCTIONS.txt', 'w', encoding='utf-8') as f:
    f.write(setup_instructions)

print("Setup instructions created!")
print("\n=== ALL FILES CREATED ===")
print("1. AH-Store-Complete-Guide.md - Project overview & documentation")
print("2. 01-config-files.txt - package.json, next.config.js, tailwind.config.ts, middleware.ts, .env.example")
print("3. 02-lib-and-models.txt - Database connection, auth, cloudinary, mail, utils + all Mongoose models")
print("4. 03-api-routes.txt - All API endpoints (auth, products, users, orders, notifications, checkout)")
print("5. 04-pages-components-part1.txt - Layout, context, Navbar, Footer, Hero, ProductCard, filters")
print("6. 05-pages-components-part2.txt - Homepage, product listing, product detail")
print("7. 06-auth-pages.txt - Login, signup, forgot-password, reset-password")
print("8. 07-shop-pages.txt - Cart, checkout, profile")
print("9. 08-admin-pages.txt - Dashboard, products, orders, users management")
print("10. 09-remaining-files.txt - Types, verify-email, checkout success, orders page")
print("11. 10-SETUP-INSTRUCTIONS.txt - Complete setup guide")
