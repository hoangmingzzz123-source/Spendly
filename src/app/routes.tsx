import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { Accounts } from './components/Accounts';
import { Categories } from './components/Categories';
import { Transactions } from './components/Transactions';
import { Timeline } from './components/Timeline';
import { Calendar } from './components/Calendar';
import { Budgets } from './components/Budgets';
import { Goals } from './components/Goals';
import { Reminders } from './components/Reminders';
import { Family } from './components/Family';
import { AIChat } from './components/AIChat';
import { Analytics } from './components/Analytics';
import { Notifications } from './components/Notifications';
import { OCRScanner } from './components/OCRScanner';
import { Help } from './components/Help';
import { Settings } from './components/Settings';
import { NotFound } from './components/NotFound';
import BillPage from './bill';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'accounts', Component: Accounts },
      { path: 'categories', Component: Categories },
      { path: 'transactions', Component: Transactions },
      { path: 'timeline', Component: Timeline },
      { path: 'calendar', Component: Calendar },
      { path: 'budgets', Component: Budgets },
      { path: 'goals', Component: Goals },
      { path: 'reminders', Component: Reminders },
      { path: 'family', Component: Family },
      { path: 'chat', Component: AIChat },
      { path: 'analytics', Component: Analytics },
      { path: 'notifications', Component: Notifications },
      { path: 'ocr', Component: OCRScanner },
      { path: 'help', Component: Help },
      { path: 'settings', Component: Settings },
      { path: 'bill', Component: BillPage },
    ],
  },
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
  { path: '*', Component: NotFound },
]);