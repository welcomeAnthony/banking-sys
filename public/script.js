// Banking System Frontend JavaScript

class BankingApp {
    constructor() {
        this.token = localStorage.getItem('bankingToken');
        this.user = JSON.parse(localStorage.getItem('bankingUser') || 'null');
        this.accounts = [];
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        
        // Check if user is logged in
        if (this.token && this.user) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showAuth();
        }
        
        this.hideLoadingSpinner();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Auth tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Transfer forms
        document.getElementById('transferForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransfer();
        });

        document.getElementById('depositForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDeposit();
        });

        document.getElementById('withdrawForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWithdraw();
        });

        // Account management
        document.getElementById('newAccountBtn').addEventListener('click', () => {
            this.showNewAccountModal();
        });

        document.getElementById('newAccountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewAccount();
        });

        // Bill payment
        document.getElementById('billPaymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBillPayment();
        });

        // Loans
        document.getElementById('applyLoanBtn').addEventListener('click', () => {
            this.showLoanModal();
        });

        document.getElementById('loanApplicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLoanApplication();
        });

        // Investments
        document.getElementById('newInvestmentBtn').addEventListener('click', () => {
            this.showInvestmentModal();
        });

        document.getElementById('investmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInvestment();
        });

        // Transaction loading
        document.getElementById('loadTransactions').addEventListener('click', () => {
            this.loadTransactions();
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('bankingTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bankingTheme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    showLoadingSpinner() {
        document.getElementById('loadingSpinner').style.display = 'flex';
        this.isLoading = true;
    }

    hideLoadingSpinner() {
        document.getElementById('loadingSpinner').style.display = 'none';
        this.isLoading = false;
    }

    showAuth() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'grid';
        document.getElementById('userWelcome').textContent = `Welcome, ${this.user.firstName}!`;
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'accounts':
                this.loadAccounts();
                break;
            case 'transfer':
                this.loadAccountsForTransfer();
                break;
            case 'loans':
                this.loadLoans();
                break;
            case 'investments':
                this.loadInvestments();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };

        const response = await fetch(`/api${url}`, { ...defaultOptions, ...options });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    'fas fa-info-circle';
        
        messageEl.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    async handleLogin() {
        try {
            this.showLoadingSpinner();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const response = await this.makeRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            this.token = response.token;
            this.user = response.user;
            
            localStorage.setItem('bankingToken', this.token);
            localStorage.setItem('bankingUser', JSON.stringify(this.user));

            this.showMessage('Login successful!', 'success');
            this.showDashboard();
            this.loadDashboardData();
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoadingSpinner();
        }
    }

    async handleRegister() {
        try {
            this.showLoadingSpinner();
            
            const formData = {
                firstName: document.getElementById('registerFirstName').value,
                lastName: document.getElementById('registerLastName').value,
                email: document.getElementById('registerEmail').value,
                phone: document.getElementById('registerPhone').value,
                address: document.getElementById('registerAddress').value,
                password: document.getElementById('registerPassword').value
            };

            const response = await this.makeRequest('/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.token = response.token;
            this.user = response.user;
            
            localStorage.setItem('bankingToken', this.token);
            localStorage.setItem('bankingUser', JSON.stringify(this.user));

            this.showMessage('Registration successful!', 'success');
            this.showDashboard();
            this.loadDashboardData();
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoadingSpinner();
        }
    }

    handleLogout() {
        this.token = null;
        this.user = null;
        this.accounts = [];
        
        localStorage.removeItem('bankingToken');
        localStorage.removeItem('bankingUser');
        
        this.showAuth();
        this.showMessage('Logged out successfully!', 'info');
    }

    async loadDashboardData() {
        try {
            const data = await this.makeRequest('/dashboard');
            
            document.getElementById('totalBalance').textContent = this.formatCurrency(data.totalBalance);
            document.getElementById('accountsCount').textContent = data.accountsCount;
            document.getElementById('activeLoans').textContent = data.activeLoans;
            document.getElementById('totalInvestments').textContent = this.formatCurrency(data.totalInvestments);
            
            this.renderRecentTransactions(data.recentTransactions);
        } catch (error) {
            this.showMessage('Failed to load dashboard data', 'error');
        }
    }

    renderRecentTransactions(transactions) {
        const container = document.getElementById('recentTransactionsList');
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No recent transactions</h3><p>Your recent transactions will appear here</p></div>';
            return;
        }

        container.innerHTML = transactions.map(txn => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${txn.description}</h4>
                    <p>${this.formatDate(txn.timestamp)}</p>
                </div>
                <div class="transaction-amount ${txn.type}">
                    ${txn.amount >= 0 ? '+' : ''}${this.formatCurrency(txn.amount)}
                </div>
            </div>
        `).join('');
    }

    async loadAccounts() {
        try {
            this.accounts = await this.makeRequest('/accounts');
            this.renderAccounts();
        } catch (error) {
            this.showMessage('Failed to load accounts', 'error');
        }
    }

    renderAccounts() {
        const container = document.getElementById('accountsList');
        
        if (this.accounts.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-wallet"></i><h3>No accounts found</h3><p>Open your first account to get started</p></div>';
            return;
        }

        container.innerHTML = this.accounts.map(account => `
            <div class="account-card">
                <div class="account-header">
                    <span class="account-type">${account.accountType}</span>
                </div>
                <div class="account-number">Account: ****${account.accountNumber.slice(-4)}</div>
                <div class="account-balance">${this.formatCurrency(account.balance)}</div>
            </div>
        `).join('');
    }

    async loadAccountsForTransfer() {
        try {
            this.accounts = await this.makeRequest('/accounts');
            this.populateAccountSelects();
        } catch (error) {
            this.showMessage('Failed to load accounts', 'error');
        }
    }

    populateAccountSelects() {
        const selects = ['fromAccount', 'depositAccount', 'withdrawAccount', 'billAccount', 'transactionAccount'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Account</option>' +
                    this.accounts.map(account => 
                        `<option value="${account.id}">${account.accountType.toUpperCase()} - ****${account.accountNumber.slice(-4)} (${this.formatCurrency(account.balance)})</option>`
                    ).join('');
            }
        });
    }

    showNewAccountModal() {
        document.getElementById('newAccountModal').classList.add('active');
    }

    closeNewAccountModal() {
        document.getElementById('newAccountModal').classList.remove('active');
        document.getElementById('newAccountForm').reset();
    }

    async handleNewAccount() {
        try {
            const accountType = document.getElementById('newAccountType').value;
            
            await this.makeRequest('/accounts', {
                method: 'POST',
                body: JSON.stringify({ accountType })
            });

            this.showMessage('Account created successfully!', 'success');
            this.closeNewAccountModal();
            this.loadAccounts();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleTransfer() {
        try {
            const formData = {
                fromAccountId: document.getElementById('fromAccount').value,
                toAccountNumber: document.getElementById('toAccount').value,
                amount: parseFloat(document.getElementById('transferAmount').value),
                description: document.getElementById('transferDescription').value
            };

            await this.makeRequest('/transfer', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.showMessage('Transfer completed successfully!', 'success');
            document.getElementById('transferForm').reset();
            this.loadAccountsForTransfer();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleDeposit() {
        try {
            const formData = {
                accountId: document.getElementById('depositAccount').value,
                amount: parseFloat(document.getElementById('depositAmount').value),
                description: document.getElementById('depositDescription').value
            };

            await this.makeRequest('/deposit', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.showMessage('Deposit completed successfully!', 'success');
            document.getElementById('depositForm').reset();
            this.loadAccountsForTransfer();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleWithdraw() {
        try {
            const formData = {
                accountId: document.getElementById('withdrawAccount').value,
                amount: parseFloat(document.getElementById('withdrawAmount').value),
                description: document.getElementById('withdrawDescription').value
            };

            await this.makeRequest('/withdraw', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.showMessage('Withdrawal completed successfully!', 'success');
            document.getElementById('withdrawForm').reset();
            this.loadAccountsForTransfer();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async loadTransactions() {
        try {
            const accountId = document.getElementById('transactionAccount').value;
            
            if (!accountId) {
                this.showMessage('Please select an account', 'error');
                return;
            }

            const transactions = await this.makeRequest(`/transactions/${accountId}`);
            this.renderTransactionsTable(transactions);
        } catch (error) {
            this.showMessage('Failed to load transactions', 'error');
        }
    }

    renderTransactionsTable(transactions) {
        const container = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No transactions found</h3><p>No transactions found for this account</p></div>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(txn => `
                        <tr>
                            <td>${this.formatDate(txn.timestamp)}</td>
                            <td>${txn.description}</td>
                            <td><span class="transaction-type ${txn.type}">${txn.type.toUpperCase()}</span></td>
                            <td class="transaction-amount ${txn.type}">
                                ${txn.amount >= 0 ? '+' : ''}${this.formatCurrency(txn.amount)}
                            </td>
                            <td>${this.formatCurrency(txn.balance)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async handleBillPayment() {
        try {
            const formData = {
                accountId: document.getElementById('billAccount').value,
                billType: document.getElementById('billType').value,
                amount: parseFloat(document.getElementById('billAmount').value),
                billerName: document.getElementById('billerName').value,
                billNumber: document.getElementById('billNumber').value
            };

            await this.makeRequest('/bills/pay', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.showMessage('Bill payment completed successfully!', 'success');
            document.getElementById('billPaymentForm').reset();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    showLoanModal() {
        document.getElementById('loanModal').classList.add('active');
    }

    closeLoanModal() {
        document.getElementById('loanModal').classList.remove('active');
        document.getElementById('loanApplicationForm').reset();
    }

    async handleLoanApplication() {
        try {
            const formData = {
                loanType: document.getElementById('loanType').value,
                amount: parseFloat(document.getElementById('loanAmount').value),
                purpose: document.getElementById('loanPurpose').value,
                income: parseFloat(document.getElementById('loanIncome').value),
                employment: document.getElementById('loanEmployment').value
            };

            await this.makeRequest('/loans/apply', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.showMessage('Loan application submitted successfully!', 'success');
            this.closeLoanModal();
            this.loadLoans();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async loadLoans() {
        try {
            const loans = await this.makeRequest('/loans');
            this.renderLoans(loans);
        } catch (error) {
            this.showMessage('Failed to load loans', 'error');
        }
    }

    renderLoans(loans) {
        const container = document.getElementById('loansList');
        
        if (loans.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-hand-holding-usd"></i><h3>No loans found</h3><p>Apply for a loan to get started</p></div>';
            return;
        }

        container.innerHTML = loans.map(loan => `
            <div class="loan-card">
                <div class="loan-header">
                    <h4>${loan.loanType.replace('_', ' ').toUpperCase()} Loan</h4>
                    <span class="loan-status status-${loan.status}">${loan.status}</span>
                </div>
                <div class="loan-details">
                    <p><strong>Amount:</strong> ${this.formatCurrency(loan.amount)}</p>
                    <p><strong>Interest Rate:</strong> ${loan.interestRate}% APR</p>
                    <p><strong>Purpose:</strong> ${loan.purpose}</p>
                    <p><strong>Applied:</strong> ${this.formatDate(loan.appliedAt)}</p>
                </div>
            </div>
        `).join('');
    }

    showInvestmentModal() {
        document.getElementById('investmentModal').classList.add('active');
    }

    closeInvestmentModal() {
        document.getElementById('investmentModal').classList.remove('active');
        document.getElementById('investmentForm').reset();
    }

    async handleInvestment() {
        try {
            const formData = {
                investmentType: document.getElementById('investmentType').value,
                amount: parseFloat(document.getElementById('investmentAmount').value),
                duration: parseInt(document.getElementById('investmentDuration').value)
            };

            await this.makeRequest('/investments', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            this.showMessage('Investment created successfully!', 'success');
            this.closeInvestmentModal();
            this.loadInvestments();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async loadInvestments() {
        try {
            const investments = await this.makeRequest('/investments');
            this.renderInvestments(investments);
        } catch (error) {
            this.showMessage('Failed to load investments', 'error');
        }
    }

    renderInvestments(investments) {
        const container = document.getElementById('investmentsList');
        
        if (investments.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><h3>No investments found</h3><p>Create your first investment to get started</p></div>';
            return;
        }

        container.innerHTML = investments.map(investment => `
            <div class="investment-card">
                <div class="investment-header">
                    <h4>${investment.investmentType.replace('_', ' ').toUpperCase()}</h4>
                    <span class="investment-status status-${investment.status}">${investment.status}</span>
                </div>
                <div class="investment-details">
                    <p><strong>Amount:</strong> ${this.formatCurrency(investment.amount)}</p>
                    <p><strong>Expected Return:</strong> ${investment.expectedReturn}% annually</p>
                    <p><strong>Duration:</strong> ${investment.duration} years</p>
                    <p><strong>Invested:</strong> ${this.formatDate(investment.investedAt)}</p>
                    <p><strong>Maturity:</strong> ${this.formatDate(investment.maturityDate)}</p>
                </div>
            </div>
        `).join('');
    }

    async loadProfile() {
        try {
            const profile = await this.makeRequest('/profile');
            this.renderProfile(profile);
        } catch (error) {
            this.showMessage('Failed to load profile', 'error');
        }
    }

    renderProfile(profile) {
        const container = document.getElementById('profileInfo');
        
        container.innerHTML = `
            <div class="profile-item">
                <div class="profile-label">First Name</div>
                <div class="profile-value">${profile.firstName}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Last Name</div>
                <div class="profile-value">${profile.lastName}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Email</div>
                <div class="profile-value">${profile.email}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Phone</div>
                <div class="profile-value">${profile.phone}</div>
            </div>
            <div class="profile-item">
                <div class="profile-label">Address</div>
                <div class="profile-value">${profile.address}</div>
            </div>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Global functions for modal management
function closeNewAccountModal() {
    app.closeNewAccountModal();
}

function closeLoanModal() {
    app.closeLoanModal();
}

function closeInvestmentModal() {
    app.closeInvestmentModal();
}

// Initialize the application
const app = new BankingApp();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            // Reset forms when closing modals
            if (modal.id === 'loanModal') {
                document.getElementById('loanApplicationForm').reset();
            } else if (modal.id === 'newAccountModal') {
                document.getElementById('newAccountForm').reset();
            } else if (modal.id === 'investmentModal') {
                document.getElementById('investmentForm').reset();
            }
        });
    }
});

// Click outside modal to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        // Reset forms when closing modals
        if (e.target.id === 'loanModal') {
            document.getElementById('loanApplicationForm').reset();
        } else if (e.target.id === 'newAccountModal') {
            document.getElementById('newAccountForm').reset();
        } else if (e.target.id === 'investmentModal') {
            document.getElementById('investmentForm').reset();
        }
    }
});

// Auto-save form data in localStorage (for better UX)
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        const formId = e.target.closest('form')?.id;
        if (formId && formId.includes('register')) {
            localStorage.setItem(`banking_form_${e.target.id}`, e.target.value);
        }
    }
});

// Restore form data on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#registerForm input, #registerForm select').forEach(input => {
        const savedValue = localStorage.getItem(`banking_form_${input.id}`);
        if (savedValue) {
            input.value = savedValue;
        }
    });
});

// Clear saved form data after successful registration
document.addEventListener('registrationSuccess', () => {
    document.querySelectorAll('#registerForm input, #registerForm select').forEach(input => {
        localStorage.removeItem(`banking_form_${input.id}`);
    });
});
