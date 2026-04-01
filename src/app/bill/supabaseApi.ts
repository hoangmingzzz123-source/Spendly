// Supabase API cho Bill Splitting
import { Bill, Participant, Item, ItemShare, Payment, Settlement, PaymentTransaction } from './types';
import { supabase } from '../../lib/supabase';

type LocalBillDb = {
  bills: Bill[];
  participants: Participant[];
  items: Item[];
  itemshares: ItemShare[];
  payments: Payment[];
  settlements: Settlement[];
  paymenttransactions: PaymentTransaction[];
};

const LOCAL_BILL_DB_KEY = 'spendly_bill_local_db_v1';

const createEmptyLocalDb = (): LocalBillDb => ({
  bills: [],
  participants: [],
  items: [],
  itemshares: [],
  payments: [],
  settlements: [],
  paymenttransactions: [],
});

const getLocalDb = (): LocalBillDb => {
  if (typeof window === 'undefined') return createEmptyLocalDb();
  const raw = window.localStorage.getItem(LOCAL_BILL_DB_KEY);
  if (!raw) return createEmptyLocalDb();

  try {
    const parsed = JSON.parse(raw) as Partial<LocalBillDb>;
    return {
      bills: parsed.bills ?? [],
      participants: parsed.participants ?? [],
      items: parsed.items ?? [],
      itemshares: parsed.itemshares ?? [],
      payments: parsed.payments ?? [],
      settlements: parsed.settlements ?? [],
      paymenttransactions: parsed.paymenttransactions ?? [],
    };
  } catch {
    return createEmptyLocalDb();
  }
};

const saveLocalDb = (db: LocalBillDb) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_BILL_DB_KEY, JSON.stringify(db));
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const isMissingTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  const message = String((error as { message?: string }).message || '');
  return code === 'PGRST205' || message.includes("Could not find the table 'public.");
};

let hasLoggedFallback = false;
const logFallbackOnce = () => {
  if (hasLoggedFallback) return;
  hasLoggedFallback = true;
  console.warn('[Bill] Supabase tables are missing. Using local storage fallback mode.');
};

export const billSupabaseApi = {
  // Bill
  async getBills(): Promise<Bill[]> {
    const { data, error } = await supabase.from('bills').select('*').order('createdDate', { ascending: false });
    if (!error) return data as Bill[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    return [...db.bills].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  },
  async createBill(bill: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase.from('bills').insert([bill]).select().single();
    if (!error) return data as Bill;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    const created: Bill = {
      id: makeId(),
      name: bill.name ?? 'Bill mới',
      createdDate: bill.createdDate ?? new Date().toISOString(),
      status: bill.status ?? 'PENDING',
      totalAmount: bill.totalAmount ?? 0,
    };
    db.bills.push(created);
    saveLocalDb(db);
    return created;
  },
  async deleteBill(id: string) {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.bills = db.bills.filter((b) => b.id !== id);
    db.participants = db.participants.filter((p) => p.billId !== id);
    const itemIds = db.items.filter((i) => i.billId === id).map((i) => i.id);
    db.items = db.items.filter((i) => i.billId !== id);
    db.itemshares = db.itemshares.filter((s) => !itemIds.includes(s.itemId));
    db.payments = db.payments.filter((p) => p.billId !== id);
    db.settlements = db.settlements.filter((s) => s.billId !== id);
    db.paymenttransactions = db.paymenttransactions.filter((t) => t.billId !== id);
    saveLocalDb(db);
  },

  // Participant
  async getParticipants(billId: string): Promise<Participant[]> {
    const { data, error } = await supabase.from('participants').select('*').eq('billId', billId);
    if (!error) return data as Participant[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    return getLocalDb().participants.filter((p) => p.billId === billId);
  },
  async addParticipant(participant: Partial<Participant>): Promise<Participant> {
    const { data, error } = await supabase.from('participants').insert([participant]).select().single();
    if (!error) return data as Participant;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    if (!participant.billId || !participant.name) {
      throw new Error('Thiếu billId hoặc tên người tham gia.');
    }
    const db = getLocalDb();
    const created: Participant = { id: makeId(), billId: participant.billId, name: participant.name };
    db.participants.push(created);
    saveLocalDb(db);
    return created;
  },
  async removeParticipant(id: string) {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.participants = db.participants.filter((p) => p.id !== id);
    db.itemshares = db.itemshares.filter((s) => s.participantId !== id);
    db.payments = db.payments.filter((p) => p.participantId !== id);
    db.settlements = db.settlements.filter((s) => s.fromParticipantId !== id && s.toParticipantId !== id);
    db.paymenttransactions = db.paymenttransactions.filter((t) => t.fromParticipantId !== id && t.toParticipantId !== id);
    saveLocalDb(db);
  },

  // Item
  async getItems(billId: string): Promise<Item[]> {
    const { data, error } = await supabase.from('items').select('*').eq('billId', billId);
    if (!error) return data as Item[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    return getLocalDb().items.filter((i) => i.billId === billId);
  },
  async addItem(item: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase.from('items').insert([item]).select().single();
    if (!error) return data as Item;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    if (!item.billId || !item.name || typeof item.price !== 'number') {
      throw new Error('Thiếu billId, tên món hoặc giá món.');
    }
    const db = getLocalDb();
    const created: Item = { id: makeId(), billId: item.billId, name: item.name, price: item.price };
    db.items.push(created);
    saveLocalDb(db);
    return created;
  },
  async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase.from('items').update(item).eq('id', id).select().single();
    if (!error) return data as Item;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    const existing = db.items.find((i) => i.id === id);
    if (!existing) throw new Error('Không tìm thấy món cần cập nhật.');
    const updated: Item = { ...existing, ...item, id: existing.id, billId: existing.billId };
    db.items = db.items.map((i) => (i.id === id ? updated : i));
    saveLocalDb(db);
    return updated;
  },
  async removeItem(id: string) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.items = db.items.filter((i) => i.id !== id);
    db.itemshares = db.itemshares.filter((s) => s.itemId !== id);
    saveLocalDb(db);
  },

  // ItemShare
  async getItemShares(itemId: string): Promise<ItemShare[]> {
    const { data, error } = await supabase.from('itemshares').select('*').eq('itemId', itemId);
    if (!error) return data as ItemShare[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    return getLocalDb().itemshares.filter((s) => s.itemId === itemId);
  },
  async addItemShare(itemShare: Partial<ItemShare>): Promise<ItemShare> {
    const { data, error } = await supabase.from('itemshares').insert([itemShare]).select().single();
    if (!error) return data as ItemShare;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    if (!itemShare.itemId || !itemShare.participantId) {
      throw new Error('Thiếu itemId hoặc participantId.');
    }
    const db = getLocalDb();
    const created: ItemShare = {
      id: makeId(),
      itemId: itemShare.itemId,
      participantId: itemShare.participantId,
    };
    db.itemshares.push(created);
    saveLocalDb(db);
    return created;
  },
  async removeItemShare(id: string) {
    const { error } = await supabase.from('itemshares').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.itemshares = db.itemshares.filter((s) => s.id !== id);
    saveLocalDb(db);
  },

  // Payment
  async getPayments(billId: string): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*').eq('billId', billId);
    if (!error) return data as Payment[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    return getLocalDb().payments.filter((p) => p.billId === billId);
  },
  async addPayment(payment: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').insert([payment]).select().single();
    if (!error) return data as Payment;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    if (!payment.billId || !payment.participantId || typeof payment.amountPaid !== 'number') {
      throw new Error('Thiếu dữ liệu thanh toán.');
    }
    const db = getLocalDb();
    const created: Payment = {
      id: makeId(),
      billId: payment.billId,
      participantId: payment.participantId,
      amountPaid: payment.amountPaid,
    };
    db.payments.push(created);
    saveLocalDb(db);
    return created;
  },
  async removePayment(id: string) {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.payments = db.payments.filter((p) => p.id !== id);
    saveLocalDb(db);
  },

  // Settlement
  async getSettlements(billId: string): Promise<Settlement[]> {
    const { data, error } = await supabase.from('settlements').select('*').eq('billId', billId);
    if (!error) return data as Settlement[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    return getLocalDb().settlements.filter((s) => s.billId === billId);
  },
  async addSettlement(settlement: Partial<Settlement>): Promise<Settlement> {
    const { data, error } = await supabase.from('settlements').insert([settlement]).select().single();
    if (!error) return data as Settlement;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    if (!settlement.billId || !settlement.fromParticipantId || !settlement.toParticipantId || typeof settlement.amount !== 'number') {
      throw new Error('Thiếu dữ liệu settlement.');
    }
    const db = getLocalDb();
    const created: Settlement = {
      id: makeId(),
      billId: settlement.billId,
      fromParticipantId: settlement.fromParticipantId,
      toParticipantId: settlement.toParticipantId,
      amount: settlement.amount,
    };
    db.settlements.push(created);
    saveLocalDb(db);
    return created;
  },
  async removeSettlement(id: string) {
    const { error } = await supabase.from('settlements').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.settlements = db.settlements.filter((s) => s.id !== id);
    saveLocalDb(db);
  },

  // PaymentTransaction
  async getPaymentTransactions(billId: string): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase.from('paymenttransactions').select('*').eq('billId', billId);
    if (!error) return data as PaymentTransaction[];
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    return getLocalDb().paymenttransactions.filter((t) => t.billId === billId);
  },
  async addPaymentTransaction(tx: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const { data, error } = await supabase.from('paymenttransactions').insert([tx]).select().single();
    if (!error) return data as PaymentTransaction;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    if (!tx.billId || !tx.fromParticipantId || !tx.toParticipantId || typeof tx.amount !== 'number') {
      throw new Error('Thiếu dữ liệu giao dịch thanh toán.');
    }
    const db = getLocalDb();
    const created: PaymentTransaction = {
      id: makeId(),
      billId: tx.billId,
      fromParticipantId: tx.fromParticipantId,
      toParticipantId: tx.toParticipantId,
      amount: tx.amount,
      paymentDate: tx.paymentDate ?? new Date().toISOString(),
      note: tx.note,
      createdAt: tx.createdAt ?? new Date().toISOString(),
    };
    db.paymenttransactions.push(created);
    saveLocalDb(db);
    return created;
  },
  async updatePaymentTransaction(id: string, tx: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const { data, error } = await supabase.from('paymenttransactions').update(tx).eq('id', id).select().single();
    if (!error) return data as PaymentTransaction;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    const existing = db.paymenttransactions.find((t) => t.id === id);
    if (!existing) throw new Error('Không tìm thấy giao dịch cần cập nhật.');
    const updated: PaymentTransaction = { ...existing, ...tx, id: existing.id, billId: existing.billId };
    db.paymenttransactions = db.paymenttransactions.map((t) => (t.id === id ? updated : t));
    saveLocalDb(db);
    return updated;
  },
  async removePaymentTransaction(id: string) {
    const { error } = await supabase.from('paymenttransactions').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTableError(error)) throw error;

    logFallbackOnce();
    const db = getLocalDb();
    db.paymenttransactions = db.paymenttransactions.filter((t) => t.id !== id);
    saveLocalDb(db);
  },
};
