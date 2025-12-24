import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Pricing.css";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const plans = {
    monthly: [
      {
        id: "basic",
        name: "Basic",
        price: "₹0",
        period: "/month",
        description: "Perfect for getting started",
        features: [
          "Browse job listings",
          "Apply to 10 jobs/month",
          "Basic resume builder",
          "Email support",
          "Job alerts (basic)",
          "Save up to 20 jobs"
        ],
        notIncluded: [
          "Priority application",
          "Advanced filters",
          "Resume review",
          "Career coaching"
        ],
        popular: false,
        buttonText: "Get Started Free",
        buttonVariant: "outline-primary"
      },
      {
        id: "pro",
        name: "Professional",
        price: "₹199",
        period: "/month",
        description: "For serious job seekers",
        features: [
          "Unlimited job applications",
          "Priority in applications",
          "Advanced resume builder",
          "Priority email & chat support",
          "Advanced job alerts",
          "Save unlimited jobs",
          "Company insights",
          "Salary insights"
        ],
        notIncluded: [
          "Resume review",
          "Career coaching sessions",
          "LinkedIn optimization"
        ],
        popular: true,
        buttonText: "Get Professional",
        buttonVariant: "primary"
      },
      {
        id: "premium",
        name: "Premium",
        price: "₹399",
        period: "/month",
        description: "Complete career package",
        features: [
          "Everything in Professional",
          "Resume review by experts",
          "Career coaching (2 sessions/month)",
          "LinkedIn profile optimization",
          "Interview preparation",
          "Negotiation guidance",
          "Certificate verification",
          "Dedicated account manager"
        ],
        notIncluded: [],
        popular: false,
        buttonText: "Get Premium",
        buttonVariant: "warning"
      }
    ],
    yearly: [
      {
        id: "basic",
        name: "Basic",
        price: "₹0",
        period: "/year",
        description: "Perfect for getting started",
        features: [
          "Browse job listings",
          "Apply to 10 jobs/month",
          "Basic resume builder",
          "Email support",
          "Job alerts (basic)",
          "Save up to 20 jobs"
        ],
        notIncluded: [
          "Priority application",
          "Advanced filters",
          "Resume review",
          "Career coaching"
        ],
        popular: false,
        buttonText: "Get Started Free",
        buttonVariant: "outline-primary"
      },
      {
        id: "pro",
        name: "Professional",
        price: "₹1,999",
        period: "/year",
        description: "For serious job seekers",
        savings: "Save ₹389 (16%)",
        features: [
          "Unlimited job applications",
          "Priority in applications",
          "Advanced resume builder",
          "Priority email & chat support",
          "Advanced job alerts",
          "Save unlimited jobs",
          "Company insights",
          "Salary insights"
        ],
        notIncluded: [
          "Resume review",
          "Career coaching sessions",
          "LinkedIn optimization"
        ],
        popular: true,
        buttonText: "Get Professional",
        buttonVariant: "primary"
      },
      {
        id: "premium",
        name: "Premium",
        price: "₹3,999",
        period: "/year",
        description: "Complete career package",
        savings: "Save ₹789 (16%)",
        features: [
          "Everything in Professional",
          "Resume review by experts",
          "Career coaching (2 sessions/month)",
          "LinkedIn profile optimization",
          "Interview preparation",
          "Negotiation guidance",
          "Certificate verification",
          "Dedicated account manager"
        ],
        notIncluded: [],
        popular: false,
        buttonText: "Get Premium",
        buttonVariant: "warning"
      }
    ]
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const currentPlans = plans[billingCycle];

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="pricing-hero text-center py-5">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="lead mb-4">
            Choose the perfect plan for your job search journey. No hidden fees, no surprises.
          </p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle mb-5">
            <div className="toggle-container">
              <span className={`toggle-label ${billingCycle === 'monthly' ? 'active' : ''}`}>
                Monthly Billing
              </span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="billingToggle"
                  className="toggle-checkbox"
                  checked={billingCycle === 'yearly'}
                  onChange={(e) => setBillingCycle(e.target.checked ? 'yearly' : 'monthly')}
                />
                <label htmlFor="billingToggle" className="toggle-slider"></label>
              </div>
              <span className={`toggle-label ${billingCycle === 'yearly' ? 'active' : ''}`}>
                Yearly Billing
                <span className="save-badge">Save up to 16%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container">
        <div className="row justify-content-center g-4">
          {currentPlans.map((plan) => (
            <div className="col-lg-4 col-md-6" key={plan.id}>
              <div 
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <span>Most Popular</span>
                  </div>
                )}
                
                <div className="card-header text-center">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="price-display">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <div className="savings-badge">
                      <span>{plan.savings}</span>
                    </div>
                  )}
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="card-body">
                  {/* Features Included */}
                  <div className="features-section mb-4">
                    <h6 className="section-title">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      What's Included:
                    </h6>
                    <ul className="features-list">
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features Not Included (for basic/pro plans) */}
                  {plan.notIncluded.length > 0 && (
                    <div className="not-included-section mb-4">
                      <h6 className="section-title">
                        <i className="fas fa-times-circle text-muted me-2"></i>
                        Not Included:
                      </h6>
                      <ul className="not-included-list">
                        {plan.notIncluded.map((item, index) => (
                          <li key={index}>
                            <i className="fas fa-times text-muted me-2"></i>
                            <span className="text-muted">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="text-center mt-4">
                    <button className={`btn btn-${plan.buttonVariant} w-100 py-3`}>
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="comparison-table mt-5">
          <div className="card">
            <div className="card-header bg-light">
              <h4 className="mb-0">Plan Comparison</h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Features</th>
                      <th scope="col" className="text-center">Basic</th>
                      <th scope="col" className="text-center">Professional</th>
                      <th scope="col" className="text-center">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Job Applications</td>
                      <td className="text-center">10/month</td>
                      <td className="text-center">Unlimited</td>
                      <td className="text-center">Unlimited</td>
                    </tr>
                    <tr>
                      <td>Resume Builder</td>
                      <td className="text-center">Basic</td>
                      <td className="text-center">
                        <i className="fas fa-check text-success"></i>
                      </td>
                      <td className="text-center">
                        <i className="fas fa-check text-success"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Priority Application</td>
                      <td className="text-center">
                        <i className="fas fa-times text-danger"></i>
                      </td>
                      <td className="text-center">
                        <i className="fas fa-check text-success"></i>
                      </td>
                      <td className="text-center">
                        <i className="fas fa-check text-success"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Resume Review</td>
                      <td className="text-center">
                        <i className="fas fa-times text-danger"></i>
                      </td>
                      <td className="text-center">
                        <i className="fas fa-times text-danger"></i>
                      </td>
                      <td className="text-center">
                        <i className="fas fa-check text-success"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Career Coaching</td>
                      <td className="text-center">
                        <i className="fas fa-times text-danger"></i>
                      </td>
                      <td className="text-center">
                        <i className="fas fa-times text-danger"></i>
                      </td>
                      <td className="text-center">2 sessions/month</td>
                    </tr>
                    <tr>
                      <td>Support</td>
                      <td className="text-center">Email</td>
                      <td className="text-center">Priority</td>
                      <td className="text-center">Dedicated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section mt-5">
          <h3 className="text-center mb-4">Frequently Asked Questions</h3>
          <div className="row">
            <div className="col-md-6">
              <div className="faq-item mb-3">
                <h5>Can I switch plans anytime?</h5>
                <p className="text-muted">
                  Yes! You can upgrade, downgrade, or cancel your plan at any time. 
                  Changes will take effect at the start of your next billing cycle.
                </p>
              </div>
              <div className="faq-item mb-3">
                <h5>Is there a free trial?</h5>
                <p className="text-muted">
                  The Basic plan is completely free forever. For paid plans, we offer 
                  a 7-day money-back guarantee if you're not satisfied.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="faq-item mb-3">
                <h5>What payment methods do you accept?</h5>
                <p className="text-muted">
                  We accept credit/debit cards, UPI, Net Banking, and digital wallets 
                  like PayPal, Paytm, and Google Pay.
                </p>
              </div>
              <div className="faq-item mb-3">
                <h5>Can I get a refund?</h5>
                <p className="text-muted">
                  Yes, we offer a 7-day money-back guarantee for all paid plans. 
                  Contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateway Info */}
        <div className="payment-info mt-5">
          <div className="card border-primary">
            <div className="card-body text-center">
              <h4 className="card-title">
                <i className="fas fa-shield-alt text-primary me-2"></i>
                Secure Payment Processing
              </h4>
              <p className="card-text">
                We use industry-standard encryption and partner with trusted payment 
                gateways to ensure your transactions are safe and secure.
              </p>
              <div className="payment-methods mt-3">
                <i className="fab fa-cc-visa fa-2x mx-2 text-primary"></i>
                <i className="fab fa-cc-mastercard fa-2x mx-2 text-danger"></i>
                <i className="fab fa-cc-amex fa-2x mx-2 text-info"></i>
                <i className="fab fa-google-pay fa-2x mx-2 text-success"></i>
                <i className="fab fa-paypal fa-2x mx-2 text-primary"></i>
                <i className="fas fa-rupee-sign fa-2x mx-2 text-warning"></i>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section text-center mt-5 py-5">
          <h2 className="mb-3">Ready to Boost Your Career?</h2>
          <p className="lead mb-4">
            Join thousands of professionals who found their dream job through LadderUp
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-primary btn-lg px-4">
              Start Free Trial
            </Link>
            <Link to="/contact" className="btn btn-outline-primary btn-lg px-4">
              Contact Sales
            </Link>
          </div>
          <p className="text-muted mt-3">
            Need help choosing? <Link to="/help">Talk to our team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;