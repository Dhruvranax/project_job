// src/pages/Help.jsx
import React from 'react';

const Help = () => {
  return (
    <div className="container py-5">
      <h2 className="mb-4 text-danger">Help Center</h2>

      <p>Welcome to the LadderUp Help Center 👋</p>

      <h4 className="mt-4">🔍 Frequently Asked Questions</h4>
      <ul>
        <li><strong>Q:</strong> How do I post a job?<br /><strong>A:</strong> Click on “Post a Job” in the navigation bar and fill in the job details.</li>
        <li><strong>Q:</strong> I forgot my password!<br /><strong>A:</strong> Use the “Forgot Password” link on the Login page to reset it.</li>
        <li><strong>Q:</strong> Can I apply without creating an account?<br /><strong>A:</strong> No, you’ll need to register first to apply for jobs.</li>
      </ul>

      <h4 className="mt-4">📞 Need More Help?</h4>
      <p>
        Contact our support team:
        <ul>
          <li>Email: support@ladderup.com</li>
          <li>Phone: +91 99999 99999</li>
          <li>Live Chat: Coming soon!</li>
        </ul>
      </p>
    </div>
  );
};

export default Help;
