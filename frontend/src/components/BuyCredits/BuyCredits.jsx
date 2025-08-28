import axios from 'axios';
import { useState } from 'react';
import './BuyCredits.css';

const BuyCredits = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  const pricingPlans = [
    {
      id: 1,
      credits: 200,
      price: 99,
      originalPrice: 149,
      discount: '33% OFF',
      popular: false
    },
    {
      id: 2,
      credits: 500,
      price: 199,
      originalPrice: 299,
      discount: '33% OFF',
      popular: true
    },
    {
      id: 3,
      credits: 2000,
      price: 999,
      originalPrice: 1499,
      discount: '33% OFF',
      popular: false
    }
  ];

  const handlePayment = async (plan) => {
    try {
      setLoading(true);
      
      // Create order
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          amount: plan.price,
          credits: plan.credits
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const order = orderResponse.data;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'CodeReviewAI',
        description: `${plan.credits} Credits Purchase`,
        order_id: order.id,
        handler: async function(response) {
          // Verify payment
          const verifyResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/payment/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              credits: plan.credits,
              couponCode: couponCode
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (verifyResponse.data.success) {
            setUser(prev => ({
              ...prev,
              credits: verifyResponse.data.totalCredits
            }));
            alert(`Payment successful! ${verifyResponse.data.creditsAdded} credits added.`);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#4CAF50'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = () => {
    if (couponCode === 'WELCOME10') {
      setCouponMessage('Coupon applied: 10% extra credits!');
    } else if (couponCode === 'FIRST20') {
      setCouponMessage('Coupon applied: 20% extra credits!');
    } else {
      setCouponMessage('Invalid coupon code');
    }
  };

  return (
    <div className="buy-credits-container">
      <h1>Buy Credits</h1>
      <p className="credits-balance">Your current balance: {user.credits} credits</p>

      {/* Coupon Section */}
      <div className="coupon-section">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="coupon-input"
        />
        <button onClick={applyCoupon} className="coupon-button">
          Apply
        </button>
        {couponMessage && <p className="coupon-message">{couponMessage}</p>}
      </div>

      {/* Pricing Plans */}
      <div className="pricing-plans">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
            <h3>{plan.credits} Credits</h3>
            <div className="price">
              <span className="current-price">₹{plan.price}</span>
              <span className="original-price">₹{plan.originalPrice}</span>
            </div>
            <div className="discount">{plan.discount}</div>
            <button
              onClick={() => handlePayment(plan)}
              disabled={loading}
              className="buy-button"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredits;
