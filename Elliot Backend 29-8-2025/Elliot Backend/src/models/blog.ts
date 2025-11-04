import mongoose, { Document, Schema } from 'mongoose';

interface IBlog extends Document {
    heading: string | null;
    slug: string | null;
    image: string | null;
    author: string;
    authorProfileImage: string | null;
    description: string | null;
    status: number;
    created_at: Date;
}

const blogSchema: Schema = new Schema({
    heading: { type: String, default: null },
    slug: { type: String, default: null, unique: true, index: true },
    image: { type: String, default: null },
    author: { type: String, default: "admin" },
    authorProfileImage: { type: String, default: null },
    description: { type: String, default: null },
    status: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now },
});

blogSchema.pre('save', function (next) {
    if (this.heading && typeof this.heading === "string") {
        this.slug = this.heading
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
    }
    next();
});


const Blog = mongoose.model<IBlog>('Blog', blogSchema);
export default Blog;
