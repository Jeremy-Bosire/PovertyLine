# PovertyLine

PovertyLine is a full-stack platform designed to bridge the gap between individuals living in poverty and available support services. It creates a two-way ecosystem where users can establish verified digital profiles while gaining access to resources, and stakeholders can analyze community-sourced poverty data for better intervention planning.

## 🌟 Key Features

- **User Authentication & Profile Management**: Secure registration, login, and comprehensive user profiles
- **Resource Matching System**: Connect users with relevant resources based on their specific needs
- **Resource Board**: Browse, search, and filter available support services
- **Admin Dashboard**: Analytics and management tools for administrators
- **Mobile-First Design**: Optimized for mobile devices, with responsive desktop experience

## 🛠️ Tech Stack

### Frontend
- React.js with functional components and hooks
- Redux Toolkit for state management
- Material-UI for responsive UI components
- Formik with Yup for form validation
- React Router for navigation
- React Query for data fetching

### Backend
- Flask (Python) with application factory pattern
- RESTful API design with proper endpoint structure
- JWT-based authentication with role-based access control
- SQLAlchemy ORM for database operations

### Database
- PostgreSQL with normalized schema design
- Alembic for database migrations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Python (v3.8 or higher)
- pip (latest version)
- PostgreSQL (v12 or higher)

## 🚀 Getting Started

### Quick Start (Recommended)

We've created a convenient script to set up and run both the backend and frontend servers in one command:

```bash
./run_app.sh
```

This script will:
1. Check for required dependencies
2. Set up and activate the virtual environment if it exists
3. Set up the database if needed
4. Ask if you want to seed the database with test data
5. Start both the backend and frontend servers

### Manual Setup

#### Setting Up the Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/povertyline.git
   cd povertyline
   ```

2. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

5. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. (Optional) Seed the database with test data:
   ```bash
   flask seed_db
   ```

7. Run the development server:
   ```bash
   flask run
   ```
   The API will be available at http://localhost:5000

#### Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at http://localhost:3000

## 📱 Mobile-First Approach

PovertyLine is built with a mobile-first approach, recognizing that many users in our target demographic primarily access the internet through mobile devices. All components are designed to work well on small screens first, then scale up for larger displays.

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control for different user types
- Input validation and sanitization to prevent XSS and injection attacks
- CORS configuration to control API access

## 📊 Database Schema

The database consists of the following main tables:
- **Users**: Authentication and authorization information
- **Profiles**: Detailed user information and demographics
- **Resources**: Support services and opportunities
- **Applications/Matches**: Connections between users and resources
- **Regions**: Geographic data for location-based features

## 🧪 Testing

### Database Seeding

For testing and development, you can seed the database with realistic test data:

```bash
# Using Flask CLI
cd backend
flask seed_db

# Using the seed script
cd backend
./seed_db.sh
```

This will create:
- Admin, provider, and regular users with various verification statuses
- User profiles with varying levels of completion
- Geographic regions with demographic and poverty data
- Resources in different categories (food, housing, healthcare, etc.)
- Resource applications with different statuses

To remove all seeded data:
```bash
flask unseed_db
# or
./seed_db.sh unseed
```

### Test Accounts

After seeding the database, you can log in with these test accounts:

- **Admin User**: admin1@povertyline.org / password123
- **Provider User**: contact@foodbank.org / password123
- **Regular User**: john@example.com / password123

### Running Tests

#### Backend Tests
```bash
cd backend
pytest
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Documentation

API documentation is available at `/api/docs` when running the backend server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Material-UI](https://mui.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
