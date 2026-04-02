// FE API wrapper for Bill Splitting
import axios from 'axios';
import { Bill, Participant, Item, ItemShare, Payment, Settlement, PaymentTransaction } from '../../../supabase/functions/server/bill/types';

export const billApi = {
  getBills: async (): Promise<Bill[]> => {
    // Replace with real API call
    return [];
  },
  createBill: async (data: Partial<Bill>): Promise<Bill> => {
    // Replace with real API call
    return { id: '1', name: data.name || '', createdDate: new Date().toISOString(), status: 'PENDING', totalAmount: 0 };
  },
  // ... Add other API methods as needed
};
