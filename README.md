# SecureBank - Banking System Web Application

A comprehensive banking system web application built with Node.js, JavaScript, and HTML featuring modern UI/UX design with dark mode support.

## 🏦 Features

### Core Banking Functions
- **User Authentication** - Secure registration and login system
- **Account Management** - Multiple account types (Checking, Savings, Business)
- **Money Transfers** - Transfer funds between accounts
- **Deposits & Withdrawals** - Cash transactions
- **Transaction History** - Complete transaction tracking
- **Bill Payments** - Pay various types of bills
- **Loan Applications** - Apply for personal, home, and auto loans
- **Investment Portfolio** - Invest in various financial instruments

### UI/UX Features
- **Dark/Light Mode Toggle** - Seamless theme switching
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Intuitive Navigation** - Easy-to-use sidebar navigation
- **Real-time Updates** - Live balance and transaction updates
- **Interactive Dashboard** - Comprehensive financial overview
- **Modern Card-based Layout** - Clean and organized interface

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - Additional security headers
- **Balance Validation** - Prevents operations exceeding account balance
- **Same-Account Transfer Prevention** - Blocks transfers to the same account
- **Investment Account Validation** - Ensures sufficient funds before investment

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd "e:\Prongs Project\banking-sys"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

5. **Login with admin credentials**
   - Email: `admin@gmail.com`
   - Password: `admin`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 📱 How to Use

### Getting Started
1. **Register** - Create a new account with your personal information
2. **Login** - Access your account with email and password
3. **Dashboard** - View your financial overview

### Banking Operations

#### Account Management
- View all your accounts
- Open new accounts (Checking, Savings, Business)
- Monitor account balances

#### Transfers & Transactions
- **Transfer Money** - Send money to other accounts with balance validation
- **Same-Account Prevention** - System prevents transfers to the same account
- **Deposit Cash** - Add money to your accounts
- **Withdraw Cash** - Remove money from your accounts (with balance checks)
- **View History** - See all your transactions with detailed records

#### Bill Payments
- Pay electricity, water, gas, internet, phone bills
- Pay credit card and insurance bills
- Track payment history

#### Loans
- Apply for personal loans (8.5% APR)
- Apply for home loans (6.2% APR)
- Apply for auto loans (4.8% APR)
- Track loan applications and status

#### Investments
- **Account-Based Investments** - Select specific accounts for investments
- **Balance Validation** - Ensures sufficient funds before investment
- **Fixed Deposits** (5.5% annually)
- **Mutual Funds** (12.0% annually)
- **Stocks** (15.0% annually)
- **Bonds** (7.0% annually)
- **Transaction Records** - All investments create transaction history

### Theme Switching
- Click the theme toggle button (🌙/☀️) in the top-right corner
- Seamlessly switch between dark and light modes
- Your preference is automatically saved

## 🏗️ Project Structure

```
banking-sys/
├── server.js              # Main server file with all API endpoints
├── package.json           # Project dependencies and scripts
├── public/                # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS with dark/light theme support
│   └── script.js          # Frontend JavaScript application
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Accounts
- `GET /api/accounts` - Get user accounts
- `POST /api/accounts` - Create new account

### Transactions
- `POST /api/transfer` - Transfer money
- `POST /api/deposit` - Deposit money
- `POST /api/withdraw` - Withdraw money
- `GET /api/transactions/:accountId` - Get transaction history

### Bills
- `POST /api/bills/pay` - Pay bills

### Loans
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans` - Get user loans

### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments` - Get user investments

### Dashboard
- `GET /api/dashboard` - Get dashboard data

## 🎨 UI Theme System

The application features a comprehensive theme system:

### Light Theme
- Clean white backgrounds
- Subtle shadows and borders
- Blue primary colors
- High contrast text

### Dark Theme
- Dark slate backgrounds
- Muted colors and borders
- Same blue accents
- Light text for readability

### Theme Persistence
- Automatically saves theme preference
- Smooth transitions between themes
- Consistent styling across all components

## 🔒 Security Considerations

**Important**: This is a demonstration application. For production use:

1. **Environment Variables** - Move sensitive data to environment variables
2. **Database** - Replace in-memory storage with a real database
3. **HTTPS** - Use SSL/TLS encryption
4. **Input Validation** - Add comprehensive input validation
5. **Audit Logging** - Implement transaction logging
6. **Multi-factor Authentication** - Add 2FA for enhanced security

## 📝 Sample Data & Login

The application includes a pre-configured admin account for testing:

**Admin Login Credentials:**
- **Email**: `admin@gmail.com`
- **Password**: `admin`
- **Starting Balance**: $10,000 in checking account

You can also:
1. Register new users with the registration form
2. Create additional accounts automatically upon registration
3. Perform transactions to see the system in action
4. Test all banking features with proper balance validation

## 🌟 Features Highlights

### Advanced Banking Functions
- **Multi-account transfers** with real-time balance updates
- **Same-account transfer prevention** for data integrity
- **Comprehensive transaction tracking** with detailed history
- **Professional loan application system** with different rates
- **Investment portfolio management** with account-based funding
- **Bill payment system** supporting multiple bill types
- **Balance validation** across all financial operations

### Professional UI/UX
- **Responsive design** that works on all devices
- **Intuitive navigation** with clear section organization
- **Real-time feedback** with success/error messages
- **Loading states** for better user experience
- **Form validation** with helpful error messages

### Modern Web Technologies
- **ES6+ JavaScript** with modern syntax
- **CSS Grid and Flexbox** for responsive layouts
- **CSS Custom Properties** for theme management
- **Async/Await** for clean API handling
- **Local Storage** for client-side persistence

## 🔧 Customization

### Adding New Features
1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Add new sections in `index.html`
3. **Styling**: Update `styles.css` with new styles
4. **Logic**: Add new functions in `script.js`

### Modifying Themes
- Update CSS custom properties in `:root` and `[data-theme="dark"]`
- Colors, shadows, and spacing can be easily customized
- Add new theme variants by extending the theme system

## 🛠️ Troubleshooting

### Common Issues

**Login Problems:**
- Ensure you're using the correct admin credentials: `admin@gmail.com` / `admin`
- Check that the server is running on port 3000
- Clear browser cache if experiencing issues

**Server Won't Start:**
- Make sure port 3000 is not already in use
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires v14 or higher)

**Transfer/Investment Errors:**
- Verify sufficient account balance before transactions
- Cannot transfer to the same account (this is by design)
- Ensure you've selected a source account for investments

**Performance Issues:**
- This is an in-memory database demo - restart server to reset data
- For production, implement a proper database solution

## 📧 Support

For questions or issues, please refer to the code comments or create an issue in your project repository.

---

**SecureBank** - Your trusted digital banking partner 🏦
