import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
  imgUrl: { type: String },
  status: { type: Boolean },
});

export default mongoose.model("Banner", BannerSchema);
