import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Payment.css";

const Payment = ({
  userId,
  currentCredits,
  onCreditsUpdate,
}) => {
  const [creditPackages, setCreditPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [upiQrCode, setUpiQrCode] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payment/pricing`);
        setCreditPackages(response.data);
      } catch (error) {
        console.error("Failed to fetch pricing plans:", error);
        // Fallback to defaults if backend fails
        setCreditPackages([
          { credits: 200, price: 99 },
          { credits: 500, price: 199 },
          { credits: 2000, price: 999 },
        ]);
      }
    };
    fetchPlans();
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setMessage("");
    setShowSuccess(false);
    setUpiQrCode(null);
    setPaymentError(null);
  };

  const handlePayment = async () => {
    if (!selectedPackage) {
      setMessage("Please select a credit package");
      setPaymentError("No package selected");
      return;
    }

    setIsProcessing(true);
    setMessage("");
    setShowSuccess(false);
    setUpiQrCode(null);
    setPaymentError(null);

    try {
      if (paymentMethod === "razorpay") {
        await handleRazorpayPayment();
      } else if (paymentMethod === "upi") {
        await handleUpiPayment();
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Payment failed. Please try again.");
      setPaymentError(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      // Create Razorpay order
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          userId,
          credits: selectedPackage.credits,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 10000,
        }
      );

      const { orderId, amount, currency, key } = response.data;

      if (!window.Razorpay) {
        setMessage("Razorpay script not loaded. Please refresh the page.");
        setPaymentError("Razorpay script not loaded");
        return;
      }

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Code Review AI",
        description: `${selectedPackage.credits} Credits Purchase`,
        order_id: orderId,
        handler: async function (response) {
          await verifyRazorpayPayment(response, orderId);
        },
        modal: {
          ondismiss: function () {
            setMessage("Payment popup closed. Please try again.");
            setPaymentError("Payment popup closed");
          },
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#1abc9c",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      setPaymentError(error.message || "Razorpay payment failed");

      if (
        error.response?.status === 503 &&
        error.response?.data?.error === "Razorpay authentication error"
      ) {
        setMessage(
          "Razorpay payment is currently unavailable due to configuration issues. Please try UPI payment instead."
        );
        setPaymentError("Razorpay authentication error");
        setPaymentMethod("upi");
        return;
      }

      if (error.response?.data?.message) {
        setMessage(`Payment failed: ${error.response.data.message}`);
        setPaymentError(error.response.data.message);
      } else {
        setMessage(
          `Failed to initialize payment: ${error.message}. Please try UPI payment method.`
        );
        setPaymentError(error.message);
      }
    }
  };

  const verifyRazorpayPayment = async (paymentResponse, orderId) => {
    try {
      const verifyResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/verify-payment`,
        {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          userId,
          credits: selectedPackage.credits,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 10000,
        }
      );

      setMessage(
        `Payment successful! ${verifyResponse.data.creditsAdded} credits added to your account.`
      );
      setShowSuccess(true);
      onCreditsUpdate && onCreditsUpdate();

      setTimeout(() => {
        window.location.href = "/";
      }, 5000);
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentError(error.message || "Payment verification failed");

      if (error.response?.data?.message) {
        setMessage(
          `Payment verification failed: ${error.response.data.message}`
        );
        setPaymentError(error.response.data.message);
      } else {
        setMessage("Payment verification failed. Please contact support.");
        setPaymentError("Payment verification failed");
      }
    }
  };

  const handleUpiPayment = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/upi-payment`,
        {
          userId,
          credits: selectedPackage.credits,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 10000,
        }
      );

      const { upiDetails, qrCode, instructions } = response.data;

      setUpiQrCode(qrCode);

      const detailedMessage = `
UPI Payment Details:
───────────────────
UPI ID: ${upiDetails.upiId}
Account Number: ${upiDetails.accountNumber}
Account Holder: ${upiDetails.accountHolder}
Amount: ₹${upiDetails.amount}
Transaction ID: ${upiDetails.transactionId}

${instructions.join("\n")}

Note: Please include the Transaction ID in your payment reference.
      `;

      setMessage(detailedMessage);
    } catch (error) {
      console.error("UPI payment error:", error);
      setPaymentError(error.message || "UPI payment failed");
      setMessage(
        `Failed to initiate UPI payment: ${
          error.response?.data?.message || error.message
        }. Please try again or contact support.`
      );
    }
  };

  const verifyManualPayment = async () => {
    try {
      const transactionId = message.match(/Transaction ID: (\S+)/)?.[1];
      if (!transactionId) {
        setMessage("Cannot find transaction ID. Please try the payment again.");
        setPaymentError("Transaction ID not found");
        return;
      }

      if (!selectedPackage) {
        setMessage(
          "No credit package selected. Please select a package and try again."
        );
        setPaymentError("No package selected");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/verify-manual-payment`,
        {
          userId,
          transactionId,
          credits: selectedPackage.credits,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 10000,
        }
      );

      setMessage(
        `Payment verified successfully! ${response.data.creditsAdded} credits added to your account. New balance: ${response.data.newBalance}`
      );
      setShowSuccess(true);
      onCreditsUpdate && onCreditsUpdate();

      setTimeout(() => {
        window.location.href = "/";
      }, 5000);
    } catch (error) {
      console.error("Manual verification error:", error);
      setPaymentError(error.message || "Manual verification failed");

      if (error.response?.data?.message) {
        setMessage(`Verification failed: ${error.response.data.message}`);
        setPaymentError(error.response.data.message);
      } else {
        setMessage(
          "Verification failed. Please check if payment was completed and try again."
        );
        setPaymentError("Verification failed");
      }
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Buy Credits</h2>
        <p>Current Credits: {currentCredits}</p>
      </div>

      {showSuccess ? (
        <div className="success-message">
          <h3>🎉 Payment Successful!</h3>
          <p>{message}</p>
          <div className="success-buttons">
            <button
              onClick={() => {
                setShowSuccess(false);
                setSelectedPackage(null);
                setMessage("");
                setUpiQrCode(null);
                setPaymentError(null);
              }}
              className="btn-primary"
            >
              Buy More Credits
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="package-selection">
            <h3>Select Credit Package</h3>
            <div className="package-grid">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`package-card ${
                    selectedPackage?.credits === pkg.credits ? "selected" : ""
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <h4>{pkg.credits} Credits</h4>
                  <p className="price">₹{pkg.price}</p>
                  <p className="credits-per-rupee">
                    {(pkg.credits / pkg.price).toFixed(2)} credits/₹
                  </p>
                </div>
              ))}
            </div>
          </div>

          {selectedPackage && (
            <div className="payment-method">
              <h3>Payment Method</h3>
              <div className="method-options">
                <label>
                  <input
                    type="radio"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Razorpay (Credit/Debit Card, Net Banking)
                </label>
                <label>
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  UPI Payment
                </label>
              </div>

              {paymentMethod === "upi" && (
                <div className="upi-details">
                  <p>UPI ID: 7068604832@ybl</p>
                  <p>Account Name: Code Review AI</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="btn-primary pay-button"
              >
                {isProcessing
                  ? "Processing..."
                  : `Pay ₹${selectedPackage.price}`}
              </button>
            </div>
          )}

          {message && (
            <div
              className={`message ${
                message.includes("successful") ? "success" : "error"
              }`}
            >
              <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>
              {paymentMethod === "upi" && upiQrCode && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <img
                    src={upiQrCode}
                    alt="Scan QR code to pay"
                    style={{
                      width: "200px",
                      height: "200px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
              {message.includes("Transaction ID:") &&
                paymentMethod === "upi" && (
                  <button
                    onClick={verifyManualPayment}
                    className="btn-secondary"
                  >
                    Verify Payment
                  </button>
                )}
            </div>
          )}
          {paymentError && (
            <div className="error-message">
              <p>Error: {paymentError}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Payment;
