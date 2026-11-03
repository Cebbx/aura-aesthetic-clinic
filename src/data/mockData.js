// Mock Data for Aura Diaz Cano Aesthetic Center Booking & Voucher System

export const CLINIC_INFO = {
  name: 'Aura Diaz Cano Aesthetic Center',
  tagline: 'HairCare Specialist & Advanced Medical Aesthetics',
  founder: 'Aura Diaz Cano',
  founderTitle: 'Founder, Owner & HairCare Specialist',
  founderImage: '/aura-diaz-cano.png',
  phone: '0917-882-AURA / (02) 8812-2872',
  address: '3F Promenade Wing, Bonifacio High Street, Taguig City, Metro Manila'
};

export const SERVICES = [
  // --- Specialized HairCare & Scalp Care (Founder Aura Diaz Cano's Signature Line) ---
  {
    id: 'srv-hair-1',
    name: 'Advanced Scalp Micro-Analysis & Deep Follicle Detox',
    category: 'Hair Care & Scalp',
    price: 1699,
    originalPrice: 2400,
    duration: '50 mins',
    description: 'High-definition trichoscopy scalp scanning by Specialist Aura Diaz Cano, ultrasonic sebum purge, scalp oxygen scaling, and peptide stimulation.',
    tags: ['Founder Signature', 'HairCare Specialist Choice'],
    promoBadge: 'Save ₱701',
    popular: true,
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80',
    includes: [
      'HD Trichoscope 200x Scalp Scan',
      'Exfoliating Herbal Scalp Scrub',
      'High-Frequency Follicle Wand',
      'Nano-Oxygen Peptides Infusion'
    ]
  },
  {
    id: 'srv-hair-2',
    name: 'Laser Hair Regrowth & Anti-Hairfall Cellular Therapy',
    category: 'Hair Care & Scalp',
    price: 2499,
    originalPrice: 3500,
    duration: '60 mins',
    description: 'Low-Level Laser Light Therapy (LLLT) paired with concentrated copper-peptide biotin serum to awaken dormant roots and curb hair thinning.',
    tags: ['Top Treatment', 'Visible Hair Density'],
    promoBadge: 'Promo: ₱1,001 OFF',
    popular: true,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    includes: [
      'Hair Density Mapping',
      'Bio-Stimulation Red Laser 650nm',
      'Biotin & Keratin Nourishing Ampoule',
      'Relaxing Acupressure Scalp Massage'
    ]
  },
  {
    id: 'srv-hair-3',
    name: 'Dandruff Clarifying & Oily Scalp Rebalance Treatment',
    category: 'Hair Care & Scalp',
    price: 1399,
    originalPrice: 1900,
    duration: '45 mins',
    description: 'Salicylic acid and tea tree clarifying formula clearing persistent flakes, itchiness, and excess scalp oil buildup.',
    tags: ['Instant Scalp Relief', 'Voucher Eligible'],
    promoBadge: 'Save ₱501',
    popular: false,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    includes: [
      'Micro-Camera Before & After Scan',
      'Purifying Salicylic Gel Mask',
      'Ozone Scalp Steamer',
      'Cooling Menthol Tonic'
    ]
  },

  // --- Facial Treatments ---
  {
    id: 'srv-1',
    name: 'Signature Glass Skin Korean Facial',
    category: 'Facial',
    price: 1899,
    originalPrice: 2500,
    duration: '60 mins',
    description: 'Deep pore cleansing, ultrasonic extraction, oxygen infusion, and stem-cell ampoule mask for luminous, poreless skin.',
    tags: ['Top Treatment', 'Promo: ₱600 OFF'],
    promoBadge: 'Save ₱601',
    popular: true,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    includes: ['Double Cleansing', 'Diamond Peel Exfoliation', 'Oxygen Dome Infusion', 'Cryo Calming Therapy']
  },
  {
    id: 'srv-2',
    name: 'HydraGlow Deep Aqua Cleansing',
    category: 'Facial',
    price: 1499,
    originalPrice: 1999,
    duration: '45 mins',
    description: 'Gentle vacuum suction extracting blackheads, sebum, and dirt while infusing hyaluronic acid serums.',
    tags: ['Mild & Soothing', 'Voucher Eligible'],
    promoBadge: '25% OFF',
    popular: false,
    image: 'https://images.unsplash.com/photo-1512290900672-1f55b9659f61?auto=format&fit=crop&w=600&q=80',
    includes: ['Hydro-dermabrasion', 'BHA Sebum Softening', 'Peptide Serum', 'LED Light Phototherapy']
  },

  // --- Slimming & Contouring ---
  {
    id: 'srv-3',
    name: 'RF 360° Body Contouring & Sculpting',
    category: 'Slimming',
    price: 2499,
    originalPrice: 3500,
    duration: '50 mins',
    description: 'Non-invasive tri-polar radio frequency that melts stubborn subcutaneous fat cells and firms loose skin.',
    tags: ['Top Rated Slimming', 'Free Consultation'],
    promoBadge: 'Save ₱1,001',
    popular: true,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    includes: ['Targeted RF Warming', 'Vacuum Drainage', 'Firming Botanical Serum', 'Body Inch Measurement']
  },
  {
    id: 'srv-4',
    name: 'Lipo-Cavitation Targeted Fat Melt',
    category: 'Slimming',
    price: 1999,
    originalPrice: 2800,
    duration: '45 mins',
    description: 'Ultrasonic sound waves liquify localized fat deposits in abdomen, flanks, or thighs with zero downtime.',
    tags: ['Immediate Results', 'Promo Pack Available'],
    promoBadge: 'Save ₱801',
    popular: false,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    includes: ['Lymphatic Stimulation', '40kHz Cavitation', 'Cooling Gel Wrap']
  },

  // --- Ingrown Removal & Precision Care ---
  {
    id: 'srv-5',
    name: 'Painless Medical Ingrown Removal & Nail Detox',
    category: 'Ingrown Removal',
    price: 999,
    originalPrice: 1500,
    duration: '35 mins',
    description: 'Specialized podiatry aesthetic treatment for chronic or painful ingrown nails with antimicrobial sterilization.',
    tags: ['Instant Relief', 'Sterile Medical Grade'],
    promoBadge: 'Special ₱999',
    popular: true,
    image: '/clinic-photos/nail-care-manicure.png',
    includes: ['Antiseptic Soak', 'Micro-blade Precision Lifting', 'Anti-fungal Ozone Jet', 'Antibiotic Dressing']
  },
  {
    id: 'srv-nail-1',
    name: 'Precision Gel Manicure & Hand Restoration Spa',
    category: 'Ingrown Removal',
    price: 899,
    originalPrice: 1200,
    duration: '45 mins',
    description: 'Expert cuticle cleaning, nail shaping, hand exfoliation, and premium long-lasting gel polish at our luxury treatment station.',
    tags: ['Top Treatment', 'Sterile Kit Guaranteed'],
    promoBadge: 'Special ₱899',
    popular: true,
    image: '/clinic-photos/specialist-nail-treatment.png',
    includes: ['Aromatic Hand Soak', 'Precision Cuticle Shaping', 'Deep Hand Hydration Massage', 'Medical-Grade LED Gel Curing']
  },
  {
    id: 'srv-nail-2',
    name: 'Luxury Velvet Foot Spa & Pedicure Lounge Therapy',
    category: 'Ingrown Removal',
    price: 1199,
    originalPrice: 1600,
    duration: '60 mins',
    description: 'Ultra-relaxing foot care treatment in our plush pink velvet lounge chairs. Includes callous smoothing, therapeutic sea salt scrub, and nail care.',
    tags: ['Relaxation Lounge', 'Deep Cleansing'],
    promoBadge: 'Save ₱401',
    popular: true,
    image: '/clinic-photos/foot-spa-lounge.png',
    includes: ['Warm Sea Salt Whirlpool Soak', 'Callous & Heel Smoothing', 'Peppermint Foot Scrub', 'Tension-Relief Foot & Calf Massage']
  },
  {
    id: 'srv-6',
    name: 'Bikini Precision Ingrown & Bump Therapy',
    category: 'Ingrown Removal',
    price: 1299,
    originalPrice: 1800,
    duration: '40 mins',
    description: 'Deep extraction of trapped hairs, clarifying salicylic scrub, and high frequency wand to eliminate bumps.',
    tags: ['Gentle & Private', 'Voucher Eligible'],
    promoBadge: 'Save ₱501',
    popular: false,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    includes: ['Steam Softening', 'Follicle Extraction', 'High Frequency Sparking', 'Soothing Chamomile Mask']
  },

  // --- Whitening & Drip ---
  {
    id: 'srv-7',
    name: 'Gluta-Glow Drip Infusion Cocktail',
    category: 'Whitening',
    price: 2199,
    originalPrice: 3000,
    duration: '45 mins',
    description: 'High-dose Japanese Glutathione, Vitamin C, Collagen, and Alpha Lipoic Acid for whole-body radiance and immunity.',
    tags: ['Nurse Administered', 'Celebrity Favorite'],
    promoBadge: 'Save ₱801',
    popular: true,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    includes: ['Free Assessment', 'Sterile IV Set', 'Pure L-Glutathione 5000mg', 'Electrolyte Hydration']
  },
  {
    id: 'srv-8',
    name: 'Diode Laser Underarm Whitening & Smoothening',
    category: 'Whitening',
    price: 1399,
    originalPrice: 2200,
    duration: '30 mins',
    description: 'Pico-toning laser breaks down dark hyperpigmentation and chicken skin textures while inhibiting hair regrowth.',
    tags: ['Safe for Sensitive Skin', 'Promo Voucher'],
    promoBadge: 'Save ₱801',
    popular: false,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    includes: ['Exfoliating Cleanse', 'Carbon Laser Peel', 'Skin Brightening Toner', 'SPF Protectant']
  },

  // --- Anti-Aging ---
  {
    id: 'srv-9',
    name: '7D HIFU Non-Surgical V-Shape Lift',
    category: 'Anti-Aging',
    price: 3499,
    originalPrice: 5500,
    duration: '60 mins',
    description: 'High-intensity focused ultrasound triggers deep collagen regeneration to tighten jowls, double chin, and neck.',
    tags: ['Zero Down-time', 'Promo ₱2,000 OFF'],
    promoBadge: 'Save ₱2,001',
    popular: true,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    includes: ['Face Mapping', '300 Focused Shots', 'Collagen Firming Serum', 'Post-lift Sunblock']
  }
];

export const TIME_SLOTS = [
  { time: '09:30 AM', period: 'Morning', available: true },
  { time: '10:30 AM', period: 'Morning', available: true },
  { time: '11:45 AM', period: 'Morning', available: false, reason: 'Fully Booked' },
  { time: '01:15 PM', period: 'Afternoon', available: true },
  { time: '02:30 PM', period: 'Afternoon', available: true },
  { time: '03:45 PM', period: 'Afternoon', available: false, reason: 'Consultation with Specialist Aura' },
  { time: '04:45 PM', period: 'Afternoon', available: true },
  { time: '05:45 PM', period: 'Evening', available: true },
  { time: '06:30 PM', period: 'Evening', available: true }
];

export const INITIAL_VOUCHERS = [
  {
    code: 'AURA-HAIR-888',
    voucherType: 'public',
    maxUses: 5,
    usedCount: 0,
    clientName: 'Open to All (Paunahan)',
    clientPhone: 'Public Promo',
    serviceCategory: 'Hair Care & Scalp',
    discountAmount: 500,
    minSpend: 1500,
    purchaseDate: '2026-10-25',
    expiryDate: '2026-12-31',
    status: 'Unredeemed',
    redeemedDate: null
  },
  {
    code: 'AURA-GLOW-882',
    voucherType: 'public',
    maxUses: 5,
    usedCount: 0,
    clientName: 'Open to All (Paunahan)',
    clientPhone: 'Public Promo',
    serviceCategory: 'Facial',
    discountAmount: 500,
    minSpend: 1500,
    purchaseDate: '2026-10-25',
    expiryDate: '2026-12-31',
    status: 'Unredeemed',
    redeemedDate: null
  },
  {
    code: 'SLIM-LUXE-401',
    voucherType: 'public',
    maxUses: 5,
    usedCount: 0,
    clientName: 'Open to All (Paunahan)',
    clientPhone: 'Public Promo',
    serviceCategory: 'Slimming',
    discountAmount: 600,
    minSpend: 2000,
    purchaseDate: '2026-10-28',
    expiryDate: '2026-12-31',
    status: 'Unredeemed',
    redeemedDate: null
  },
  {
    code: 'WHITE-VIP-109',
    voucherType: 'public',
    maxUses: 5,
    usedCount: 0,
    clientName: 'Open to All (Paunahan)',
    clientPhone: 'Public Promo',
    serviceCategory: 'Whitening',
    discountAmount: 400,
    minSpend: 1300,
    purchaseDate: '2026-10-15',
    expiryDate: '2026-12-31',
    status: 'Unredeemed',
    redeemedDate: null
  },
  {
    code: 'INGROWN-RELIEF-77',
    voucherType: 'public',
    maxUses: 5,
    usedCount: 0,
    clientName: 'Open to All (Paunahan)',
    clientPhone: 'Public Promo',
    serviceCategory: 'Ingrown Removal',
    discountAmount: 300,
    minSpend: 900,
    purchaseDate: '2026-10-20',
    expiryDate: '2026-12-31',
    status: 'Unredeemed',
    redeemedDate: null
  },
  {
    code: 'AURA-WELCOME-200',
    voucherType: 'public',
    maxUses: 5,
    usedCount: 0,
    clientName: 'Open to All (Paunahan)',
    clientPhone: 'Public Promo',
    serviceCategory: 'All Services',
    discountAmount: 200,
    minSpend: 1000,
    purchaseDate: '2026-11-01',
    expiryDate: '2026-12-31',
    status: 'Unredeemed',
    redeemedDate: null
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'AURA-202611-4',
    clientName: 'Atty. Sofia Ramos',
    phone: '0922-441-9876',
    email: 'sofia.ramos.law@gmail.com',
    serviceId: 'srv-3',
    serviceName: 'RF 360° Body Contouring & Sculpting',
    date: '2026-11-03',
    time: '02:30 PM',
    totalPrice: 2499,
    discountApplied: 600,
    finalAmount: 1899,
    status: 'Confirmed',
    voucherUsed: 'SLIM-LUXE-401',
    notes: 'Focus on abdominal and love handles contouring.',
    createdAt: '2026-11-02 11:30'
  },
  {
    id: 'AURA-202611-3',
    clientName: 'Christian David Lim',
    phone: '0918-444-2391',
    email: 'cdlim@yahoo.com',
    serviceId: 'srv-5',
    serviceName: 'Painless Medical Ingrown Removal & Nail Detox',
    date: '2026-11-02',
    time: '04:45 PM',
    totalPrice: 999,
    discountApplied: 0,
    finalAmount: 999,
    status: 'Pending',
    voucherUsed: null,
    notes: 'Both big toes have slight inflammation. First timer.',
    createdAt: '2026-11-02 09:12'
  },
  {
    id: 'AURA-202611-2',
    clientName: 'Jasmine Rose Rivera',
    phone: '0927-891-3456',
    email: 'jasmine.rivera@outlook.com',
    serviceId: 'srv-7',
    serviceName: 'Gluta-Glow Drip Infusion Cocktail',
    date: '2026-11-02',
    time: '01:15 PM',
    totalPrice: 2199,
    discountApplied: 200,
    finalAmount: 1999,
    status: 'Completed',
    voucherUsed: 'AURA-WELCOME-200',
    notes: 'Requested nurse: Nurse Leah. 3rd session.',
    createdAt: '2026-11-01 18:05'
  },
  {
    id: 'AURA-202611-1',
    clientName: 'Kristine Bernadette Tan',
    phone: '0917-882-9912',
    email: 'kristine.tan@gmail.com',
    serviceId: 'srv-hair-1',
    serviceName: 'Advanced Scalp Micro-Analysis & Deep Follicle Detox',
    date: '2026-11-02',
    time: '10:30 AM',
    totalPrice: 1699,
    discountApplied: 0,
    finalAmount: 1699,
    status: 'Confirmed',
    voucherUsed: null,
    notes: 'Scalp scan with Specialist Aura Diaz Cano. Concern: hair fall & dryness',
    createdAt: '2026-11-01 14:20'
  }
];

export const INITIAL_CLIENTS = [
  {
    id: 'CL-001',
    name: 'Kristine Bernadette Tan',
    phone: '0917-882-9912',
    email: 'kristine.tan@gmail.com',
    tier: 'VIP',
    status: 'active',
    totalVisits: 5,
    totalSpent: 10890,
    skinType: 'Dry Scalp / Oily T-Zone',
    lastVisit: '2026-11-02',
    notes: 'Undergoing customized hair restoration program with Specialist Aura.'
  },
  {
    id: 'CL-002',
    name: 'Jasmine Rose Rivera',
    phone: '0927-891-3456',
    email: 'jasmine.rivera@outlook.com',
    tier: 'Regular',
    status: 'active',
    totalVisits: 3,
    totalSpent: 6200,
    skinType: 'Dry / Dehydrated',
    lastVisit: '2026-11-02',
    notes: 'Enjoys warm herbal tea post-infusion.'
  },
  {
    id: 'CL-003',
    name: 'Christian David Lim',
    phone: '0918-444-2391',
    email: 'cdlim@yahoo.com',
    tier: 'New Client',
    status: 'active',
    totalVisits: 1,
    totalSpent: 999,
    skinType: 'Normal',
    lastVisit: '2026-11-02',
    notes: 'Ingrown care on right toe.'
  },
  {
    id: 'CL-004',
    name: 'Atty. Sofia Ramos',
    phone: '0922-441-9876',
    email: 'sofia.ramos.law@gmail.com',
    tier: 'VIP Gold',
    status: 'active',
    totalVisits: 9,
    totalSpent: 28500,
    skinType: 'Normal / Mature',
    lastVisit: '2026-10-22',
    notes: 'Subscribed to 10-session RF Body contouring package.'
  },
  {
    id: 'CL-005',
    name: 'Mark Lester Mendoza',
    phone: '0935-112-9988',
    email: 'mark.mendoza.test@gmail.com',
    tier: 'Suspended',
    status: 'blocked',
    blockedReason: 'Multiple fake booking requests and repeated no-shows without cancellation.',
    blockedAt: '2026-11-01 10:15',
    totalVisits: 0,
    totalSpent: 0,
    skinType: 'Unspecified',
    lastVisit: 'N/A',
    notes: 'Account suspended due to unconfirmed bogus bookings.'
  }
];

export const INITIAL_REVIEWS = {
  'srv-nail-1': [
    {
      id: 'rev-n1-1',
      clientName: 'Alyssa D.',
      rating: 5,
      date: '2026-10-30',
      comment: 'Super ganda ng gel manicure! Almost 3 weeks na pero makintab at buo pa rin ang polish. Babalik ako for sure!',
      verified: true
    },
    {
      id: 'rev-n1-2',
      clientName: 'Bea Gonzales',
      rating: 5,
      date: '2026-10-24',
      comment: 'Very relaxing ambiance sa clinic, napaka-gentle sa cuticle and hands.',
      verified: true
    },
    {
      id: 'rev-n1-3',
      clientName: 'Karen Mae T.',
      rating: 5,
      date: '2026-10-18',
      comment: 'Magaan ang kamay ni ate specialist and sterile talaga ang tools. 10 out of 10 experience!',
      verified: true
    }
  ],
  'srv-nail-2': [
    {
      id: 'rev-n2-1',
      clientName: 'Kaye Morales',
      rating: 5,
      date: '2026-10-26',
      comment: 'Lounge chairs are so comfortable, parang royalty treatment sa pink velvet chair! Tanggal lahat ng pagod sa paa.',
      verified: true
    },
    {
      id: 'rev-n2-2',
      clientName: 'Rowena S.',
      rating: 5,
      date: '2026-10-19',
      comment: 'Sobrang linis ng clinic and napakabait ng staff. Highly recommended ang foot spa lounge!',
      verified: true
    }
  ],
  'srv-5': [
    {
      id: 'rev-5-1',
      clientName: 'Maria Santos',
      rating: 5,
      date: '2026-10-28',
      comment: 'Sobrang galing ng specialist! Walang sakit yung ingrown removal at sterile talaga ang mga tools. Maraming salamat!',
      verified: true
    },
    {
      id: 'rev-5-2',
      clientName: 'Camille R.',
      rating: 5,
      date: '2026-10-15',
      comment: 'Super satisfied! Gumaan agad paa ko at napakabait ng staff.',
      verified: true
    }
  ],
  'srv-1': [
    {
      id: 'rev-1-1',
      clientName: 'Dra. Patricia M.',
      rating: 5,
      date: '2026-10-22',
      comment: 'Instant glass skin glow right after the facial! Zero irritation and very thorough extraction.',
      verified: true
    },
    {
      id: 'rev-1-2',
      clientName: 'Stephanie L.',
      rating: 5,
      date: '2026-10-14',
      comment: 'My go-to facial in the city. Very professional doctor and nurses.',
      verified: true
    }
  ],
  'srv-hair-2': [
    {
      id: 'rev-h2-1',
      clientName: 'Kristine Tan',
      rating: 5,
      date: '2026-10-29',
      comment: 'Noticed significant decrease in hair fall after session 3. The scalp red laser feels so soothing.',
      verified: true
    }
  ]
};
