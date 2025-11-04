import mongoose, { Document, Schema } from 'mongoose';

export interface ISection {
  _id?: string;
  section: string;
  content: string;
}

export interface IPage extends Document {
  page: string;
  sections: ISection[];
}

const pageSchema: Schema = new Schema({
  page: { type: String, required: true, unique: true },
  sections: [
    {
      section: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
});

const Page = mongoose.model<IPage>('Page', pageSchema);

export default Page;
