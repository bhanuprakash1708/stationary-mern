# Stationery Management System

A modern, full-stack web application for managing stationery orders with real-time inventory tracking, time slot booking, and integrated payment processing.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse available stationery items with real-time stock information
- **Time Slot Booking**: Select preferred delivery/pickup time slots
- **Calendar Integration**: Choose delivery dates with an intuitive calendar interface
- **Payment Integration**: Secure payment processing with Razorpay
- **Order Tracking**: Check order status and track deliveries
- **Rush Order Management**: Handle urgent orders with special pricing

### Admin Features
- **Inventory Management**: Add, edit, and manage stationery items
- **Stock Control**: Real-time stock tracking and updates
- **Order Management**: View and manage customer orders
- **Time Slot Management**: Configure available delivery/pickup slots
- **Dashboard Analytics**: Overview of orders, inventory, and business metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React DatePicker** - Date selection component
- **Vite** - Fast build tool and development server

### Backend & Database
- **MongoDB** - NoSQL database for data storage
- **MongoDB Driver** - Native MongoDB connection
- **Node.js** - JavaScript runtime environment

### Payment & Authentication
- **Razorpay** - Payment gateway integration
- **JWT (JSON Web Tokens)** - Authentication system
- **bcryptjs** - Password hashing

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
stationary-mern/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Calendar.jsx
│   │   ├── StationeryItem.jsx
│   │   ├── TimeSlotPicker.jsx
│   │   ├── PaymentModal.jsx
│   │   ├── OrderStatusCheck.jsx
│   │   ├── OrdersManagement.jsx
│   │   └── StockManagement.jsx
│   ├── pages/              # Main application pages
│   │   ├── StoreFront.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── AdminLogin.jsx
│   ├── contexts/           # React context providers
│   │   └── AuthContext.jsx
│   ├── utils/              # Utility functions
│   │   ├── orderNumber.js
│   │   ├── razorpay.js
│   │   └── stockManager.js
│   ├── lib/                # External library configurations
│   │   └── mongodb.js
│   ├── App.jsx             # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── mongodb/               # Database initialization
│   └── init-database.js
├── dist/                  # Production build files
└── node_modules/          # Dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stationary-mern
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/stationery_management
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Initialize the database**
   ```bash
   node mongodb/init-database.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Customer Store: `http://localhost:5173`
   - Admin Dashboard: `http://localhost:5173/admin`

## 📊 Database Schema

### Collections

#### stationery_items
- `_id`: ObjectId
- `name`: String
- `description`: String
- `price`: Number
- `stock`: Number
- `category`: String
- `image`: String (optional)

#### bookings
- `_id`: ObjectId
- `orderNumber`: String
- `customerName`: String
- `items`: Array of ordered items
- `totalAmount`: Number
- `selectedDate`: Date
- `selectedSlot`: String
- `status`: String (pending, confirmed, completed, cancelled)
- `paymentId`: String
- `createdAt`: Date

#### rush_status
- `_id`: ObjectId
- `isRushActive`: Boolean
- `rushMultiplier`: Number
- `updatedAt`: Date

## 🔧 Configuration

### Payment Setup (Razorpay)
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the dashboard
3. Add the keys to your `.env` file
4. Configure webhook endpoints for payment verification

### MongoDB Setup
- **Local MongoDB**: Install MongoDB locally and ensure it's running on port 27017
- **MongoDB Atlas**: Create a cluster and get the connection string
- Update the `MONGODB_URI` in your environment variables

## 🚀 Deployment

### Frontend Deployment
The application is built with Vite and can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Database Deployment
- MongoDB Atlas (recommended for production)
- Self-hosted MongoDB instance
- Docker containerized MongoDB

## 🔒 Security Features

- JWT-based authentication for admin access
- Password hashing with bcryptjs
- Input validation and sanitization
- Secure payment processing with Razorpay
- Environment variable protection for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Endpoints

### Customer Endpoints
- `GET /api/items` - Get all stationery items
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:orderNumber` - Get booking details
- `GET /api/rush-status` - Get current rush status

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status
- `POST /api/admin/items` - Add new item
- `PUT /api/admin/items/:id` - Update item
- `DELETE /api/admin/items/:id` - Delete item

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Payment Integration Issues**
   - Verify Razorpay API keys
   - Check webhook configuration
   - Ensure HTTPS in production

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---
