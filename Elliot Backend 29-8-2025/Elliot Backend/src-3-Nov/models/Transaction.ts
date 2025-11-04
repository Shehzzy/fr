// models/Transaction.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface ITransaction extends Document {
    user_id: mongoose.Types.ObjectId | null;
    transaction_id: string | null;
    type: string | null;
    payment_status: number;
    plan_id: string,
    subscription_id: string;
    current_period_end: number
    created_at: string;
    status: string;
    full_response: any;
    amount: number;
    promo_code: string
}

const TransactionSchema: Schema<ITransaction> = new Schema<ITransaction>({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    transaction_id: { type: String, default: null },
    type: { type: String, default: null },
    payment_status: { type: Number, default: 0 },
    plan_id: { type: String, default: null },
    created_at: { type: String, default: () => `${+new Date()}` },
    subscription_id: { type: String, default: null },
    current_period_end: { type: Number, default: null },
    amount: { type: Number, default: null },
    status: { type: String, enum: ['active', 'inactive', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'past_due', 'unpaid'], default: 'active' },
    full_response: { type: Schema.Types.Mixed, default: null },
    promo_code: { type: String, default: null }
});

const Transaction = model<ITransaction>('transaction', TransactionSchema);

export default Transaction;
