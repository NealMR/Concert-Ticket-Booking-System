const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public (guest checkout)
router.post('/', [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('customerPhone').notEmpty().withMessage('Phone number is required'),
  body('sectionName').notEmpty().withMessage('Section name is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, customerName, customerEmail, customerPhone, sectionName, quantity, userId } = req.body;

    // Verify event exists and is active
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found or inactive' });
    }

    // Find the section
    const section = event.sections.find(s => s.name === sectionName);
    if (!section) {
      return res.status(400).json({ message: 'Invalid section name' });
    }

    // Check availability
    const bookedQuantity = await Booking.aggregate([
      {
        $match: {
          eventId: event._id,
          sectionName: section.name,
          status: { $in: ['Reserved', 'Confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalBooked: { $sum: '$quantity' }
        }
      }
    ]);

    const booked = bookedQuantity.length > 0 ? bookedQuantity[0].totalBooked : 0;
    const available = section.totalCapacity - booked;

    if (available < quantity) {
      return res.status(400).json({ 
        message: `Only ${available} seats available in ${sectionName} section` 
      });
    }

    // Create booking
    const booking = new Booking({
      eventId,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      sectionName,
      quantity,
      totalAmount: section.price * quantity
    });

    await booking.save();

    // Populate event details for response
    await booking.populate('eventId', 'title date time location');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        event: booking.eventId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        sectionName: booking.sectionName,
        quantity: booking.quantity,
        totalAmount: booking.totalAmount,
        status: booking.status,
        bookingDate: booking.bookingDate
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// @route   GET /api/bookings/my
// @desc    Get user's bookings
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('eventId', 'title date time location')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// @route   GET /api/bookings/:bookingId
// @desc    Get booking by booking ID
// @access  Public
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('eventId', 'title date time location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error fetching booking' });
  }
});

module.exports = router;
