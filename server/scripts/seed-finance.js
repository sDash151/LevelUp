import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Configuration
const SEED_MONTHS = 6;
const USER_EMAIL = 'admin@levelup.com'; // Adjust if needed, or we'll fetch the first user

// Data Banks for Realistic Randomization
const MERCHANTS = {
  FOOD: ['Swiggy', 'Zomato', 'Starbucks', 'Third Wave Coffee', 'Burger King', 'McDonalds', 'Dominos', 'Taco Bell', 'Local Cafe', 'FreshMenu'],
  TRANSPORT: ['Uber', 'Ola', 'Rapido', 'Namma Metro', 'IRCTC', 'Indian Oil', 'Shell', 'Bharat Petroleum', 'Indigo', 'MakeMyTrip'],
  SHOPPING: ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'H&M', 'Zara', 'Reliance Digital', 'Croma', 'IKEA', 'Decathlon'],
  GROCERIES: ['Blinkit', 'Zepto', 'Instamart', 'BigBasket', 'Nature\'s Basket', 'Local Supermarket', 'D-Mart'],
  ENTERTAINMENT: ['BookMyShow', 'PVR', 'INOX', 'Steam', 'PlayStation Store', 'Spotify', 'Netflix', 'Disney+', 'Gaming Arcade', 'Live Concert'],
  UTILITIES: ['BESCOM', 'Jio', 'Airtel', 'Act Fibernet', 'Water Bill', 'Gas Pipeline'],
  INCOME: ['Tech Corp Ltd', 'Freelance Client A', 'Freelance Client B', 'Upwork', 'Stock Dividend', 'Interest Credit']
};

const RANDOM_NOTES = [
  "Split with friends", "Treated myself", "Essential purchase", "A bit expensive but worth it", 
  "Monthly quota", "Unexpected expense", "Planned spending", "Weekend vibes", "", "", ""
];

// Helpers
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const roundTo = (num, nearest) => Math.round(num / nearest) * nearest;

async function main() {
  console.log('🌱 Starting Finance Module Seed...');

  // 1. Get Target User
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found! Creating a dummy user...');
    user = await prisma.user.create({
      data: { name: 'Test User', email: 'test@levelup.com', password: 'hashedpassword', baseCurrency: 'INR' }
    });
  }
  const userId = user.id;
  console.log(`👤 Using user: ${user.name} (${user.id})`);

  // 2. Clear Existing Finance Data
  console.log('🧹 Clearing existing finance data for user...');
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.budget.deleteMany({ where: { userId } });
  await prisma.financeGoal.deleteMany({ where: { userId } });
  await prisma.subscription.deleteMany({ where: { userId } });
  await prisma.debt.deleteMany({ where: { userId } });
  await prisma.insurance.deleteMany({ where: { userId } });
  await prisma.bill.deleteMany({ where: { userId } });
  await prisma.moneyStreak.deleteMany({ where: { userId } });
  await prisma.monthlyReflection.deleteMany({ where: { userId } });
  await prisma.financeAccount.deleteMany({ where: { userId } });
  await prisma.financeCategory.deleteMany({ where: { userId } });

// 3. Create Categories
  console.log('📂 Creating Categories...');
  const categories = [
    { name: 'Salary', type: 'INCOME', icon: '💼', color: '#10B981' },
    { name: 'Freelance', type: 'INCOME', icon: '💻', color: '#34D399' },
    { name: 'Dividends', type: 'INCOME', icon: '📈', color: '#8B5CF6' },
    { name: 'Food & Dining', type: 'EXPENSE', icon: '🍔', color: '#F59E0B' },
    { name: 'Groceries', type: 'EXPENSE', icon: '🛒', color: '#D97706' },
    { name: 'Transport', type: 'EXPENSE', icon: '🚗', color: '#3B82F6' },
    { name: 'Shopping', type: 'EXPENSE', icon: '🛍️', color: '#EC4899' },
    { name: 'Entertainment', type: 'EXPENSE', icon: '🎬', color: '#8B5CF6' },
    { name: 'Utilities', type: 'EXPENSE', icon: '⚡', color: '#6366F1' },
    { name: 'Rent', type: 'EXPENSE', icon: '🏠', color: '#EF4444' },
    { name: 'Health & Fitness', type: 'EXPENSE', icon: '💪', color: '#F43F5E' },
    { name: 'Learning', type: 'EXPENSE', icon: '📚', color: '#14B8A6' },
    { name: 'Software', type: 'EXPENSE', icon: '💻', color: '#0EA5E9' },
    { name: 'Certifications', type: 'EXPENSE', icon: '📜', color: '#EAB308' },
  ];

  const createdCategories = {};
  for (const cat of categories) {
    const created = await prisma.financeCategory.create({
      data: { ...cat, userId, isSystem: true }
    });
    createdCategories[cat.name] = created;
  }

  // 4. Create Accounts
  console.log('🏦 Creating Accounts...');
  const accountsData = [
    { name: 'Main Checking', type: 'cash', balance: 0, institution: 'HDFC Bank', icon: '🏦', color: '#3B82F6', isDefault: true },
    { name: 'High Yield Savings', type: 'savings', balance: 0, institution: 'SBI', icon: '💰', color: '#10B981', isDefault: false },
    { name: 'Stock Portfolio', type: 'investment', balance: 0, institution: 'Zerodha', icon: '📈', color: '#8B5CF6', isDefault: false },
    { name: 'Credit Card', type: 'debt', balance: 0, institution: 'ICICI Bank', icon: '💳', color: '#EF4444', isDefault: false },
  ];

  const createdAccounts = {};
  for (const acc of accountsData) {
    const created = await prisma.financeAccount.create({ data: { ...acc, userId } });
    createdAccounts[acc.name] = created;
  }

  // 5. Generate Transactions (Last 6 Months)
  console.log(`💸 Generating realistic transactions for the last ${SEED_MONTHS} months...`);
  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - SEED_MONTHS);

  const transactions = [];
  let accountBalances = {
    'Main Checking': 42500.50,
    'High Yield Savings': 485400.00,
    'Stock Portfolio': 824500.00,
    'Credit Card': -24500.75
  };

  const addTx = (type, amount, date, categoryName, merchantGroup, accountName, necessity, mood) => {
    const acc = createdAccounts[accountName];
    const cat = createdCategories[categoryName];
    const merchant = randomItem(MERCHANTS[merchantGroup] || ['Unknown']);
    
    if (type === 'INCOME') accountBalances[accountName] += amount;
    else if (type === 'EXPENSE') accountBalances[accountName] -= amount;

    transactions.push({
      userId,
      accountId: acc.id,
      type,
      amount,
      category: cat.name,
      description: `${cat.name} at ${merchant}`,
      merchant,
      paymentMethod: accountName === 'Credit Card' ? 'CREDIT_CARD' : 'UPI',
      necessityLevel: necessity,
      mood: mood,
      note: randomItem(RANDOM_NOTES),
      date,
      createdAt: date
    });
  };

  for (let m = 0; m <= SEED_MONTHS; m++) {
    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
    const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + m + 1, 0);
    
    addTx('INCOME', roundTo(randomAmount(85000, 95000), 100), new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), 'Salary', 'INCOME', 'Main Checking', 'ESSENTIAL', 'HAPPY');
    
    if (Math.random() > 0.4) {
      addTx('INCOME', roundTo(randomAmount(15000, 45000), 50), new Date(monthDate.getFullYear(), monthDate.getMonth(), 15), 'Freelance', 'INCOME', 'Main Checking', 'COMFORTABLE', 'HAPPY');
    }

    addTx('EXPENSE', 18500, new Date(monthDate.getFullYear(), monthDate.getMonth(), 5), 'Rent', 'UTILITIES', 'Main Checking', 'ESSENTIAL', 'NEUTRAL');
    addTx('EXPENSE', randomAmount(1200, 2500), new Date(monthDate.getFullYear(), monthDate.getMonth(), 8), 'Utilities', 'UTILITIES', 'Credit Card', 'ESSENTIAL', 'NEUTRAL');

    // Generate 60-90 txns per month for heavy data variation
    const txCount = Math.floor(Math.random() * 30) + 60;
    for (let i = 0; i < txCount; i++) {
      const txDate = randomDate(monthDate, endOfMonth);
      if (txDate > now) continue;

      const rand = Math.random();
      if (rand < 0.25) {
        addTx('EXPENSE', randomAmount(150, 1800), txDate, 'Food & Dining', 'FOOD', 'Credit Card', randomItem(['COMFORTABLE', 'LUXURY', 'WASTEFUL']), randomItem(['HAPPY', 'REGRET', 'NEUTRAL']));
      } else if (rand < 0.4) {
        addTx('EXPENSE', randomAmount(80, 600), txDate, 'Transport', 'TRANSPORT', 'Main Checking', 'ESSENTIAL', 'NEUTRAL');
      } else if (rand < 0.55) {
        addTx('EXPENSE', randomAmount(450, 3800), txDate, 'Groceries', 'GROCERIES', 'Credit Card', 'ESSENTIAL', 'NEUTRAL');
      } else if (rand < 0.70) {
        addTx('EXPENSE', randomAmount(800, 6500), txDate, 'Shopping', 'SHOPPING', 'Credit Card', randomItem(['LUXURY', 'COMFORTABLE']), randomItem(['HAPPY', 'REGRET']));
      } else if (rand < 0.80) {
        addTx('EXPENSE', randomAmount(250, 2200), txDate, 'Entertainment', 'ENTERTAINMENT', 'Credit Card', 'COMFORTABLE', 'HAPPY');
      } else if (rand < 0.88) {
        addTx('EXPENSE', randomAmount(600, 4500), txDate, 'Learning', 'SHOPPING', 'Main Checking', 'ESSENTIAL', 'HAPPY');
      } else if (rand < 0.94) {
        addTx('EXPENSE', randomAmount(300, 2900), txDate, 'Software', 'SHOPPING', 'Credit Card', 'COMFORTABLE', 'HAPPY');
      } else if (rand < 0.98) {
        addTx('EXPENSE', randomAmount(800, 3500), txDate, 'Health & Fitness', 'FOOD', 'Main Checking', 'ESSENTIAL', 'HAPPY');
      } else {
        addTx('EXPENSE', randomAmount(1500, 8500), txDate, 'Certifications', 'SHOPPING', 'Credit Card', 'ESSENTIAL', 'HAPPY');
      }
    }
    
    const transferAmount = roundTo(randomAmount(12000, 35000), 500);
    accountBalances['Main Checking'] -= transferAmount;
    accountBalances['High Yield Savings'] += transferAmount;

    // Simulate paying off a large chunk of the Credit Card from Main Checking
    // to prevent it from accumulating a massive negative balance over 6 months
    if (accountBalances['Credit Card'] < 0) {
      const ccPayment = Math.abs(accountBalances['Credit Card']) * 0.8; // Pay 80% of CC bill
      accountBalances['Main Checking'] -= ccPayment;
      accountBalances['Credit Card'] += ccPayment;
      
      transactions.push({
        userId,
        accountId: createdAccounts['Credit Card'].id,
        type: 'INCOME', // Income to CC is a payment
        amount: ccPayment,
        category: 'Salary', // Doesn't perfectly map, but works for balance logic
        description: `Credit Card Payment`,
        merchant: 'ICICI Bank',
        paymentMethod: 'UPI',
        necessityLevel: 'ESSENTIAL',
        mood: 'NEUTRAL',
        note: 'Auto-pay',
        date: endOfMonth,
        createdAt: endOfMonth
      });
    }
  }

  transactions.sort((a, b) => a.date - b.date);
  await prisma.transaction.createMany({ data: transactions });
  console.log(`✅ Created ${transactions.length} highly varied transactions`);

  for (const accName in accountBalances) {
    await prisma.financeAccount.update({
      where: { id: createdAccounts[accName].id },
      data: { balance: accountBalances[accName] }
    });
  }

  // 6. Create Budgets with variance
  console.log('📊 Creating Budgets...');
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const budgetConfigs = [
    { cat: 'Food & Dining', limit: randomAmount(8000, 10000) },
    { cat: 'Groceries', limit: randomAmount(10000, 12000) },
    { cat: 'Shopping', limit: randomAmount(4500, 6000) },
    { cat: 'Entertainment', limit: randomAmount(3000, 5000) },
    { cat: 'Transport', limit: randomAmount(2500, 4000) }
  ];

  for (const b of budgetConfigs) {
    await prisma.budget.create({
      data: {
        userId,
        categoryId: createdCategories[b.cat].id,
        monthlyLimit: roundTo(b.limit, 100),
        month: currentMonthStr
      }
    });
  }

  // 7. Create Goals (Including Opportunity Fund)
  console.log('🎯 Creating Finance Goals...');
  await prisma.financeGoal.createMany({
    data: [
      { userId, title: 'Emergency Reserve', goalType: 'EMERGENCY', targetAmount: 250000, currentAmount: 125000, icon: '🛡️', color: '#F59E0B', priority: 'HIGH' },
      { userId, title: 'Japan Trip 2027', goalType: 'TRAVEL', targetAmount: 350000, currentAmount: 45000, deadline: new Date(now.getFullYear() + 1, 5, 1), icon: '✈️', color: '#3B82F6', priority: 'MEDIUM' },
      { userId, title: 'MacBook Pro M4', goalType: 'ASSET', targetAmount: 220000, currentAmount: 85000, deadline: new Date(now.getFullYear(), now.getMonth() + 3, 1), icon: '💻', color: '#10B981', priority: 'LOW' },
      { userId, title: 'Startup Seed Fund', goalType: 'OPPORTUNITY', targetAmount: 500000, currentAmount: 110500, icon: '🎯', color: '#8B5CF6', priority: 'HIGH' },
      { userId, title: 'Index Funds VTI', goalType: 'INVESTMENT', targetAmount: 1000000, currentAmount: 420000, icon: '📈', color: '#22C55E', priority: 'MEDIUM' },
    ]
  });

  // 8. Create Subscriptions
  console.log('🔁 Creating Subscriptions...');
  await prisma.subscription.createMany({
    data: [
      { userId, merchant: 'Netflix Premium', amount: 649, cycle: 'MONTHLY', status: 'ACTIVE', category: 'Entertainment', isDetected: true },
      { userId, merchant: 'Spotify Family', amount: 179, cycle: 'MONTHLY', status: 'ACTIVE', category: 'Entertainment', isDetected: true },
      { userId, merchant: 'Amazon Prime', amount: 1499, cycle: 'YEARLY', status: 'ACTIVE', category: 'Shopping', isDetected: true },
      { userId, merchant: 'Figma Pro', amount: 1200, cycle: 'MONTHLY', status: 'ACTIVE', category: 'Software', isDetected: false },
      { userId, merchant: 'Gym Membership', amount: 1800, cycle: 'MONTHLY', status: 'ACTIVE', category: 'Health & Fitness', isDetected: true }
    ]
  });

  // 9. Create Debts
  console.log('💳 Creating Debts...');
  await prisma.debt.createMany({
    data: [
      { userId, title: 'Education Loan', type: 'loan', totalAmount: 850000, paidAmount: 320000, monthlyEmi: 12500, interestRate: 8.5, dueDay: 5 },
      { userId, title: 'Car Loan', type: 'emi', totalAmount: 450000, paidAmount: 180000, monthlyEmi: 9800, interestRate: 9.2, dueDay: 10 }
    ]
  });

  // 10. Create Insurances
  console.log('🛡️ Creating Insurances...');
  await prisma.insurance.createMany({
    data: [
      { userId, type: 'health', provider: 'Star Health', policyNumber: 'SH-98765432', premium: 14500, cycle: 'YEARLY', expiryDate: new Date(now.getFullYear() + 1, 3, 10) },
      { userId, type: 'term', provider: 'HDFC Life', policyNumber: 'HL-12345678', premium: 9200, cycle: 'YEARLY', expiryDate: new Date(now.getFullYear(), now.getMonth() + 2, 20) }
    ]
  });

  // 11. Create Upcoming Bills
  console.log('📄 Creating Bills...');
  await prisma.bill.createMany({
    data: [
      { userId, title: 'Electricity (BESCOM)', amount: randomAmount(900, 1800), dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4), category: 'Utilities', status: 'UPCOMING' },
      { userId, title: 'Broadband (JioFiber)', amount: 1178, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9), category: 'Utilities', status: 'UPCOMING' },
      { userId, title: 'Maintenance Fee', amount: 2500, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), category: 'Utilities', status: 'OVERDUE' }
    ]
  });

  // 12. Create Streaks with varying lengths
  console.log('🔥 Creating Streaks...');
  await prisma.moneyStreak.createMany({
    data: [
      { userId, streakType: 'no_spend', currentStreak: Math.floor(Math.random() * 8), bestStreak: 15 },
      { userId, streakType: 'savings', currentStreak: Math.floor(Math.random() * 20) + 5, bestStreak: 30 },
      { userId, streakType: 'budget', currentStreak: Math.floor(Math.random() * 12) + 2, bestStreak: 18 },
      { userId, streakType: 'logging', currentStreak: Math.floor(Math.random() * 45) + 10, bestStreak: 65 }
    ]
  });

  console.log('✨ Seed complete! Your LevelUp Finance module is now packed with highly varied, production-grade data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
