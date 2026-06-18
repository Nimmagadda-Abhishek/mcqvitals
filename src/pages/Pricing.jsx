import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Pricing = () => {
  const { user, login } = useAuth(); // Assuming login or updateUser updates context
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      period: 'forever',
      features: [
        'Access to basic tests',
        'Limited performance tracking',
        'Standard question bank',
        'Community support'
      ],
      popular: false
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: 299,
      period: 'per month',
      features: [
        'Access to all intermediate tests',
        'Access to all advanced tests',
        'Unlimited access to all premium resources',
        'Detailed performance analytics',
        'Cancel anytime'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 1499,
      period: 'per year',
      features: [
        'Access to all intermediate tests',
        'Access to all advanced tests',
        'Unlimited access to all premium resources',
        'Detailed performance analytics',
        'Priority email support',
        'Save over 65% compared to monthly'
      ],
      popular: true
    }
  ];

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoadingPlan(planId);

      if (planId === 'free') {
        alert('You are already on the Free Tier or it is active by default.');
        navigate('/dashboard');
        setLoadingPlan(null);
        return;
      }

      // 1. Create order on backend
      let orderData;
      const now = new Date();
      const expiryDate = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
      const isExpired = expiryDate ? expiryDate < now : false;
      const hasActiveSub = user.subscription?.status === 'active' && !isExpired;

      const isUpgrade = hasActiveSub && user.subscription?.plan === 'monthly' && planId === 'yearly';

      if (isUpgrade) {
        orderData = await api.subscription.upgrade(planId);
      } else {
        orderData = await api.subscription.createOrder(planId);
      }

      // 2. Initialize Razorpay Checkout for Subscriptions
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'McqVitals',
        description: `${planId === 'monthly' ? 'Monthly' : 'Yearly'} Pro Subscription`,
        image: window.location.origin + '/logo.png',
        subscription_id: orderData.orderId, // orderData.orderId actually holds the subscription ID now
        handler: async function (response) {
          try {
            const verifyData = await api.subscription.verifyPayment({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId
            });

            alert('Payment successful! Your subscription is active.');
            // Quick refresh to update user context
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert(`Payment verification failed: ${err.message || 'Error verifying payment'}`);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Add razorpay script to document body if not present
  React.useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>Unlock Your Potential</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)', maxWidth: '600px', margin: '0 auto' }}>
          Get unlimited access to advanced assessments and premium study materials. Choose the plan that fits your goals.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {plans.map((plan) => {
          const now = new Date();
          const expiryDate = user?.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
          const isExpired = expiryDate ? expiryDate < now : false;
          const hasActiveSub = user?.subscription?.status === 'active' && !isExpired;

          const isFreePlan = plan.id === 'free';
          const isActivePlan = (isFreePlan && !hasActiveSub) || (hasActiveSub && user?.subscription?.plan === plan.id);
          const isDowngrade = hasActiveSub && user?.subscription?.plan === 'yearly' && plan.id === 'monthly';
          const isUpgrade = hasActiveSub && user?.subscription?.plan === 'monthly' && plan.id === 'yearly';

          const isDisabled = isActivePlan || isDowngrade || loadingPlan === plan.id || (isFreePlan && hasActiveSub);

          let buttonText = 'Subscribe Now';
          if (isActivePlan) buttonText = 'Current Plan';
          else if (isFreePlan && hasActiveSub) buttonText = 'Included';
          else if (isDowngrade) buttonText = 'Included in Yearly';
          else if (isUpgrade) buttonText = 'Upgrade Now';

          return (
            <div
              key={plan.id}
              style={{
                background: plan.popular ? 'var(--primary-container)' : 'var(--surface)',
                border: `2px solid ${plan.popular ? 'var(--primary)' : 'var(--outline-variant)'}`,
                borderRadius: '24px',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '400px',
                position: 'relative',
                boxShadow: plan.popular ? '0 20px 40px rgba(59, 130, 246, 0.15)' : 'none',
                /* Let CSS handle scaling if needed, or remove it so it fits mobile */
                transform: 'scale(1)', 
                transition: 'transform 0.3s ease'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Star size={14} fill="white" /> Most Popular
                </div>
              )}

              <h2 style={{ fontSize: '1.5rem', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>{plan.name}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹{plan.price}</span>
                <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--on-surface)', fontWeight: 500 }}>
                    <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px' }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isDisabled}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: isDisabled ? 'var(--surface-high)' : (plan.popular ? 'var(--primary)' : 'var(--surface-high)'),
                  color: isDisabled ? 'var(--on-surface-variant)' : (plan.popular ? 'white' : 'var(--on-surface)'),
                  border: isDisabled ? '1px solid var(--outline-variant)' : (plan.popular ? 'none' : '1px solid var(--outline)'),
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isDisabled ? 0.7 : 1
                }}
              >
                {loadingPlan === plan.id ? (
                  <span className="spinner-small" style={{ borderColor: plan.popular ? 'white' : 'var(--primary)', borderTopColor: 'transparent' }} />
                ) : (
                  <>{buttonText} {!isDisabled && <Shield size={18} />}</>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
        <p>Payments are securely processed by Razorpay.</p>
        <p>You can cancel your subscription at any time from your account settings.</p>
      </div>
    </div>
  );
};

export default Pricing;
