import React from 'react';

const Faq = () => {
  const faqs = [
    {
      question: 'What is LadderUp?',
      answer: 'LadderUp is a job search platform that helps job seekers connect with top companies. We’re based in Surat, Gujarat, India, and committed to making career opportunities accessible to all.'
    },
    {
      question: 'Is LadderUp free to use?',
      answer: 'Yes! LadderUp is completely free for job seekers. No hidden charges, no premium traps.'
    },
    {
      question: 'How can I apply for jobs?',
      answer: 'Just create a free account, fill out your profile, and start applying with a single click.'
    },
    {
      question: 'How do I know if my application was seen?',
      answer: 'We notify you via email and on your dashboard when an employer views your application.'
    },
    {
      question: 'I forgot my password. What do I do?',
      answer: 'Go to the login page and click on "Forgot Password". Follow the instructions to reset it.'
    }
  ];

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Frequently Asked Questions</h1>
      <div className="accordion" id="faqAccordion">
        {faqs.map((faq, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded={index === 0 ? 'true' : 'false'}
                aria-controls={`collapse${index}`}
              >
                {faq.question}
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
              aria-labelledby={`heading${index}`}
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
