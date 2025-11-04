import mongoose, { Document, Schema, model } from "mongoose";

// Define the interface for Home
export interface IHome extends Document {
  home1Heading: string | null;
  home1HeadingGreen: string | null;
  homeDesc: string | null;
  homeSubHeading: string | null;
  homeDesc2: string | null;
  homeDesc3: string | null;
  home3Heading: string | null;
  home3HeadingGreen: string | null;
  homeCardHeading1: string | null;
  homeCardDesc1: string | null;
  homeCardHeading2: string | null;
  homeCardDesc2: string | null;
  homeCardHeading3: string | null;
  homeCardDesc3: string | null;
  homeDesc4: string | null;
  homeDesc4Green: string | null;
  home2Heading: string | null;
  home2CardHeading1: string | null;
  home2CardSubHeading1: string | null;
  home2CardDesc1: string | null;
  home3CardHeading1: string | null;
  home3CardSubHeaing1: string | null;
  home3CardDesc1: string | null;
  home2CardSubHeading2: string | null;
  home2CardSubHeading2Green: string | null;
  home1Btn: string | null;
  home3CardBtn: string | null;
  homeCardImage1: string | null;
  homeCardImage2: string | null;
  homeCardImage3: string | null;
  home2CardImage1: string | null;
  status: number | null;
  created_at: string;
}


// Define the schema
const HomeSchema = new Schema<IHome>({
  home1Heading: { type: String, default: null },
  home1HeadingGreen: { type: String, default: null },
  homeDesc: { type: String, default: null },
  homeSubHeading: { type: String, default: null },
  homeDesc2: { type: String, default: null },
  homeDesc3: { type: String, default: null },
  home3Heading: { type: String, default: null },
  home3HeadingGreen: { type: String, default: null },
  homeCardHeading1: { type: String, default: null },
  homeCardDesc1: { type: String, default: null },
  homeCardHeading2: { type: String, default: null },
  homeCardDesc2: { type: String, default: null },
  homeCardHeading3: { type: String, default: null },
  homeCardDesc3: { type: String, default: null },
  homeDesc4: { type: String, default: null },
  homeDesc4Green: { type: String, default: null },
  home2Heading: { type: String, default: null },
  home2CardHeading1: { type: String, default: null },
  home2CardSubHeading1: { type: String, default: null },
  home2CardDesc1: { type: String, default: null },
  home3CardHeading1: { type: String, default: null },
  home3CardSubHeaing1: { type: String, default: null },
  home3CardDesc1: { type: String, default: null },
  home2CardSubHeading2: { type: String, default: null },
  home2CardSubHeading2Green: { type: String, default: null },
  home1Btn: { type: String, default: null },
  home3CardBtn: { type: String, default: null },
  homeCardImage1: { type: String, default: null },
  homeCardImage2: { type: String, default: null },
  homeCardImage3: { type: String, default: null },
  home2CardImage1: { type: String, default: null },
  status: { type: Number, default: 1 },
  created_at: { type: String, default: () => `${+new Date()}` },
});


// Export the model
const HomeSch = model<IHome>('home', HomeSchema);
export default HomeSch;
