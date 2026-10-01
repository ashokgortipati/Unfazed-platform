import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Intake Form', 'Assessment', 'Worksheet', 'Medical Record', 'Therapy Plan', 'Other'],
      default: 'Other',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'uploadedByModel',
    },
    uploadedByModel: {
      type: String,
      required: true,
      enum: ['Therapist', 'Client'],
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
    },
    visibility: {
      type: String,
      enum: ['private', 'shared'],
      default: 'private',
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ therapist: 1, client: 1, visibility: 1 });

export const Document = mongoose.model('Document', documentSchema);
