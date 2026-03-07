# CredBuzz

## Project Overview
CredBuzz is a collaborative platform where users can exchange credits for tasks they create and fulfill based on their wishes and the number of credits they have. The system encourages community engagement and participation by allowing users to earn credits for time or tasks contributed and to spend those credits on services that they need.

## Key Benefits
1. Collaborative Economy: CredBuzz operates on the principles of a collaborative economy, where users contribute their time and skills to help each other. This not only enhances community engagement but also allows for the efficient utilization of individual skills and resources.

2. Credit-Based System: Users earn credits by completing tasks for others and can use these credits to request services in return. This creates a self-sustaining ecosystem and all the users have an equal opportunity to benefit.

3. Task Creation & Fulfillment: Users can post tasks that they need assistance with, specifying the required skills and the number of credits offered. Other users can browse these tasks and claim the ones that match their abilities and interests. This system ensures that tasks are completed by individuals who are both capable and willing.

4. Community Trust: To foster a trustworthy and reliable community, CredBuzz includes a rating and review system. After completing a task, both the task poster and the task claimer can rate and review each other. This feedback mechanism helps maintain high standards and accountability within the platform.

5. Empowering Individuals: CredBuzz empowers individuals by allowing them to leverage their skills and time to earn credits. This can be particularly beneficial for those who may have limited financial resources but possess valuable skills. 

6. Building Connections: The platform encourages users to connect and collaborate with others in their community. By helping each other, users build strong relationships and a sense of belonging.

7. Flexibility & Autonomy: Users have the flexibility to choose which tasks they want to take on based on their availability and interests. This autonomy ensures that users are engaged and motivated to participate.

8. Skill Development: By participating in a variety of tasks, users can develop new skills and gain experience in different areas. This can enhance their personal and professional growth.

## Features

1. **User Registration & Profile Management**: Users can create profiles, track their credits, and view their transaction history.
2. **Auction-Based Task Assignment**: Tasks go through an open bidding phase — workers submit proposals with their credit ask and estimated days. The creator reviews all proposals and selects the best fit.
3. **Credit Escrow System**: Credits are locked in escrow only when the creator selects a bidder, protecting both parties. Credits are released to the worker upon approval.
4. **Task Marketplace**: A central hub where all open and bidding tasks are listed, allowing users to browse and submit proposals.
5. **Real-Time Task Chat**: Once a worker is assigned, the creator and worker get a private Socket.io chat channel on the task page.
6. **Ratings & Reviews**: After a task is completed, both parties can rate and review each other, maintaining community trust.
7. **AI-Powered Task Assistance**: AI suggestions for task titles and descriptions while creating tasks, plus an AI review of submitted work to help creators make informed decisions.
8. **Analytics & Reports**: Users can track their activity, credits earned and spent, and gain insights into their contributions.

### Additional Features that can be implemented:
1. **Mobile Application**: Developing a mobile app to increase accessibility and user engagement.
2. **Automated Matching System**: A system that matches tasks with suitable users based on their skills and availability.
3. **Gamification**: Introducing leaderboards, and rewards to increase user participation.
4. **Integration with Other Platforms**: Allowing users to sync their CredBuzz credits and tasks with other services like Google Calendar,etc.

## Task Lifecycle / Workflow

```
OPEN  →  BIDDING  →  ASSIGNED  →  SUBMITTED  →  COMPLETED
                                              ↘  REJECTED (creator requests changes)
```

1. **OPEN** — Task is created and visible on the marketplace. Anyone can submit a proposal.
2. **BIDDING** — First proposal received; task enters bidding phase. More proposals accepted up to the creator's set maximum (`maxBidders`). Bidding closes automatically once the cap is hit.
3. **ASSIGNED** — Creator selects a bidder. Credits are locked in escrow (deducted from creator's balance). The chosen worker and creator now have access to a private task chat.
4. **SUBMITTED** — Worker submits their completed work (text + files). An AI review is generated for the creator.
5. **COMPLETED** — Creator approves the submission. Escrowed credits are transferred to the worker.
6. **REJECTED** — Creator requests changes with a reason. Worker can revise and re-submit.


## Tools & Technologies
### Frontend
- **React.js**: For building a dynamic and responsive user interface.
- **Tailwind CSS v4**: Utility-first styling with a dark theme throughout.
- **Lucide React**: Icon library used across the UI.
- **Socket.io-client**: For real-time task chat between creator and assigned worker.

### Backend
- **Node.js**: For server-side logic.
- **Express.js**: For building the API endpoints.
- **MongoDB / Mongoose**: For the database — stores users, tasks, bids, transactions, and chat messages.

### Authentication
- **JWT**: For secure user authentication and session management.

### Real-time Communication
- **Socket.io**: Per-task chat rooms for real-time messaging between creator and worker.

### Deployment
- **Render**: Backend server deployment.
- **Vercel / Netlify**: Frontend deployment.


## AWS S3 Avatar Upload (Backend)

This project includes optional support for storing user avatar uploads in AWS S3. The feature is optional — when S3 is not configured the backend falls back to saving uploaded avatars on the local filesystem under `Backend/uploads/avatars`.

To enable S3 uploads, provide these environment variables in your backend environment (for local development place in `Backend/.env`):

- `AWS_S3_BUCKET` - your S3 bucket name (e.g. `my-app-avatars`)
- `AWS_REGION` - the AWS region for your bucket (e.g. `us-east-1`)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - credentials for an IAM user with S3 PutObject permissions (for local testing). In production prefer IAM roles.

Behavior and notes:
- If `AWS_S3_BUCKET` and `AWS_REGION` are present the backend will configure multer to use memory storage and the avatar upload controller will upload images to S3 and save a public URL on the user document.
- If those env vars are not present, the server uses disk storage and saves files to `./uploads/avatars` (served statically at `/uploads/*`).
- The current implementation sets uploaded S3 objects to `public-read`. If your bucket blocks public ACLs you can either adjust the bucket policy or change the code to use presigned URLs instead (recommended for private objects).

Quick local test (disk fallback):

1. Ensure dependencies are installed: `cd Backend && npm install`
2. Create uploads folder: `mkdir -p Backend/uploads/avatars` (or in PowerShell: `New-Item -ItemType Directory -Path .\Backend\uploads\avatars -Force`).
3. Start the backend: `node server.js` (or `npm run dev`).
4. POST a multipart/form-data request to `/api/users/upload-avatar` with field name `avatar` and an Authorization bearer token.

Quick local test (S3 enabled):

1. Set the environment variables above (or add them to `Backend/.env`) and restart the backend.
2. POST to `/api/users/upload-avatar` as above. The response will include the S3 URL saved on the user object.

If you want, I can add a short UI page to the frontend to test avatar uploads and demonstrate both flows.
# Week 1-2: Project Setup
- Initialize project repository and set up development environment.
- Build a project roadmap (deliverables and deadlines for team members).
- Design UI/UX mockups for Task Marketplace and User Profiles.
- Finalize database schema for users, tasks, and credit transactions.

"Set up project repository, UI/UX mockups, and database schema."

# Week 2-3: Backend Development
- Install and configure Node.js, Express.js, and MongoDB.
- Implement JWT-based authentication (Registration, Login, Logout).
- Develop CRUD APIs for user profiles and tasks.
- Test and validate API endpoints using Postman.

"Backend setup with JWT-based authentication and CRUD APIs."

# Week 3-4: Frontend Development
- Initialize React.js project with Material-UI for styling.
- Implement routing for Home, Marketplace, and Profile pages.
- Build User registration and login forms.
- Create Task marketplace interface for displaying available tasks.
- Integrate frontend with backend APIs for data exchange.

"Frontend setup with routing, core components, and API integration."

# Week 4-5: Core Features Implementation
- Build a Credit System (earn and spend credits via tasks).
- Integrate Socket.io for real-time Notifications.
- Add Ratings & Reviews feature (store and retrieve ratings in database).

 "Added Credit System, Notifications, and Ratings & Reviews."

# Week 5-6: Advanced Features
- Integrate Firebase for real-time messaging between users.
- Implement AI-powered task recommendations based on user preferences.
- Develop basic analytics to display user activities and credit history.

 "Advanced features: Firebase messaging, AI recommendations, and user analytics."

# Week 6: Testing and Deployment
- Conduct end-to-end testing for frontend and backend.
- Fix bugs and optimize performance for responsiveness and loading speed.
- Deploy the backend to Heroku and the frontend to Netlify.
- Collect user feedback for future improvements.

 "End-to-end testing, optimizations, and deployment on Render/Netlify/Vercel."