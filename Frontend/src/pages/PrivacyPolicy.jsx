import React from 'react';
import Layout from '../components/Layout';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-heading font-bold text-white mb-3">{title}</h2>
    <div className="text-white/60 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <Layout>
    <div className="min-h-screen bg-dark">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="text-xs font-nav font-semibold uppercase tracking-widest text-primary">Legal</span>
          <h1 className="text-4xl font-heading font-bold text-white mt-2">Privacy Policy</h1>
          <p className="text-white/40 text-sm mt-2">Last updated: March 2026</p>
        </div>

        <div className="card">
          <Section title="1. Information We Collect">
            <p>We collect information you provide directly when you register an account, create or claim tasks, and communicate with other users. This includes your name, email address, and profile avatar.</p>
            <p>We also collect usage data such as pages visited, tasks viewed, and actions taken within the platform to improve your experience.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your information is used to operate and improve CredBuzz, including processing credit transactions, facilitating task assignments, and sending account-related notifications.</p>
            <p>We do not sell or share your personal data with third parties for marketing purposes.</p>
          </Section>

          <Section title="3. Credit & Transaction Data">
            <p>All credit transactions — including escrow locks, releases, and balances — are stored securely and are only visible to you and the counterparty involved in a task.</p>
          </Section>

          <Section title="4. Cookies">
            <p>CredBuzz uses minimal cookies and localStorage solely for session management (JWT tokens). We do not use tracking or advertising cookies.</p>
          </Section>

          <Section title="5. Data Security">
            <p>Passwords are hashed using bcrypt. Authentication tokens are signed with a secure secret. We follow industry-standard practices to protect your data, but no system is 100% secure and you use the platform at your own risk.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You may request deletion of your account and associated data at any time by contacting us at the address below. Completed transaction records may be retained for audit purposes.</p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. Continued use of CredBuzz after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="8. Contact">
            <p>Questions about this policy? Reach us at <span className="text-primary">support@credbuzz.app</span></p>
          </Section>
        </div>
      </div>
    </div>
  </Layout>
);

export default PrivacyPolicy;
