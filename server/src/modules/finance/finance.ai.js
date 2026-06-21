/**
 * Finance AI — Gemini-powered financial intelligence.
 * Handles: transaction parsing, CFO insights, spend personality,
 * leak detection, savings opportunities, weekly challenges,
 * wealth plans, and risk alerts.
 */
import { GoogleGenAI } from '@google/genai';

class FinanceAI {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.model = 'gemini-2.5-flash';
  }

  async _generate(prompt) {
    if (!this.client) return null;
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error('FinanceAI error:', error.message);
      return null;
    }
  }

  // ══════════════════════════════════════════════
  // SMART TRANSACTION PARSING
  // ══════════════════════════════════════════════

  async parseTransaction(text) {
    const prompt = `You are a financial transaction parser. Extract structured transaction data from natural language input.

INPUT: "${text}"

Return a JSON object with these fields:
{
  "amount": <number - the monetary amount>,
  "category": <string - one of: "Food & Dining", "Groceries", "Rent & Mortgage", "Transport", "Fuel", "Shopping", "Subscriptions", "Health & Fitness", "Education", "Entertainment", "Bills & Utilities", "Travel", "Personal Care", "Family & Kids", "Pets", "Gifts & Donations", "Insurance", "Taxes", "Debt Payment", "Other Expense", "Salary", "Freelance", "Investments", "Business", "Gifts Received", "Refunds", "Side Hustle", "Other Income">,
  "merchant": <string or null - the store/brand/service name if mentioned>,
  "type": <"INCOME" or "EXPENSE" - determine from context>,
  "necessityLevel": <"ESSENTIAL", "COMFORTABLE", "LUXURY", or "WASTEFUL" - judge from context>,
  "mood": <"NECESSARY", "HAPPY", "REGRET", or "NEUTRAL" - judge from context. For uber/taxi, it's usually NEUTRAL or NECESSARY>,
  "tags": <array of short strings describing the transaction, max 2 items>,
  "paymentMethod": <"UPI", "Cash", "Card", "Bank", or null - if mentioned>,
  "description": <string - a clean one-line description of the transaction>
}

Rules:
- If amount is not mentioned, set to 0
- If type is ambiguous, default to EXPENSE
- If necessity is unclear, default to COMFORTABLE
- For food-related, use "Food & Dining" category
- For salary/income keywords, use type INCOME
- Extract merchant names when possible (Swiggy, Amazon, Netflix, etc.)
- Tags should be short, lowercase keywords`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // AI CFO INSIGHT
  // ══════════════════════════════════════════════

  async generateCFOInsight(financeData) {
    const prompt = `You are an AI Chief Financial Officer for a personal finance app. Analyze the user's financial data and provide a personalized, actionable recommendation.

USER FINANCIAL DATA:
- Monthly Income: ${financeData.monthlyIncome}
- Monthly Expenses: ${financeData.monthlyExpenses}
- Net Savings: ${financeData.monthlySavings}
- Savings Rate: ${financeData.savingsRate}%
- Top Expense Categories: ${JSON.stringify(financeData.topCategories || [])}
- Total Debt: ${financeData.totalDebt}
- Emergency Fund: ${financeData.emergencyFund}
- Active Subscriptions: ${financeData.subscriptionCount}
- Subscription Load: ${financeData.subscriptionLoad}/month
- Freedom Score: ${financeData.freedomScore}/100
- Active Goals: ${financeData.goalCount}
- Money Streaks: ${JSON.stringify(financeData.streaks || [])}

Return JSON:
{
  "title": "<catchy 5-8 word title with emoji>",
  "summary": "<2-3 sentence personalized insight>",
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "actionItems": ["<specific action 1>", "<specific action 2>"],
  "confidenceScore": <0-100 based on data completeness>
}

Be specific with numbers. Reference actual categories and amounts. Be encouraging but honest.`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // SPEND PERSONALITY
  // ══════════════════════════════════════════════

  async analyzeSpendPersonality(transactions) {
    const summary = this._summarizeTransactions(transactions);

    const prompt = `You are a behavioral finance analyst. Analyze this user's spending pattern from the last 30 days and determine their spend personality.

SPENDING DATA:
- Total transactions: ${summary.count}
- Total spent: ${summary.totalExpense}
- Total income: ${summary.totalIncome}
- Category breakdown: ${JSON.stringify(summary.categories)}
- Average transaction: ${summary.avgTransaction}
- Largest single expense: ${summary.maxExpense}
- Most frequent category: ${summary.topCategory}
- Recurring transaction count: ${summary.recurringCount}

Return JSON:
{
  "type": "<one of: disciplined_saver, impulse_spender, balanced_spender, food_heavy, subscription_heavy, investment_focused>",
  "label": "<human-friendly label like 'Balanced Spender'>",
  "scores": {
    "budgetControl": <0-100>,
    "impulseControl": <0-100>,
    "savingsConsistency": <0-100>,
    "planningScore": <0-100>,
    "subscriptionAwareness": <0-100>
  },
  "description": "<2 sentences describing their personality>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // LEAK DETECTION
  // ══════════════════════════════════════════════

  async detectLeaks(transactions) {
    const summary = this._summarizeTransactions(transactions);

    const prompt = `You are a financial waste analyst. Identify spending leaks — unnecessary, avoidable, or excessive spending patterns.

SPENDING DATA (last 30 days):
- Category breakdown: ${JSON.stringify(summary.categories)}
- Merchant frequency: ${JSON.stringify(summary.merchants)}
- Recurring patterns: ${summary.recurringCount} potential subscriptions
- Total spent: ${summary.totalExpense}

LEAK CATEGORIES TO CHECK:
1. Food delivery (Swiggy, Zomato, UberEats) — high frequency, low value
2. Subscriptions — multiple unused streaming/software
3. Impulse shopping — frequent small purchases at Amazon, Flipkart
4. Unnecessary convenience spending

Return JSON:
{
  "leaks": [
    {
      "category": "<leak category>",
      "amount": <total leaked in this category>,
      "percentage": <% of total expenses>,
      "description": "<brief explanation>",
      "icon": "<emoji>"
    }
  ],
  "totalLeaks": <sum of all leaks>,
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>"]
}

Only include genuine leaks. If spending looks healthy, return fewer or zero leaks.`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // SAVINGS OPPORTUNITIES
  // ══════════════════════════════════════════════

  async findSavingsOpportunities(financeData) {
    const prompt = `You are a personal finance optimizer. Find concrete savings opportunities based on the user's financial data.

DATA:
- Monthly Income: ${financeData.monthlyIncome}
- Monthly Expenses: ${financeData.monthlyExpenses}
- Top Categories: ${JSON.stringify(financeData.topCategories || [])}
- Subscriptions: ${financeData.subscriptionCount} active (${financeData.subscriptionLoad}/month)
- Food spending: ${financeData.foodSpending}/month
- Shopping spending: ${financeData.shoppingSpending}/month
- EMI/Debt payments: ${financeData.emiPayments}/month

Return JSON:
{
  "opportunities": [
    {
      "title": "<short action title>",
      "potentialSavings": <monthly savings amount>,
      "impact": "<high/medium/low>",
      "description": "<1-2 sentence explanation>",
      "icon": "<emoji>"
    }
  ],
  "totalPotentialSavings": <sum of all potential savings>,
  "percentageOfIncome": <potential savings as % of income>
}

Be realistic. Base suggestions on actual data. Max 5 opportunities.`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // WEEKLY CHALLENGES
  // ══════════════════════════════════════════════

  async generateWeeklyChallenges(financeData) {
    const prompt = `You are a gamification designer for a personal finance app. Create 3 weekly money challenges that are achievable and rewarding.

USER CONTEXT:
- Average daily spend: ${financeData.avgDailySpend}
- Top expense category: ${financeData.topCategory}
- Current savings rate: ${financeData.savingsRate}%
- Biggest weakness: ${financeData.weakness || 'food delivery'}

Return JSON:
{
  "challenges": [
    {
      "title": "<catchy challenge title with emoji>",
      "description": "<1 sentence description>",
      "xpReward": <50-100>,
      "target": <number - times to complete>,
      "metric": "<what to track: no_spend_days, saved_amount, cooked_meals>"
    }
  ]
}

Make challenges specific, fun, and achievable within a week. One should be easy, one medium, one harder.`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // AI WEALTH PLAN
  // ══════════════════════════════════════════════

  async generateWealthPlan(financeData) {
    const prompt = `You are an AI wealth advisor. Create a personalized monthly wealth plan with 4 specific actions.

USER DATA:
- Monthly Income: ${financeData.monthlyIncome}
- Monthly Expenses: ${financeData.monthlyExpenses}
- Savings: ${financeData.monthlySavings}
- Emergency Fund: ${financeData.emergencyFund}
- Total Debt: ${financeData.totalDebt}
- Active Subscriptions: ${financeData.subscriptionCount} (${financeData.subscriptionLoad}/month)
- Active Goals: ${JSON.stringify(financeData.goals || [])}
- Freedom Score: ${financeData.freedomScore}/100

Return JSON:
{
  "actions": [
    {
      "title": "<action title>",
      "description": "<specific instruction with amounts>",
      "impact": "<high/medium/low>",
      "category": "<savings/debt/investment/subscription/emergency>",
      "icon": "<emoji>"
    }
  ],
  "potentialImpact": {
    "monthly": <total monthly improvement>,
    "yearly": <total yearly improvement>
  }
}

Be specific with amounts. Reference their actual data. 4 actions max.`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // RISK ALERTS
  // ══════════════════════════════════════════════

  async generateRiskAlerts(protectionData) {
    const prompt = `You are a financial risk analyst. Identify financial risks and vulnerabilities.

PROTECTION DATA:
- Emergency Fund: ${protectionData.emergencyFund} (${protectionData.emergencyMonths} months covered)
- Total Debt: ${protectionData.totalDebt}
- Monthly Income: ${protectionData.monthlyIncome}
- Debt-to-Income: ${protectionData.dtiRatio}%
- Active Insurance: ${protectionData.insuranceCount} policies
- Subscription Load: ${protectionData.subscriptionLoad}/month
- Credit Utilization: ${protectionData.creditUtilization || 'unknown'}%
- Bills Overdue: ${protectionData.overdueCount}

Return JSON:
{
  "alerts": [
    {
      "title": "<alert title>",
      "description": "<1-2 sentence explanation>",
      "severity": "<high/medium/low>",
      "recommendation": "<specific action to take>",
      "icon": "<emoji>"
    }
  ]
}

Only include genuine risks. Order by severity (high first). Max 5 alerts.`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  _summarizeTransactions(transactions) {
    const categories = {};
    const merchants = {};
    let totalExpense = 0, totalIncome = 0, maxExpense = 0, recurringCount = 0;

    for (const t of transactions) {
      const amt = parseFloat(t.amount);
      if (t.type === 'INCOME') totalIncome += amt;
      else {
        totalExpense += amt;
        if (amt > maxExpense) maxExpense = amt;
      }

      if (t.category) categories[t.category] = (categories[t.category] || 0) + amt;
      if (t.merchant) merchants[t.merchant] = (merchants[t.merchant] || 0) + 1;
      if (t.isRecurring || t.isSubscriptionCandidate) recurringCount++;
    }

    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }));

    const sortedMerchants = Object.entries(merchants)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      count: transactions.length,
      totalExpense: Math.round(totalExpense * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      categories: sortedCategories,
      merchants: sortedMerchants,
      avgTransaction: transactions.length > 0 ? Math.round((totalExpense / transactions.length) * 100) / 100 : 0,
      maxExpense: Math.round(maxExpense * 100) / 100,
      topCategory: sortedCategories[0]?.name || 'None',
      recurringCount,
    };
  }
}

export const financeAI = new FinanceAI();
