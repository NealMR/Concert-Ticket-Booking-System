# EventPass Offline Booking System

A comprehensive MERN stack application for offline event ticket booking where customers can reserve seats online and pay on-site at the venue.

## 🚀 Features

### Customer Features
- **Browse Events**: View all available events with details
- **Guest Checkout**: Book tickets without registration (optional)
- **User Registration**: Create account to track bookings
- **Seat Selection**: Choose from different sections with pricing
- **Booking Management**: View and track reservation status
- **Responsive Design**: Works on desktop and mobile devices

### Manager Features
- **Event Management**: Create, edit, and delete events
- **Section Configuration**: Set up different seating sections with pricing
- **Booking Management**: View all bookings with filtering options
- **Payment Confirmation**: Confirm bookings after on-site payment
- **Dashboard Analytics**: Overview of events and booking statistics

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client

## 📁 Project Structure

```
EventPass/
├── server.js                 # Main server file
├── package.json             # Backend dependencies
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Event.js
│   └── Booking.js
├── routes/                  # API routes
│   ├── auth.js
│   ├── events.js
│   ├── bookings.js
│   └── manager.js
├── middleware/              # Custom middleware
│   └── auth.js
└── client/                  # React frontend
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/          # Page components
    │   ├── contexts/       # React contexts
    │   └── services/       # API services
    └── package.json        # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EventPass
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/eventpass
   JWT_SECRET=your_jwt_secret_key_here
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events (Public)
- `GET /api/events` - Get all active events
- `GET /api/events/:id` - Get single event details

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my` - Get user's bookings (authenticated)
- `GET /api/bookings/:bookingId` - Get booking by ID

### Manager Routes (Protected)
- `GET /api/manager/dashboard` - Dashboard statistics
- `GET /api/manager/events` - Get all events (manager)
- `POST /api/manager/events` - Create event
- `PUT /api/manager/events/:id` - Update event
- `DELETE /api/manager/events/:id` - Delete event
- `GET /api/manager/bookings` - Get all bookings
- `PUT /api/manager/bookings/:id/confirm` - Confirm booking
- `PUT /api/manager/bookings/:id/cancel` - Cancel booking

## 🎯 User Roles

### Customer
- Browse and view events
- Create bookings (guest or registered)
- Track booking status
- Optional account registration

### Manager
- Full event management (CRUD)
- Booking management and confirmation
- Dashboard analytics
- Payment confirmation on-site

## 💳 Booking Flow

1. **Customer browses events** on the homepage
2. **Selects an event** and views details
3. **Chooses section and quantity** for booking
4. **Provides contact information** (guest checkout or logged in)
5. **Reservation created** with "Reserved" status
6. **Customer arrives at venue** and pays on-site
7. **Manager confirms payment** and updates status to "Confirmed"

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- CORS protection
- Environment variable configuration

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **User-Friendly**: Intuitive navigation and clear feedback
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Loading States**: Smooth user experience with loading indicators

## 🧪 Testing

To test the application:

1. **Start the application** using `npm run dev`
2. **Create a manager account** by registering with role "manager"
3. **Create events** through the manager dashboard
4. **Test customer booking flow** as a guest or registered user
5. **Confirm bookings** through the manager interface

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**EventPass Offline Booking System** - Making event management simple and efficient! 🎫
