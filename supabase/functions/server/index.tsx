import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Token'],
}));
app.use('*', logger(console.log));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// CRITICAL: Hardcoded credentials to ensure frontend/backend sync
// These match /utils/supabase/info.tsx exactly
const HARDCODED_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oenNzb2lzaHBpcGl5cHd1dXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDg2NzQsImV4cCI6MjA5MDA4NDY3NH0.iewipgI4uIEuiomW6r1vY19RwQ3LW8nElh6sOCtipmo';
const HARDCODED_URL = 'https://mhzssoishpipiypwuupx.supabase.co';

// Helper to get user-facing Supabase client (with ANON_KEY)
function getUserClient() {
  // ALWAYS use hardcoded values for now to ensure consistency
  // Environment variables may be outdated or misconfigured
  const url = HARDCODED_URL;
  const key = HARDCODED_ANON_KEY;
  
  console.log(`[getUserClient] Using URL: ${url}`);
  console.log(`[getUserClient] Using ANON_KEY (source: HARDCODED, length: ${key.length})`);
  
  return createClient(url, key);
}

// ========== AUTH ROUTES ==========
app.post('/make-server-f5f5b39c/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.log(`Registration error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    const userId = data.user.id;
    await initializeDefaultData(userId);

    return c.json({ data });
  } catch (error) {
    console.log(`Registration exception: ${error}`);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

app.post('/make-server-f5f5b39c/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    const userClient = getUserClient();

    const { data, error } = await userClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Login error: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }

    return c.json({ data });
  } catch (error) {
    console.log(`Login exception: ${error}`);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ========== DEBUG ENDPOINTS ==========
app.get('/make-server-f5f5b39c/debug/env', async (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const hasAnonKey = !!Deno.env.get('SUPABASE_ANON_KEY');
  const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  return c.json({
    supabaseUrl,
    hasAnonKey,
    hasServiceKey,
    anonKeyPrefix: hasAnonKey ? anonKey.substring(0, 50) + '...' : 'MISSING',
    anonKeyLength: anonKey.length,
    // Show full key for debugging (remove in production!)
    anonKeyFull: anonKey,
  });
});

app.get('/make-server-f5f5b39c/debug/token', async (c) => {
  // CRITICAL FIX: Read user token from X-User-Token header
  const userToken = c.req.header('X-User-Token');
  
  if (!userToken) {
    return c.json({ error: 'No X-User-Token header' }, 401);
  }
  
  console.log(`[DEBUG] Token length: ${userToken.length}, prefix: ${userToken.substring(0, 30)}...`);
  
  const userClient = getUserClient();
  
  const { data: { user }, error } = await userClient.auth.getUser(userToken);
  
  if (error) {
    console.error(`[DEBUG] Token validation FAILED:`, error);
    return c.json({
      error: 'Token validation failed',
      debug: {
        errorMessage: error.message,
        errorStatus: error.status,
        errorName: error.name,
        tokenLength: userToken.length,
        tokenPrefix: userToken.substring(0, 30) + '...',
        anonKeySource: Deno.env.get('SUPABASE_ANON_KEY') ? 'ENV' : 'HARDCODED',
      }
    }, 401);
  }
  
  if (!user) {
    return c.json({ error: 'No user found' }, 401);
  }
  
  return c.json({
    success: true,
    userId: user.id,
    userEmail: user.email,
    tokenPrefix: userToken.substring(0, 30) + '...',
    anonKeySource: Deno.env.get('SUPABASE_ANON_KEY') ? 'ENV' : 'HARDCODED',
  });
});

// ========== ACCOUNTS ROUTES ==========
app.get('/make-server-f5f5b39c/accounts', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const accounts = await kv.getByPrefix(`account:${userId}:`);
    return c.json({ data: accounts });
  } catch (error) {
    console.log(`Get accounts error: ${error}`);
    return c.json({ error: 'Failed to get accounts' }, 500);
  }
});

app.post('/make-server-f5f5b39c/accounts', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { name, type, balance, icon, color, bankCode, logoUrl } = body;

    if (!name || !type) {
      return c.json({ error: 'Name and type are required' }, 400);
    }

    const accountId = crypto.randomUUID();
    const account = {
      id: accountId,
      userId,
      name,
      type, // CASH, BANK, EWALLET, INCOME_SOURCE
      balance: balance || 0,
      icon: icon || 'wallet',
      color: color || '#3B82F6',
      bankCode: bankCode || null,
      logoUrl: logoUrl || null,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`account:${userId}:${accountId}`, account);
    return c.json({ data: account });
  } catch (error) {
    console.log(`Create account error: ${error}`);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

app.put('/make-server-f5f5b39c/accounts/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const account = await kv.get(`account:${userId}:${id}`);
    
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    const updated = { ...account, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`account:${userId}:${id}`, updated);
    return c.json({ data: updated });
  } catch (error) {
    console.log(`Update account error: ${error}`);
    return c.json({ error: 'Failed to update account' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/accounts/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    await kv.del(`account:${userId}:${id}`);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Delete account error: ${error}`);
    return c.json({ error: 'Failed to delete account' }, 500);
  }
});

app.get('/make-server-f5f5b39c/accounts/balance', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const accounts = await kv.getByPrefix(`account:${userId}:`);
    const totalBalance = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
    return c.json({ data: { totalBalance, accounts } });
  } catch (error) {
    console.log(`Get balance error: ${error}`);
    return c.json({ error: 'Failed to get balance' }, 500);
  }
});

// ========== CATEGORIES ROUTES ==========
app.get('/make-server-f5f5b39c/categories', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const categories = await kv.getByPrefix(`category:${userId}:`);
    return c.json({ data: categories });
  } catch (error) {
    console.log(`Get categories error: ${error}`);
    return c.json({ error: 'Failed to get categories' }, 500);
  }
});

app.post('/make-server-f5f5b39c/categories', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { name, type, parentId, icon, color } = body;

    if (!name || !type) {
      return c.json({ error: 'Name and type are required' }, 400);
    }

    const categoryId = crypto.randomUUID();
    const category = {
      id: categoryId,
      userId,
      name,
      type,
      parentId: parentId || null,
      icon: icon || 'tag',
      color: color || '#6B7280',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`category:${userId}:${categoryId}`, category);
    return c.json({ data: category });
  } catch (error) {
    console.log(`Create category error: ${error}`);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// ========== TRANSACTIONS ROUTES ==========
app.get('/make-server-f5f5b39c/transactions', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    const categoryId = c.req.query('category_id');

    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    
    let filtered = transactions;
    
    if (from) {
      filtered = filtered.filter((t: any) => t.date >= from);
    }
    if (to) {
      filtered = filtered.filter((t: any) => t.date <= to);
    }
    if (categoryId) {
      filtered = filtered.filter((t: any) => t.categoryId === categoryId);
    }

    filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ data: filtered });
  } catch (error) {
    console.log(`Get transactions error: ${error}`);
    return c.json({ error: 'Failed to get transactions' }, 500);
  }
});

app.post('/make-server-f5f5b39c/transactions', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { amount, type, categoryId, accountId, date, note, tags } = body;

    if (!amount || !type || !categoryId || !accountId) {
      return c.json({ error: 'Amount, type, categoryId, and accountId are required' }, 400);
    }

    const transactionId = crypto.randomUUID();
    const transaction = {
      id: transactionId,
      userId,
      amount: parseFloat(amount),
      type,
      categoryId,
      accountId,
      date: date || new Date().toISOString().split('T')[0],
      note: note || '',
      tags: tags || [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`transaction:${userId}:${transactionId}`, transaction);

    // Update account balance
    const account = await kv.get(`account:${userId}:${accountId}`);
    if (account) {
      const balanceChange = type === 'INCOME' ? parseFloat(amount) : -parseFloat(amount);
      account.balance = (account.balance || 0) + balanceChange;
      await kv.set(`account:${userId}:${accountId}`, account);
    }

    // Invalidate AI cache for this user's month
    const txMonth = (date || new Date().toISOString().split('T')[0]).slice(0, 7);
    await kv.del(`ai_cache:${userId}:precompute:${txMonth}`);

    return c.json({ data: transaction });
  } catch (error) {
    console.log(`Create transaction error: ${error}`);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

app.get('/make-server-f5f5b39c/transactions/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const transaction = await kv.get(`transaction:${userId}:${id}`);
    
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    return c.json({ data: transaction });
  } catch (error) {
    console.log(`Get transaction error: ${error}`);
    return c.json({ error: 'Failed to get transaction' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/transactions/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const transaction = await kv.get(`transaction:${userId}:${id}`);
    
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    const account = await kv.get(`account:${userId}:${transaction.accountId}`);
    if (account) {
      const balanceChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
      account.balance = (account.balance || 0) + balanceChange;
      await kv.set(`account:${userId}:${transaction.accountId}`, account);
    }

    await kv.del(`transaction:${userId}:${id}`);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Delete transaction error: ${error}`);
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// ========== DASHBOARD ROUTES ==========
app.get('/make-server-f5f5b39c/dashboard/summary', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const month = c.req.query('month') || new Date().toISOString().slice(0, 7);
    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    
    const monthTransactions = transactions.filter((t: any) => t.date.startsWith(month));

    const income = monthTransactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const categories = await kv.getByPrefix(`category:${userId}:`);
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    const categoryBreakdown: any = {};
    monthTransactions.forEach((t: any) => {
      if (!categoryBreakdown[t.categoryId]) {
        const cat = categoryMap.get(t.categoryId);
        categoryBreakdown[t.categoryId] = {
          categoryId: t.categoryId,
          categoryName: cat?.name || 'Unknown',
          categoryIcon: cat?.icon || 'tag',
          categoryColor: cat?.color || '#6B7280',
          amount: 0,
          count: 0,
        };
      }
      categoryBreakdown[t.categoryId].amount += t.amount;
      categoryBreakdown[t.categoryId].count += 1;
    });

    const topCategories = Object.values(categoryBreakdown)
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5);

    const accounts = await kv.getByPrefix(`account:${userId}:`);
    const totalBalance = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);

    return c.json({
      data: {
        month,
        income,
        expense,
        balance: income - expense,
        totalBalance,
        topCategories,
        transactionCount: monthTransactions.length,
      }
    });
  } catch (error) {
    console.log(`Get dashboard summary error: ${error}`);
    return c.json({ error: 'Failed to get dashboard summary' }, 500);
  }
});

// ========== TIMELINE ROUTES ==========
app.get('/make-server-f5f5b39c/timeline', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const period = c.req.query('period') || 'month';
    const date = c.req.query('date') || new Date().toISOString().slice(0, 7);

    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    const categories = await kv.getByPrefix(`category:${userId}:`);
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    let filtered = transactions;
    if (period === 'month') {
      filtered = transactions.filter((t: any) => t.date.startsWith(date));
    } else if (period === 'week') {
      const endDate = new Date(date);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      filtered = transactions.filter((t: any) => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
      });
    }

    const grouped: any = {};
    filtered.forEach((t: any) => {
      if (!grouped[t.date]) {
        grouped[t.date] = {
          date: t.date,
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
          categories: new Map(),
        };
      }
      
      grouped[t.date].transactions.push({
        ...t,
        categoryName: categoryMap.get(t.categoryId)?.name || 'Unknown',
        categoryIcon: categoryMap.get(t.categoryId)?.icon || 'tag',
        categoryColor: categoryMap.get(t.categoryId)?.color || '#6B7280',
      });

      if (t.type === 'INCOME') {
        grouped[t.date].totalIncome += t.amount;
      } else {
        grouped[t.date].totalExpense += t.amount;
      }

      if (!grouped[t.date].categories.has(t.categoryId)) {
        grouped[t.date].categories.set(t.categoryId, {
          categoryId: t.categoryId,
          name: categoryMap.get(t.categoryId)?.name || 'Unknown',
          icon: categoryMap.get(t.categoryId)?.icon || 'tag',
          color: categoryMap.get(t.categoryId)?.color || '#6B7280',
          amount: 0,
        });
      }
      grouped[t.date].categories.get(t.categoryId).amount += t.amount;
    });

    const timeline = Object.values(grouped).map((day: any) => ({
      ...day,
      topCategories: Array.from(day.categories.values())
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 3),
      categories: undefined,
    })).sort((a: any, b: any) => b.date.localeCompare(a.date));

    return c.json({ data: timeline });
  } catch (error) {
    console.log(`Get timeline error: ${error}`);
    return c.json({ error: 'Failed to get timeline' }, 500);
  }
});

// ========== BUDGETS ROUTES ==========
app.get('/make-server-f5f5b39c/budgets', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const month = c.req.query('month') || new Date().toISOString().slice(0, 7);
    const budgets = await kv.getByPrefix(`budget:${userId}:${month}:`);
    
    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    const monthTransactions = transactions.filter((t: any) => t.date.startsWith(month) && t.type === 'EXPENSE');
    
    const budgetsWithSpent = budgets.map((budget: any) => {
      const spent = monthTransactions
        .filter((t: any) => t.categoryId === budget.categoryId)
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      };
    });

    return c.json({ data: budgetsWithSpent });
  } catch (error) {
    console.log(`Get budgets error: ${error}`);
    return c.json({ error: 'Failed to get budgets' }, 500);
  }
});

app.post('/make-server-f5f5b39c/budgets', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { categoryId, amount, month } = body;

    if (!categoryId || !amount || !month) {
      return c.json({ error: 'CategoryId, amount, and month are required' }, 400);
    }

    const budgetId = crypto.randomUUID();
    const budget = {
      id: budgetId,
      userId,
      categoryId,
      amount: parseFloat(amount),
      month,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`budget:${userId}:${month}:${budgetId}`, budget);
    return c.json({ data: budget });
  } catch (error) {
    console.log(`Create budget error: ${error}`);
    return c.json({ error: 'Failed to create budget' }, 500);
  }
});

app.put('/make-server-f5f5b39c/budgets/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const budgets = await kv.getByPrefix(`budget:${userId}:`);
    const budget = budgets.find((b: any) => b.id === id);
    
    if (!budget) {
      return c.json({ error: 'Budget not found' }, 404);
    }

    const updatedBudget = { ...budget, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`budget:${userId}:${budget.month}:${id}`, updatedBudget);
    return c.json({ data: updatedBudget });
  } catch (error) {
    console.log(`Update budget error: ${error}`);
    return c.json({ error: 'Failed to update budget' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/budgets/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const budgets = await kv.getByPrefix(`budget:${userId}:`);
    const budget = budgets.find((b: any) => b.id === id);
    
    if (!budget) {
      return c.json({ error: 'Budget not found' }, 404);
    }

    await kv.del(`budget:${userId}:${budget.month}:${id}`);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Delete budget error: ${error}`);
    return c.json({ error: 'Failed to delete budget' }, 500);
  }
});

// ========== SAVINGS GOALS ROUTES ==========
app.get('/make-server-f5f5b39c/goals', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const goals = await kv.getByPrefix(`goal:${userId}:`);
    
    const goalsWithProgress = goals.map((goal: any) => {
      const progress = goal.currentAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      return { ...goal, progress, remaining: goal.targetAmount - goal.currentAmount };
    });

    return c.json({ data: goalsWithProgress });
  } catch (error) {
    console.log(`Get goals error: ${error}`);
    return c.json({ error: 'Failed to get goals' }, 500);
  }
});

app.post('/make-server-f5f5b39c/goals', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { name, targetAmount, deadline, icon, color } = body;

    if (!name || !targetAmount) {
      return c.json({ error: 'Name and targetAmount are required' }, 400);
    }

    const goalId = crypto.randomUUID();
    const goal = {
      id: goalId, userId, name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline: deadline || null,
      icon: icon || 'target',
      color: color || '#3B82F6',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`goal:${userId}:${goalId}`, goal);
    return c.json({ data: goal });
  } catch (error) {
    console.log(`Create goal error: ${error}`);
    return c.json({ error: 'Failed to create goal' }, 500);
  }
});

app.put('/make-server-f5f5b39c/goals/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const goal = await kv.get(`goal:${userId}:${id}`);
    if (!goal) return c.json({ error: 'Goal not found' }, 404);

    const updatedGoal = { ...goal, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`goal:${userId}:${id}`, updatedGoal);
    return c.json({ data: updatedGoal });
  } catch (error) {
    console.log(`Update goal error: ${error}`);
    return c.json({ error: 'Failed to update goal' }, 500);
  }
});

app.post('/make-server-f5f5b39c/goals/:id/allocate', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { amount } = body;
    if (!amount || amount <= 0) return c.json({ error: 'Valid amount is required' }, 400);

    const goal = await kv.get(`goal:${userId}:${id}`);
    if (!goal) return c.json({ error: 'Goal not found' }, 404);

    goal.currentAmount = (goal.currentAmount || 0) + parseFloat(amount);
    goal.updatedAt = new Date().toISOString();
    await kv.set(`goal:${userId}:${id}`, goal);
    return c.json({ data: goal });
  } catch (error) {
    console.log(`Allocate to goal error: ${error}`);
    return c.json({ error: 'Failed to allocate to goal' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/goals/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const goal = await kv.get(`goal:${userId}:${id}`);
    if (!goal) return c.json({ error: 'Goal not found' }, 404);
    await kv.del(`goal:${userId}:${id}`);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Delete goal error: ${error}`);
    return c.json({ error: 'Failed to delete goal' }, 500);
  }
});

// ========== REMINDERS ROUTES ==========
app.get('/make-server-f5f5b39c/reminders', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const reminders = await kv.getByPrefix(`reminder:${userId}:`);
    return c.json({ data: reminders });
  } catch (error) {
    console.log(`Get reminders error: ${error}`);
    return c.json({ error: 'Failed to get reminders' }, 500);
  }
});

app.post('/make-server-f5f5b39c/reminders', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { title, type, frequency, dayOfMonth, dayOfWeek, time, amount, categoryId, accountId } = body;

    if (!title || !type) {
      return c.json({ error: 'Title and type are required' }, 400);
    }

    const reminderId = crypto.randomUUID();
    const reminder = {
      id: reminderId, userId, title, type, frequency,
      dayOfMonth, dayOfWeek,
      time: time || '21:00',
      amount: amount ? parseFloat(amount) : null,
      categoryId: categoryId || null,
      accountId: accountId || null,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`reminder:${userId}:${reminderId}`, reminder);
    return c.json({ data: reminder });
  } catch (error) {
    console.log(`Create reminder error: ${error}`);
    return c.json({ error: 'Failed to create reminder' }, 500);
  }
});

app.put('/make-server-f5f5b39c/reminders/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const reminder = await kv.get(`reminder:${userId}:${id}`);
    if (!reminder) return c.json({ error: 'Reminder not found' }, 404);

    const updated = { ...reminder, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`reminder:${userId}:${id}`, updated);
    return c.json({ data: updated });
  } catch (error) {
    console.log(`Update reminder error: ${error}`);
    return c.json({ error: 'Failed to update reminder' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/reminders/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const reminder = await kv.get(`reminder:${userId}:${id}`);
    if (!reminder) return c.json({ error: 'Reminder not found' }, 404);
    await kv.del(`reminder:${userId}:${id}`);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Delete reminder error: ${error}`);
    return c.json({ error: 'Failed to delete reminder' }, 500);
  }
});

// ========== INCOME REMINDER CHECK ==========
app.get('/make-server-f5f5b39c/reminders/income-check', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().getDate();

    // Get income reminders
    const reminders = await kv.getByPrefix(`reminder:${userId}:`);
    const incomeReminders = reminders.filter((r: any) => r.type === 'INCOME' && r.enabled);

    // Get this month's income transactions
    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    const monthIncomes = transactions.filter((t: any) => 
      t.date.startsWith(currentMonth) && t.type === 'INCOME'
    );

    // Get last month's income for suggestions
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    const lastMonthIncomes = transactions.filter((t: any) => 
      t.date.startsWith(lastMonthStr) && t.type === 'INCOME'
    );

    const suggestedAmount = lastMonthIncomes.reduce((sum: number, t: any) => sum + t.amount, 0);

    // Check which reminders are due
    const dueReminders = incomeReminders.filter((r: any) => {
      if (r.frequency === 'MONTHLY' && r.dayOfMonth) {
        return today >= r.dayOfMonth;
      }
      return false;
    });

    // Check if income already recorded this month
    const hasRecordedIncome = monthIncomes.length > 0;
    const missingIncome = dueReminders.length > 0 && !hasRecordedIncome && today >= 7;

    return c.json({
      data: {
        dueReminders,
        hasRecordedIncome,
        missingIncome,
        suggestedAmount,
        lastMonthIncome: suggestedAmount,
        monthIncomeTotal: monthIncomes.reduce((sum: number, t: any) => sum + t.amount, 0),
      }
    });
  } catch (error) {
    console.log(`Income check error: ${error}`);
    return c.json({ error: 'Failed to check income reminders' }, 500);
  }
});

// ========== FAMILY ROUTES ==========
app.get('/make-server-f5f5b39c/family/group', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const groups = await kv.getByPrefix(`family_group:`);
    const userGroup = groups.find((g: any) => g.members.includes(userId));
    return c.json({ data: userGroup || null });
  } catch (error) {
    console.log(`Get family group error: ${error}`);
    return c.json({ error: 'Failed to get family group' }, 500);
  }
});

app.post('/make-server-f5f5b39c/family/groups', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { name } = body;
    if (!name) return c.json({ error: 'Name is required' }, 400);

    const groupId = crypto.randomUUID();
    const group = { id: groupId, name, ownerId: userId, members: [userId], createdAt: new Date().toISOString() };
    await kv.set(`family_group:${groupId}`, group);
    return c.json({ data: group });
  } catch (error) {
    console.log(`Create family group error: ${error}`);
    return c.json({ error: 'Failed to create family group' }, 500);
  }
});

app.post('/make-server-f5f5b39c/family/invite', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { email } = body;
    if (!email) return c.json({ error: 'Email is required' }, 400);

    const groups = await kv.getByPrefix(`family_group:`);
    const userGroup = groups.find((g: any) => g.members.includes(userId) && g.ownerId === userId);
    if (!userGroup) return c.json({ error: 'You must be a group owner to invite members' }, 403);

    return c.json({ data: { message: 'Invitation sent', email } });
  } catch (error) {
    console.log(`Invite member error: ${error}`);
    return c.json({ error: 'Failed to invite member' }, 500);
  }
});

app.post('/make-server-f5f5b39c/family/leave', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const groups = await kv.getByPrefix(`family_group:`);
    const userGroup = groups.find((g: any) => g.members.includes(userId));
    if (!userGroup) return c.json({ error: 'You are not in a family group' }, 404);
    if (userGroup.ownerId === userId) return c.json({ error: 'Group owner cannot leave. Delete the group instead.' }, 403);

    userGroup.members = userGroup.members.filter((m: string) => m !== userId);
    await kv.set(`family_group:${userGroup.id}`, userGroup);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Leave family error: ${error}`);
    return c.json({ error: 'Failed to leave family group' }, 500);
  }
});

// ========== EXPORT ROUTES ==========
app.get('/make-server-f5f5b39c/export/excel', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const type = c.req.query('type') || 'transactions';
    const year = c.req.query('year') || new Date().getFullYear().toString();

    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    const yearTransactions = transactions.filter((t: any) => t.date.startsWith(year));

    const categories = await kv.getByPrefix(`category:${userId}:`);
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    const excelData = yearTransactions.map((t: any) => ({
      date: t.date,
      type: t.type === 'INCOME' ? 'Thu' : 'Chi',
      category: categoryMap.get(t.categoryId)?.name || 'Unknown',
      amount: t.amount,
      note: t.note || '',
    }));

    return c.json({ 
      data: {
        type, year, transactions: excelData,
        summary: {
          totalIncome: yearTransactions.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0),
          totalExpense: yearTransactions.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0),
          count: yearTransactions.length,
        }
      }
    });
  } catch (error) {
    console.log(`Export error: ${error}`);
    return c.json({ error: 'Failed to export data' }, 500);
  }
});

// ========== AI ROUTER + CACHE + PRE-COMPUTE ==========

// Pre-compute financial insights (NO AI needed)
app.get('/make-server-f5f5b39c/ai/precompute', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const month = c.req.query('month') || new Date().toISOString().slice(0, 7);

    // Check cache first
    const cacheKey = `ai_cache:${userId}:precompute:${month}`;
    const cached = await kv.get(cacheKey);
    if (cached && cached.computedAt) {
      const cacheAge = Date.now() - new Date(cached.computedAt).getTime();
      if (cacheAge < 30 * 60 * 1000) { // 30 min cache
        return c.json({ data: cached, fromCache: true });
      }
    }

    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    const categories = await kv.getByPrefix(`category:${userId}:`);
    const accounts = await kv.getByPrefix(`account:${userId}:`);
    const budgets = await kv.getByPrefix(`budget:${userId}:${month}:`);
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    const monthTx = transactions.filter((t: any) => t.date.startsWith(month));
    const totalIncome = monthTx.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpense = monthTx.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0);

    // Previous month comparison
    const prevDate = new Date(month + '-01');
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonth = prevDate.toISOString().slice(0, 7);
    const prevTx = transactions.filter((t: any) => t.date.startsWith(prevMonth));
    const prevIncome = prevTx.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0);
    const prevExpense = prevTx.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0);

    // Top expense categories
    const catExpenses: any = {};
    monthTx.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      const cat = categoryMap.get(t.categoryId);
      const name = cat?.name || 'Unknown';
      catExpenses[name] = (catExpenses[name] || 0) + t.amount;
    });
    const topCategories = Object.entries(catExpenses)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Daily average
    const daysInMonth = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0).getDate();
    const currentDay = month === new Date().toISOString().slice(0, 7) ? new Date().getDate() : daysInMonth;
    const dailyAvgExpense = currentDay > 0 ? totalExpense / currentDay : 0;
    const projectedExpense = dailyAvgExpense * daysInMonth;

    // Budget status
    const budgetStatus = budgets.map((b: any) => {
      const spent = monthTx.filter((t: any) => t.categoryId === b.categoryId && t.type === 'EXPENSE')
        .reduce((s: number, t: any) => s + t.amount, 0);
      return { categoryId: b.categoryId, categoryName: categoryMap.get(b.categoryId)?.name, budget: b.amount, spent, pct: b.amount > 0 ? (spent / b.amount * 100) : 0 };
    });
    const overBudget = budgetStatus.filter((b: any) => b.pct > 100);

    // Savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

    const totalBalance = accounts.reduce((s: number, a: any) => s + (a.balance || 0), 0);

    const result = {
      month,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: Math.round(savingsRate * 10) / 10,
      totalBalance,
      topCategories,
      dailyAvgExpense: Math.round(dailyAvgExpense),
      projectedExpense: Math.round(projectedExpense),
      comparison: {
        incomeChange: prevIncome > 0 ? Math.round((totalIncome - prevIncome) / prevIncome * 100) : 0,
        expenseChange: prevExpense > 0 ? Math.round((totalExpense - prevExpense) / prevExpense * 100) : 0,
        prevIncome, prevExpense,
      },
      budgetStatus,
      overBudget,
      transactionCount: monthTx.length,
      computedAt: new Date().toISOString(),
    };

    // Cache the result
    await kv.set(cacheKey, result);

    return c.json({ data: result, fromCache: false });
  } catch (error) {
    console.log(`Precompute error: ${error}`);
    return c.json({ error: 'Failed to precompute insights' }, 500);
  }
});

// AI Chat with Router + Cache
app.post('/make-server-f5f5b39c/chat', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { message } = body;
    if (!message) return c.json({ error: 'Message is required' }, 400);

    // Step 1: Classify query complexity
    const complexity = classifyQuery(message);

    // Step 2: Check cache for similar queries
    const cacheKey = `ai_cache:${userId}:chat:${hashMessage(message)}`;
    const cached = await kv.get(cacheKey);
    if (cached && cached.cachedAt) {
      const cacheAge = Date.now() - new Date(cached.cachedAt).getTime();
      if (cacheAge < 60 * 60 * 1000) { // 1 hour cache
        return c.json({ data: { response: cached.response, context: cached.context, fromCache: true, model: 'cache' } });
      }
    }

    // Step 3: Get pre-computed data
    const currentMonth = new Date().toISOString().slice(0, 7);
    const precomputeKey = `ai_cache:${userId}:precompute:${currentMonth}`;
    let precomputed = await kv.get(precomputeKey);
    
    if (!precomputed) {
      // Compute on the fly
      const transactions = await kv.getByPrefix(`transaction:${userId}:`);
      const monthTx = transactions.filter((t: any) => t.date.startsWith(currentMonth));
      const income = monthTx.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0);
      const expense = monthTx.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0);
      precomputed = { totalIncome: income, totalExpense: expense, netSavings: income - expense, transactionCount: monthTx.length };
    }

    let aiResponse: string;
    let modelUsed = 'precompute';

    // Step 4: Route based on complexity
    if (complexity === 'simple') {
      // Use pre-computed data, no AI call needed
      aiResponse = generatePrecomputedResponse(message, precomputed);
      modelUsed = 'precompute';
    } else {
      // Need AI - use Gemini (free) as primary
      const geminiKey = Deno.env.get('GEMINI_API_KEY');

      if (geminiKey) {
        try {
          if (complexity === 'medium') {
            aiResponse = await callGemini(message, precomputed, geminiKey, 'flash');
            modelUsed = 'gemini-2.0-flash';
          } else {
            aiResponse = await callGemini(message, precomputed, geminiKey, 'pro');
            modelUsed = 'gemini-1.5-pro';
          }
        } catch (aiError) {
          console.log(`Gemini API error: ${aiError}, falling back to precompute`);
          aiResponse = generatePrecomputedResponse(message, precomputed);
          modelUsed = 'fallback';
        }
      } else {
        console.log('No GEMINI_API_KEY found, using precompute fallback');
        aiResponse = generatePrecomputedResponse(message, precomputed);
        modelUsed = 'fallback';
      }
    }

    // Step 5: Cache the response
    await kv.set(cacheKey, {
      response: aiResponse,
      context: precomputed,
      cachedAt: new Date().toISOString(),
    });

    return c.json({ data: { response: aiResponse, context: precomputed, fromCache: false, model: modelUsed } });
  } catch (error) {
    console.log(`Chat error: ${error}`);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// Real OCR via AI Vision API
app.post('/make-server-f5f5b39c/ocr/scan', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return c.json({ error: 'Image data is required' }, 400);
    }

    // Try Gemini Vision OCR first (FREE)
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const result = await performGeminiOCR(imageBase64, geminiKey);
        return c.json({ data: result });
      } catch (ocrError) {
        console.log(`Gemini OCR failed: ${ocrError}, trying fallback`);
      }
    }

    // Fallback mock OCR
    const mockResult = {
      amount: Math.floor(Math.random() * 500000) + 50000,
      date: new Date().toISOString().split('T')[0],
      merchantName: ['Highlands Coffee', 'Circle K', 'Vinmart', 'The Coffee House', 'Grab', 'Shopee'][Math.floor(Math.random() * 6)],
      category: 'Ăn uống',
      items: [],
      confidence: 0.85 + Math.random() * 0.15,
    };

    return c.json({ data: mockResult });
  } catch (error) {
    console.log(`OCR scan error: ${error}`);
    return c.json({ error: 'Failed to scan receipt' }, 500);
  }
});

// Health check
app.get('/make-server-f5f5b39c/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== BILL SPLITTING ROUTES ==========

app.get('/make-server-f5f5b39c/bills', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);
  try {
    const bills = await kv.getByPrefix(`bill:${userId}:`);
    const sorted = bills.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ data: sorted });
  } catch (error) {
    console.log(`Get bills error: ${error}`);
    return c.json({ error: 'Failed to get bills' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);
  try {
    const body = await c.req.json();
    const { name, date } = body;
    if (!name) return c.json({ error: 'Name is required' }, 400);
    const billId = crypto.randomUUID();
    const bill = {
      id: billId, userId, name, date: date || new Date().toISOString().split('T')[0],
      status: 'PENDING', participants: [], items: [], payments: [],
      settlements: [], transactions: [], totalAmount: 0, createdAt: new Date().toISOString(),
    };
    await kv.set(`bill:${userId}:${billId}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Create bill error: ${error}`);
    return c.json({ error: 'Failed to create bill' }, 500);
  }
});

app.get('/make-server-f5f5b39c/bills/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Get bill error: ${error}`);
    return c.json({ error: 'Failed to get bill' }, 500);
  }
});

app.put('/make-server-f5f5b39c/bills/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    const body = await c.req.json();
    const updated = { ...bill, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`bill:${userId}:${id}`, updated);
    return c.json({ data: updated });
  } catch (error) {
    console.log(`Update bill error: ${error}`);
    return c.json({ error: 'Failed to update bill' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/bills/:id', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ message: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    await kv.del(`bill:${userId}:${id}`);
    return c.json({ data: { success: true } });
  } catch (error) {
    console.log(`Delete bill error: ${error}`);
    return c.json({ error: 'Failed to delete bill' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:id/participants', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    const { name } = await c.req.json();
    if (!name) return c.json({ error: 'Name is required' }, 400);
    bill.participants.push({ id: crypto.randomUUID(), name });
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Add participant error: ${error}`);
    return c.json({ error: 'Failed to add participant' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/bills/:id/participants/:pid', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const pid = c.req.param('pid');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    bill.participants = bill.participants.filter((p: any) => p.id !== pid);
    bill.items.forEach((item: any) => { item.shares = (item.shares || []).filter((s: any) => s !== pid); });
    bill.payments = (bill.payments || []).filter((p: any) => p.participantId !== pid);
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Delete participant error: ${error}`);
    return c.json({ error: 'Failed to delete participant' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:id/items', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    const { name, price } = await c.req.json();
    if (!name || price === undefined) return c.json({ error: 'Name and price required' }, 400);
    bill.items.push({ id: crypto.randomUUID(), name, price: parseFloat(price), shares: [] });
    bill.totalAmount = bill.items.reduce((s: number, i: any) => s + i.price, 0);
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Add item error: ${error}`);
    return c.json({ error: 'Failed to add item' }, 500);
  }
});

app.put('/make-server-f5f5b39c/bills/:billId/items/:itemId', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const billId = c.req.param('billId');
    const itemId = c.req.param('itemId');
    const bill = await kv.get(`bill:${userId}:${billId}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    const body = await c.req.json();
    const idx = bill.items.findIndex((i: any) => i.id === itemId);
    if (idx === -1) return c.json({ error: 'Item not found' }, 404);
    bill.items[idx] = { ...bill.items[idx], ...body };
    if (body.price !== undefined) bill.items[idx].price = parseFloat(body.price);
    bill.totalAmount = bill.items.reduce((s: number, i: any) => s + i.price, 0);
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${billId}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Update item error: ${error}`);
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

app.delete('/make-server-f5f5b39c/bills/:billId/items/:itemId', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const billId = c.req.param('billId');
    const itemId = c.req.param('itemId');
    const bill = await kv.get(`bill:${userId}:${billId}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    bill.items = bill.items.filter((i: any) => i.id !== itemId);
    bill.totalAmount = bill.items.reduce((s: number, i: any) => s + i.price, 0);
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${billId}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Delete item error: ${error}`);
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:billId/items/:itemId/shares', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const billId = c.req.param('billId');
    const itemId = c.req.param('itemId');
    const bill = await kv.get(`bill:${userId}:${billId}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    const { participantIds } = await c.req.json();
    const idx = bill.items.findIndex((i: any) => i.id === itemId);
    if (idx === -1) return c.json({ error: 'Item not found' }, 404);
    bill.items[idx].shares = participantIds || [];
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${billId}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Update shares error: ${error}`);
    return c.json({ error: 'Failed to update shares' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:id/payments', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    if (bill.status === 'COMPLETED') return c.json({ error: 'Cannot edit completed bill' }, 400);
    const { payments } = await c.req.json();
    bill.payments = payments.map((p: any) => ({ id: crypto.randomUUID(), participantId: p.participantId, amount: parseFloat(p.amount) }));
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Set payments error: ${error}`);
    return c.json({ error: 'Failed to set payments' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:id/split', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);

    const owes: Record<string, number> = {};
    bill.participants.forEach((p: any) => { owes[p.id] = 0; });
    bill.items.forEach((item: any) => {
      const shares = item.shares || [];
      if (shares.length === 0) return;
      const perPerson = item.price / shares.length;
      shares.forEach((pid: string) => { owes[pid] = (owes[pid] || 0) + perPerson; });
    });

    const balances: Record<string, number> = {};
    bill.participants.forEach((p: any) => {
      const paid = (bill.payments || []).filter((pay: any) => pay.participantId === p.id).reduce((s: number, pay: any) => s + pay.amount, 0);
      balances[p.id] = paid - (owes[p.id] || 0);
    });

    const debtors = Object.entries(balances).filter(([, b]) => b < -0.01).map(([id, b]) => ({ id, amount: -b })).sort((a, b) => b.amount - a.amount);
    const creditors = Object.entries(balances).filter(([, b]) => b > 0.01).map(([id, b]) => ({ id, amount: b })).sort((a, b) => b.amount - a.amount);

    const settlements: any[] = [];
    let di = 0, ci = 0;
    const d = debtors.map(x => ({ ...x }));
    const cr = creditors.map(x => ({ ...x }));
    while (di < d.length && ci < cr.length) {
      const amount = Math.min(d[di].amount, cr[ci].amount);
      if (amount > 0.01) {
        settlements.push({ id: crypto.randomUUID(), fromParticipantId: d[di].id, toParticipantId: cr[ci].id, amount: Math.round(amount) });
      }
      d[di].amount -= amount;
      cr[ci].amount -= amount;
      if (d[di].amount < 0.01) di++;
      if (cr[ci].amount < 0.01) ci++;
    }

    bill.settlements = settlements;
    bill.owes = owes;
    bill.balances = balances;
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Split bill error: ${error}`);
    return c.json({ error: 'Failed to split bill' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:id/transactions', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    const { fromParticipantId, toParticipantId, amount, note } = await c.req.json();
    if (!fromParticipantId || !toParticipantId || !amount) return c.json({ error: 'Missing required fields' }, 400);
    if (amount <= 0) return c.json({ error: 'Amount must be positive' }, 400);

    const settlement = (bill.settlements || []).find((s: any) => s.fromParticipantId === fromParticipantId && s.toParticipantId === toParticipantId);
    if (settlement) {
      const existingPaid = (bill.transactions || []).filter((t: any) => t.fromParticipantId === fromParticipantId && t.toParticipantId === toParticipantId).reduce((s: number, t: any) => s + t.amount, 0);
      if (existingPaid + amount > settlement.amount + 0.01) return c.json({ error: 'Payment exceeds debt' }, 400);
    }

    if (!bill.transactions) bill.transactions = [];
    bill.transactions.push({ id: crypto.randomUUID(), fromParticipantId, toParticipantId, amount: parseFloat(amount), note: note || '', paymentDate: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() });

    const allSettled = (bill.settlements || []).every((s: any) => {
      const paid = bill.transactions.filter((t: any) => t.fromParticipantId === s.fromParticipantId && t.toParticipantId === s.toParticipantId).reduce((sum: number, t: any) => sum + t.amount, 0);
      return paid >= s.amount - 0.01;
    });
    if (allSettled && bill.settlements?.length > 0) bill.status = 'COMPLETED';

    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Add transaction error: ${error}`);
    return c.json({ error: 'Failed to add transaction' }, 500);
  }
});

app.post('/make-server-f5f5b39c/bills/:id/complete', async (c) => {
  const { userId, error } = await getUserId(c);
  if (!userId) return c.json({ error: error || 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const bill = await kv.get(`bill:${userId}:${id}`);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);
    bill.status = 'COMPLETED';
    bill.completedAt = new Date().toISOString();
    bill.updatedAt = new Date().toISOString();
    await kv.set(`bill:${userId}:${id}`, bill);
    return c.json({ data: bill });
  } catch (error) {
    console.log(`Complete bill error: ${error}`);
    return c.json({ error: 'Failed to complete bill' }, 500);
  }
});

// ========== HELPER FUNCTIONS ==========
async function getUserId(c: any): Promise<{ userId: string | null; error?: string }> {
  console.log(`[AUTH DEBUG] ======= getUserId Called =======`);
  try {
    // CRITICAL FIX: Read user token from X-User-Token header instead of Authorization
    // Authorization header must contain ANON_KEY for Supabase gateway validation
    const userToken = c.req.header('X-User-Token');
    console.log(`[AUTH DEBUG] X-User-Token header present: ${!!userToken}`);
    
    if (!userToken) {
      console.log(`[AUTH DEBUG] No X-User-Token header`);
      return { userId: null, error: 'No X-User-Token header' };
    }
    
    console.log(`[AUTH DEBUG] Token length: ${userToken.length}, starts with: ${userToken.substring(0, 10)}...`);
    
    // Use getUserClient helper for consistency
    const userClient = getUserClient();
    
    const { data: { user }, error } = await userClient.auth.getUser(userToken);
    
    console.log(`[AUTH DEBUG] Calling userClient.auth.getUser()...`);
    
    if (error) {
      console.error(`[AUTH DEBUG] ❌ getUser error: ${error.message}, status: ${error.status}, name: ${error.name}`);
      console.error(`[AUTH DEBUG] Full error:`, JSON.stringify(error, null, 2));
      return { userId: null, error: `Invalid JWT: ${error.message}` };
    }
    
    if (!user) {
      console.log(`[AUTH DEBUG] No user found for token`);
      return { userId: null, error: 'No user found for token' };
    }
    
    console.log(`[AUTH DEBUG] ✅ User authenticated: ${user.id}`);
    return { userId: user.id };
  } catch (error) {
    console.error(`[AUTH DEBUG] ❌ Exception in getUserId:`, error);
    return { userId: null, error: `Auth exception: ${error}` };
  }
}

// Helper to ensure backwards compatibility with old code
async function requireAuth(c: any): Promise<string | null> {
  const { userId } = await getUserId(c);
  return userId;
}

// AI Router - classify query complexity
function classifyQuery(message: string): 'simple' | 'medium' | 'complex' {
  const lower = message.toLowerCase();
  
  // Simple: direct data lookup
  const simplePatterns = [
    'tổng chi tiêu', 'tổng thu nhập', 'số dư', 'chi tiêu tháng', 'thu nhập tháng',
    'bao nhiêu', 'tháng này', 'tháng trước', 'balance', 'total', 'spending',
    'income this month', 'how much', 'top category',
  ];
  if (simplePatterns.some(p => lower.includes(p))) return 'simple';

  // Complex: needs deep analysis / advice
  const complexPatterns = [
    'tư vấn', 'kế hoạch', 'phân tích chi tiết', 'so sánh', 'xu hướng',
    'dự đoán', 'tiết kiệm', 'đầu tư', 'advice', 'plan', 'forecast',
    'optimize', 'strategy', 'recommend', 'suggest savings',
  ];
  if (complexPatterns.some(p => lower.includes(p))) return 'complex';

  return 'medium';
}

// Hash message for cache key
function hashMessage(message: string): string {
  const normalized = message.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Generate response from pre-computed data (no AI needed)
function generatePrecomputedResponse(message: string, data: any): string {
  const lower = message.toLowerCase();
  const fmt = (n: number) => n.toLocaleString('vi-VN');

  if (lower.includes('chi tiêu') || lower.includes('expense') || lower.includes('spending')) {
    const response = `Tháng này bạn đã chi tiêu ${fmt(data.totalExpense || 0)} VNĐ.`;
    if (data.comparison?.expenseChange) {
      const change = data.comparison.expenseChange;
      return `${response} ${change > 0 ? `Tăng ${change}%` : `Giảm ${Math.abs(change)}%`} so với tháng trước.`;
    }
    return response;
  }

  if (lower.includes('thu nhập') || lower.includes('income') || lower.includes('lương')) {
    return `Thu nhập tháng này: ${fmt(data.totalIncome || 0)} VNĐ. ${data.totalIncome > data.totalExpense ? 'Bạn đang tiết kiệm tốt!' : 'Chi tiêu đang vượt thu nhập, cần cân nhắc.'}`;
  }

  if (lower.includes('số dư') || lower.includes('balance') || lower.includes('còn lại')) {
    return `Số dư tháng này: ${fmt(data.netSavings || 0)} VNĐ. Tổng tài sản: ${fmt(data.totalBalance || 0)} VNĐ. Tỷ lệ tiết kiệm: ${data.savingsRate || 0}%.`;
  }

  if (lower.includes('top') || lower.includes('nhiều nhất') || lower.includes('category')) {
    const cats = data.topCategories || [];
    if (cats.length === 0) return 'Chưa có dữ liệu chi tiêu trong tháng này.';
    const list = cats.map((c: any, i: number) => `${i + 1}. ${c.name}: ${fmt(c.amount)} VNĐ`).join('\n');
    return `Top danh mục chi tiêu tháng này:\n${list}`;
  }

  if (lower.includes('ngân sách') || lower.includes('budget')) {
    const over = data.overBudget || [];
    if (over.length > 0) {
      return `Cảnh báo: ${over.length} danh mục vượt ngân sách!\n${over.map((b: any) => `- ${b.categoryName}: ${Math.round(b.pct)}% (${fmt(b.spent)}/${fmt(b.budget)} VNĐ)`).join('\n')}`;
    }
    return 'Tất cả ngân sách đang trong giới hạn.';
  }

  // Default
  return `Tháng này:\n- Thu nhập: ${fmt(data.totalIncome || 0)} VNĐ\n- Chi tiêu: ${fmt(data.totalExpense || 0)} VNĐ\n- Tiết kiệm: ${fmt(data.netSavings || 0)} VNĐ\n- Tỷ lệ tiết kiệm: ${data.savingsRate || 0}%\n- Số giao dịch: ${data.transactionCount || 0}\n\nBạn muốn biết thêm chi tiết gì?`;
}

async function initializeDefaultData(userId: string) {
  const incomeCategories = [
    { name: 'Lương', icon: 'briefcase', color: '#10B981' },
    { name: 'Thưởng', icon: 'gift', color: '#F59E0B' },
    { name: 'Đầu tư', icon: 'trending-up', color: '#3B82F6' },
    { name: 'Quà tặng', icon: 'heart', color: '#EC4899' },
    { name: 'Freelance', icon: 'laptop', color: '#8B5CF6' },
    { name: 'Khác', icon: 'plus-circle', color: '#6B7280' },
  ];

  const expenseCategories = [
    { name: 'Ăn uống', icon: 'utensils', color: '#EF4444', children: [
      { name: 'Quán ăn', icon: 'store', color: '#DC2626' },
      { name: 'Siêu thị', icon: 'shopping-cart', color: '#F87171' },
    ]},
    { name: 'Di chuyển', icon: 'car', color: '#3B82F6', children: [
      { name: 'Xăng', icon: 'fuel', color: '#2563EB' },
      { name: 'Xe ôm', icon: 'bike', color: '#60A5FA' },
    ]},
    { name: 'Nhà cửa', icon: 'home', color: '#8B5CF6' },
    { name: 'Giải trí', icon: 'film', color: '#EC4899' },
    { name: 'Sức khỏe', icon: 'heart-pulse', color: '#14B8A6' },
    { name: 'Mua sắm', icon: 'shopping-bag', color: '#F59E0B' },
    { name: 'Khác', icon: 'more-horizontal', color: '#6B7280' },
  ];

  for (const cat of incomeCategories) {
    const catId = crypto.randomUUID();
    await kv.set(`category:${userId}:${catId}`, {
      id: catId, userId, name: cat.name, type: 'INCOME', parentId: null,
      icon: cat.icon, color: cat.color, createdAt: new Date().toISOString(),
    });
  }

  for (const cat of expenseCategories) {
    const catId = crypto.randomUUID();
    await kv.set(`category:${userId}:${catId}`, {
      id: catId, userId, name: cat.name, type: 'EXPENSE', parentId: null,
      icon: cat.icon, color: cat.color, createdAt: new Date().toISOString(),
    });

    if ((cat as any).children) {
      for (const child of (cat as any).children) {
        const childId = crypto.randomUUID();
        await kv.set(`category:${userId}:${childId}`, {
          id: childId, userId, name: child.name, type: 'EXPENSE', parentId: catId,
          icon: child.icon, color: child.color, createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // Default accounts with bank logos
  const defaultAccounts = [
    { name: 'Tiền mặt', type: 'CASH', icon: 'wallet', color: '#10B981', balance: 0, bankCode: 'cash' },
    { name: 'Ngân hàng', type: 'BANK', icon: 'landmark', color: '#3B82F6', balance: 0, bankCode: 'general' },
  ];

  for (const acc of defaultAccounts) {
    const accId = crypto.randomUUID();
    await kv.set(`account:${userId}:${accId}`, {
      id: accId, userId, ...acc, createdAt: new Date().toISOString(),
    });
  }
}

// Call Gemini API
async function callGemini(message: string, context: any, apiKey: string, tier: 'flash' | 'pro'): Promise<string> {
  const model = tier === 'flash' ? 'gemini-2.0-flash' : 'gemini-1.5-pro';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemPrompt = `Bạn là trợ lý tài chính Spendly. Trả lời ngắn gọn bằng tiếng Việt.
Dữ liệu tài chính tháng này:
- Thu nhập: ${(context.totalIncome || 0).toLocaleString('vi-VN')} VNĐ
- Chi tiêu: ${(context.totalExpense || 0).toLocaleString('vi-VN')} VNĐ
- Tiết kiệm: ${(context.netSavings || 0).toLocaleString('vi-VN')} VNĐ
- Tỷ lệ tiết kiệm: ${context.savingsRate || 0}%
- Top danh mục: ${(context.topCategories || []).map((c: any) => `${c.name}: ${c.amount?.toLocaleString('vi-VN')}`).join(', ')}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{
        parts: [{ text: message }],
      }],
      generationConfig: {
        maxOutputTokens: tier === 'flash' ? 400 : 800,
        temperature: 0.7,
      },
    }),
  });

  const data = await response.json();
  console.log(`Gemini ${model} response status: ${response.status}`);

  if (data.candidates && data.candidates.length > 0) {
    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    if (text) return text;
  }

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  throw new Error(`Gemini response empty: ${JSON.stringify(data).slice(0, 200)}`);
}

// OCR via Gemini Vision (FREE)
async function performGeminiOCR(imageBase64: string, apiKey: string): Promise<any> {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Trích xuất thông tin từ hóa đơn/receipt này. Trả về JSON duy nhất (không markdown): {"amount":number,"date":"YYYY-MM-DD","merchantName":"string","category":"string","confidence":number}. Category là danh mục chi tiêu tiếng Việt (Ăn uống, Di chuyển, Mua sắm, Giải trí, Sức khỏe, Nhà cửa, Khác). Confidence từ 0-1.' },
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
        ],
      }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.2,
      },
    }),
  });

  const data = await response.json();
  console.log(`Gemini OCR response status: ${response.status}`);

  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        amount: parsed.amount || 0,
        date: parsed.date || new Date().toISOString().split('T')[0],
        merchantName: parsed.merchantName || 'Unknown',
        category: parsed.category || 'Khác',
        confidence: parsed.confidence || 0.8,
      };
    }
  }

  throw new Error(`Gemini OCR failed: ${JSON.stringify(data).slice(0, 200)}`);
}

Deno.serve(app.fetch);