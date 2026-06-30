import { Schema, models, model, Types } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface IConversation {
  _id: string;
  userId: Types.ObjectId;
  title: string;
  model: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Cuộc trò chuyện mới" },
    model: { type: String, default: "gpt-4o-mini" },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Conversation || model<IConversation>("Conversation", ConversationSchema);
