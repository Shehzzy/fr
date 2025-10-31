import mongoose, { Schema } from 'mongoose';
interface PageMeta {
    page: string;
    title: string;
    description: string;
    keywords: string;
}

const PageMetaSchema = new Schema<PageMeta>({
    page: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    keywords: { type: String },
}, { timestamps: true });

const PageMetaModel = mongoose.model<PageMeta>('PageMeta', PageMetaSchema);
export default PageMetaModel;




