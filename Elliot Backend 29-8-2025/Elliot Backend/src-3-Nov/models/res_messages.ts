import mongoose, { Schema, Document, model } from 'mongoose';

// 1. Define the enum
export enum MessageType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// 2. Define the interface for the document
export interface IResMessage extends Document {
  type: MessageType;
  message_type: string | null;
  status_code: number;
  msg_in_english: string | null;
  status: boolean;
  code: number;
  created_at: string;
}

// 3. Define the schema
const ResMessagesSchema = new Schema<IResMessage>({
  type: {
    type: String,
    enum: Object.values(MessageType),
    required: true,
  },
  message_type: { type: String, default: null },
  status_code: { type: Number, default: 0 },
  msg_in_english: { type: String, default: null },
  status: { type: Boolean, default: false },
  code: { type: Number, default: 400 },
  created_at: { type: String, default: () => `${+new Date()}` },
});

// 4. Create and export the model
const ResMessages = model<IResMessage>('res_messages', ResMessagesSchema);
export default ResMessages;
