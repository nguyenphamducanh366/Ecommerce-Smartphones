# Smartphone E-Commerce Website

Welcome to the **Smartphone** e-commerce website! This project is built using modern web technologies and provides a robust platform for users to browse, compare, and purchase smartphones online. 

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Security](#security)

## Features

- **Variable Products**: Create and manage a variety of smartphone products.
- **Vouchers**: Generate discount vouchers for promotional offers.
- **Online Banking**: Integrate online payment options for seamless transactions.
- **Product Comparison**: Compare different smartphones based on specifications and prices.
- **Product Evaluation**: Allow users to leave reviews and ratings for products.
- **Statistics Pages**: Access functioning statistics pages for insights into sales and user behavior.
- **User Security**: Secure user accounts with JWT tokens and bcrypt for password encryption.

## Technologies Used

## Technologies Used

- **Frontend**: 
  - React.js
  - Vite
  - Tailwind CSS
  - Bootstrap CSS
  - Ant Design
  - Axios (for HTTP requests)
  - Framer Motion (for animations)
  - React Router (for routing)
  - Chart.js and Recharts (for data visualization)
  - Socket.IO (for real-time communication)

- **Backend**: 
  - Node.js
  - Express.js (for server-side framework)
  - MongoDB (for database management)
  - Mongoose (for MongoDB object modeling)
  - JWT (for user authentication)
  - Bcrypt.js (for password hashing)
  - Cloudinary (for media storage)
  - dotenv (for environment variable management)
  - Cors (for enabling Cross-Origin Resource Sharing)
  - Multer (for handling file uploads)
  - Joi (for data validation)


## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nguyenphamducanh366/Ecommerce-Smartphones.git
   ```

2. **Install dependencies for the backend**:
   ```bash
   cd backend
   npm i
   ```

3. **Install dependencies for the frontend**:
   ```bash
   cd ../frontend
   npm i
   ```

## Running the Application

To run the application, follow these commands:

1. **Start the backend server**:
   ```bash
   cd backend
   node server.js
   ```

2. **Start the frontend development server**:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Security

The application uses JWT (JSON Web Tokens) for user authentication and bcrypt for password hashing to ensure user data is securely managed.

Thank you for checking out the Smartphone e-commerce website! We hope you find it useful and enjoyable.
