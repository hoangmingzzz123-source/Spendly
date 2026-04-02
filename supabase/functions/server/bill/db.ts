// Bill Splitting DB Access Layer (stub, replace with real DB logic)
import {
  Bill, Participant, Item, ItemShare, Payment, Settlement, PaymentTransaction,
} from './types';

export const db = {
  bills: [] as Bill[],
  participants: [] as Participant[],
  items: [] as Item[],
  itemShares: [] as ItemShare[],
  payments: [] as Payment[],
  settlements: [] as Settlement[],
  paymentTransactions: [] as PaymentTransaction[],
};

// Add CRUD functions for each entity as needed (stub)
