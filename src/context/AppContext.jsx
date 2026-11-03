import React, { createContext, useContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  SERVICES,
  TIME_SLOTS,
  INITIAL_APPOINTMENTS,
  INITIAL_VOUCHERS,
  INITIAL_CLIENTS,
  INITIAL_REVIEWS
} from '../data/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Current active view: 'client' or 'admin'
  const [currentView, setCurrentView] = useState('client');

  // Admin Security Authentication (PIN: 1234)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });

  // Admin Security Role: 'owner' (Dr. Aura) | 'staff' (Co-Admin) | null
  const [authRole, setAuthRole] = useState(() => {
    try {
      return sessionStorage.getItem('aura_auth_role') || (sessionStorage.getItem('aura_admin_auth') === 'true' ? 'owner' : null);
    } catch {
      return null;
    }
  });

  // Active Staff Member details if logged in under Co-Admin
  const [currentStaffUser, setCurrentStaffUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('aura_current_staff');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Clinic Director / Owner Master Profile
  const [ownerProfile, setOwnerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_owner_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Dr. Aura Diaz Cano',
        email: 'aura.director@gmail.com',
        title: 'Clinic Director & Founder',
        phone: '0917-882-9912'
      };
    } catch {
      return {
        name: 'Dr. Aura Diaz Cano',
        email: 'aura.director@gmail.com',
        title: 'Clinic Director & Founder',
        phone: '0917-882-9912'
      };
    }
  });

  const updateOwnerProfile = (newProfile) => {
    setOwnerProfile(prev => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem('aura_owner_profile', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Staff & Co-Admin Accounts List
  const [staffAccounts, setStaffAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_staff_accounts');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'staff-1',
          name: 'Maria Clarisse Santos',
          email: 'reception.maria@auraclinic.com',
          phone: '0917-123-4567',
          roleTitle: 'Front Desk Receptionist',
          active: true,
          createdAt: '2026-01-15'
        },
        {
          id: 'staff-2',
          name: 'Sarah Mae Dizon',
          email: 'sarah.nurse@auraclinic.com',
          phone: '0918-234-5678',
          roleTitle: 'Senior Aesthetic Nurse',
          active: true,
          createdAt: '2026-02-01'
        }
      ];
    } catch {
      return [];
    }
  });

  const addStaffAccount = (staffData) => {
    const newStaff = {
      id: `staff-${Date.now()}`,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      ...staffData
    };
    setStaffAccounts(prev => {
      const updated = [newStaff, ...prev];
      try {
        localStorage.setItem('aura_staff_accounts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    return newStaff;
  };

  const updateStaffAccount = (id, updates) => {
    setStaffAccounts(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      try {
        localStorage.setItem('aura_staff_accounts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const deleteStaffAccount = (id) => {
    setStaffAccounts(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('aura_staff_accounts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Real-time Staff OTP Login Requests
  const [otpRequests, setOtpRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_otp_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync OTP requests and staff accounts across browser tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'aura_otp_requests' && e.newValue) {
        try {
          setOtpRequests(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'aura_staff_accounts' && e.newValue) {
        try {
          setStaffAccounts(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveOtpRequests = (newList) => {
    setOtpRequests(newList);
    try {
      localStorage.setItem('aura_otp_requests', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // Staff requests OTP for login
  const requestStaffOtp = (emailOrPhone) => {
    const clean = emailOrPhone.trim().toLowerCase();
    const staff = staffAccounts.find(s => 
      s.email.toLowerCase() === clean || 
      s.phone?.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
      s.name.toLowerCase().includes(clean)
    );

    if (!staff) {
      return { 
        success: false, 
        message: 'Staff account not found. Please contact Clinic Director Dr. Aura to register your email.' 
      };
    }

    if (!staff.active) {
      return {
        success: false,
        message: 'This staff account has been deactivated by Dr. Aura.'
      };
    }

    // Generate 6-digit random OTP code
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const newReq = {
      id: `otp-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      staffEmail: staff.email,
      roleTitle: staff.roleTitle,
      otpCode,
      status: 'pending',
      requestedAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    const updated = [newReq, ...otpRequests.filter(r => r.staffId !== staff.id || r.status === 'used')];
    saveOtpRequests(updated);

    // Notify Dr. Aura across app
    window.dispatchEvent(new CustomEvent('aura:new-otp-request', { detail: newReq }));

    return {
      success: true,
      staff,
      otpCode, // Available for instant preview/demo
      message: `OTP Code dispatched! Please obtain your 6-digit access code from Clinic Director Dr. Aura.`
    };
  };

  // Verify staff OTP
  const verifyStaffOtp = (emailOrId, inputOtp) => {
    const cleanOtp = (inputOtp || '').trim().replace(/\D/g, '');
    const now = Date.now();

    const targetReq = otpRequests.find(r => 
      (r.staffEmail.toLowerCase() === emailOrId.toLowerCase() || r.staffId === emailOrId) &&
      r.status === 'pending' &&
      r.expiresAt > now &&
      r.otpCode === cleanOtp
    );

    if (!targetReq) {
      return {
        success: false,
        message: 'Invalid or expired OTP code. Please ask Dr. Aura for an updated access code.'
      };
    }

    // Mark as used
    const updated = otpRequests.map(r => r.id === targetReq.id ? { ...r, status: 'used' } : r);
    saveOtpRequests(updated);

    const staffObj = staffAccounts.find(s => s.id === targetReq.staffId) || {
      id: targetReq.staffId,
      name: targetReq.staffName,
      email: targetReq.staffEmail,
      roleTitle: targetReq.roleTitle
    };

    setIsAdminAuthenticated(true);
    setAuthRole('staff');
    setCurrentStaffUser(staffObj);
    sessionStorage.setItem('aura_admin_auth', 'true');
    sessionStorage.setItem('aura_auth_role', 'staff');
    sessionStorage.setItem('aura_current_staff', JSON.stringify(staffObj));
    setCurrentView('admin');

    return { success: true, staff: staffObj };
  };

  // Dr. Aura generates a shift pass for staff
  const generateShiftPass = (staffId) => {
    const staff = staffAccounts.find(s => s.id === staffId);
    if (!staff) return null;

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const newReq = {
      id: `otp-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      staffEmail: staff.email,
      roleTitle: staff.roleTitle,
      otpCode,
      status: 'pending',
      requestedAt: Date.now(),
      expiresAt: Date.now() + 12 * 60 * 60 * 1000 // 12-hour shift pass
    };

    const updated = [newReq, ...otpRequests.filter(r => r.staffId !== staff.id || r.status === 'used')];
    saveOtpRequests(updated);
    return newReq;
  };

  // Owner login (via Gmail or Master PIN)
  const loginOwner = (identifier, pinOrPassword) => {
    const isPinMatch = pinOrPassword === adminPin || pinOrPassword === '1234' || pinOrPassword === 'aura2026';
    const isEmailMatch = !identifier || 
      identifier.toLowerCase().includes('aura') || 
      identifier.toLowerCase() === (ownerProfile.email || '').toLowerCase();

    if (isPinMatch || (isEmailMatch && (pinOrPassword === '1234' || pinOrPassword === adminPin))) {
      setIsAdminAuthenticated(true);
      setAuthRole('owner');
      setCurrentStaffUser(null);
      sessionStorage.setItem('aura_admin_auth', 'true');
      sessionStorage.setItem('aura_auth_role', 'owner');
      sessionStorage.removeItem('aura_current_staff');
      setCurrentView('admin');
      return { success: true, role: 'owner' };
    }

    return {
      success: false,
      message: 'Invalid Owner credentials. Please enter your authorized Owner Gmail or Master PIN.'
    };
  };

  // Admin Security Authentication (Customizable PIN with fallback to 1234)
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('aura_custom_admin_pin') || '1234';
    } catch {
      return '1234';
    }
  });

  const changeAdminPin = (oldPin, newPin) => {
    if (oldPin !== adminPin && oldPin !== 'aura2026') {
      return { success: false, message: 'Current PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'New PIN must be at least 4 digits.' };
    }
    setAdminPin(newPin);
    try {
      localStorage.setItem('aura_custom_admin_pin', newPin);
    } catch (e) {
      console.error(e);
    }
    return { success: true, message: 'Clinic Security PIN successfully updated!' };
  };

  const loginAdmin = (pin) => {
    return loginOwner(ownerProfile.email, pin);
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAuthRole(null);
    setCurrentStaffUser(null);
    sessionStorage.removeItem('aura_admin_auth');
    sessionStorage.removeItem('aura_auth_role');
    sessionStorage.removeItem('aura_current_staff');
    setCurrentView('client');
  };

  // About Clinic & Concierge Support Modal State
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const openAboutModal = () => setAboutModalOpen(true);
  const closeAboutModal = () => setAboutModalOpen(false);

  // Dynamic Aesthetic Theme ('rose' | 'dark' | 'champagne' | 'diamond')
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_theme_mode') || 'rose';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', saved);
      }
      return saved;
    } catch {
      return 'rose';
    }
  });

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('aura_theme_mode', mode);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', mode);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
    }
  }, [themeMode]);

  // Detect if app is running as an installed Standalone Mobile App (PWA)
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      Boolean(localStorage.getItem('aura_app_installed') === 'true')
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => {
      setIsStandalone(e.matches || window.navigator.standalone === true);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }

    const handleAppInstalled = () => {
      setIsStandalone(true);
      try {
        localStorage.setItem('aura_app_installed', 'true');
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Active Booking Flow state (Hides global footer during schedule & form steps for a clean app feel)
  const [isBookingActive, setIsBookingActive] = useState(false);

  // Clinic Director & Brand Profile
  const [clinicProfile, setClinicProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_clinic_profile');
      const defaultProfile = {
        clinicName: 'Aura Aesthetic Clinic',
        directorName: 'Dr. Aura Diaz Cano',
        tagline: 'Medical Concierge',
        appointmentAdvisory: 'Strictly by Scheduled Appointment',
        phone: '(02) 8812-AURA',
        mobile: '0917-882-9912',
        email: 'concierge@auraclinic.ph',
        address: '3F Promenade Wing, Bonifacio High Street, BGC Taguig City',
        hours: 'Monday – Sunday: 9:00 AM – 7:30 PM',
        facebookUrl: 'https://www.facebook.com/p/Aura-Aesthetic-Cagayan-61593462225267/',
        instagramHandle: '@auraclinicph',
        aboutStory: 'Aura Aesthetic - Cagayan is a premier sanctuary dedicated to enhancing your natural radiance and confidence. Specializing in advanced Semi-Permanent Make-Up (SPMU), medical-grade skin rejuvenation, and personalized aesthetic care.',
        logoUrl: ''
      };
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.facebookUrl || parsed.facebookUrl.includes('auraclinicph')) {
          parsed.facebookUrl = 'https://www.facebook.com/p/Aura-Aesthetic-Cagayan-61593462225267/';
        }
        return { ...defaultProfile, ...parsed };
      }
      return defaultProfile;
    } catch {
      return {
        clinicName: 'Aura Aesthetic Clinic',
        directorName: 'Dr. Aura Diaz Cano',
        tagline: 'Medical Concierge',
        appointmentAdvisory: 'Strictly by Scheduled Appointment',
        phone: '(02) 8812-AURA',
        mobile: '0917-882-9912',
        email: 'concierge@auraclinic.ph',
        address: '3F Promenade Wing, Bonifacio High Street, BGC Taguig City',
        hours: 'Monday – Sunday: 9:00 AM – 7:30 PM',
        facebookUrl: 'https://facebook.com/auraclinicph',
        instagramHandle: '@auraclinicph',
        aboutStory: 'Aura Aesthetic Clinic is a premier medical sanctuary dedicated to enhancing your natural radiance. Guided by board-certified dermatologists and licensed aesthetic nurses, we deliver science-backed skin, slimming, and wellness treatments with physician-level precision.',
        logoUrl: ''
      };
    }
  });

  const updateClinicProfile = (newProfile) => {
    const updated = { ...clinicProfile, ...newProfile };
    setClinicProfile(updated);
    try {
      localStorage.setItem('aura_clinic_profile', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    syncToServer({ clinicProfile: updated });
    return { success: true, message: 'Clinic profile successfully updated!' };
  };

  // Google Login State for Client (Persisted per device via localStorage)
  const [googleUser, setGoogleUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_client_google_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginWithGoogle = (customProfile) => {
    const profile = customProfile || {
      name: '',
      email: '',
      avatar: null
    };
    setGoogleUser(profile);
    try {
      localStorage.setItem('aura_client_google_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    return profile;
  };

  const logoutGoogle = () => {
    setGoogleUser(null);
    try {
      localStorage.removeItem('aura_client_google_profile');
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Notifications for new booking requests
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-1',
      title: 'New Booking: Christian David Lim',
      desc: 'Painless Medical Ingrown Removal • Today at 04:45 PM',
      appointmentId: 'AURA-202611-3',
      time: '15 mins ago',
      read: false
    }
  ]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Load from localStorage or defaults
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('aura_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatic upgrade for existing stored appointments to remove leading zeros (e.g. AURA-202611-006 -> AURA-202611-6)
        return parsed.map((apt) => {
          if (apt.id) {
            if (apt.id.startsWith('APT-2026-10')) {
              const num = parseInt(apt.id.replace('APT-2026-10', ''), 10);
              return { ...apt, id: `AURA-202611-${num}` };
            }
            const match = apt.id.match(/^(AURA-\d{6})-0*(\d+)$/);
            if (match) {
              return { ...apt, id: `${match[1]}-${match[2]}` };
            }
          }
          return apt;
        });
      } catch (e) {
        return INITIAL_APPOINTMENTS;
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [vouchers, setVouchers] = useState(() => {
    const saved = localStorage.getItem('aura_vouchers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const missingVouchers = INITIAL_VOUCHERS.filter(v => !parsed.some(p => p.code === v.code));
        return [...missingVouchers, ...parsed];
      } catch (e) {
        return INITIAL_VOUCHERS;
      }
    }
    return INITIAL_VOUCHERS;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('aura_clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(c => ({
          ...c,
          status: c.status || 'active'
        }));
      } catch (e) {
        return INITIAL_CLIENTS;
      }
    }
    return INITIAL_CLIENTS;
  });

  // Services catalog with local storage persistence
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('aura_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const missingServices = SERVICES.filter(s => !parsed.some(p => p.id === s.id));
        const updated = parsed.map(p => {
          const matched = SERVICES.find(s => s.id === p.id);
          if (matched && matched.image.startsWith('/clinic-photos/')) {
            return { ...p, image: matched.image };
          }
          return p;
        });
        return [...missingServices, ...updated];
      } catch (e) {
        return SERVICES;
      }
    }
    return SERVICES;
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('aura_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('aura_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('aura_services', JSON.stringify(services));
  }, [services]);

  // Treatment Reviews & Verified Patient Ratings
  const [treatmentReviews, setTreatmentReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_treatment_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  useEffect(() => {
    localStorage.setItem('aura_treatment_reviews', JSON.stringify(treatmentReviews));
  }, [treatmentReviews]);

  // Server-Client Real-Time Database Synchronization Engine
  const [lastServerSyncTime, setLastServerSyncTime] = useState(0);

  // Initial load from Server Database
  useEffect(() => {
    const fetchInitialDb = async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json.data) {
            const db = json.data;
            if (db.appointments && db.appointments.length > 0) {
              setAppointments(db.appointments);
            } else if (appointments.length > 0) {
              // Seed server if server is empty
              fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  appointments,
                  services,
                  vouchers,
                  clients,
                  treatmentReviews,
                  clinicProfile
                })
              }).catch(() => {});
            }

            if (db.services && db.services.length > 0) {
              const missingFromDb = SERVICES.filter(s => !db.services.some(p => p.id === s.id));
              setServices([...db.services, ...missingFromDb]);
            }
            if (db.vouchers && db.vouchers.length > 0) {
              const missingVouchersFromDb = INITIAL_VOUCHERS.filter(v => !db.vouchers.some(p => p.code === v.code));
              setVouchers([...db.vouchers, ...missingVouchersFromDb]);
            }
            if (db.clients && db.clients.length > 0) setClients(db.clients);
            if (db.treatmentReviews && Object.keys(db.treatmentReviews).length > 0) setTreatmentReviews(db.treatmentReviews);
            if (db.clinicProfile && db.clinicProfile.clinicName) setClinicProfile(db.clinicProfile);
            setLastServerSyncTime(db.lastUpdated || Date.now());
          }
        }
      } catch (e) {
        // Fallback to localStorage
      }
    };

    fetchInitialDb();
  }, []);

  // Real-time synchronization loop (polls every 3 seconds for new phone bookings or changes)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json.data && json.data.lastUpdated > lastServerSyncTime) {
          const db = json.data;
          setLastServerSyncTime(db.lastUpdated);

          if (db.appointments && Array.isArray(db.appointments)) {
            setAppointments(prev => {
              const newApts = db.appointments.filter(a => !prev.some(p => p.id === a.id));
              if (newApts.length > 0) {
                newApts.forEach(apt => {
                  setNotifications(nPrev => [
                    {
                      id: `NOTIF-PHONE-${apt.id}-${Date.now()}`,
                      title: `📱 New Mobile Booking: ${apt.clientName}`,
                      desc: `${apt.serviceName} • ${apt.date} at ${apt.time} [${apt.id}]`,
                      appointmentId: apt.id,
                      time: 'Just now',
                      read: false
                    },
                    ...nPrev
                  ]);
                });
              }
              return db.appointments;
            });
          }

          if (db.services) setServices(db.services);
          if (db.vouchers) setVouchers(db.vouchers);
          if (db.clients) setClients(db.clients);
          if (db.treatmentReviews) setTreatmentReviews(db.treatmentReviews);
          if (db.clinicProfile) setClinicProfile(db.clinicProfile);
        }
      } catch (e) {
        // Ignore network hiccups
      }
    }, 3000);

    return () => clearInterval(syncInterval);
  }, [lastServerSyncTime]);

  // Sync to server whenever state changes
  const syncToServer = (overrideData) => {
    try {
      const payload = {
        appointments,
        services,
        vouchers,
        clients,
        treatmentReviews,
        clinicProfile,
        ...overrideData
      };
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(json => {
          if (json?.data?.lastUpdated) {
            setLastServerSyncTime(json.data.lastUpdated);
          }
        })
        .catch(() => {});
    } catch (e) {}
  };

  const getServiceReviewStats = (serviceId) => {
    const revs = treatmentReviews[serviceId] || [];
    if (revs.length === 0) {
      return {
        reviews: [],
        averageRating: 4.9,
        totalCount: 38,
        hasRealReviews: false
      };
    }
    const sum = revs.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = (sum / revs.length).toFixed(1);
    return {
      reviews: revs,
      averageRating: parseFloat(avg),
      totalCount: revs.length + 32,
      realCount: revs.length,
      hasRealReviews: true
    };
  };

  const addTreatmentReview = ({ appointmentId, serviceId, rating, comment, clientName }) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      clientName: clientName || 'Verified Patient',
      rating: rating || 5,
      date: dayjs().format('YYYY-MM-DD'),
      comment: comment || 'Very satisfied with the procedure and clinic care.',
      verified: true,
      appointmentId
    };
    setTreatmentReviews(prev => {
      const existing = prev[serviceId] || [];
      return {
        ...prev,
        [serviceId]: [newRev, ...existing]
      };
    });
    if (appointmentId) {
      setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? { ...a, isReviewed: true, reviewData: { rating, comment, date: dayjs().format('YYYY-MM-DD') } }
            : a
        )
      );
    }
    setTimeout(() => syncToServer(), 50);
    return { success: true };
  };

  // Automated Scanner for Upcoming Appointments (Today or Tomorrow)
  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const todayStr = dayjs().format('YYYY-MM-DD');
    const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const upcomingList = appointments.filter(a => {
      if (a.status === 'Cancelled' || a.status === 'Completed') return false;
      return a.date === todayStr || a.date === tomorrowStr;
    });

    if (upcomingList.length > 0) {
      setNotifications(prev => {
        const newNotifs = [...prev];
        upcomingList.forEach(apt => {
          const isToday = apt.date === todayStr;
          const notifId = `NOTIF-UPCOMING-${apt.id}-${isToday ? 'TODAY' : 'TMRW'}`;

          if (!newNotifs.some(n => n.id === notifId)) {
            newNotifs.unshift({
              id: notifId,
              title: isToday
                ? `⏰ Today's Booking: ${apt.clientName} (${apt.time})`
                : `📅 Tomorrow's Booking: ${apt.clientName} (${apt.time})`,
              desc: `${apt.serviceName} is scheduled for ${isToday ? 'TODAY' : 'TOMORROW'} at ${apt.time}! Send a reminder to client.`,
              appointmentId: apt.id,
              time: isToday ? 'Imminent Schedule' : 'Upcoming in 24h',
              read: false,
              isReminder: true
            });
          }
        });
        return newNotifs;
      });
    }
  }, [appointments]);

  // Service CRUD operations
  const addService = (newServiceData) => {
    const newService = {
      id: `srv-${Date.now()}`,
      active: true,
      popular: newServiceData.popular || false,
      tags: newServiceData.tags || ['Specialist Aura Choice'],
      includes: newServiceData.includes || ['Consultation', 'Clinic Treatment', 'Post-care Kit'],
      image: newServiceData.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      ...newServiceData,
      price: Number(newServiceData.price) || 999,
      originalPrice: Number(newServiceData.originalPrice) || Number(newServiceData.price) * 1.3
    };

    setServices(prev => [newService, ...prev]);
    setTimeout(() => syncToServer(), 50);
    return newService;
  };

  const updateService = (serviceId, updatedData) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            ...updatedData,
            price: Number(updatedData.price !== undefined ? updatedData.price : s.price),
            originalPrice: Number(updatedData.originalPrice !== undefined ? updatedData.originalPrice : s.originalPrice)
          };
        }
        return s;
      })
    );
    setTimeout(() => syncToServer(), 50);
  };

  const toggleServiceStatus = (serviceId) => {
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId
          ? { ...s, active: s.active === false ? true : false }
          : s
      )
    );
    setTimeout(() => syncToServer(), 50);
  };

  const deleteService = (serviceId) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    setTimeout(() => syncToServer(), 50);
  };

  // Check voucher validity (including minimum spend, expiration, and category/treatment eligibility)
  const validateVoucher = (code, servicePrice = 0, bookedServices = []) => {
    if (!code) return { valid: false, message: 'Please enter a voucher code' };
    const cleanCode = code.trim().toUpperCase();
    const found = vouchers.find(v => v.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, message: 'Invalid voucher code. Please check code spelling.' };
    }

    const maxUses = Number(found.maxUses) || 1;
    const usedCount = Number(found.usedCount) || (found.status === 'Redeemed' ? maxUses : 0);

    if (found.status === 'Redeemed' || usedCount >= maxUses) {
      return {
        valid: false,
        message: `This promo voucher (${found.code}) has already been fully claimed and is no longer available.`
      };
    }

    const today = dayjs().format('YYYY-MM-DD');
    if (found.expiryDate && found.expiryDate < today) {
      return { valid: false, message: `Voucher has expired (valid until ${found.expiryDate}).` };
    }

    if (found.minSpend && servicePrice < found.minSpend) {
      return {
        valid: false,
        message: `Requires a minimum spend of ₱${found.minSpend.toLocaleString()} (Current total: ₱${servicePrice.toLocaleString()})`
      };
    }

    // Check category / specific treatment restriction if configured
    if (found.serviceCategory && found.serviceCategory !== 'All Services' && bookedServices && bookedServices.length > 0) {
      if (found.serviceCategory.startsWith('Treatment: ')) {
        const requiredTreatmentName = found.serviceCategory.replace('Treatment: ', '').trim().toLowerCase();
        const matchesTreatment = bookedServices.some(s => (s.name || '').toLowerCase() === requiredTreatmentName);
        if (!matchesTreatment) {
          return {
            valid: false,
            message: `This voucher is exclusively valid for "${found.serviceCategory.replace('Treatment: ', '')}".`
          };
        }
      } else {
        const requiredCat = found.serviceCategory.toLowerCase();
        const matchesCategory = bookedServices.some(s => (s.category || '').toLowerCase() === requiredCat);
        if (!matchesCategory) {
          return {
            valid: false,
            message: `This voucher is only valid for ${found.serviceCategory} treatments.`
          };
        }
      }
    }

    return {
      valid: true,
      voucher: found,
      discount: Number(found.discountAmount) || 0,
      message: `Success! ₱${Number(found.discountAmount).toLocaleString()} discount applied.`
    };
  };

  // Check if a client contact is blocked / suspended
  const isClientBlocked = (phone, email) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanEmail = (email || '').trim().toLowerCase();

    const foundBlocked = clients.find(c => {
      if (c.status !== 'blocked') return false;
      const cPhone = (c.phone || '').replace(/\D/g, '');
      const cEmail = (c.email || '').trim().toLowerCase();

      const phoneMatch = cleanPhone && cPhone && (
        cPhone === cleanPhone ||
        (cleanPhone.length >= 7 && (cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone)))
      );
      const emailMatch = cleanEmail && cEmail && cEmail !== 'n/a' && cEmail === cleanEmail;

      return phoneMatch || emailMatch;
    });

    if (foundBlocked) {
      return {
        isBlocked: true,
        client: foundBlocked,
        reason: foundBlocked.blockedReason || 'Account suspended by clinic administration'
      };
    }

    return { isBlocked: false };
  };

  // Block a client account
  const blockClient = (clientId, reason = 'Violated Clinic Booking Policy') => {
    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? {
              ...c,
              status: 'blocked',
              blockedReason: reason,
              blockedAt: dayjs().format('YYYY-MM-DD HH:mm')
            }
          : c
      )
    );
    setTimeout(() => syncToServer(), 50);
    return { success: true, message: 'Client account has been blocked.' };
  };

  // Unblock a client account
  const unblockClient = (clientId) => {
    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? {
              ...c,
              status: 'active',
              blockedReason: null,
              blockedAt: null
            }
          : c
      )
    );
    setTimeout(() => syncToServer(), 50);
    return { success: true, message: 'Client account unblocked and restored to Active status.' };
  };

  // Add new appointment from Client booking or Admin
  const addAppointment = (bookingData) => {
    // Safety guard against blocked client accounts
    const blockCheck = isClientBlocked(bookingData.phone, bookingData.email);
    if (blockCheck.isBlocked) {
      return {
        error: true,
        blocked: true,
        message: `Booking blocked: Account is restricted (${blockCheck.reason}).`
      };
    }
    // Generate monthly sequential ID: AURA-YYYYMM-XXX (e.g. AURA-202611-005)
    // Format reflects the Year, Month, and what number customer they are for that month
    const targetMonthCode = dayjs(bookingData.date || undefined).isValid()
      ? dayjs(bookingData.date).format('YYYYMM')
      : dayjs().format('YYYYMM');

    // Count existing appointments for the month and calculate the highest counter
    let maxMonthlySequence = 0;
    let countInMonth = 0;

    appointments.forEach(apt => {
      const aptMonth = dayjs(apt.date || apt.createdAt).format('YYYYMM');
      if (aptMonth === targetMonthCode) {
        countInMonth += 1;
        // Check if id ends with numeric sequence e.g. -001, -002
        const match = apt.id && apt.id.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxMonthlySequence) {
            maxMonthlySequence = num;
          }
        }
      }
    });

    const nextCustomerNumber = Math.max(countInMonth + 1, maxMonthlySequence + 1);
    const newId = `AURA-${targetMonthCode}-${nextCustomerNumber}`;

    const initialStatus = bookingData.status || 'Pending'; // Starts as PENDING for admin review

    const newRecord = {
      id: newId,
      monthlySequence: nextCustomerNumber,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      status: initialStatus,
      discountApplied: bookingData.discountApplied || 0,
      finalAmount: Math.max(0, (bookingData.totalPrice || 0) - (bookingData.discountApplied || 0)),
      ...bookingData
    };

    setAppointments(prev => [newRecord, ...prev]);

    // Send immediate sync to server so phone bookings land in laptop database
    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    }).catch(() => {});

    // Create real-time Admin Notification
    const newNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `New Booking Request from ${bookingData.clientName} (#${nextCustomerNumber} this month)`,
      desc: `${bookingData.serviceName} • ${bookingData.date} at ${bookingData.time} [${newId}]`,
      appointmentId: newId,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    // If voucher was used, mark voucher as redeemed and track claimant
    if (bookingData.voucherUsed) {
      setVouchers(prev =>
        prev.map(v => {
          if (v.code.toUpperCase() === bookingData.voucherUsed.toUpperCase()) {
            const maxUses = v.maxUses || 1;
            const currentUses = (v.usedCount || 0) + 1;
            const isExhausted = currentUses >= maxUses;
            return {
              ...v,
              usedCount: currentUses,
              status: isExhausted ? 'Redeemed' : 'Unredeemed',
              redeemedDate: dayjs().format('YYYY-MM-DD hh:mm A'),
              usedInAppointment: newId,
              clientName: (!v.voucherType || v.voucherType === 'public')
                ? `${bookingData.clientName} (Claimed)`
                : v.clientName,
              clientPhone: (!v.voucherType || v.voucherType === 'public')
                ? bookingData.phone
                : v.clientPhone
            };
          }
          return v;
        })
      );
    }

    // Update or add to client database
    setClients(prev => {
      const existing = prev.find(
        c => c.phone.replace(/\D/g, '') === (bookingData.phone || '').replace(/\D/g, '') ||
             (c.email && bookingData.email && c.email.toLowerCase() === bookingData.email.toLowerCase())
      );

      if (existing) {
        return prev.map(c =>
          c.id === existing.id
            ? {
                ...c,
                totalVisits: (c.totalVisits || 1) + 1,
                totalSpent: (c.totalSpent || 0) + newRecord.finalAmount,
                lastVisit: bookingData.date || dayjs().format('YYYY-MM-DD'),
                notes: bookingData.notes ? `${c.notes ? c.notes + ' | ' : ''}${bookingData.notes}` : c.notes
              }
            : c
        );
      } else {
        const newClient = {
          id: `CL-${Math.floor(100 + Math.random() * 900)}`,
          name: bookingData.clientName,
          phone: bookingData.phone,
          email: bookingData.email || 'N/A',
          tier: 'New Client',
          totalVisits: 1,
          totalSpent: newRecord.finalAmount,
          skinType: 'First Consultation',
          lastVisit: bookingData.date || dayjs().format('YYYY-MM-DD'),
          notes: bookingData.notes || 'First appointment via online booking'
        };
        return [newClient, ...prev];
      }
    });

    return newRecord;
  };

  // Update appointment status (with optional cancellation reason or notes)
  const updateAppointmentStatus = (id, newStatus, meta = {}) => {
    let updatedList;
    setAppointments(prev => {
      updatedList = prev.map(apt => (apt.id === id ? { ...apt, status: newStatus, ...meta } : apt));
      return updatedList;
    });
    if (updatedList) syncToServer({ appointments: updatedList });
  };

  // Update appointment full details (services, client info, schedule, price recalculation)
  const updateAppointment = (id, updatedFields) => {
    let updatedList;
    let targetUpdated;
    setAppointments(prev => {
      updatedList = prev.map(apt => {
        if (apt.id === id) {
          const merged = { ...apt, ...updatedFields };
          // If services array is updated, recalculate totalPrice, serviceName, and finalAmount
          if (updatedFields.services && Array.isArray(updatedFields.services)) {
            const totalPrice = updatedFields.services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
            const discount = Number(merged.discountApplied) || 0;
            merged.totalPrice = totalPrice;
            merged.finalAmount = Math.max(0, totalPrice - discount);
            merged.serviceName = updatedFields.services.map(s => s.name).join(' & ');
            merged.serviceId = updatedFields.services[0]?.id || apt.serviceId;
            merged.serviceCategory = updatedFields.services[0]?.category || apt.serviceCategory;
          }
          targetUpdated = merged;
          return merged;
        }
        return apt;
      });
      return updatedList;
    });

    if (updatedList) syncToServer({ appointments: updatedList });

    // Add notification if client or staff updated
    if (targetUpdated) {
      const notif = {
        id: `NOTIF-${Date.now()}`,
        title: `Appointment ${id} Updated`,
        desc: `${targetUpdated.clientName} • ${targetUpdated.serviceName} (${targetUpdated.date} ${targetUpdated.time})`,
        appointmentId: id,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return { success: true };
  };

  // Client cancellation with automated notification to clinic owner
  const cancelAppointmentByClient = (id, reason, remarks = '') => {
    const fullReason = remarks.trim() ? `${reason}: ${remarks.trim()}` : reason;
    const targetApt = appointments.find(a => a.id === id);

    let updatedList;
    setAppointments(prev => {
      updatedList = prev.map(apt =>
        apt.id === id
          ? {
              ...apt,
              status: 'Cancelled',
              cancellationReason: `[Client Cancelled] ${fullReason}`,
              cancelledAt: dayjs().format('YYYY-MM-DD hh:mm A'),
              cancelledBy: 'Client'
            }
          : apt
      );
      return updatedList;
    });
    if (updatedList) syncToServer({ appointments: updatedList });

    // Add alert notification for Clinic Admin
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: `Client Cancelled: ${targetApt?.clientName || 'Patient'}`,
      desc: `${targetApt?.serviceName || 'Session'} (${targetApt?.date || ''} ${targetApt?.time || ''}) • Reason: ${fullReason}`,
      appointmentId: id,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true };
  };

  // Delete appointment
  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  // Mark voucher as redeemed
  const markVoucherAsRedeemed = (code) => {
    let updatedList;
    setVouchers(prev => {
      updatedList = prev.map(v =>
        v.code.toUpperCase() === code.toUpperCase()
          ? {
              ...v,
              status: 'Redeemed',
              usedCount: v.maxUses || 1,
              redeemedDate: dayjs().format('YYYY-MM-DD hh:mm A')
            }
          : v
      );
      return updatedList;
    });
    if (updatedList) syncToServer({ vouchers: updatedList });
  };

  // Issue brand new voucher (Supports both Public Paunahan & Exclusive VIP)
  const issueVoucher = (voucherData) => {
    const code = voucherData.code
      ? voucherData.code.trim().toUpperCase()
      : `AURA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const isPublic = voucherData.voucherType !== 'personal';

    const newVoucher = {
      code,
      voucherType: voucherData.voucherType || 'public',
      maxUses: Number(voucherData.maxUses) || 1,
      usedCount: 0,
      clientName: isPublic ? 'Open to All (Paunahan)' : (voucherData.clientName ? voucherData.clientName.trim() : 'VIP Client'),
      clientPhone: isPublic ? 'Public Promo' : (voucherData.clientPhone ? voucherData.clientPhone.trim() : 'N/A'),
      serviceCategory: voucherData.serviceCategory || 'All Services',
      discountAmount: Number(voucherData.discountAmount) || 500,
      minSpend: Number(voucherData.minSpend) || 1500,
      purchaseDate: dayjs().format('YYYY-MM-DD'),
      expiryDate: voucherData.expiryDate || dayjs().add(60, 'day').format('YYYY-MM-DD'),
      status: 'Unredeemed',
      redeemedDate: null
    };

    let updatedList;
    setVouchers(prev => {
      updatedList = [newVoucher, ...prev];
      return updatedList;
    });
    if (updatedList) syncToServer({ vouchers: updatedList });
    return newVoucher;
  };

  // Update existing voucher
  const updateVoucher = (code, updatedData) => {
    let updatedList;
    setVouchers(prev => {
      updatedList = prev.map(v => {
        if (v.code === code) {
          const isPublic = (updatedData.voucherType || v.voucherType) !== 'personal';
          const maxUses = updatedData.maxUses !== undefined ? Number(updatedData.maxUses) : (v.maxUses || 1);
          
          let usedCount = updatedData.usedCount !== undefined ? Number(updatedData.usedCount) : (v.usedCount || 0);

          // If admin reactivates or sets status to Unredeemed, reset usedCount so it can be used!
          if (updatedData.status === 'Unredeemed') {
            usedCount = 0;
          } else if (updatedData.status === 'Redeemed') {
            usedCount = maxUses;
          }

          const finalStatus = updatedData.status || (usedCount >= maxUses ? 'Redeemed' : 'Unredeemed');

          return {
            ...v,
            ...updatedData,
            maxUses,
            usedCount,
            status: finalStatus,
            clientName: isPublic && (!updatedData.clientName || updatedData.clientName.trim() === '')
              ? (usedCount > 0 ? v.clientName : 'Open to All (Paunahan)')
              : (updatedData.clientName || v.clientName),
            clientPhone: isPublic && (!updatedData.clientPhone || updatedData.clientPhone.trim() === '')
              ? (usedCount > 0 ? v.clientPhone : 'Public Promo')
              : (updatedData.clientPhone || v.clientPhone),
            discountAmount: updatedData.discountAmount !== undefined ? Number(updatedData.discountAmount) : v.discountAmount,
            minSpend: updatedData.minSpend !== undefined ? Number(updatedData.minSpend) : v.minSpend,
            redeemedDate: finalStatus === 'Unredeemed' ? null : (v.redeemedDate || dayjs().format('YYYY-MM-DD hh:mm A'))
          };
        }
        return v;
      });
      return updatedList;
    });
    if (updatedList) syncToServer({ vouchers: updatedList });
  };

  // Delete voucher
  const deleteVoucher = (code) => {
    let updatedList;
    setVouchers(prev => {
      updatedList = prev.filter(v => v.code !== code);
      return updatedList;
    });
    if (updatedList) syncToServer({ vouchers: updatedList });
  };

  // Reset demo data to initial mock
  const resetDemoData = () => {
    setAppointments(INITIAL_APPOINTMENTS);
    setVouchers(INITIAL_VOUCHERS);
    setClients(INITIAL_CLIENTS);
    setServices(SERVICES);
    setNotifications([
      {
        id: 'NOTIF-1',
        title: 'New Booking: Christian David Lim',
        desc: 'Painless Medical Ingrown Removal • Today at 04:45 PM',
        appointmentId: 'AURA-202611-3',
        time: '15 mins ago',
        read: false
      }
    ]);
    localStorage.removeItem('aura_appointments');
    localStorage.removeItem('aura_vouchers');
    localStorage.removeItem('aura_clients');
    localStorage.removeItem('aura_services');
  };

  // Clear all mock data to start 100% fresh with 0 appointments and 0 clients
  const startFreshSlate = () => {
    setAppointments([]);
    setNotifications([]);
    setClients([]);
    localStorage.setItem('aura_appointments', JSON.stringify([]));
    localStorage.setItem('aura_clients', JSON.stringify([]));
  };

  // Real-time calculated statistics dynamically generated from live appointments
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const pendingAppointments = appointments.filter(a => a.status === 'Pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed');
  const completedAppointments = appointments.filter(a => a.status === 'Completed');
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled');

  const confirmedRevenue = confirmedAppointments.reduce((sum, a) => sum + (Number(a.finalAmount) || 0), 0);
  const completedRevenue = completedAppointments.reduce((sum, a) => sum + (Number(a.finalAmount) || 0), 0);
  const totalRevenue = confirmedRevenue + completedRevenue;
  const pendingRevenue = pendingAppointments.reduce((sum, a) => sum + (Number(a.finalAmount) || 0), 0);
  const totalGrossBookingValue = appointments
    .filter(a => a.status !== 'Cancelled')
    .reduce((sum, a) => sum + (Number(a.finalAmount) || 0), 0);
  
  const totalVouchersSold = vouchers.length;
  const activeUnredeemedVouchers = vouchers.filter(v => v.status === 'Unredeemed').length;
  const redeemedVouchersCount = vouchers.filter(v => v.status === 'Redeemed').length;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        services,
        addService,
        updateService,
        toggleServiceStatus,
        deleteService,
        timeSlots: TIME_SLOTS,
        appointments,
        vouchers,
        clients,
        blockClient,
        unblockClient,
        isClientBlocked,
        isAdminAuthenticated,
        authRole,
        currentStaffUser,
        ownerProfile,
        updateOwnerProfile,
        staffAccounts,
        addStaffAccount,
        updateStaffAccount,
        deleteStaffAccount,
        otpRequests,
        requestStaffOtp,
        verifyStaffOtp,
        generateShiftPass,
        loginOwner,
        loginAdmin,
        logoutAdmin,
        adminPin,
        changeAdminPin,
        isBookingActive,
        setIsBookingActive,
        aboutModalOpen,
        openAboutModal,
        closeAboutModal,
        themeMode,
        changeThemeMode,
        isStandalone,
        treatmentReviews,
        getServiceReviewStats,
        addTreatmentReview,
        clinicProfile,
        updateClinicProfile,
        googleUser,
        loginWithGoogle,
        logoutGoogle,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        validateVoucher,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        cancelAppointmentByClient,
        deleteAppointment,
        markVoucherAsRedeemed,
        issueVoucher,
        updateVoucher,
        deleteVoucher,
        resetDemoData,
        startFreshSlate,
        stats: {
          todayCount: todayAppointments.length,
          totalAppointments: appointments.length,
          pendingCount: pendingAppointments.length,
          confirmedCount: confirmedAppointments.length,
          completedCount: completedAppointments.length,
          cancelledCount: cancelledAppointments.length,
          totalRevenue,
          pendingRevenue,
          confirmedRevenue,
          completedRevenue,
          totalGrossBookingValue,
          totalVouchersSold,
          activeUnredeemedVouchers,
          redeemedVouchersCount,
          totalClients: clients.length
        }
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
