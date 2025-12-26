import React from "react";
import { useNavigate } from "react-router-dom";

const SecurityPayment = () => {
  const navigate = useNavigate();

  const openRazorpay = () => {
    const options = {
      key: "rzp_test_Rw5hinDy03A1Eb", // ✅ ONLY API KEY (test mode)
      amount: 100, // ₹1 = 100 paise
      currency: "INR",
      name: "Job Portal",
      description: "₹1 Security Payment (Test Mode)",

      handler: function (response) {
        console.log("Payment Success:", response);
        // demo success handling
        navigate("/login");
      },

      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },

      theme: {
        color: "#3399cc",
      },

      modal: {
        ondismiss: function () {
          alert("Payment cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "70px" }}>
      <h2>₹1 Security Payment</h2>
      <p>Test Mode Razorpay Checkout</p>

      <button
        onClick={openRazorpay}
        style={{
          padding: "10px 20px",
          backgroundColor: "#3399cc",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Pay ₹1
      </button>
    </div>
  );
};

export default SecurityPayment;
