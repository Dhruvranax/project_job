import React from "react";
import { useNavigate } from "react-router-dom";

const SecurityPayment = () => {
  const navigate = useNavigate();

  // ઓપ્શન 1: જો તમે માત્ર રીડાયરેક્ટ કરવું હોય તો (Razorpay Checkout નહીં)
  const handlePaymentRedirect = () => {
    // Razorpay Checkout ને બદલે સીધું payment link પર રીડાયરેક્ટ
    window.location.href = "https://rzp.io/rzp/OtfSyE9";
  };

  // ઓપ્શન 2: જો તમે Razorpay Checkout જ ખોલવું હોય (તમારા મૂળ કોડ પ્રમાણે)
  const openRazorpay = () => {
    const options = {
      key: "rzp_test_Rw5hinDy03A1Eb",
      amount: 100,
      currency: "INR",
      name: "Job Portal",
      description: "₹1 Security Payment (Test Mode)",

      handler: function (response) {
        console.log("Payment Success:", response);
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

  // તમારી જરૂરિયાત પ્રમાણે એક મેથડ પસંદ કરો
  return (
    <div style={{ textAlign: "center", marginTop: "70px" }}>
      <h2>₹1 Security Payment</h2>
      <p>Test Mode Razorpay Checkout</p>

      {/* ઓપ્શન 1: સીધું રીડાયરેક્ટ માટે */}
      <button
        onClick={handlePaymentRedirect}
        style={{
          padding: "10px 20px",
          backgroundColor: "#3399cc",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Pay via Link (રીડાયરેક્ટ)
      </button>

      {/* ઓપ્શન 2: Razorpay Checkout માટે */}
      <button
        onClick={openRazorpay}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Pay via Razorpay Checkout
      </button>
    </div>
  );
};

export default SecurityPayment;