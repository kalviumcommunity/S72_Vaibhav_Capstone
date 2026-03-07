import React from 'react';
import Layout from '../components/Layout';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-heading font-bold text-white mb-3">{title}</h2>
    <div className="text-white/60 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsOfService = () => (
  <Layout>
    <div className="min-h-screen bg-dark">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="text-xs font-nav font-semibold uppercase tracking-widest text-primary">Legal</span>
          <h1 className="text-4xl font-heading font-bold text-white mt-2">Terms of Service</h1>
          <p className="text-white/40 text-sm mt-2">Last updated: March 2026</p>
        </div>

        <div className="card">
          <Section title="1. Acceptance of Terms">
            <p>By creating an account and using CredBuzz, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 13 years of age to use CredBuzz. By registering, you confirm that you meet this requirement.</p>
          </Section>

          <Section title="3. Credits">
            <p>CredBuzz credits are virtual tokens used within the platform only. They have no monetary value and cannot be exchanged for real currency. Credits are awarded at registration and through task completion.</p>
            <p>Credits placed in escrow are held until a task is approved. If a task is rejected the credits remain locked until the work is acceptably revised and approved.</p>
          </Section>

          <Section title="4. Task Creation & Fulfillment">
            <p>Task creators are responsible for providing accurate, clear descriptions. Workers are responsible for delivering work that meets the stated requirements.</p>
            <p>CredBuzz is not liable for disputes between users. However, we reserve the right to intervene and make final decisions on credit disputes at our discretion.</p>
          </Section>

          <Section title="5. Prohibited Conduct">
            <p>You agree not to: post fraudulent or misleading tasks, harass other users, attempt to exploit the credit system, or upload content that is illegal, offensive, or violates third-party rights.</p>
            <p>Violations may result in immediate account suspension.</p>
          </Section>

          <Section title="6. Content Ownership">
            <p>Work submitted through tasks remains the intellectual property of the worker unless explicitly agreed otherwise between the parties involved.</p>
          </Section>

          <Section title="7. Termination">
            <p>We reserve the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or poses a risk to the community.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>CredBuzz is provided "as is" without warranties of any kind. We are not liable for any loss of credits, data, or damages arising from use of the platform.</p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>We may revise these terms at any time. Continued use of CredBuzz after revisions constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions about these terms, contact <span className="text-primary">support@credbuzz.app</span></p>
          </Section>
        </div>
      </div>
    </div>
  </Layout>
);

export default TermsOfService;
