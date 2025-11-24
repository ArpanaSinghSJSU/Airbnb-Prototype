# Airbnb Prototype Requirements

## Project Overview
Develop a prototype of Airbnb using **React** for the frontend and **Node.js (Express.js)** for the backend. The application must support two main personas:
- **Traveler**
- **Owner (Property Host)**

---

## Tech Stack

### Frontend
- **Framework**: React
- **Styling**: Bootstrap or TailwindCSS (fully responsive)
- **API Communication**: Axios or Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Express-session (session-based)
- **Password Security**: bcrypt.js

### AI Agent Service
- **Framework**: Python FastAPI
- **LLM Integration**: Langchain
- **Database**: MySQL
- **Web Search**: [Tavily API](https://www.tavily.com/#features)

---

## Required Features

### Traveler Features

#### 1. Authentication
- **Signup**: Traveler signs up with name, email ID, and password (store securely using bcrypt.js)
- **Login/Logout**: Implement basic session-based authentication using Express-session

#### 2. Profile Management
- **Profile Page**: Display customer details
  - Upload profile picture
  - Update profile information:
    - Name
    - Email
    - Phone number
    - About me
    - City
    - Country (dropdown list)
    - State (abbreviated)
    - Languages
    - Gender

#### 3. Property Search & Booking
- **Property Search Page/Dashboard**: Search available properties by:
  - Location
  - Start Date, End Date
  - Number of Guests
- **Property Details View**: View details such as:
  - Property name
  - Type
  - Amenities
  - Pricing
  - Bedrooms
  - Bathrooms
  - Availability
  - Allow booking from this view

#### 4. Booking Flow
- Create a booking request for selected dates/guests
- A booking starts in **PENDING** state until the Owner responds
- Travelers can view:
  - Pending bookings
  - Accepted bookings
  - Cancelled bookings

#### 5. Favorites
- Mark properties as favorites
- Display a favorites tab

#### 6. Traveler History
- Display a history tab for any previous bookings/trips taken

#### 7. Agent AI
- The agent's button should be accessible to the user from the dashboard

---

### Owner (Host) Features

#### 1. Authentication
- **Signup**: Owner signs up with name, email ID, password, and location
- **Login/Logout**: Implement session-based authentication

#### 2. Profile Management
- View/update profile details:
  - Name
  - Location
  - Contact info
  - Images
- Add/edit property details:
  - Property name
  - Type
  - Amenities
  - Pricing
  - Bedrooms
  - Bathrooms
  - Availability

#### 3. Property Posting
- Post property for rent with details:
  - Location
  - Description
  - Photos
  - Pricing
  - Amenities
  - Availability

#### 4. Booking Management
- View incoming booking requests for your properties
- **Accept** or **Cancel** each request:
  - **Accepting** a booking:
    - Changes status to **ACCEPTED**
    - Blocks the property for the requested dates
  - **Cancelling** a booking:
    - Changes status to **CANCELLED**
    - Releases the dates

#### 5. Owner Dashboard
- Show previous bookings
- Show recent requests

---

## Backend Development Requirements

### Technology
- **Node.js** with **Express.js** for the backend
- **Database**: MySQL

### RESTful APIs
Implement RESTful APIs for:
- User authentication (session-based login/signup)
- Traveler profile management
- Property posting and management
- Property search and booking
- Traveler and Owner dashboards

### Bookings API
- **Create booking** (Traveler) → status **PENDING**
- **List bookings** (Traveler & Owner)
- **Accept booking** (Owner) → status **ACCEPTED**
- **Cancel booking** (Owner or Traveler) → status **CANCELLED**

### Security & Error Handling
- Secure API endpoints with basic validation and error handling
- Handle errors with proper exception handling

---

## Frontend Development Requirements

### Responsive Design
- The frontend should be fully responsive using CSS frameworks like **Bootstrap** or **TailwindCSS**

### API Integration
- API calls should be managed using **Axios** or **Fetch API**

---

## Agent Features (AI Concierge)

### Technology Stack
- **Python FastAPI**
- **Langchain**
- **MySQL**
- **Web Search**: [Tavily API](https://www.tavily.com/#features)

### Functionality
Given a booking (dates, location, party type), traveler preferences (budget, interests, mobility needs, dietary filters), and live/local context (weather, POIs, events), the agent produces:

#### Outputs
- **Day-by-day plan** (morning/afternoon/evening blocks)
- **Activity cards**:
  - Title
  - Address/geo location
  - Price tier
  - Duration
  - Tags
  - Wheelchair-friendly flags
  - Child-friendly flags
- **Restaurant recommendations** filtered by dietary needs
- **Packing checklist** (weather-aware)

#### Natural Language Understanding (NLU)
- Users may submit a free-text ask
- Example: *"we're in {user's booking should be passed in context} vegan, no long hikes, two kids"*

### Inputs
- **Booking context**: dates, location, party type
- **Preferences**: budget, interests, mobility needs, dietary filters
- **Local context**: Point of Interest catalog & events (local events)

### REST Endpoint
- Create the AI service in Python as a REST endpoint
- **POST** request to AI Concierge Agent → returns suggestions in JSON format

---

## User Interface (UI) Specifications

### AI Agent Button
- In your **Dashboard**, the agent service should show up as a **button on the bottom right corner**
- Upon clicking the button, the layout should open on the **right-hand side of the screen**
- Feel free to add **FAQ buttons** (optional)
- Your agentic service should be usable from UI

### Reference
Visit [HDFC Bank](https://www.hdfcbank.com/) to see the structure

---

## Booking State Flow

```
PENDING → ACCEPTED (by Owner)
        → CANCELLED (by Owner or Traveler)
```

### State Definitions
- **PENDING**: Initial state when Traveler creates a booking request
- **ACCEPTED**: Owner has accepted the booking (property dates are blocked)
- **CANCELLED**: Booking has been cancelled (property dates are released)

---

## Database Considerations

### User Management
- Separate tables/roles for Travelers and Owners
- Secure password storage using bcrypt.js
- Session management for authentication

### Property Management
- Property details (name, type, description, location, pricing)
- Amenities
- Availability calendar
- Photos/images

### Booking Management
- Booking requests with status tracking
- Date range blocking for accepted bookings
- Association with Traveler and Property

### Favorites
- Many-to-many relationship between Travelers and Properties

---

## Development Phases

### Phase 1: Backend Development
1. Set up Express.js server
2. Configure MySQL database
3. Implement authentication APIs
4. Implement property APIs
5. Implement booking APIs
6. Implement favorites APIs

### Phase 2: Frontend Development
1. Set up React application
2. Implement authentication flows
3. Create Traveler dashboard and features
4. Create Owner dashboard and features
5. Implement responsive design
6. Integrate with backend APIs

### Phase 3: AI Agent Development
1. Set up Python FastAPI service
2. Integrate Langchain
3. Implement Tavily web search
4. Create recommendation engine
5. Implement NLU for free-text queries
6. Expose REST endpoint

### Phase 4: Integration & Testing
1. Integrate AI agent with frontend
2. End-to-end testing
3. UI/UX refinements
4. Security testing

---

## Success Criteria

- ✅ Both Traveler and Owner can sign up, log in, and manage profiles
- ✅ Travelers can search, view, and book properties
- ✅ Owners can post properties and manage booking requests
- ✅ Booking state management works correctly (PENDING → ACCEPTED/CANCELLED)
- ✅ Date blocking works when bookings are accepted
- ✅ Favorites functionality works for travelers
- ✅ AI Concierge Agent provides personalized recommendations
- ✅ UI is fully responsive and user-friendly
- ✅ All APIs are secure with proper error handling

---

## Additional Notes

- Ensure proper validation on both frontend and backend
- Implement proper error messages for users
- Consider pagination for property listings and booking history
- Optimize database queries for performance
- Follow REST API best practices
- Implement proper logging for debugging

