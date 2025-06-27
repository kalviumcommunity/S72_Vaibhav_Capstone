# Complete Frontend Documentation

## Project Overview

This frontend is built with **React** (using Vite), React Router, and Tailwind CSS. It provides a modern, responsive UI for authentication, user management, and task management, integrating with the backend via RESTful APIs. The codebase is modular, using context for authentication and reusable components for UI consistency.

### Directory Structure

- `src/` – Main source code
  - `pages/` – Page-level components (route targets)
  - `components/` – Reusable UI components (Navbar, Footer, etc.)
  - `context/` – React context providers (e.g., AuthContext)
  - `assets/` – Static assets (images, SVGs)
  - `public/` – Public files (served as-is)
  - `App.jsx` – Main app component (routing, layout)
  - `main.jsx` – Entry point (React root)
  - `config.js` – API/config constants
  - `index.css`, `App.css` – Global and app-specific styles

---

## File-by-File Explanations

### Main Files

#### 1. `src/main.jsx`
- **Purpose:** Entry point; renders the React app into the DOM.
- **Key Logic:**
  - Imports global styles and the root `<App />` component.
  - Uses `React.StrictMode` for highlighting potential issues.
  - Uses `createRoot` from `react-dom/client` for concurrent rendering.

#### 2. `src/App.jsx`
- **Purpose:** Main application shell; sets up routing and providers.
- **Key Logic:**
  - Wraps the app in `GoogleOAuthProvider` (for Google login) and `AuthProvider` (for authentication context).
  - Uses `BrowserRouter` and `Routes` from React Router.
  - Defines all main routes, using `ProtectedRoute` for authenticated pages.

#### 3. `src/config.js`
- **Purpose:** Stores configuration constants (e.g., API base URL).
- **Key Logic:**
  - Exports constants for use throughout the app.

#### 4. `src/index.css` & `src/App.css`
- **Purpose:** Global and app-specific styles.
- **Key Logic:**
  - `index.css` sets up Tailwind and resets.
  - `App.css` contains custom styles for the app.

---

### Context

#### 5. `src/context/AuthContext.jsx`
- **Purpose:** Provides authentication state and logic to the app.
- **Key Logic:**
  - Uses React Context to share `user`, `token`, and auth functions.
  - On mount, loads user info if a token exists (using Axios).
  - Provides `login`, `register`, and `logout` functions.
  - Exposes a `useAuth` hook for easy access in components.
- **Patterns:**
  - Context API, useState, useEffect, custom hooks.
- **Interaction:**
  - Used by `App.jsx` and any component via `useAuth()`.

---

### Components

#### 6. `src/components/Navbar.jsx`
- **Purpose:** Top navigation bar.
- **Key Logic:**
  - Shows links to main pages.
  - Displays login/register or user info based on auth state.
  - Uses `useAuth` to access user info and logout.
- **Patterns:**
  - Conditional rendering based on authentication.
- **Interaction:**
  - Used in `Layout.jsx` and across all pages.

#### 7. `src/components/Footer.jsx`
- **Purpose:** Site footer.
- **Key Logic:**
  - Renders static footer content.
- **Interaction:**
  - Used in `Layout.jsx`.

#### 8. `src/components/Layout.jsx`
- **Purpose:** Provides a consistent layout (Navbar + Footer + main content).
- **Key Logic:**
  - Wraps children with Navbar and Footer.
- **Interaction:**
  - Used to wrap main content in pages.

#### 9. `src/components/ProtectedRoute.jsx`
- **Purpose:** Restricts access to authenticated users.
- **Key Logic:**
  - Uses `useAuth` to check if user is logged in.
  - If not authenticated, redirects to `/login`.
  - Otherwise, renders the child component.
- **Patterns:**
  - Higher-order component for route protection.
- **Interaction:**
  - Used in `App.jsx` to protect routes.

#### 10. `src/components/Hero.jsx`
- **Purpose:** Prominent section for the Home page.
- **Key Logic:**
  - Renders a visually appealing hero section.
- **Interaction:**
  - Used in `Home.jsx`.

#### 11. `src/components/Button.jsx`
- **Purpose:** Reusable button component (currently empty).
- **Key Logic:**
  - Intended for shared button styles/logic.
- **Interaction:**
  - To be used across forms and actions.

---

### Pages

#### 12. `src/pages/Home.jsx`
- **Purpose:** Landing page.
- **Key Logic:**
  - Welcomes users and introduces the app.
  - May include a call-to-action or hero section.
- **Interaction:**
  - Root route (`/`).

#### 13. `src/pages/TaskMarketplace.jsx`
- **Purpose:** Shows all available tasks.
- **Key Logic:**
  - Fetches and displays a list of open tasks.
  - Allows users to browse and claim tasks.
- **Interaction:**
  - `/tasks` route.

#### 14. `src/pages/SingleTask.jsx`
- **Purpose:** Shows details for a single task.
- **Key Logic:**
  - Fetches task details by ID from the URL.
  - Displays task info, status, and actions (claim, submit, etc.).
- **Interaction:**
  - `/tasks/:id` route.

#### 15. `src/pages/CreateTask.jsx`
- **Purpose:** Form to create a new task.
- **Key Logic:**
  - Allows users to input task details and submit to backend.
  - Handles form validation and submission.
- **Interaction:**
  - `/create-task` route.

#### 16. `src/pages/UpdateTask.jsx`
- **Purpose:** Form to edit an existing task.
- **Key Logic:**
  - Loads existing task data for editing.
  - Submits updates to backend.
- **Interaction:**
  - `/edit-task/:id` route.

#### 17. `src/pages/MyTasks.jsx`
- **Purpose:** Shows tasks created or claimed by the user.
- **Key Logic:**
  - Fetches tasks related to the current user.
  - Displays them with status and actions.
- **Interaction:**
  - `/my-tasks` route.

#### 18. `src/pages/Profile.jsx`
- **Purpose:** User profile and stats.
- **Key Logic:**
  - Fetches and displays user info, stats, and avatar.
  - Allows editing profile details and uploading avatar.
- **Interaction:**
  - `/profile` route.

#### 19. `src/pages/Login.jsx`
- **Purpose:** Login form (email/password and Google).
- **Key Logic:**
  - Handles login via form and Google OAuth.
  - On success, stores token and redirects.
- **Interaction:**
  - `/login` route.

#### 20. `src/pages/Register.jsx`
- **Purpose:** Registration form.
- **Key Logic:**
  - Handles user registration.
  - On success, logs in the user.
- **Interaction:**
  - `/register` route.

#### 21. `src/pages/ForgotPassword.jsx`
- **Purpose:** Password reset flow.
- **Key Logic:**
  - Handles requesting OTP and resetting password.
- **Interaction:**
  - `/forgot-password` route.

---

### Other

#### 22. `src/TestTailwind.jsx`
- **Purpose:** Test/demo file for Tailwind CSS classes.
- **Key Logic:**
  - Used to verify Tailwind setup.

---

## How They Work Together

- **App.jsx** is the root, setting up providers and routes.
- **Context** provides global state (auth) to all components.
- **Pages** are mapped to routes and represent main screens.
- **Components** are reused across pages for consistent UI.
- **Config** centralizes constants.
- **Styles** ensure a cohesive look.

---

## Concepts Clarified

- **React Context:** Used for global state (auth).
- **React Router:** SPA navigation and route protection.
- **Axios:** For API requests to the backend.
- **Google OAuth:** Integrated for social login.
- **Protected Routes:** Only accessible if logged in.
- **Component Reuse:** Navbar, Footer, Button, etc.
- **State Management:** useState/useEffect for local and global state.

---

## Error Log & Troubleshooting

- **API errors:**  
  - Check network tab for failed requests.
  - Ensure backend URL in `config.js` matches deployment.
  - If 401 errors, token may be missing/expired; try logging in again.

- **Login/Registration issues:**  
  - Check backend logs for error details.
  - Ensure Google OAuth client ID is set in environment variables.

- **Routing issues:**  
  - If page not found, check route paths in `App.jsx`.

- **Styling issues:**  
  - Ensure Tailwind is properly configured in `postcss.config.cjs` and `tailwind.config.cjs`.

---

## How to Extend

- Add new pages to `pages/` and routes in `App.jsx`.
- Add new context providers in `context/`.
- Add new reusable UI in `components/`.
- Update API endpoints in `config.js` as needed.

---

If you want a detailed, line-by-line breakdown of any specific file or component, just let me know which one!

---

## Line-by-Line Explanation: src/main.jsx

```js
import { StrictMode } from 'react'
```
- **What:** Imports the `StrictMode` component from React.
- **Why:** `StrictMode` is a tool for highlighting potential problems in an application. It activates additional checks and warnings for its descendants.
- **How:** Used as a wrapper around the app to help catch common bugs and unsafe lifecycle methods.

```js
import { createRoot } from 'react-dom/client'
```
- **What:** Imports the `createRoot` function from the React DOM client package.
- **Why:** `createRoot` is the new API for rendering React apps in React 18+, enabling concurrent features.
- **How:** Used to create a root for rendering the React component tree.

```js
import './index.css'
```
- **What:** Imports the global CSS file for the app.
- **Why:** Ensures that Tailwind CSS and any global styles are applied to the entire application.
- **How:** Webpack/Vite will include this CSS in the build.

```js
import App from './App.jsx'
```
- **What:** Imports the main App component.
- **Why:** This is the root component that contains all routes and providers for the app.
- **How:** Will be rendered as the main content of the application.

```js
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
- **What:** Renders the React application into the DOM.
- **Why:** This is the entry point for the React app; it attaches the app to the HTML element with id `root` (usually in `index.html`).
- **How:**
  - `createRoot(document.getElementById('root'))` creates a root React node attached to the DOM element with id `root`.
  - `.render(...)` renders the React component tree inside this root.
  - `<StrictMode>` wraps `<App />` to enable additional checks and warnings during development. 

---

## Line-by-Line Explanation: src/App.jsx

```js
import React from 'react';
```
- **What:** Imports the React library.
- **Why:** Required for using JSX and React components.
- **How:** Enables the use of React features in this file.

```js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
```
- **What:** Imports routing components from React Router DOM.
- **Why:** Needed to enable client-side routing in the app.
- **How:** `Router` provides routing context, `Routes` defines route mappings, and `Route` defines individual routes.

```js
import { GoogleOAuthProvider } from '@react-oauth/google';
```
- **What:** Imports the Google OAuth provider component.
- **Why:** Used to enable Google login functionality throughout the app.
- **How:** Wraps the app to provide Google OAuth context.

```js
import Home from './pages/Home';
import TaskMarketplace from './pages/TaskMarketplace';
import SingleTask from './pages/SingleTask';
import CreateTask from './pages/CreateTask';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTasks from './pages/MyTasks';
import UpdateTask from './pages/UpdateTask';
```
- **What:** Imports all the main page components.
- **Why:** Each import corresponds to a route in the app.
- **How:** These components are rendered based on the current route.

```js
import { AuthProvider } from './context/AuthContext';
```
- **What:** Imports the authentication context provider.
- **Why:** Provides authentication state and logic to the app.
- **How:** Wraps the app to make auth context available everywhere.

```js
import ProtectedRoute from './components/ProtectedRoute';
```
- **What:** Imports the ProtectedRoute component.
- **Why:** Used to restrict access to certain routes to authenticated users only.
- **How:** Wraps route elements that require authentication.

```js
import ForgotPassword from './pages/ForgotPassword';
```
- **What:** Imports the ForgotPassword page component.
- **Why:** Used for the password reset flow.
- **How:** Mapped to the `/forgot-password` route.

```js
const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<TaskMarketplace />} />
            <Route 
              path="/my-tasks" 
              element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/tasks/:id" 
              element={
                <ProtectedRoute>
                  <SingleTask />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/create-task" 
              element={
                <ProtectedRoute>
                  <CreateTask />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/edit-task/:id" 
              element={
                <ProtectedRoute>
                  <UpdateTask />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};
```
- **What:** Defines the main App component as a functional component.
- **Why:** This is the root of the React component tree for the frontend.
- **How:**
  - `<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>` wraps the app to provide Google OAuth context, using the client ID from environment variables.
  - `<AuthProvider>` wraps the app to provide authentication context.
  - `<Router>` enables client-side routing.
  - `<Routes>` contains all the route definitions:
    - `/` renders `<Home />`.
    - `/tasks` renders `<TaskMarketplace />`.
    - `/my-tasks`, `/tasks/:id`, `/create-task`, `/edit-task/:id`, `/profile` are all protected routes, only accessible to authenticated users, and render their respective components inside `<ProtectedRoute>`.
    - `/login`, `/register`, `/forgot-password` are public routes for authentication and password reset.

```js
export default App; 
```
- **What:** Exports the App component as the default export.
- **Why:** Allows this component to be imported and rendered in `main.jsx`.
- **How:** Standard ES module export syntax.

---

## Line-by-Line Explanation: src/config.js

```js
// API Configuration
```
- **What:** A comment describing the purpose of the file or the following line.
- **Why:** Provides context for developers that this file contains API configuration settings.
- **How:** Standard JavaScript comment.

```js
export const API_URL = 'https://s72-vaibhav-capstone.onrender.com'; 
```
- **What:** Exports a constant named `API_URL` with the backend API's base URL.
- **Why:** Centralizes the API endpoint so it can be easily imported and used throughout the frontend codebase. This makes it easier to update the API URL in one place if needed.
- **How:** Uses ES6 `export` syntax to make `API_URL` available for import in other files.

---

## Line-by-Line Explanation: src/index.css

```css
@import "tailwindcss";
```
- **What:** Imports the Tailwind CSS framework.
- **Why:** Ensures Tailwind's utility classes and base styles are available in the project.
- **How:** Uses CSS `@import` to bring in Tailwind from the node_modules.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- **What:** Tailwind CSS directives to inject base styles, component classes, and utility classes.
- **Why:** These are required for Tailwind to generate its CSS layers.
- **How:** The Tailwind CLI or PostCSS processes these directives to output the final CSS.

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
- **What:** Styles for the `<body>` element.
- **Why:**
  - `margin: 0;` removes default browser margin.
  - `font-family: ...;` sets a system font stack for better performance and appearance.
  - `-webkit-font-smoothing` and `-moz-osx-font-smoothing` improve font rendering on macOS and iOS.
- **How:** Standard CSS rules for global body styling.

```css
code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```
- **What:** Styles for `<code>` elements.
- **Why:** Sets a monospace font stack for code snippets for better readability.
- **How:** Standard CSS rule for code blocks.

```css
.btn-action {
    @apply inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}
```
- **What:** Custom utility class `.btn-action` using Tailwind's `@apply` directive.
- **Why:** Provides a reusable button style for action buttons throughout the app.
- **How:**
  - `@apply` allows you to compose Tailwind utility classes into a single custom class.
  - The applied classes style the button for layout, color, border, focus, and shadow.

---

## Line-by-Line Explanation: src/App.css

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
```
- **What:** Styles for the root element (the React app container).
- **Why:**
  - `max-width: 1280px;` limits the width for better readability on large screens.
  - `margin: 0 auto;` centers the app horizontally.
  - `padding: 2rem;` adds space around the content.
  - `text-align: center;` centers text by default.
- **How:** Standard CSS for layout and centering.

```css
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
```
- **What:** Styles for elements with the `logo` class (e.g., React logo).
- **Why:**
  - `height` and `padding` size and space the logo.
  - `will-change: filter;` hints to the browser that the filter property will change, optimizing performance.
  - `transition: filter 300ms;` animates filter changes smoothly.
- **How:** Used for interactive logo effects.

```css
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}
```
- **What:** Hover effects for `.logo` and `.logo.react`.
- **Why:** Adds a colored glow/shadow on hover for visual feedback.
- **How:** Uses CSS `filter: drop-shadow` with different colors.

```css
@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```
- **What:** Defines a keyframes animation for spinning.
- **Why:** Used to animate the logo with a continuous rotation.
- **How:** Rotates the element from 0 to 360 degrees.

```css
@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}
```
- **What:** Media query for users who do not prefer reduced motion.
- **Why:** Respects user accessibility preferences for motion.
- **How:**
  - If allowed, applies the `logo-spin` animation to the second link's logo, spinning it infinitely over 20 seconds.

```css
.card {
  padding: 2em;
}
```
- **What:** Styles for elements with the `card` class.
- **Why:** Adds padding for card-like UI elements.
- **How:** Simple padding for spacing.

```css
.read-the-docs {
  color: #888;
}
```
- **What:** Styles for elements with the `read-the-docs` class.
- **Why:** Sets a muted color for documentation links or notes.
- **How:** Uses a gray color for less emphasis.

---

## Line-by-Line Explanation: src/context/AuthContext.jsx

```js
import React, { createContext, useState, useEffect, useContext } from 'react';
```
- **What:** Imports React and several hooks/utilities from the React library.
- **Why:** Needed for creating context, managing state, side effects, and consuming context.
- **How:** Enables the use of context and hooks in this file.

```js
import axios from 'axios';
```
- **What:** Imports the Axios HTTP client library.
- **Why:** Used for making API requests to the backend.
- **How:** Allows the app to communicate with the backend server.

```js
const AuthContext = createContext(null);
```
- **What:** Creates a new React context for authentication.
- **Why:** Provides a way to share authentication state and logic across the app.
- **How:** `createContext(null)` initializes the context with a default value of `null`.

```js
// Set base URL for Axios requests
axios.defaults.baseURL = 'https://s72-vaibhav-capstone.onrender.com'; // Set the base URL for all axios requests
```
- **What:** Sets the default base URL for all Axios requests.
- **Why:** Ensures all API requests are sent to the correct backend server.
- **How:** Modifies Axios's global defaults.

```js
export const AuthProvider = ({ children }) => {
```
- **What:** Defines the AuthProvider component, which will wrap the app.
- **Why:** Provides authentication state and functions to all child components via context.
- **How:** Accepts `children` as props and returns a context provider.

```js
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
```
- **What:** Declares state variables for user info, auth token, and loading status.
- **Why:**
  - `user`: Stores the current user's data.
  - `token`: Stores the JWT token (initialized from localStorage for persistence).
  - `loading`: Indicates if the auth state is being loaded.
- **How:** Uses React's `useState` hook.

```js
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        console.log('Token exists, attempting to load user...');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          console.log('Making request to /api/auth/me...');
          const res = await axios.get('/api/auth/me');
          console.log('Response from /api/auth/me:', res.data);
          if (res.data.success && res.data.user) {
            setUser({
              ...res.data.user,
              _id: res.data.user.id
            });
          }
        } catch (err) {
          console.error('Error loading user:', err);
          console.error('Error details:', err.response?.data);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);
```
- **What:** React effect that runs when the `token` changes.
- **Why:**
  - Loads the current user's data from the backend if a token exists.
  - Handles token expiration or invalidation by clearing state and localStorage.
- **How:**
  - Sets the Authorization header for Axios.
  - Makes a GET request to `/api/auth/me` to fetch user info.
  - Updates state accordingly.
  - Sets `loading` to false when done.

```js
  const login = async (email, password, token = null, userData = null) => {
    try {
      if (token && userData) {
        // Google OAuth login
        setToken(token);
        localStorage.setItem('token', token);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      } else {
        // Regular email/password login
        const res = await axios.post('/api/auth/login', { email, password });
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return { success: true };
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };
```
- **What:** Defines the `login` function for user authentication.
- **Why:**
  - Handles both Google OAuth and regular email/password login.
  - Updates state and localStorage with the new token and user info.
- **How:**
  - For Google login, uses provided token and user data.
  - For email/password, sends a POST request to `/api/auth/login`.
  - Handles errors and returns a success/failure object.

```js
  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };
```
- **What:** Defines the `register` function for new user registration.
- **Why:**
  - Registers a new user and logs them in immediately.
  - Updates state and localStorage with the new token and user info.
- **How:**
  - Sends a POST request to `/api/auth/register`.
  - Handles errors and returns a success/failure object.

```js
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };
```
- **What:** Defines the `logout` function.
- **Why:**
  - Clears authentication state and removes the token from localStorage and Axios headers.
- **How:**
  - Resets state and cleans up persistent storage.

```js
  const value = { user, token, loading, login, register, logout, setUser };
```
- **What:** Prepares the value object to be provided by the context.
- **Why:** Makes all relevant state and functions available to consumers of the context.
- **How:** Bundles state and functions into a single object.

```js
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
```
- **What:** Renders the context provider with the value object.
- **Why:** Makes the authentication state and functions available to all child components.
- **How:** Only renders children when not loading, to prevent rendering before auth state is determined.

```js
};
```
- **What:** Closes the AuthProvider component definition.

```js
export const useAuth = () => {
  return useContext(AuthContext);
}; 
```
- **What:** Exports a custom hook for consuming the AuthContext.
- **Why:** Provides a convenient way for components to access authentication state and functions.
- **How:** Uses React's `useContext` hook.

---

## Line-by-Line Explanation: src/components/Navbar.jsx

```js
import React from 'react';
```
- **What:** Imports the React library.
- **Why:** Required for using JSX and React components.
- **How:** Enables React features in this file.

```js
import { Link, useNavigate } from 'react-router-dom';
```
- **What:** Imports `Link` and `useNavigate` from React Router DOM.
- **Why:**
  - `Link` is used for client-side navigation between routes.
  - `useNavigate` is a hook for programmatic navigation.
- **How:** Enables navigation without full page reloads.

```js
import { useAuth } from '../context/AuthContext';
```
- **What:** Imports the custom `useAuth` hook.
- **Why:** Used to access authentication state and functions.
- **How:** Allows the Navbar to show/hide links and handle logout based on auth state.

```js
const Navbar = () => {
```
- **What:** Defines the Navbar functional component.
- **Why:** Encapsulates the navigation bar UI and logic.

```js
  const { user, logout } = useAuth();
  const navigate = useNavigate();
```
- **What:**
  - Destructures `user` and `logout` from the auth context.
  - Gets the `navigate` function for programmatic navigation.
- **Why:**
  - `user` determines which links/buttons to show.
  - `logout` is called when the user logs out.
  - `navigate` is used to redirect after logout.

```js
  const handleLogout = () => {
    logout();
    navigate('/');
  };
```
- **What:** Defines a function to handle user logout.
- **Why:**
  - Calls the `logout` function to clear auth state.
  - Redirects the user to the home page after logging out.
- **How:** Combines context and navigation logic.

```js
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-black">
              CredBuzz
            </Link>
          </div>
          
          <nav className="hidden md:ml-10 md:flex items-center space-x-8">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
              Home
            </Link>
            <Link to="/tasks" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
              Task Marketplace
            </Link>
            {user && (
              <Link to="/my-tasks" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
                My Tasks
              </Link>
            )}
            <Link to="/profile" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
              Profile
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                  Credits: {user.credits} ₵
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-black rounded-lg text-sm font-medium text-black hover:bg-gray-100 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors duration-200 shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
```
- **What:** Returns the JSX for the navigation bar.
- **Why:**
  - Renders the app name/logo as a link to the home page.
  - Shows navigation links (Home, Task Marketplace, My Tasks, Profile).
  - Shows "My Tasks" only if the user is logged in.
  - Shows "Credits" and "Logout" if logged in, or "Sign in" and "Get started" if not.
- **How:**
  - Uses Tailwind CSS classes for styling and layout.
  - Uses conditional rendering based on `user`.
  - Handles logout with a button click.

```js
};
```
- **What:** Closes the Navbar component definition.

```js
export default Navbar;
```
- **What:** Exports the Navbar component as the default export.
- **Why:** Allows this component to be imported and used in other files (e.g., Layout).
- **How:** Standard ES module export syntax.

---