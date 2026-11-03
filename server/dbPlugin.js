import fs from 'fs';
import path from 'path';

export function clinicDatabasePlugin() {
  const dbDir = path.resolve(process.cwd(), 'data');
  const dbFile = path.resolve(dbDir, 'aura-database.json');

  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Helper to read DB
  const readDb = () => {
    try {
      if (fs.existsSync(dbFile)) {
        const raw = fs.readFileSync(dbFile, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[Aura DB] Error reading database file:', e.message);
    }
    return null;
  };

  // Helper to write DB
  const writeDb = (data) => {
    try {
      const payload = {
        ...data,
        lastUpdated: Date.now()
      };
      fs.writeFileSync(dbFile, JSON.stringify(payload, null, 2), 'utf8');
      return payload;
    } catch (e) {
      console.error('[Aura DB] Error writing database file:', e.message);
      return null;
    }
  };

  return {
    name: 'aura-clinic-database-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Set CORS headers so any device can call API
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // GET /api/sync
        if (req.method === 'GET' && req.url.startsWith('/api/sync')) {
          const db = readDb();
          res.setHeader('Content-Type', 'application/json');
          if (db) {
            res.end(JSON.stringify({ success: true, data: db }));
          } else {
            res.end(JSON.stringify({ success: false, data: null }));
          }
          return;
        }

        // POST /api/sync (Sync full state or merged payload)
        if (req.method === 'POST' && req.url.startsWith('/api/sync')) {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const incoming = JSON.parse(body || '{}');
              const current = readDb() || {};
              
              // Smart merge to prevent overwriting newer appointments
              const merged = {
                ...current,
                ...incoming,
                // Ensure arrays don't lose items
                appointments: incoming.appointments || current.appointments || [],
                services: incoming.services || current.services || [],
                vouchers: incoming.vouchers || current.vouchers || [],
                clients: incoming.clients || current.clients || [],
                treatmentReviews: incoming.treatmentReviews || current.treatmentReviews || {},
                clinicProfile: incoming.clinicProfile || current.clinicProfile || {}
              };

              const saved = writeDb(merged);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: saved }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // POST /api/book (Fast booking from client phone)
        if (req.method === 'POST' && req.url.startsWith('/api/book')) {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const newApt = JSON.parse(body || '{}');
              const current = readDb() || {};
              const appointments = current.appointments || [];
              
              // Check if already exists
              const existingIdx = appointments.findIndex(a => a.id === newApt.id);
              if (existingIdx >= 0) {
                appointments[existingIdx] = { ...appointments[existingIdx], ...newApt };
              } else {
                appointments.unshift(newApt);
              }

              // If a voucher was used in this booking, mark it as Redeemed in DB immediately
              let vouchers = current.vouchers || [];
              if (newApt.voucherUsed) {
                vouchers = vouchers.map(v =>
                  v.code?.toUpperCase() === newApt.voucherUsed.toUpperCase()
                    ? {
                        ...v,
                        status: 'Redeemed',
                        redeemedDate: new Date().toISOString().split('T')[0],
                        usedInAppointment: newApt.id
                      }
                    : v
                );
              }

              const saved = writeDb({ ...current, appointments, vouchers });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, appointment: newApt, data: saved }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
