const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { managerAuth } = require('../middleware/auth');

const router = express.Router();

// ========== EVENT MANAGEMENT ==========

// @route   GET /api/manager/events
// @desc    Get all events for manager
// @access  Private (Manager only)
router.get('/events', managerAuth, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Get manager events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   POST /api/manager/events
// @desc    Create new event
// @access  Private (Manager only)
router.post('/events', managerAuth, [
  body('title').notEmpty().withMessage('Event title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Event time is required'),
  body('location').notEmpty().withMessage('Event location is required'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('sections').isArray({ min: 1 }).withMessage('At least one section is required'),
  body('sections.*.name').notEmpty().withMessage('Section name is required'),
  body('sections.*.price').isNumeric().withMessage('Section price must be a number'),
  body('sections.*.totalCapacity').isInt({ min: 1 }).withMessage('Section capacity must be at least 1'),
  body('venueLayout').optional().isURL().withMessage('Venue layout must be a valid URL'),
  body('venueLayoutDescription').optional().isLength({ max: 200 }).withMessage('Venue layout description must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = new Event(req.body);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// @route   PUT /api/manager/events/:id
// @desc    Update event
// @access  Private (Manager only)
router.put('/events/:id', managerAuth, [
  body('title').optional().notEmpty().withMessage('Event title cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().notEmpty().withMessage('Event time cannot be empty'),
  body('location').optional().notEmpty().withMessage('Event location cannot be empty'),
  body('description').optional().notEmpty().withMessage('Event description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   DELETE /api/manager/events/:id
// @desc    Delete event
// @access  Private (Manager only)
router.delete('/events/:id', managerAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Also delete all related bookings
    await Booking.deleteMany({ eventId: req.params.id });

    res.json({ message: 'Event and related bookings deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

// ========== BOOKING MANAGEMENT ==========

// @route   GET /api/manager/bookings
// @desc    Get all bookings for manager
// @access  Private (Manager only)
router.get('/bookings', managerAuth, async (req, res) => {
  try {
    const { eventId, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('eventId', 'title date time location')
      .populate('userId', 'username email')
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get manager bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// @route   PUT /api/manager/bookings/:id/confirm
// @desc    Confirm booking (payment received)
// @access  Private (Manager only)
router.put('/bookings/:id/confirm', managerAuth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed' },
      { new: true }
    ).populate('eventId', 'title date time location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ message: 'Server error confirming booking' });
  }
});

// @route   PUT /api/manager/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private (Manager only)
router.put('/bookings/:id/cancel', managerAuth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    ).populate('eventId', 'title date time location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
});

// @route   GET /api/manager/dashboard
// @desc    Get dashboard statistics
// @access  Private (Manager only)
router.get('/dashboard', managerAuth, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    
    const totalBookings = await Booking.countDocuments();
    const reservedBookings = await Booking.countDocuments({ status: 'Reserved' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('eventId', 'title date')
      .populate('userId', 'username')
      .sort({ bookingDate: -1 })
      .limit(5);

    res.json({
      stats: {
        totalEvents,
        activeEvents,
        totalBookings,
        reservedBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      },
      recentBookings
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

module.exports = router;
