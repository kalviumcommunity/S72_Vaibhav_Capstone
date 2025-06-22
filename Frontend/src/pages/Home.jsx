import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const FeatureCard = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-black text-center">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6 mx-auto">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-black mb-4">{title}</h3>
    <p className="text-gray-800 leading-relaxed">{children}</p>
  </div>
);

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
            <span className="text-black font-semibold tracking-wide uppercase">A New Way to Collaborate</span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold text-black leading-tight">
              Exchange Skills &<br />Services with Credits
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-900 leading-8">
                CredBuzz connects people who want to exchange skills, time, and services in a collaborative community. Create tasks, earn credits, and get things done.
            </p>
            <div className="mt-10 flex items-center justify-center space-x-4">
                <Link to="/tasks" className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 text-lg">
                  Browse Tasks
                </Link>
                <Link to="/create-task" className="px-8 py-4 bg-white text-black border border-black rounded-xl font-semibold hover:bg-gray-100 text-lg">
                  Create Task
                </Link>
            </div>
             <div className="mt-12 flex items-center justify-center space-x-8 text-gray-800">
                <span>Join <span className="font-bold text-black">5,000+</span> Users</span>
                <span className="h-5 border-l border-gray-300"></span>
                <span><span className="font-bold text-black">1,000+</span> Tasks Completed</span>
              </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black mb-16">Why Choose CredBuzz?</h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <FeatureCard title="Skill Exchange">
              Trade your expertise for services you need. Whether you're a designer, developer, writer, or have any other skill, find the perfect exchange.
            </FeatureCard>
            <FeatureCard title="Community Driven">
              Join a vibrant community of like-minded individuals who believe in the power of collaboration and mutual support.
            </FeatureCard>
            <FeatureCard title="Flexible Credits">
                Our credit system makes it easy to value and exchange services fairly, ensuring everyone gets what they deserve.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <FeatureCard title="Create a Task" icon={<svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}>
              Post what you need help with and offer credits in return.
            </FeatureCard>
            <FeatureCard title="Find Help" icon={<svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}>
              Connect with skilled community members who can help you.
            </FeatureCard>
            <FeatureCard title="Earn Credits" icon={<svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}>
              Complete tasks for others and earn credits to spend on your needs.
            </FeatureCard>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;