import mongoose from "mongoose";

const sccDefectSchema = new mongoose.Schema(
  {
    no: { type: Number, required: true, unique: true },
    defectNameEng: { type: String, required: true },
    defectNameKhmer: { type: String, required: true },
    defectNameChinese: { type: String, required: true },
  },
  {
    collection: "sccdefects", // Explicitly set collection name
    timestamps: true,
  }
);

export default function createSCCDefectModel(connection) {
  return connection.model("SCCDefect", sccDefectSchema);
}
