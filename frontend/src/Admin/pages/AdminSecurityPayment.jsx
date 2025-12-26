import React from "react";
import { useNavigate } from "react-router-dom";

const SecurityPayment = () => {
  const navigate = useNavigate();

  // option 1: for direct redirect (Payment Link)
  const handlePaymentRedirect = () => {
    // Payment link પર રીડાયરેક્ટ
    window.location.href = "https://rzp.io/rzp/OtfSyE9";
    // window.location.href = "https://razorpay.me/@dhruvrana1487";
    // window.location.href = "https://rzp.io/rzp/OtfSyE9";

    // suppose if payment sucessful so , redirect after 2.5 sec login page 
    // here settimeout for demo
    setTimeout(() => {
      //in original application for payment we can first verification API call
      navigate("/login");
    }, 2500); // after 2.5 sec
  };

  // option 2: for RazorPay checkout
  const openRazorpay = () => {
    const options = {
      key: "rzp_test_Rw5hinDy03A1Eb",
      amount: 100,
      currency: "INR",
      name: "Job Portal",
      description: "₹1 Security Payment (Test Mode)",

      handler: function (response) {
        console.log("Payment Success:", response);
        
        // after sucess payment  redirect 2.5 sec in login page
        //show sucess message
        alert("Payment Successful! Redirecting to login page...");
        // after 2.5 sec redirect
        setTimeout(() => {
          navigate("/login");
        }, 2500);
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
      <p>After successful payment, you will be redirected to login page in 2-3 seconds</p>

      {/* option 1: direct redirect*/}
      {/* <button
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
        Pay via Link
      </button> */}

      {/* option 2: for Razorpay Checkout */}
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