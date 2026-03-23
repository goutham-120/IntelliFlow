import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      default: null,
    },
    stageName: {
      type: String,
      default: "",
      trim: true,
    },
    assignedGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done", "blocked"],
      default: "pending",
    },
    completedStages: {
      type: [
        {
          stageName: { type: String, required: true, trim: true },
          completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          completedAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

taskSchema.index({ organizationId: 1, assignedTo: 1, status: 1 });
taskSchema.index({ organizationId: 1, assignedGroupId: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
