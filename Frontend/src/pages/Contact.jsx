import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    // In a real deployment this would POST to a contact endpoint or email service.
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-dark">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="text-xs font-nav font-semibold uppercase tracking-widest text-primary">Get in Touch</span>
            <h1 className="text-4xl font-heading font-bold text-white mt-2">Contact Us</h1>
            <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm">Have a question, found a bug, or just want to say hi? We'd love to hear from you.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Info cards */}
            <div className="flex flex-col gap-6">
              <div className="card flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold text-white text-sm mb-1">Email Us</h3>
                  <p className="text-white/50 text-sm">support@credbuzz.app</p>
                  <p className="text-white/30 text-xs mt-1">We reply within 48 hours.</p>
                </div>
              </div>
              <div className="card flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold text-white text-sm mb-1">Community</h3>
                  <p className="text-white/50 text-sm">Join our Discord server to connect with other users.</p>
                </div>
              </div>
              <div className="card flex items-start gap-4">
                <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold text-white text-sm mb-1">Report a Bug</h3>
                  <p className="text-white/50 text-sm">Open an issue on our <a href="https://github.com/kalviumcommunity/S72_Vaibhav_Capstone" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub repository</a>.</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2 card">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-white mb-2">Message Sent!</h2>
                  <p className="text-white/50 text-sm">Thanks for reaching out. We'll get back to you within 48 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="mt-6 text-primary text-sm hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
                      <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                      <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Subject</label>
                    <input name="subject" required value={form.subject} onChange={handleChange} placeholder="What's this about?" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Message</label>
                    <textarea name="message" required rows={5} value={form.message} onChange={handleChange} placeholder="Tell us more..." className="input resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-primary text-white font-nav font-semibold rounded hover:bg-primary-dark transition-all duration-300 uppercase tracking-wider text-sm">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
