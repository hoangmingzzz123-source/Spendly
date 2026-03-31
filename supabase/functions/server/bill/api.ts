// Bill Splitting API Handlers (stub, FE-ready endpoints)
import { db } from './db';
import { Bill, Participant, Item, ItemShare, Payment, Settlement, PaymentTransaction } from './types';
import { v4 as uuidv4 } from 'uuid';

// Example: Create Bill
export function createBill(data: Partial<Bill>): Bill {
  const bill: Bill = {
    id: uuidv4(),
    name: data.name || '',
    createdDate: new Date().toISOString(),
    status: 'PENDING',
    totalAmount: 0,
  };
  db.bills.push(bill);
  return bill;
}

// Example: Get Bills
export function getBills(): Bill[] {
  return db.bills;
}

// ... Implement other API handlers as per spec
