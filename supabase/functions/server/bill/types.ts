// Bill Splitting Domain Types
export type BillStatus = 'PENDING' | 'COMPLETED';

export interface Bill {
  id: string;
  name: string;
  createdDate: string;
  status: BillStatus;
  totalAmount: number;
}

export interface Participant {
  id: string;
  billId: string;
  name: string;
}

export interface Item {
  id: string;
  billId: string;
  name: string;
  price: number;
}

export interface ItemShare {
  id: string;
  itemId: string;
  participantId: string;
}

export interface Payment {
  id: string;
  billId: string;
  participantId: string;
  amountPaid: number;
}

export interface Settlement {
  id: string;
  billId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
}

export interface PaymentTransaction {
  id: string;
  billId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}
