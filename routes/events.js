const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all active events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .select('-sections._id')
      .sort({ date: 1 });

    // Calculate available capacity for each section
    const eventsWithAvailability = await Promise.all(
      events.map(async (event) => {
        const sectionsWithAvailability = await Promise.all(
          event.sections.map(async (section) => {
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

            return {
              ...section.toObject(),
              availableCapacity: Math.max(0, available),
              isAvailable: available > 0
            };
          })
        );

        return {
          ...event.toObject(),
          sections: sectionsWithAvailability
        };
      })
    );

    res.json(eventsWithAvailability);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event with detailed info
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Calculate available capacity for each section
    const sectionsWithAvailability = await Promise.all(
      event.sections.map(async (section) => {
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

        return {
          ...section.toObject(),
          availableCapacity: Math.max(0, available),
          isAvailable: available > 0
        };
      })
    );

    res.json({
      ...event.toObject(),
      sections: sectionsWithAvailability
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

module.exports = router;
