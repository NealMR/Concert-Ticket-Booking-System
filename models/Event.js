const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: false,
    maxlength: 100
  },
  color: {
    type: String,
    required: false,
    default: '#3B82F6' // Default blue color for section highlighting
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  sections: [sectionSchema],
  venueLayout: {
    type: String, // URL or path to the venue layout image
    required: false
  },
  venueLayoutDescription: {
    type: String,
    required: false,
    maxlength: 200
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for available capacity per section
eventSchema.virtual('sectionsWithAvailability').get(function() {
  return this.sections.map(section => ({
    ...section.toObject(),
    availableCapacity: section.totalCapacity // This will be calculated in the booking logic
  }));
});

module.exports = mongoose.model('Event', eventSchema);
