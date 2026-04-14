import mongoose from "mongoose";

const groupMembershipSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleInGroup: {
      type: String,
      enum: ["member", "team_lead"],
      default: "member",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

groupMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMembershipSchema.index({ organizationId: 1, groupId: 1 });
groupMembershipSchema.index({ organizationId: 1, userId: 1 });

const GroupMembership = mongoose.model("GroupMembership", groupMembershipSchema);

export default GroupMembership;
