import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

groupSchema.index({ organizationId: 1, code: 1 }, { unique: true });
groupSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const Group = mongoose.model("Group", groupSchema);

export default Group;
