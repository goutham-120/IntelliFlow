import mongoose from "mongoose";

import { SLA_STATUS_LIST } from "../constants/slaStatus.js";

const slaRecordSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      default: null,
      index: true,
    },
    stageName: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: SLA_STATUS_LIST,
      default: "on_track",
      index: true,
    },
    targetMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    elapsedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    warningAt: {
      type: Date,
      default: null,
    },
    dueAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    breachedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

slaRecordSchema.index({ organizationId: 1, taskId: 1, stageName: 1 }, { unique: true });
slaRecordSchema.index({ organizationId: 1, status: 1, dueAt: 1 });

const SLARecord = mongoose.model("SLARecord", slaRecordSchema);

export default SLARecord;
