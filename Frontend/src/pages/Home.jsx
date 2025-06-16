import React from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import './Pages.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      {/* This page-container will wrap the hero and how it works sections */}
      <div className="page-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle">A New Way to Collaborate</p>
            <h1>Exchange Skills & Services with Credits</h1>
            <p className="hero-description">
            CredBuzz connects people who want to exchange skills, time, and services in a collaborative community. Create tasks, earn credits, and get things done.
            </p>
            <div className="hero-buttons">
              <Link to="/tasks" className="btn btn-primary">Browse Tasks</Link>
              <Link to="/create-task" className="btn btn-secondary">Create Task</Link>
            </div>
            <div className="user-stats">
              
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/images/image.png" 
              alt="Task Exchange Illustration"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="features-section">
          <h2>How It Works</h2>
          <div className="feature-grid">
            <div className="feature-item">
            <svg className="h-8-w-8-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
              <h3>Create a Task</h3>
              <p>Post what you need help with and offer credits in return.</p>
            </div>
            <div className="feature-item">
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8-w-8-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
              <h3>Find Help</h3>
              <p>Connect with skilled community members who can help you.</p>
            </div>
            <div className="feature-item">
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8-w-8-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              <h3>Earn Credits</h3>
              <p>Complete tasks for others and earn credits to spend on your needs.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Call to Action - This section is outside the main page-container */}
      <section className="call-to-action-section">
        <div className="page-container"> {/* This inner container centers its content */}
          <h2>Ready to Get Started?</h2>
          <p className="hero-description">
            Join our community today and start exchanging skills with others.
          </p>
          <div className="hero-buttons">
            {!user && <Link to="/register" className="btn btn-primary">Sign Up Now</Link>}
            <Link to="/tasks" className="btn btn-secondary">Browse Tasks</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home; 