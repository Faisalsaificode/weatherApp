import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index: one entry per city per user
citySchema.index({ user: 1, lat: 1, lon: 1 }, { unique: true });

const City = mongoose.model('City', citySchema);
export default City;
