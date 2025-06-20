import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-primary/5"></div>
        <div className="absolute -left-40 bottom-20 h-80 w-80 rounded-full bg-primary/5"></div>
        <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-primary/5"></div>
      </div>
      
      <div className="relative mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-block rounded-full bg-secondary px-3 py-1 text-sm">
              A New Way to Collaborate
            </div>
            
            <h1 className="text-balance font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl">
              Exchange Skills & Services with 
              <span className="text-primary relative inline-block">
                Credits
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/30 rounded-full"></span>
              </span>
            </h1>
            
            <p className="text-balance text-lg text-muted-foreground md:text-xl max-w-lg">
              CredBuzz connects people who want to exchange skills, time, and services in a collaborative community. Create tasks, earn credits, and get things done.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/tasks">
                <Button size="lg">
                  Browse Tasks
                </Button>
              </Link>
              <Link to="/create-task">
                <Button variant="outline" size="lg">
                  Create a Task
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <img 
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${24 + i}.jpg`}
                      alt="Community member" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-medium">500+</span>
                <span className="text-muted-foreground"> users exchanging skills</span>
              </div>
            </div>
          </div>
          
          <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative mx-auto max-w-md">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary rounded-lg -z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-lg -z-10"></div>
              
              {/* Main image */}
              <div className="rounded-2xl overflow-hidden border shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                  alt="People collaborating" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Stats card */}
              <div className="absolute -bottom-8 -left-8 bg-white rounded-lg shadow-lg p-4 max-w-[160px]">
                <div className="text-xs text-muted-foreground">Active Tasks</div>
                <div className="text-2xl font-bold">2,345</div>
                <div className="mt-1 flex items-center text-xs text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>+24% this month</span>
                </div>
              </div>
              
              {/* Credit card */}
              <div className="absolute -top-8 -right-8 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 max-w-[160px]">
                <div className="text-xs opacity-80">Total Credits</div>
                <div className="text-2xl font-bold">125,400</div>
                <div className="mt-1 flex items-center text-xs opacity-80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>Exchanged last week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 