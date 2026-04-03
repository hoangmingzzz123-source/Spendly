// Sample data for Vietnamese personal finance app

export const SAMPLE_CATEGORIES = {
  EXPENSE: [
    // Main categories
    { name: 'Ăn uống', color: '#EF4444', parentId: null },
    { name: 'Di chuyển', color: '#F59E0B', parentId: null },
    { name: 'Mua sắm', color: '#EC4899', parentId: null },
    { name: 'Giải trí', color: '#8B5CF6', parentId: null },
    { name: 'Hóa đơn & Tiện ích', color: '#06B6D4', parentId: null },
    { name: 'Y tế & Sức khỏe', color: '#10B981', parentId: null },
    { name: 'Giáo dục', color: '#3B82F6', parentId: null },
    { name: 'Gia đình', color: '#F97316', parentId: null },
    { name: 'Làm đẹp', color: '#DB2777', parentId: null },
    { name: 'Khác', color: '#6B7280', parentId: null },
  ],
  INCOME: [
    { name: 'Lương', color: '#10B981', parentId: null },
    { name: 'Thu nhập phụ', color: '#3B82F6', parentId: null },
    { name: 'Đầu tư', color: '#8B5CF6', parentId: null },
    { name: 'Thưởng', color: '#F59E0B', parentId: null },
    { name: 'Quà tặng', color: '#EC4899', parentId: null },
    { name: 'Thu nhập khác', color: '#6B7280', parentId: null },
  ],
};

// Subcategories to be added after main categories are created
export const SAMPLE_SUBCATEGORIES = {
  'Ăn uống': [
    { name: 'Nhà hàng', color: '#EF4444' },
    { name: 'Quán ăn', color: '#EF4444' },
    { name: 'Cà phê & Trà sữa', color: '#EF4444' },
    { name: 'Siêu thị & Chợ', color: '#EF4444' },
    { name: 'Đồ ăn vặt', color: '#EF4444' },
  ],
  'Di chuyển': [
    { name: 'Xăng xe', color: '#F59E0B' },
    { name: 'Grab/Uber', color: '#F59E0B' },
    { name: 'Xe buýt', color: '#F59E0B' },
    { name: 'Bảo dưỡng xe', color: '#F59E0B' },
    { name: 'Gửi xe', color: '#F59E0B' },
  ],
  'Mua sắm': [
    { name: 'Quần áo', color: '#EC4899' },
    { name: 'Giày dép', color: '#EC4899' },
    { name: 'Phụ kiện', color: '#EC4899' },
    { name: 'Đồ gia dụng', color: '#EC4899' },
    { name: 'Điện tử', color: '#EC4899' },
  ],
  'Giải trí': [
    { name: 'Phim ảnh', color: '#8B5CF6' },
    { name: 'Chơi game', color: '#8B5CF6' },
    { name: 'Du lịch', color: '#8B5CF6' },
    { name: 'Thể thao', color: '#8B5CF6' },
    { name: 'Sách báo', color: '#8B5CF6' },
  ],
  'Hóa đơn & Tiện ích': [
    { name: 'Điện nước', color: '#06B6D4' },
    { name: 'Internet', color: '#06B6D4' },
    { name: 'Điện thoại', color: '#06B6D4' },
    { name: 'Thuê nhà', color: '#06B6D4' },
    { name: 'Bảo hiểm', color: '#06B6D4' },
  ],
  'Y tế & Sức khỏe': [
    { name: 'Khám bệnh', color: '#10B981' },
    { name: 'Thuốc men', color: '#10B981' },
    { name: 'Gym & Fitness', color: '#10B981' },
    { name: 'Vitamin & Thực phẩm chức năng', color: '#10B981' },
  ],
  'Giáo dục': [
    { name: 'Học phí', color: '#3B82F6' },
    { name: 'Khóa học', color: '#3B82F6' },
    { name: 'Sách giáo khoa', color: '#3B82F6' },
    { name: 'Đồ dùng học tập', color: '#3B82F6' },
  ],
  'Gia đình': [
    { name: 'Con cái', color: '#F97316' },
    { name: 'Phụng dưỡng', color: '#F97316' },
    { name: 'Quà tặng', color: '#F97316' },
    { name: 'Tiệc tùng', color: '#F97316' },
  ],
  'Làm đẹp': [
    { name: 'Tóc', color: '#DB2777' },
    { name: 'Spa & Massage', color: '#DB2777' },
    { name: 'Mỹ phẩm', color: '#DB2777' },
  ],
};

export const SAMPLE_BUDGET_TEMPLATES = [
  { name: 'Ăn uống', amount: 5000000, emoji: '🍜' },
  { name: 'Di chuyển', amount: 2000000, emoji: '🚗' },
  { name: 'Mua sắm', amount: 3000000, emoji: '🛍️' },
  { name: 'Giải trí', amount: 2000000, emoji: '🎮' },
  { name: 'Hóa đơn & Tiện ích', amount: 3000000, emoji: '💡' },
];

export const SAMPLE_GOALS = [
  {
    name: 'Mua iPhone mới',
    targetAmount: 25000000,
    icon: '📱',
    color: '#3B82F6',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
  },
  {
    name: 'Du lịch Đà Lạt',
    targetAmount: 10000000,
    icon: '✈️',
    color: '#10B981',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
  },
  {
    name: 'Quỹ khẩn cấp',
    targetAmount: 50000000,
    icon: '🏦',
    color: '#EF4444',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
  },
  {
    name: 'Mua laptop',
    targetAmount: 20000000,
    icon: '💻',
    color: '#8B5CF6',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0],
  },
];

export const SAMPLE_REMINDERS = [
  {
    title: 'Đóng tiền điện nước',
    type: 'BILL',
    frequency: 'MONTHLY',
    dayOfMonth: 5,
    time: '09:00',
    amount: 500000,
  },
  {
    title: 'Đóng tiền thuê nhà',
    type: 'BILL',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    time: '08:00',
    amount: 5000000,
  },
  {
    title: 'Đóng tiền Internet',
    type: 'BILL',
    frequency: 'MONTHLY',
    dayOfMonth: 10,
    time: '09:00',
    amount: 300000,
  },
  {
    title: 'Gửi tiết kiệm hàng tháng',
    type: 'SAVING',
    frequency: 'MONTHLY',
    dayOfMonth: 25,
    time: '10:00',
    amount: 3000000,
  },
];

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Helper to get sample data summary
export const getSampleDataSummary = () => {
  return {
    categories: {
      expense: SAMPLE_CATEGORIES.EXPENSE.length,
      income: SAMPLE_CATEGORIES.INCOME.length,
      subcategories: Object.values(SAMPLE_SUBCATEGORIES).flat().length,
    },
    budgets: SAMPLE_BUDGET_TEMPLATES.length,
    goals: SAMPLE_GOALS.length,
    reminders: SAMPLE_REMINDERS.length,
  };
};

// Demo Mode: Sample data functions
export const getSampleAccounts = () => {
  return [
    {
      id: 'acc-1',
      name: 'Tiền mặt',
      type: 'CASH',
      balance: 5000000,
      color: '#10B981',
      icon: '💵',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'acc-2',
      name: 'Techcombank',
      type: 'BANK',
      balance: 15000000,
      color: '#3B82F6',
      icon: '🏦',
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'acc-3',
      name: 'Ví Momo',
      type: 'EWALLET',
      balance: 2500000,
      color: '#EC4899',
      icon: '📱',
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
  ];
};

export const getSampleCategories = () => {
  const expenseCategories = SAMPLE_CATEGORIES.EXPENSE.map((cat, idx) => ({
    id: `cat-exp-${idx}`,
    name: cat.name,
    type: 'EXPENSE' as const,
    color: cat.color,
    icon: '📊',
    parentId: null,
    createdAt: new Date().toISOString(),
  }));

  const incomeCategories = SAMPLE_CATEGORIES.INCOME.map((cat, idx) => ({
    id: `cat-inc-${idx}`,
    name: cat.name,
    type: 'INCOME' as const,
    color: cat.color,
    icon: '💰',
    parentId: null,
    createdAt: new Date().toISOString(),
  }));

  return [...expenseCategories, ...incomeCategories];
};

export const getSampleTransactions = () => {
  const now = new Date();
  const categories = getSampleCategories();
  const accounts = getSampleAccounts();

  return [
    {
      id: 'txn-1',
      type: 'EXPENSE',
      amount: 150000,
      categoryId: categories[0].id, // Ăn uống
      accountId: accounts[0].id,
      date: new Date(now.setDate(now.getDate() - 1)).toISOString(),
      description: 'Ăn trưa',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn-2',
      type: 'EXPENSE',
      amount: 50000,
      categoryId: categories[0].id,
      accountId: accounts[0].id,
      date: new Date(now.setDate(now.getDate() - 1)).toISOString(),
      description: 'Cà phê sáng',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn-3',
      type: 'INCOME',
      amount: 15000000,
      categoryId: categories.find(c => c.name === 'Lương')?.id || 'cat-inc-0',
      accountId: accounts[1].id,
      date: new Date(now.setDate(1)).toISOString(),
      description: 'Lương tháng',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const getSampleBudgets = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const categories = getSampleCategories();

  return SAMPLE_BUDGET_TEMPLATES.map((template, idx) => {
    const category = categories.find(c => c.name === template.name);
    return {
      id: `budget-${idx}`,
      name: template.name,
      amount: template.amount,
      spent: Math.floor(template.amount * (Math.random() * 0.7 + 0.1)), // Random 10-80%
      categoryId: category?.id || null,
      month: currentMonth,
      icon: template.emoji,
      color: category?.color || '#6B7280',
      createdAt: new Date().toISOString(),
    };
  });
};

export const getSampleGoals = () => {
  return SAMPLE_GOALS.map((goal, idx) => ({
    id: `goal-${idx}`,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: Math.floor(goal.targetAmount * (Math.random() * 0.5)), // Random 0-50%
    deadline: goal.deadline,
    icon: goal.icon,
    color: goal.color,
    status: 'IN_PROGRESS' as const,
    createdAt: new Date().toISOString(),
  }));
};

export const getSampleReminders = () => {
  return SAMPLE_REMINDERS.map((reminder, idx) => ({
    id: `reminder-${idx}`,
    title: reminder.title,
    type: reminder.type,
    frequency: reminder.frequency,
    dayOfMonth: reminder.dayOfMonth,
    time: reminder.time,
    amount: reminder.amount,
    isActive: true,
    createdAt: new Date().toISOString(),
  }));
};

export const getSampleDashboardData = (month: string) => {
  const budgets = getSampleBudgets();
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return {
    totalIncome: 45000000,
    totalExpense: totalSpent,
    balance: 45000000 - totalSpent,
    budgetUsage: (totalSpent / totalBudget) * 100,
    topCategories: [
      { name: 'Ăn uống', amount: 4500000, color: '#EF4444' },
      { name: 'Di chuyển', amount: 1800000, color: '#F59E0B' },
      { name: 'Mua sắm', amount: 2200000, color: '#EC4899' },
    ],
    recentTransactions: getSampleTransactions().slice(0, 5),
    monthlyComparison: {
      income: { current: 45000000, previous: 42000000, change: 7.1 },
      expense: { current: totalSpent, previous: 18000000, change: 25.0 },
    },
  };
};