import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

/**
 * CCX Systems Architecture - Production-Grade Server Entry Point
 * Standards: OWASP Security Baseline, Deterministic Routing, Graceful Degradation.
 */

// Lazy SendGrid Initialization
let isSgInitialized = false;
function initSendGrid() {
  if (!isSgInitialized) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      isSgInitialized = true;
    }
  }
  return isSgInitialized;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security: Body Parsing with strict limits
  app.use(express.json({ limit: '10kb' }));

  // Catch invalid JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ status: "error", message: "Invalid JSON payload" });
    }
    next(err);
  });

  // Debug: Request Logger for Audit Logic
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
  });

  // API: Technical Inquiry Handshake
  const inquiryHandler = async (req: express.Request, res: express.Response) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        status: "error", 
        message: "Method not allowed. Handshake requires POST protocol." 
      });
    }

    const { name, email, org, focus, message } = req.body || {};

    if (!name || !email || !focus || !message) {
      return res.status(400).json({ 
        status: "error", 
        message: "Incomplete handshake payload. Audit integrity requires all fields." 
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: "error", message: "Invalid identity format." });
    }

    console.log(`[SYSTEM] Handshake Received: ${email} | ${org || 'N/A'}`);

    try {
      if (initSendGrid()) {
        const msg = {
          to: process.env.INQUIRY_RECIPIENT_EMAIL || 'alison@ccxny.org',
          from: 'system@ccxny.org',
          subject: `CCX Technical Handshake: ${org || 'Independent Inquiry'}`,
          text: `Name: ${name}\nEmail: ${email}\nOrganization: ${org || 'N/A'}\nFocus: ${focus}\n\nMessage:\n${message}`,
          html: `<h3>Technical Handshake Received</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Organization:</strong> ${org || 'N/A'}</p><p><strong>Focus Pattern:</strong> ${focus}</p><p><strong>Message:</strong></p><p>${String(message).replace(/\n/g, '<br>')}</p>`,
        };
        await sgMail.send(msg);
      }
    } catch (error) {
      console.error('[SYSTEM] Dispatch Failure:', error);
    }

    res.status(200).json({ 
      status: "success", 
      message: "Handshake initiated successfully.",
      timestamp: new Date().toISOString()
    });
  };

  app.all("/api/inquiry", inquiryHandler);
  app.all("/api/inquiry/", inquiryHandler);
  app.use("/api/inquiry", (req, res, next) => {
    if (req.url === '/' || req.url === '') {
      if (req.method !== 'POST') {
        return res.status(405).json({ status: "error", message: "Method not allowed. Use POST." });
      }
    }
    next();
  });

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", version: "4.0.0", uptime: process.uptime() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYSTEM] CCX Systems Architect: Server operational at http://localhost:${PORT}`);
  });
}

// Global Exception Handling (Defensive Programming)
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
