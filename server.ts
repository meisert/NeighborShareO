import express, { type Request, type Response } from 'express';
import http from 'http';
import { db } from './src/db/index.ts';
import { items, borrowRequests, chatMessages, isoRequests, users } from './src/db/schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';
import { seedDemoDataIfEmpty } from './src/db/seed.ts';
import { optionalAuth, type AuthRequest } from './src/middleware/auth.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
// Dev server MUST run on port 3000 (nginx proxy runs on 8080)
const port = process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// Background seed for demo items if Cloud SQL is empty
seedDemoDataIfEmpty().catch((err) => console.error('Seed error:', err));

// --- API ROUTES ---

// Health & DB status
app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({ status: 'ok', database: 'cloudsql-postgresql' });
});

// GET /api/items - Fetch community catalog with is_demo filtering
app.get('/api/items', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const includeDemo = req.query.includeDemo === 'true';
    const isDemoFilter = req.query.onlyDemo === 'true';

    let query = db.select().from(items);

    if (isDemoFilter) {
      // Return only demo items
      const results = await query.where(eq(items.isDemo, true)).orderBy(desc(items.createdAt));
      return res.json(results.map(formatItem));
    } else if (!includeDemo) {
      // Real user mode: strictly return REAL user items
      const results = await query.where(eq(items.isDemo, false)).orderBy(desc(items.createdAt));
      return res.json(results.map(formatItem));
    } else {
      // Combined showcase mode
      const results = await query.orderBy(desc(items.createdAt));
      return res.json(results.map(formatItem));
    }
  } catch (error) {
    console.error('Failed to fetch items from Cloud SQL:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// POST /api/items - Add item to garage
app.post('/api/items', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const isDemo = body.isDemo === true;
    const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const lender = body.lender || {};
    const lenderId = lender.id || req.user?.uid || 'user-unknown';

    const newItem = {
      id: itemId,
      title: body.title,
      category: body.category,
      condition: body.condition,
      description: body.description,
      rules: body.rules || '',
      dailyFee: Number(body.dailyFee) || 0,
      refundableDeposit: Number(body.refundableDeposit) || 0,
      depositNote: body.depositNote || null,
      neighborhood: body.neighborhood,
      zipCode: body.zipCode,
      imageUrl: body.imageUrl,
      isAvailable: true,
      isDemo: isDemo, // Real user items are stored as isDemo = false
      lenderId: lenderId,
      lenderName: lender.name || 'Neighbor',
      lenderAvatar: lender.avatar || 'NB',
      lenderTrustScore: Number(lender.trustScore) || 100,
      lenderTotalLends: Number(lender.totalLends) || 0,
      lenderResponseTime: lender.responseTime || 'within 15 mins',
    };

    await db.insert(items).values(newItem);
    res.status(201).json(formatItem(newItem));
  } catch (error) {
    console.error('Failed to create item in Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PATCH /api/items/:id/toggle - Toggle availability
app.patch('/api/items/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const newStatus = !existing[0].isAvailable;
    await db.update(items).set({ isAvailable: newStatus }).where(eq(items.id, id));
    res.json({ ...formatItem(existing[0]), isAvailable: newStatus });
  } catch (error) {
    console.error('Failed to toggle item availability:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(items).where(eq(items.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// GET /api/requests - Get all borrow requests
app.get('/api/requests', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const includeDemo = req.query.includeDemo === 'true';
    let query = db.select().from(borrowRequests);

    let reqs;
    if (!includeDemo) {
      reqs = await query.where(eq(borrowRequests.isDemo, false)).orderBy(desc(borrowRequests.createdAt));
    } else {
      reqs = await query.orderBy(desc(borrowRequests.createdAt));
    }

    // Attach chat messages for each request
    const allMessages = await db.select().from(chatMessages);
    const messagesByReq: Record<string, any[]> = {};
    for (const msg of allMessages) {
      if (!messagesByReq[msg.requestId]) messagesByReq[msg.requestId] = [];
      messagesByReq[msg.requestId].push({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      });
    }

    const formatted = reqs.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      itemTitle: r.itemTitle,
      itemCategory: r.itemCategory,
      itemImageUrl: r.itemImageUrl,
      lenderId: r.lenderId,
      lenderName: r.lenderName,
      borrowerId: r.borrowerId,
      borrowerName: r.borrowerName,
      borrowerNeighborhood: r.borrowerNeighborhood,
      borrowerTrustScore: r.borrowerTrustScore,
      startDate: r.startDate,
      endDate: r.endDate,
      totalDays: r.totalDays,
      dailyFee: r.dailyFee,
      deposit: r.deposit,
      message: r.message,
      pickupPreference: r.pickupPreference,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      messages: messagesByReq[r.id] || [],
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch borrow requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST /api/requests - Create borrow request
app.post('/api/requests', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const isDemo = body.isDemo === true;
    const reqId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newReq = {
      id: reqId,
      itemId: body.itemId,
      itemTitle: body.itemTitle,
      itemCategory: body.itemCategory,
      itemImageUrl: body.itemImageUrl,
      lenderId: body.lenderId,
      lenderName: body.lenderName,
      borrowerId: body.borrowerId || req.user?.uid || 'user-unknown',
      borrowerName: body.borrowerName,
      borrowerNeighborhood: body.borrowerNeighborhood,
      borrowerTrustScore: Number(body.borrowerTrustScore) || 100,
      startDate: body.startDate,
      endDate: body.endDate,
      totalDays: Number(body.totalDays) || 1,
      dailyFee: Number(body.dailyFee) || 0,
      deposit: Number(body.deposit) || 0,
      message: body.message,
      pickupPreference: body.pickupPreference,
      status: 'pending',
      isDemo: isDemo,
    };

    await db.insert(borrowRequests).values(newReq);

    // Initial message
    const msgId = `msg-${Date.now()}`;
    await db.insert(chatMessages).values({
      id: msgId,
      requestId: reqId,
      senderId: newReq.borrowerId,
      senderName: newReq.borrowerName,
      senderRole: 'borrower',
      text: body.message,
    });

    res.status(201).json({
      ...newReq,
      createdAt: new Date().toISOString(),
      messages: [{
        id: msgId,
        senderId: newReq.borrowerId,
        senderName: newReq.borrowerName,
        senderRole: 'borrower',
        text: body.message,
        timestamp: new Date().toISOString(),
      }],
    });
  } catch (error) {
    console.error('Failed to create borrow request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// PATCH /api/requests/:id/status - Update request status
app.patch('/api/requests/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.update(borrowRequests).set({ status }).where(eq(borrowRequests.id, id));
    res.json({ success: true, status });
  } catch (error) {
    console.error('Failed to update request status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/chat/:requestId - Add chat message
app.post('/api/chat/:requestId', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { senderId, senderName, senderRole, text } = req.body;
    const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newMsg = {
      id: msgId,
      requestId,
      senderId,
      senderName,
      senderRole,
      text,
    };

    await db.insert(chatMessages).values(newMsg);
    res.status(201).json({ ...newMsg, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to post chat message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/iso - Get ISO requests
app.get('/api/iso', async (req: Request, res: Response) => {
  try {
    const includeDemo = req.query.includeDemo === 'true';
    let query = db.select().from(isoRequests);

    let list;
    if (!includeDemo) {
      list = await query.where(eq(isoRequests.isDemo, false)).orderBy(desc(isoRequests.createdAt));
    } else {
      list = await query.orderBy(desc(isoRequests.createdAt));
    }

    res.json(list.map((iso) => ({
      ...iso,
      createdAt: iso.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('Failed to fetch ISO requests:', error);
    res.status(500).json({ error: 'Failed to fetch ISO requests' });
  }
});

// POST /api/iso - Create ISO request
app.post('/api/iso', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const isDemo = body.isDemo === true;
    const isoId = `iso-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newIso = {
      id: isoId,
      title: body.title,
      category: body.category,
      description: body.description,
      neededByDate: body.neededByDate,
      neighborhood: body.neighborhood,
      zipCode: body.zipCode,
      posterId: body.posterId || req.user?.uid || 'user-unknown',
      posterName: body.posterName,
      posterTrustScore: Number(body.posterTrustScore) || 100,
      posterAvatar: body.posterAvatar || 'NB',
      responsesCount: 0,
      status: 'open',
      isDemo: isDemo,
    };

    await db.insert(isoRequests).values(newIso);
    res.status(201).json({ ...newIso, createdAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to create ISO request:', error);
    res.status(500).json({ error: 'Failed to create ISO request' });
  }
});

// POST /api/iso/:id/respond - Increment responses count
app.post('/api/iso/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(isoRequests).set({
      responsesCount: sql`${isoRequests.responsesCount} + 1`,
    }).where(eq(isoRequests.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to respond to ISO:', error);
    res.status(500).json({ error: 'Failed to update response count' });
  }
});

// POST /api/users/sync - Register or sync user
app.post('/api/users/sync', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const uid = body.uid || req.user?.uid;
    if (!uid) return res.status(400).json({ error: 'Missing UID' });

    const result = await db.insert(users).values({
      uid,
      email: body.email,
      name: body.name,
      neighborhood: body.neighborhood,
      zipCode: body.zipCode,
      avatar: body.avatar || 'NB',
      bio: body.bio || null,
      trustScore: Number(body.trustScore) || 100,
      totalLends: Number(body.totalLends) || 0,
      isVerifiedNeighbor: true,
      isAdmin: body.isAdmin || false,
      isDemo: body.isDemo || false,
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        name: body.name,
        neighborhood: body.neighborhood,
        zipCode: body.zipCode,
        avatar: body.avatar,
        bio: body.bio,
      },
    }).returning();

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Format helper from DB row to ShareItem format
function formatItem(row: any) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    condition: row.condition,
    description: row.description,
    rules: row.rules || '',
    dailyFee: row.dailyFee,
    refundableDeposit: row.refundableDeposit,
    depositNote: row.depositNote || '',
    neighborhood: row.neighborhood,
    zipCode: row.zipCode,
    imageUrl: row.imageUrl,
    isAvailable: row.isAvailable,
    isDemo: row.isDemo,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt || new Date().toISOString()),
    lender: {
      id: row.lenderId,
      name: row.lenderName,
      avatar: row.lenderAvatar,
      trustScore: row.lenderTrustScore,
      totalLends: row.lenderTotalLends,
      responseTime: row.lenderResponseTime || 'within 15 mins',
      neighborhood: row.neighborhood,
      zipCode: row.zipCode,
      isVerifiedNeighbor: true,
    },
  };
}

// --- VITE MIDDLEWARE OR STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'public')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use by another process.`);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`NeighborShare Full-Stack Cloud SQL Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
