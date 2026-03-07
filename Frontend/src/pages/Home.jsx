import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Coins, ArrowRight, ChevronDown, Palette, Laptop, PenLine, Megaphone, Video, BarChart2, BadgeDollarSign, GraduationCap } from 'lucide-react';
import Layout from '../components/Layout';

const STATS = [
  { value: '500+',  label: 'Active Members' },
  { value: '2,345', label: 'Tasks Completed' },
  { value: '125K',  label: 'Credits Exchanged' },
  { value: '98%',   label: 'Satisfaction Rate' },
];

const STEPS = [
  {
    icon: <PlusCircle className="w-6 h-6" />,
    title: 'Post a Task',
    desc: 'Describe what you need done, set your credit offer, and publish it to the marketplace.',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Claim & Deliver',
    desc: 'Skilled community members claim your task, complete the work, and submit for review.',
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: 'Earn Credits',
    desc: 'Approve work and credits transfer instantly. Spend them on tasks you need done.',
  },
];

const CATEGORIES = [
  { label: 'Design', icon: <Palette className="w-7 h-7" /> },
  { label: 'Development', icon: <Laptop className="w-7 h-7" /> },
  { label: 'Writing', icon: <PenLine className="w-7 h-7" /> },
  { label: 'Marketing', icon: <Megaphone className="w-7 h-7" /> },
  { label: 'Video', icon: <Video className="w-7 h-7" /> },
  { label: 'Data', icon: <BarChart2 className="w-7 h-7" /> },
  { label: 'Finance', icon: <BadgeDollarSign className="w-7 h-7" /> },
  { label: 'Education', icon: <GraduationCap className="w-7 h-7" /> },
];

const Home = () => {
  return (
    <Layout>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          {/* gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark/90 via-dark/75 to-dark-card/80" />
          <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,74,23,0.12) 0%, transparent 70%)'}} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-nav font-semibold uppercase tracking-widest mb-6">
            A New Way to Collaborate
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight mb-6">
            POST.&nbsp;
            <span className="text-primary">BID.</span>
            &nbsp;EARN.
          </h1>

          <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto">
            CredBuzz connects people who want to exchange skills and services.
            Create tasks, earn credits, and get things done — together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-nav font-semibold rounded hover:bg-primary-dark transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Browse Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white font-nav font-semibold rounded hover:border-primary hover:text-primary transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Start Free
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-white/30 text-xs font-nav animate-bounce">
            <span>Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-dark-lighter border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-heading font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-white/50 font-nav uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-dark">
        <div className="max-w-6xl mx-auto px-6">
          <div className="section-title">
            <span className="label">Process</span>
            <h2>How It Works</h2>
            <p>Three simple steps to exchange skills and earn credits in our community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="card group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary transition-all duration-300">
                    {step.icon}
                  </div>
                  <span className="text-5xl font-heading font-bold text-white/5">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-dark-lighter">
        <div className="max-w-6xl mx-auto px-6">
          <div className="section-title">
            <span className="label">Explore</span>
            <h2>Popular Categories</h2>
            <p>Find tasks across a wide range of skills and disciplines.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to="/tasks"
                className="group flex flex-col items-center gap-3 p-6 bg-dark-card border border-white/5 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <span className="text-primary/70 group-hover:text-primary transition-colors">{cat.icon}</span>
                <span className="text-sm font-nav font-medium text-white/70 group-hover:text-primary transition-colors uppercase tracking-wide">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 bg-dark overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{background:'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,74,23,0.10) 0%, transparent 70%)'}}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Ready to Join the <span className="text-primary">Exchange?</span>
          </h2>
          <p className="text-white/55 text-lg leading-relaxed mb-10">
            Thousands of community members are already exchanging skills and earning credits. Your next collaboration is one task away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-white font-nav font-semibold rounded hover:bg-primary-dark transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/20 text-white font-nav font-semibold rounded hover:border-primary hover:text-primary transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Browse Tasks
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Home;