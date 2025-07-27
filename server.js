const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// In-memory database (In production, use a real database)
let users = [];
let accounts = [];
let transactions = [];
let loans = [];
let investments = [];

// Utility functions
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    users.push(user);

    // Create default checking account
    const checkingAccount = {
      id: uuidv4(),
      userId: user.id,
      accountNumber: generateAccountNumber(),
      accountType: 'checking',
      balance: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    accounts.push(checkingAccount);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email && u.isActive);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address
  });
});

// Get user accounts
app.get('/api/accounts', authenticateToken, (req, res) => {
  const userAccounts = accounts.filter(acc => acc.userId === req.user.userId && acc.isActive);
  res.json(userAccounts);
});

// Create new account
app.post('/api/accounts', authenticateToken, (req, res) => {
  const { accountType } = req.body;

  if (!['checking', 'savings', 'business'].includes(accountType)) {
    return res.status(400).json({ error: 'Invalid account type' });
  }

  const newAccount = {
    id: uuidv4(),
    userId: req.user.userId,
    accountNumber: generateAccountNumber(),
    accountType,
    balance: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  res.status(201).json(newAccount);
});

// Transfer money
app.post('/api/transfer', authenticateToken, (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find source account
    const fromAccount = accounts.find(acc => acc.id === fromAccountId && acc.userId === req.user.userId);
    if (!fromAccount) {
      return res.status(404).json({ error: 'Source account not found' });
    }

    // Find destination account
    const toAccount = accounts.find(acc => acc.accountNumber === toAccountNumber);
    if (!toAccount) {
      return res.status(404).json({ error: 'Destination account not found' });
    }

    // Check sufficient balance
    if (fromAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Process transfer
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // Create transaction records
    const transactionId = generateTransactionId();

    const debitTransaction = {
      id: uuidv4(),
      transactionId,
      accountId: fromAccount.id,
      type: 'debit',
      amount: -amount,
      balance: fromAccount.balance,
      description: description || `Transfer to ${toAccountNumber}`,
      timestamp: new Date().toISOString()
    };

    const creditTransaction = {
      id: uuidv4(),
      transactionId,
      accountId: toAccount.id,
      type: 'credit',
      amount: amount,
      balance: toAccount.balance,
      description: description || `Transfer from ${fromAccount.accountNumber}`,
      timestamp: new Date().toISOString()
    };

    transactions.push(debitTransaction, creditTransaction);

    res.json({
      message: 'Transfer successful',
      transactionId,
      fromBalance: fromAccount.balance,
      toBalance: toAccount.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Transfer failed' });
  }
});

// Deposit money
app.post('/api/deposit', authenticateToken, (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.balance += amount;

    const transaction = {
      id: uuidv4(),
      transactionId: generateTransactionId(),
      accountId: account.id,
      type: 'credit',
      amount: amount,
      balance: account.balance,
      description: description || 'Cash deposit',
      timestamp: new Date().toISOString()
    };

    transactions.push(transaction);

    res.json({
      message: 'Deposit successful',
      newBalance: account.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// Withdraw money
app.post('/api/withdraw', authenticateToken, (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    account.balance -= amount;

    const transaction = {
      id: uuidv4(),
      transactionId: generateTransactionId(),
      accountId: account.id,
      type: 'debit',
      amount: -amount,
      balance: account.balance,
      description: description || 'Cash withdrawal',
      timestamp: new Date().toISOString()
    };

    transactions.push(transaction);

    res.json({
      message: 'Withdrawal successful',
      newBalance: account.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// Get transaction history
app.get('/api/transactions/:accountId', authenticateToken, (req, res) => {
  const { accountId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  // Verify account ownership
  const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const accountTransactions = transactions
    .filter(txn => txn.accountId === accountId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json(accountTransactions);
});

// Apply for loan
app.post('/api/loans/apply', authenticateToken, (req, res) => {
  try {
    const { loanType, amount, purpose, income, employment } = req.body;

    const loan = {
      id: uuidv4(),
      userId: req.user.userId,
      loanType,
      amount,
      purpose,
      income,
      employment,
      status: 'pending',
      interestRate: loanType === 'personal' ? 8.5 : loanType === 'home' ? 6.2 : 4.8,
      appliedAt: new Date().toISOString()
    };

    loans.push(loan);

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loanId: loan.id,
      loan
    });
  } catch (error) {
    res.status(500).json({ error: 'Loan application failed' });
  }
});

// Get user loans
app.get('/api/loans', authenticateToken, (req, res) => {
  const userLoans = loans.filter(loan => loan.userId === req.user.userId);
  res.json(userLoans);
});

// Investment portfolio
app.post('/api/investments', authenticateToken, (req, res) => {
  try {
    const { investmentType, amount, duration } = req.body;

    const returns = {
      'fixed_deposit': 5.5,
      'mutual_fund': 12.0,
      'stocks': 15.0,
      'bonds': 7.0
    };

    const investment = {
      id: uuidv4(),
      userId: req.user.userId,
      investmentType,
      amount,
      duration,
      expectedReturn: returns[investmentType] || 5.0,
      status: 'active',
      investedAt: new Date().toISOString(),
      maturityDate: new Date(Date.now() + duration * 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    investments.push(investment);

    res.status(201).json({
      message: 'Investment created successfully',
      investment
    });
  } catch (error) {
    res.status(500).json({ error: 'Investment creation failed' });
  }
});

// Get user investments
app.get('/api/investments', authenticateToken, (req, res) => {
  const userInvestments = investments.filter(inv => inv.userId === req.user.userId);
  res.json(userInvestments);
});

// Bill payment
app.post('/api/bills/pay', authenticateToken, (req, res) => {
  try {
    const { accountId, billType, amount, billerName, billNumber } = req.body;

    const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    account.balance -= amount;

    const transaction = {
      id: uuidv4(),
      transactionId: generateTransactionId(),
      accountId: account.id,
      type: 'debit',
      amount: -amount,
      balance: account.balance,
      description: `${billType} bill payment to ${billerName}`,
      timestamp: new Date().toISOString(),
      billDetails: {
        billType,
        billerName,
        billNumber
      }
    };

    transactions.push(transaction);

    res.json({
      message: 'Bill payment successful',
      transactionId: transaction.transactionId,
      newBalance: account.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Bill payment failed' });
  }
});

// Dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  try {
    const userAccounts = accounts.filter(acc => acc.userId === req.user.userId && acc.isActive);
    const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const recentTransactions = transactions
      .filter(txn => userAccounts.some(acc => acc.id === txn.accountId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    const userLoans = loans.filter(loan => loan.userId === req.user.userId);
    const userInvestments = investments.filter(inv => inv.userId === req.user.userId);

    res.json({
      totalBalance,
      accountsCount: userAccounts.length,
      recentTransactions,
      activeLoans: userLoans.filter(loan => loan.status === 'approved').length,
      totalInvestments: userInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Banking System Server running on port ${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});

module.exports = app;
