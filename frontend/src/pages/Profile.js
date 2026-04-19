import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Phone, Clock, User, Mail, AlertCircle, Droplet, Heart, Shield, Award, Target, Zap, Star, ChevronRight, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Embedded CSS styles
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fff1f2 100%)',
      fontFamily: "'Inter', sans-serif"
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    profileHeader: {
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 50%, #ec4899 100%)',
      borderRadius: '1.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    statsCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    appointmentCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '2px solid rgba(229, 231, 235, 0.5)',
      transition: 'all 0.3s ease'
    },
    buttonPrimary: {
      background: 'linear-gradient(90deg, #dc2626 0%, #ec4899 100%)',
      color: 'white',
      borderRadius: '0.75rem',
      padding: '0.75rem 1.5rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3), 0 2px 4px -1px rgba(220, 38, 38, 0.2)'
    },
    buttonSecondary: {
      background: 'white',
      border: '2px solid #e5e7eb',
      color: '#374151',
      borderRadius: '0.75rem',
      padding: '0.75rem 1.5rem',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    statusBadge: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }
  };

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/donations/appointments`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch appointments');
        }

        const data = await response.json();
        
        if (data.success) {
          setAppointments(data.data || []);
        } else {
          throw new Error(data.error || 'Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Fetch appointments error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Cancel appointment
  const cancelAppointment = async (appointment) => {
    try {
      console.log('Full appointment object:', appointment);

      if (!appointment) {
        throw new Error('No appointment data provided');
      }

      if (!window.confirm(`Cancel appointment at ${appointment.centerId?.name || 'the donation center'}?`)) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const dateValue = appointment.date || appointment.appointmentDate;
      if (!dateValue) {
        throw new Error('Appointment date is missing');
      }

      let parsedDate;
      try {
        parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (dateError) {
        console.error('Date parsing failed:', {
          rawDateValue: dateValue,
          error: dateError.message
        });
        throw new Error('Invalid appointment date');
      }

      if (!user?.email || !appointment.confirmationCode) {
        throw new Error('Missing required information for cancellation');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/donations/appointments`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email.toLowerCase(),
          date: parsedDate.toISOString(),
          confirmationCode: appointment.confirmationCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Cancellation failed');
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointment._id ? { ...apt, status: 'cancelled' } : apt
        )
      );

      alert('Appointment cancelled successfully!');

    } catch (error) {
      console.error('Cancellation failed:', {
        error: error.message,
        appointment: appointment,
        userEmail: user?.email
      });
      
      alert(`Cancellation failed: ${error.message}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled': 
        return { 
          color: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', 
          icon: Clock,
          bgColor: '#dbeafe',
          borderColor: '#bfdbfe'
        };
      case 'confirmed': 
        return { 
          color: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', 
          icon: Shield,
          bgColor: '#d1fae5',
          borderColor: '#a7f3d0'
        };
      case 'completed': 
        return { 
          color: 'linear-gradient(90deg, #059669 0%, #10b981 100%)', 
          icon: Award,
          bgColor: '#ccfbf1',
          borderColor: '#99f6e4'
        };
      case 'cancelled': 
        return { 
          color: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)', 
          icon: AlertCircle,
          bgColor: '#fee2e2',
          borderColor: '#fecaca'
        };
      default: 
        return { 
          color: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)', 
          icon: Clock,
          bgColor: '#f3f4f6',
          borderColor: '#e5e7eb'
        };
    }
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '28rem',
            width: '100%'
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertCircle size={40} color="white" />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(90deg, #dc2626 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              Access Required
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Please log in to view your donor profile
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                ...styles.buttonPrimary,
                width: '100%',
                fontSize: '1rem'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedDonations = appointments.filter(apt => apt.status === 'completed').length;
  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Enhanced Profile Header */}
        <div style={styles.profileHeader}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
            backdropFilter: 'blur(20px)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '24rem',
            height: '24rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            transform: 'translate(-8rem, -8rem)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '16rem',
            height: '16rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            transform: 'translate(8rem, 8rem)'
          }}></div>
          
          <div style={{
            position: 'relative',
            padding: '2rem 1rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '6rem',
                    height: '6rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <User size={48} color="white" />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '-0.5rem',
                    width: '2rem',
                    height: '2rem',
                    background: '#10b981',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                  }}>
                    <Heart size={16} color="white" />
                  </div>
                </div>
                
                <div>
                  <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    {user.name}
                  </h1>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '1rem'
                  }}>
                    <Mail size={20} />
                    <span style={{ fontSize: '1.125rem' }}>{user.email}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '1.5rem'
                  }}>
                    <Calendar size={16} />
                    <span>Member since {user.joinDate ? new Date(user.joinDate).getFullYear() : '2024'}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '9999px',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}>
                      <Droplet size={16} style={{ marginRight: '0.5rem' }} /> 
                      Blood Donor
                    </span>
                    <span style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '9999px',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}>
                      <Heart size={16} style={{ marginRight: '0.5rem' }} /> 
                      Life Saver
                    </span>
                    <span style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '9999px',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}>
                      <Award size={16} style={{ marginRight: '0.5rem' }} /> 
                      Hero Donor
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {completedDonations}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1.125rem',
                  fontWeight: '500'
                }}>
                  Lives Saved
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem'
                }}>
                  {completedDonations * 3} people helped
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          margin: '2rem 0'
        }}>
          {[
            {
              title: "Total Donations",
              value: completedDonations,
              subtitle: "Completed successfully",
              icon: Award,
              color: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
              bgColor: '#ccfbf1'
            },
            {
              title: "Lives Saved",
              value: completedDonations * 3,
              subtitle: "People helped",
              icon: Heart,
              color: 'linear-gradient(90deg, #dc2626 0%, #ec4899 100%)',
              bgColor: '#fee2e2'
            },
            {
              title: "Upcoming",
              value: upcomingAppointments,
              subtitle: "Scheduled appointments",
              icon: Calendar,
              color: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
              bgColor: '#dbeafe'
            },
            {
              title: "Impact Score",
              value: completedDonations * 100,
              subtitle: "Community points",
              icon: Target,
              color: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)',
              bgColor: '#ede9fe'
            }
          ].map((stat, index) => (
            <div key={index} style={{
              ...styles.statsCard,
              background: stat.bgColor,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  background: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={24} color="white" />
                </div>
                <Zap size={20} color="#9ca3af" />
              </div>
              <div style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                color: '#374151',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                {stat.title}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {stat.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Appointments Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #f9fafb 0%, #ffffff 100%)',
            padding: '2rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(90deg, #dc2626 0%, #ec4899 100%)',
                  borderRadius: '0.75rem',
                  marginRight: '1rem'
                }}>
                  <Calendar size={28} color="white" />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    My Appointments
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    Track your donation journey
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#111827'
                }}>
                  {appointments.length}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Total appointments
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '2rem' }}>
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 0'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    border: '4px solid #fecaca',
                    borderRadius: '9999px',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    border: '4px solid #dc2626',
                    borderTopColor: 'transparent',
                    borderRadius: '9999px',
                    animation: 'spin 1s linear infinite',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}></div>
                </div>
                <p style={{
                  color: '#6b7280',
                  marginTop: '1.5rem',
                  fontSize: '1.125rem'
                }}>
                  Loading your appointments...
                </p>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 0'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: '#fee2e2',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <AlertCircle size={32} color="#ef4444" />
                </div>
                <p style={{
                  color: '#ef4444',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '1.125rem'
                }}>
                  Error loading appointments
                </p>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '2rem'
                }}>
                  {error}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    ...styles.buttonPrimary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                  Try Again
                </button>
              </div>
            ) : appointments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 0'
              }}>
                <div style={{
                  width: '6rem',
                  height: '6rem',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fce7f3 100%)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Calendar size={48} color="#ef4444" />
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  No appointments scheduled
                </h3>
                <p style={{
                  color: '#6b7280',
                  maxWidth: '32rem',
                  margin: '0 auto 2rem',
                  fontSize: '1.125rem'
                }}>
                  Start your donation journey today. Your donation can save up to 3 lives!
                </p>
                <button 
                  onClick={() => window.location.href = '/schedule'}
                  style={{
                    ...styles.buttonPrimary,
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Schedule Your First Donation
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {appointments.map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div
                      key={appointment._id}
                      style={{
                        ...styles.appointmentCard,
                        background: statusInfo.bgColor,
                        borderColor: statusInfo.borderColor,
                        opacity: appointment.status === 'cancelled' ? 0.75 : 1
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{
                            ...styles.statusBadge,
                            background: statusInfo.color,
                            color: 'white'
                          }}>
                            <StatusIcon size={16} style={{ marginRight: '0.5rem' }} />
                            <span style={{ textTransform: 'capitalize' }}>{appointment.status}</span>
                          </div>
                          {appointment.confirmationCode && (
                            <div style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(255, 255, 255, 0.7)',
                              backdropFilter: 'blur(5px)',
                              borderRadius: '0.5rem',
                              border: '1px solid #e5e7eb'
                            }}>
                              <span style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                #{appointment.confirmationCode}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '2rem'
                        }}>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <h3 style={{
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: '#111827',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Calendar size={20} color="#ef4444" style={{ marginRight: '0.5rem' }} />
                              Appointment Details
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                              {[
                                { icon: Calendar, text: formatDate(appointment.date) },
                                { icon: Clock, text: appointment.timeSlot || formatTime(appointment.date) },
                                { icon: User, text: appointment.name },
                                { icon: Phone, text: appointment.phone }
                              ].map((item, index) => (
                                <div key={index} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  padding: '0.75rem',
                                  background: 'rgba(255, 255, 255, 0.5)',
                                  borderRadius: '0.75rem'
                                }}>
                                  <item.icon size={20} color="#6b7280" />
                                  <span style={{
                                    color: '#374151',
                                    fontWeight: '500'
                                  }}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {appointment.centerId && (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                              <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#111827',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <MapPin size={20} color="#ef4444" style={{ marginRight: '0.5rem' }} />
                                Donation Center
                              </h3>
                              <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{
                                  padding: '0.75rem',
                                  background: 'rgba(255, 255, 255, 0.5)',
                                  borderRadius: '0.75rem'
                                }}>
                                  <div style={{
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {appointment.centerId.name}
                                  </div>
                                </div>
                                {[
                                  { icon: MapPin, text: `${appointment.centerId.address}, ${appointment.centerId.city}, ${appointment.centerId.state} ${appointment.centerId.zipCode}` },
                                  { icon: Phone, text: appointment.centerId.phone },
                                  { icon: Clock, text: appointment.centerId.hours }
                                ].filter(item => item.text).map((item, index) => (
                                  <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    borderRadius: '0.75rem'
                                  }}>
                                    <item.icon size={20} color="#6b7280" style={{ marginTop: '0.125rem' }} />
                                    <span style={{ color: '#374151' }}>
                                      {item.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {appointment.notes && (
                          <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'linear-gradient(90deg, #dbeafe 0%, #e0e7ff 100%)',
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem'
                            }}>
                              <Star size={20} color="#3b82f6" style={{ marginTop: '0.125rem' }} />
                              <div>
                                <p style={{
                                  color: '#1e40af',
                                  fontWeight: '500',
                                  marginBottom: '0.25rem'
                                }}>
                                  Special Notes
                                </p>
                                <p style={{ color: '#3b82f6' }}>
                                  {appointment.notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {appointment.status === 'scheduled' && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          marginTop: '1.5rem'
                        }}>
                          <button
                            onClick={() => cancelAppointment(appointment)}
                            style={{
                              ...styles.buttonSecondary,
                              borderColor: '#fca5a5',
                              color: '#dc2626'
                            }}
                          >
                            Cancel Appointment
                          </button>
                          <button 
                            onClick={() => window.location.href = `/reschedule/${appointment._id}`}
                            style={{
                              ...styles.buttonPrimary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            Reschedule
                            <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Impact Section */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #0d9488 100%)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(5, 150, 105, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
            backdropFilter: 'blur(20px)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '18rem',
            height: '18rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            transform: 'translate(-4rem, -4rem)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '12rem',
            height: '12rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            transform: 'translate(4rem, 4rem)'
          }}></div>
          
          <div style={{
            position: 'relative',
            padding: '2rem 1.5rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Heart size={32} color="white" />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    Your Donation Impact
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1.125rem',
                    marginBottom: '1rem'
                  }}>
                    Each donation saves up to 3 lives. You've potentially saved{' '}
                    <span style={{
                      fontWeight: '700',
                      color: '#fef08a',
                      fontSize: '1.25rem'
                    }}>
                      {completedDonations * 3} lives
                    </span>{' '}
                    so far!
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Award size={20} style={{ marginRight: '0.5rem' }} />
                      <span>Hero Status</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Target size={20} style={{ marginRight: '0.5rem' }} />
                      <span>{completedDonations * 100} Points</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => window.location.href = '/schedule'}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: '0.75rem',
                    fontWeight: '500',
                    fontSize: '1.125rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Schedule Another Donation
                  <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  Next eligible: {new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;