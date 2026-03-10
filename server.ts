import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import webpush from "web-push";

const db = new Database("fishing_club.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fishing-key";

// VAPID Keys
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || "BA5XEpO0sJnieomv1bfP0k0beylEfOVbRN3eo-1xC4KnLJ5hJOcNZh4YPPubY0AFg71CN3vR4dxCQix65AxtEao";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "tPapJWjQsr7zvoNevXSk0pVWJv3gXdsGfo1D6h-nRtU";

webpush.setVapidDetails(
  "mailto:admin@fishing-club.de",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    first_name TEXT,
    last_name TEXT
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_by INTEGER,
    FOREIGN KEY(used_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS catches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    species TEXT NOT NULL,
    weight REAL,
    length REAL,
    date TEXT NOT NULL,
    angler TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sent_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM app_settings").get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)").run("water_regulations", "Hier stehen die Gewässerordnungen des Vereins.");
  db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)").run("parking_info", "");
}

// Migration logic for existing databases
const usersInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const userColumns = usersInfo.map(c => c.name);
if (!userColumns.includes("first_name")) {
  db.exec("ALTER TABLE users ADD COLUMN first_name TEXT");
}
if (!userColumns.includes("last_name")) {
  db.exec("ALTER TABLE users ADD COLUMN last_name TEXT");
}
if (!userColumns.includes("license_front_url")) {
  db.exec("ALTER TABLE users ADD COLUMN license_front_url TEXT");
}
if (!userColumns.includes("license_back_url")) {
  db.exec("ALTER TABLE users ADD COLUMN license_back_url TEXT");
}

const catchesInfo = db.prepare("PRAGMA table_info(catches)").all() as any[];
const catchesColumns = catchesInfo.map(c => c.name);
if (!catchesColumns.includes("user_id")) {
  db.exec("ALTER TABLE catches ADD COLUMN user_id INTEGER");
}

// Seed data if empty
const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
if (eventCount.count === 0) {
  const insertEvent = db.prepare("INSERT INTO events (title, date, location, description) VALUES (?, ?, ?, ?)");
  insertEvent.run("Anfischen 2026", "2026-04-15", "Vereinssee Nord", "Saisonauftakt mit anschließendem Grillen.");
  insertEvent.run("Hegeabfischen", "2026-05-20", "Flussabschnitt B", "Bestandskontrolle und gemeinsames Fischen.");
  insertEvent.run("Jugendzeltlager", "2026-07-10", "Zeltplatz am See", "Drei Tage Fischen und Natur für unsere Jugend.");
}

// Initial Admin User (if no users exist)
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashedPassword, "admin");
  console.log("Default admin user created: admin / admin123");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use("/uploads", express.static("uploads"));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      license_front_url: user.license_front_url,
      license_back_url: user.license_back_url
    }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ 
      id: user.id, 
      username: user.username, 
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      license_front_url: user.license_front_url,
      license_back_url: user.license_back_url
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json(null);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json(decoded);
    } catch (err) {
      res.json(null);
    }
  });

  app.put("/api/user/profile", authenticate, upload.fields([
    { name: 'license_front', maxCount: 1 },
    { name: 'license_back', maxCount: 1 }
  ]), (req: any, res: any) => {
    const { username, first_name, last_name } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;
      
      let license_front_url = user.license_front_url;
      let license_back_url = user.license_back_url;

      if (req.files) {
        if (req.files.license_front) {
          if (user.license_front_url) {
            const oldPath = path.join(process.cwd(), user.license_front_url.replace(/^\//, ''));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          license_front_url = `/uploads/${req.files.license_front[0].filename}`;
        }
        if (req.files.license_back) {
          if (user.license_back_url) {
            const oldPath = path.join(process.cwd(), user.license_back_url.replace(/^\//, ''));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          license_back_url = `/uploads/${req.files.license_back[0].filename}`;
        }
      }

      db.prepare("UPDATE users SET username = ?, first_name = ?, last_name = ?, license_front_url = ?, license_back_url = ? WHERE id = ?")
        .run(username, first_name, last_name, license_front_url, license_back_url, req.user.id);
      
      // Update token with new data
      const token = jwt.sign({ 
        id: req.user.id, 
        username, 
        role: req.user.role,
        first_name,
        last_name,
        license_front_url,
        license_back_url
      }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ 
        id: req.user.id, 
        username, 
        role: req.user.role,
        first_name,
        last_name,
        license_front_url,
        license_back_url
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Username already exists or update failed" });
    }
  });

  app.put("/api/user/password", authenticate, (req: any, res: any) => {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: "Current password incorrect" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, req.user.id);
    res.json({ success: true });
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password, inviteCode, first_name, last_name } = req.body;
    
    // Check invite code
    const invitation = db.prepare("SELECT * FROM invitations WHERE code = ? AND used_by IS NULL").get(inviteCode) as any;
    if (!invitation) return res.status(400).json({ error: "Invalid or used invite code" });

    if (!first_name || !last_name) {
      return res.status(400).json({ error: "Vor- und Nachname sind erforderlich" });
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const info = db.prepare("INSERT INTO users (username, password, first_name, last_name) VALUES (?, ?, ?, ?)")
        .run(username, hashedPassword, first_name, last_name);
      db.prepare("UPDATE invitations SET used_by = ? WHERE id = ?").run(info.lastInsertRowid, invitation.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  // Admin Routes
  app.get("/api/admin/invites", authenticate, isAdmin, (req, res) => {
    const invites = db.prepare(`
      SELECT i.*, u.username as used_by_name 
      FROM invitations i 
      LEFT JOIN users u ON i.used_by = u.id
    `).all();
    res.json(invites);
  });

  app.post("/api/admin/invites", authenticate, isAdmin, (req, res) => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    db.prepare("INSERT INTO invitations (code) VALUES (?)").run(code);
    res.json({ code });
  });

  app.get("/api/admin/users", authenticate, isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, username, role, first_name, last_name FROM users").all();
    res.json(users);
  });

  app.delete("/api/admin/users/:id", authenticate, isAdmin, (req: any, res: any) => {
    const userId = req.params.id;
    if (userId == req.user.id) {
      return res.status(400).json({ error: "Du kannst dich nicht selbst löschen" });
    }

    // Optional: Delete associated catches and invitations if needed
    // For now, just delete the user. 
    // Note: In a real app, you might want to handle foreign key constraints or nullify them.
    // The current schema has FOREIGN KEY(user_id) REFERENCES users(id) in catches.
    // We should probably delete their catches too or nullify them.
    
    db.transaction(() => {
      db.prepare("DELETE FROM catches WHERE user_id = ?").run(userId);
      db.prepare("UPDATE invitations SET used_by = NULL WHERE used_by = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    })();

    res.json({ success: true });
  });

  app.post("/api/admin/events", authenticate, isAdmin, (req, res) => {
    const { title, date, location, description } = req.body;
    const info = db.prepare(
      "INSERT INTO events (title, date, location, description) VALUES (?, ?, ?, ?)"
    ).run(title, date, location, description);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/admin/events/:id", authenticate, isAdmin, (req, res) => {
    const { title, date, location, description } = req.body;
    db.prepare(
      "UPDATE events SET title = ?, date = ?, location = ?, description = ? WHERE id = ?"
    ).run(title, date, location, description, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/events/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // App Routes
  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(events);
  });

  app.get("/api/catches", authenticate, (req: any, res: any) => {
    let catches;
    if (req.user.role === 'admin') {
      catches = db.prepare("SELECT * FROM catches ORDER BY date DESC").all();
    } else {
      catches = db.prepare("SELECT * FROM catches WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
    }
    res.json(catches);
  });

  app.post("/api/catches", authenticate, upload.single("image"), (req: any, res: any) => {
    const { species, weight, length, date, angler, location } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const info = db.prepare(
      "INSERT INTO catches (species, weight, length, date, angler, location, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(species, weight, length, date, angler, location, image_url, req.user.id);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/catches/:id", authenticate, (req: any, res: any) => {
    const catchItem = db.prepare("SELECT * FROM catches WHERE id = ?").get(req.params.id) as any;
    if (!catchItem) return res.status(404).json({ error: "Catch not found" });

    // Allow any authenticated user to delete catches as requested
    if (req.user.role !== 'admin' && catchItem.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete image if exists
    if (catchItem.image_url) {
      const imagePath = path.join(process.cwd(), catchItem.image_url.replace(/^\//, ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    db.prepare("DELETE FROM catches WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Push Notification Routes
  app.post("/api/notifications/subscribe", authenticate, (req: any, res: any) => {
    const subscription = JSON.stringify(req.body);
    const userId = req.user.id;

    // Check if subscription already exists for this user
    const existing = db.prepare("SELECT id FROM push_subscriptions WHERE user_id = ? AND subscription = ?")
      .get(userId, subscription);

    if (!existing) {
      db.prepare("INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?)")
        .run(userId, subscription);
    }

    res.json({ success: true });
  });

  // Settings & Feedback Routes
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM app_settings").all() as any[];
    const result: any = {};
    settings.forEach(s => result[s.key] = s.value);
    res.json(result);
  });

  app.put("/api/settings", authenticate, isAdmin, upload.single("parking_image"), (req: any, res: any) => {
    const { water_regulations } = req.body;
    
    if (water_regulations !== undefined) {
      db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)").run("water_regulations", water_regulations);
    }
    
    if (req.file) {
      const oldSetting = db.prepare("SELECT value FROM app_settings WHERE key = ?").get("parking_info") as { value: string } | undefined;
      if (oldSetting && oldSetting.value && oldSetting.value.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), oldSetting.value.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      const image_url = `/uploads/${req.file.filename}`;
      db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)").run("parking_info", image_url);
    }
    
    res.json({ success: true });
  });

  app.post("/api/feedback", authenticate, (req: any, res: any) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    
    db.prepare("INSERT INTO feedback (user_id, content) VALUES (?, ?)").run(req.user.id, content);
    res.json({ success: true });
  });

  app.get("/api/admin/feedback", authenticate, isAdmin, (req, res) => {
    const feedback = db.prepare(`
      SELECT f.*, u.username, u.first_name, u.last_name 
      FROM feedback f 
      JOIN users u ON f.user_id = u.id 
      ORDER BY f.created_at DESC
    `).all();
    res.json(feedback);
  });

  // Background task to check for upcoming events
  const checkUpcomingEvents = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const upcomingEvents = db.prepare("SELECT * FROM events WHERE date = ?").all(tomorrowStr) as any[];

      for (const event of upcomingEvents) {
        const subscriptions = db.prepare("SELECT * FROM push_subscriptions").all() as any[];
        
        for (const sub of subscriptions) {
          // Check if already sent
          const alreadySent = db.prepare("SELECT id FROM sent_notifications WHERE event_id = ? AND user_id = ?")
            .get(event.id, sub.user_id);

          if (!alreadySent) {
            try {
              const pushSubscription = JSON.parse(sub.subscription);
              await webpush.sendNotification(pushSubscription, JSON.stringify({
                title: 'Terminerinnerung 🎣',
                body: `Morgen steht an: ${event.title} bei ${event.location || 'unbekannt'}.`,
                url: '/events'
              }));
              
              db.prepare("INSERT INTO sent_notifications (event_id, user_id) VALUES (?, ?)")
                .run(event.id, sub.user_id);
            } catch (err: any) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                // Subscription expired or no longer valid
                db.prepare("DELETE FROM push_subscriptions WHERE id = ?").run(sub.id);
              }
              console.error('Error sending push notification:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in checkUpcomingEvents:', err);
    }
  };

  // Run check every hour
  setInterval(checkUpcomingEvents, 3600000);
  // Also run once on startup after a short delay
  setTimeout(checkUpcomingEvents, 10000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
