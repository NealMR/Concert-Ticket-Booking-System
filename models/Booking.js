const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest bookings
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Reserved', 'Confirmed', 'Cancelled'],
    default: 'Reserved'
  },
  bookingId: {
    type: String,
    unique: true,
    required: false // Will be auto-generated in pre-save hook
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Generate unique booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.bookingId = `EP${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Index for better query performance
bookingSchema.index({ eventId: 1, sectionName: 1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
