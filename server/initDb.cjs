const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.resolve(projectRoot, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = path.resolve(dataDir, 'aura-database.json');

// Default initial state
const defaultDb = {
  lastUpdated: Date.now(),
  appointments: [],
  services: [],
  vouchers: [],
  clients: [],
  treatmentReviews: {},
  clinicProfile: {
    clinicName: 'Aura Aesthetic - Cagayan',
    directorName: 'Dr. Aura Diaz Cano, MD, FPDS',
    tagline: 'Medical Concierge & Semi-Permanent Make-Up (SPMU)',
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
  }
};

fs.writeFileSync(dbFile, JSON.stringify(defaultDb, null, 2), 'utf8');
console.log('Initialized database at:', dbFile);
