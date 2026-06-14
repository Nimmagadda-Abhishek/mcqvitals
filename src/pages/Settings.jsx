import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  Settings as SettingsIcon,
  Bell,
  Shield,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Save,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { user, logout, getProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [adminSubscriptions, setAdminSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.academicBio || 'Postgraduate student focusing on Computational Fluid Dynamics and Advanced Thermodynamics.',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('academicBio', profileData.bio);
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      await api.auth.updateProfile(formData);
      await getProfile(); // Refresh global auth state
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Update failed', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeTab === 'subscription') {
      if (user?.role === 'admin') {
        fetchAdminSubscriptionStats();
      } else {
        fetchSubscriptionData();
      }
    }
  }, [activeTab, user?.role]);

  const fetchAdminSubscriptionStats = async () => {
    try {
      setLoadingHistory(true);
      const [stats, subscriptions] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getAllSubscriptions()
      ]);
      setAdminStats(stats);
      setAdminSubscriptions(subscriptions);
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      setLoadingHistory(true);
      const [subscriptionInfo, plansData] = await Promise.all([
        api.subscription.getHistory(),
        api.subscription.getPlans()
      ]);
      setBillingHistory(subscriptionInfo.history || []);
      setSubscriptionDetails(subscriptionInfo);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to fetch subscription data', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.subscription.cancel();
      await getProfile(); // Refresh context
      alert('Your subscription has been cancelled.');
    } catch (error) {
      console.error('Failed to cancel subscription', error);
      alert(error.message || 'Failed to cancel subscription');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size={18} /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Profile Picture Section */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: isMobile ? '1.5rem' : '2rem' 
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '30px',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  overflow: 'hidden'
                }}>
                  {imagePreview || user?.profileImage ? (
                    <img 
                      src={imagePreview || user.profileImage} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    user?.name?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  background: 'var(--on-surface)',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid var(--surface-lowest)',
                  cursor: 'pointer'
                }}>
                  <Camera size={16} />
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Profile Picture</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                  A personal photo helps your peers recognize you. PNG or JPG, max 5MB.
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '2rem' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  disabled
                  style={{ ...inputStyle, background: 'var(--surface-low)', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  style={{ ...inputStyle, background: 'var(--surface-low)', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Academic Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  placeholder="Describe your academic interests and expertise..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="primary-gradient"
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                {isSaving ? 'Synchronizing...' : <><Save size={18} /> Save Profile</>}
              </button>
            </div>
          </div>
        );

      case 'subscription':
        if (user?.role === 'admin') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div className="card-tonal" style={{
                background: 'linear-gradient(135deg, var(--on-surface) 0%, #333 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'flex-start', 
                    marginBottom: '2.5rem',
                    gap: isMobile ? '1.5rem' : '0'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.5rem' }}>ADMINISTRATOR OVERVIEW</div>
                      <h3 style={{ fontSize: '2rem' }}>Subscription Intelligence</h3>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : '4rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.4rem' }}>ACTIVE SUBSCRIBERS</div>
                      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#10b981' }}>
                        {loadingHistory ? '...' : adminStats?.activeSubscribers || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.4rem' }}>TOTAL EARNINGS</div>
                      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f59e0b' }}>
                        {loadingHistory ? '...' : `₹${(adminStats?.totalSubscriptionEarnings || 0).toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-10%',
                  width: '300px',
                  height: '300px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '50%'
                }} />
              </div>

              {/* Admin Subscription List */}
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Global Subscription Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loadingHistory ? (
                    <p>Loading subscriptions...</p>
                  ) : adminSubscriptions.length === 0 ? (
                    <p>No subscriptions found.</p>
                  ) : adminSubscriptions.map((sub) => (
                    <div key={sub._id} className="card-tonal" style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      padding: isMobile ? '1.5rem' : '1.2rem 2rem',
                      gap: isMobile ? '1.5rem' : '0'
                    }}>
                      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '3rem', alignItems: isMobile ? 'flex-start' : 'center' }}>
                        <div style={{ width: '120px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                            {sub.orderId || 'N/A'}
                          </div>
                        </div>
                        <div style={{ width: '180px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{sub.userId?.name || 'Unknown User'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{sub.userId?.email || 'No email provided'}</div>
                        </div>
                        <div style={{ fontWeight: 700, width: '100px' }}>
                          {sub.plan === 'yearly' ? 'Yearly Pro' : sub.plan === 'monthly' ? 'Monthly Pro' : 'N/A'}
                        </div>
                        <div style={{ fontWeight: 700 }}>₹{sub.amount?.toFixed(2)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: sub.status === 'paid' ? 'var(--success)' : (sub.status === 'created' ? 'var(--tertiary)' : 'var(--error)'), fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
                          {sub.status === 'paid' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {sub.status}
                        </div>
                        <button style={{ color: 'var(--primary)' }}><ExternalLink size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        const currentPlanId = subscriptionDetails?.currentPlan && subscriptionDetails.currentPlan !== 'none' ? subscriptionDetails.currentPlan : user?.subscription?.plan;
        const currentPlanDetails = plans.find(p => p.id === currentPlanId) || null;
        const isSubActive = subscriptionDetails?.currentPlan && subscriptionDetails.currentPlan !== 'none';
        
        let expiryDate = 'N/A';
        if (subscriptionDetails?.nextBillingDate) {
           expiryDate = new Date(subscriptionDetails.nextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (user?.subscription?.expiryDate) {
           expiryDate = new Date(user.subscription.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        const displayAmount = subscriptionDetails?.amount || (currentPlanDetails ? currentPlanDetails.price : 0);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Current Plan Card */}
            <div className="card-tonal" style={{
              background: 'linear-gradient(135deg, var(--on-surface) 0%, #333 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'flex-start' : 'flex-start', 
                  marginBottom: '2.5rem',
                  gap: isMobile ? '1.5rem' : '0'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.5rem' }}>CURRENT PLAN</div>
                    <h3 style={{ fontSize: '2rem' }}>{currentPlanDetails ? currentPlanDetails.name : 'Free Tier'}</h3>
                  </div>
                  <div style={{
                    background: isSubActive ? 'var(--primary)' : 'var(--outline-variant)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {isSubActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : '4rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.4rem' }}>NEXT BILLING</div>
                    <div style={{ fontWeight: 600 }}>{isSubActive ? expiryDate : 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.4rem' }}>AMOUNT</div>
                    <div style={{ fontWeight: 600 }}>{displayAmount > 0 ? `₹${displayAmount} / ${currentPlanId === 'monthly' ? 'mo' : 'yr'}` : '₹0'}</div>
                  </div>
                </div>
              </div>
              {/* Decorative circle */}
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%'
              }} />
            </div>

            {/* Billing Actions */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem' }}>
              <button 
                onClick={() => navigate('/pricing')}
                style={{
                  flex: 1,
                  padding: '1.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--outline-variant)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Change Plan
              </button>
              <button 
                onClick={handleCancelSubscription}
                style={{
                  flex: 1,
                  padding: '1.2rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--error)',
                  border: '2px solid rgba(186, 26, 26, 0.1)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel Subscription
              </button>
            </div>

            {/* Billing History */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Billing History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingHistory ? (
                  <p>Loading billing history...</p>
                ) : billingHistory.length === 0 ? (
                  <p>No billing history found.</p>
                ) : billingHistory.map((bill) => (
                  <div key={bill._id} className="card-tonal" style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    padding: isMobile ? '1.5rem' : '1.2rem 2rem',
                    gap: isMobile ? '1.5rem' : '0'
                  }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '3rem', alignItems: isMobile ? 'flex-start' : 'center' }}>
                      <div style={{ width: '120px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {new Date(bill.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                          {bill.orderId || 'N/A'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{bill.amount?.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: bill.status === 'paid' ? 'var(--success)' : (bill.status === 'failed' ? 'var(--error)' : 'var(--on-surface-variant)'), fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {bill.status === 'paid' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {bill.status}
                      </div>
                      <button style={{ color: 'var(--primary)' }}><ExternalLink size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Notification Settings */}
            <section>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Bell size={20} color="var(--primary)" /> Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { title: 'Personalized Progress Reports', desc: 'Weekly insights into your cognitive velocity and accuracy.' },
                  { title: 'Exam Reminders', desc: 'Alerts for your scheduled tests and submission deadlines.' },
                  { title: 'New Premium Resources', desc: 'Be the first to know when admin uploads new materials.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 650, fontSize: '1rem', marginBottom: '0.2rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{item.desc}</div>
                    </div>
                    <div style={{
                      width: '44px',
                      minWidth: '44px',
                      height: '24px',
                      borderRadius: '20px',
                      background: i < 3 ? 'var(--primary)' : 'var(--outline-variant)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: i < 3 ? '2px' : 'auto',
                        left: i < 3 ? 'auto' : '2px',
                        top: '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1rem' : '0' }}>
      <header style={{ marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>Workspace Settings</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>
          Manage your scholarly identity and premium membership details.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', 
        gap: isMobile ? '2.5rem' : '4rem', 
        alignItems: 'start' 
      }}>
        {/* Navigation Sidebar */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column', 
          gap: '0.5rem',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? '1rem' : '0',
          scrollbarWidth: 'none'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: isMobile ? '0.8rem 1.2rem' : '1.2rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === tab.id ? 'var(--primary-container)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontSize: '0.95rem',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span style={{ color: activeTab === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                {tab.icon}
              </span>
              {!isMobile && tab.label}
              {activeTab === tab.id && !isMobile && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
          {!isMobile && <div style={{ height: '1px', background: 'var(--surface-high)', margin: '1.5rem 0' }} />}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: isMobile ? '0.8rem 1.2rem' : '1.2rem 1.5rem',
              color: 'var(--error)',
              fontWeight: 700,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              marginLeft: isMobile ? 'auto' : '0'
            }}
          >
            <LogOut size={18} /> {!isMobile && 'Log Out'}
          </button>
        </nav>

        {/* Content Area */}
        <main className="section-tonal" style={{ 
          minHeight: isMobile ? 'auto' : '600px', 
          padding: isMobile ? '1.5rem' : '3.5rem',
          borderRadius: 'var(--radius-lg)'
        }}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--outline-variant)',
  background: 'var(--surface-lowest)',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
  color: 'var(--on-surface)',
  transition: 'all 0.2s ease'
};

export default Settings;
