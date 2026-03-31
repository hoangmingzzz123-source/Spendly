// Supabase API cho Bill Splitting
import { createClient } from '@supabase/supabase-js';
import { Bill, Participant, Item, ItemShare, Payment, Settlement, PaymentTransaction } from './types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export const billSupabaseApi = {
  // Bill
  async getBills(): Promise<Bill[]> {
    const { data, error } = await supabase.from('bills').select('*').order('createdDate', { ascending: false });
    if (error) throw error;
    return data as Bill[];
  },
  async createBill(bill: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase.from('bills').insert([bill]).select().single();
    if (error) throw error;
    return data as Bill;
  },
  async deleteBill(id: string) {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) throw error;
  },

  // Participant
  async getParticipants(billId: string): Promise<Participant[]> {
    const { data, error } = await supabase.from('participants').select('*').eq('billId', billId);
    if (error) throw error;
    return data as Participant[];
  },
  async addParticipant(participant: Partial<Participant>): Promise<Participant> {
    const { data, error } = await supabase.from('participants').insert([participant]).select().single();
    if (error) throw error;
    return data as Participant;
  },
  async removeParticipant(id: string) {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) throw error;
  },

  // Item
  async getItems(billId: string): Promise<Item[]> {
    const { data, error } = await supabase.from('items').select('*').eq('billId', billId);
    if (error) throw error;
    return data as Item[];
  },
  async addItem(item: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase.from('items').insert([item]).select().single();
    if (error) throw error;
    return data as Item;
  },
  async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase.from('items').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data as Item;
  },
  async removeItem(id: string) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
  },

  // ItemShare
  async getItemShares(itemId: string): Promise<ItemShare[]> {
    const { data, error } = await supabase.from('itemshares').select('*').eq('itemId', itemId);
    if (error) throw error;
    return data as ItemShare[];
  },
  async addItemShare(itemShare: Partial<ItemShare>): Promise<ItemShare> {
    const { data, error } = await supabase.from('itemshares').insert([itemShare]).select().single();
    if (error) throw error;
    return data as ItemShare;
  },
  async removeItemShare(id: string) {
    const { error } = await supabase.from('itemshares').delete().eq('id', id);
    if (error) throw error;
  },

  // Payment
  async getPayments(billId: string): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*').eq('billId', billId);
    if (error) throw error;
    return data as Payment[];
  },
  async addPayment(payment: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').insert([payment]).select().single();
    if (error) throw error;
    return data as Payment;
  },
  async removePayment(id: string) {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },

  // Settlement
  async getSettlements(billId: string): Promise<Settlement[]> {
    const { data, error } = await supabase.from('settlements').select('*').eq('billId', billId);
    if (error) throw error;
    return data as Settlement[];
  },
  async addSettlement(settlement: Partial<Settlement>): Promise<Settlement> {
    const { data, error } = await supabase.from('settlements').insert([settlement]).select().single();
    if (error) throw error;
    return data as Settlement;
  },
  async removeSettlement(id: string) {
    const { error } = await supabase.from('settlements').delete().eq('id', id);
    if (error) throw error;
  },

  // PaymentTransaction
  async getPaymentTransactions(billId: string): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase.from('paymenttransactions').select('*').eq('billId', billId);
    if (error) throw error;
    return data as PaymentTransaction[];
  },
  async addPaymentTransaction(tx: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const { data, error } = await supabase.from('paymenttransactions').insert([tx]).select().single();
    if (error) throw error;
    return data as PaymentTransaction;
  },
  async updatePaymentTransaction(id: string, tx: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const { data, error } = await supabase.from('paymenttransactions').update(tx).eq('id', id).select().single();
    if (error) throw error;
    return data as PaymentTransaction;
  },
  async removePaymentTransaction(id: string) {
    const { error } = await supabase.from('paymenttransactions').delete().eq('id', id);
    if (error) throw error;
  },
};
