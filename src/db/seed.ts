import { db } from './index.ts';
import { items, users, isoRequests } from './schema.ts';
import { INITIAL_ITEMS, MY_INITIAL_GARAGE_ITEM, INITIAL_ISO_REQUESTS, DEFAULT_ACCOUNTS } from '../data/mockData.ts';

export async function seedDemoDataIfEmpty() {
  try {
    const existingItems = await db.select().from(items).limit(1);
    if (existingItems.length === 0) {
      console.log('Seeding initial demo showcase items (flagged as is_demo = true)...');
      
      // Seed Demo Accounts
      for (const acc of DEFAULT_ACCOUNTS) {
        await db.insert(users).values({
          uid: acc.id,
          email: acc.email,
          name: acc.name,
          neighborhood: acc.neighborhood,
          zipCode: acc.zipCode,
          avatar: acc.avatar,
          bio: acc.bio || null,
          trustScore: acc.trustScore,
          totalLends: acc.totalLends,
          isVerifiedNeighbor: acc.isVerifiedNeighbor,
          isAdmin: acc.isAdmin || false,
          isDemo: true,
        }).onConflictDoNothing();
      }

      // Seed Items (all marked is_demo = true)
      const allDemoItems = [MY_INITIAL_GARAGE_ITEM, ...INITIAL_ITEMS];
      for (const item of allDemoItems) {
        await db.insert(items).values({
          id: item.id,
          title: item.title,
          category: item.category,
          condition: item.condition,
          description: item.description,
          rules: item.rules,
          dailyFee: item.dailyFee,
          refundableDeposit: item.refundableDeposit,
          depositNote: item.depositNote || null,
          neighborhood: item.neighborhood,
          zipCode: item.zipCode,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isDemo: true, // Tagged strictly as demo
          lenderId: item.lender.id,
          lenderName: item.lender.name,
          lenderAvatar: item.lender.avatar,
          lenderTrustScore: item.lender.trustScore,
          lenderTotalLends: item.lender.totalLends,
          lenderResponseTime: item.lender.responseTime || 'within 15 mins',
        }).onConflictDoNothing();
      }

      // Seed ISO requests (all marked is_demo = true)
      for (const iso of INITIAL_ISO_REQUESTS) {
        await db.insert(isoRequests).values({
          id: iso.id,
          title: iso.title,
          category: iso.category,
          description: iso.description,
          neededByDate: iso.neededByDate,
          neighborhood: iso.neighborhood,
          zipCode: iso.zipCode,
          posterId: 'user-demo-neighbor',
          posterName: iso.posterName,
          posterTrustScore: iso.posterTrustScore,
          posterAvatar: iso.posterAvatar,
          responsesCount: iso.responsesCount,
          status: iso.status,
          isDemo: true, // Tagged strictly as demo
        }).onConflictDoNothing();
      }

      console.log('Demo items & showcase data seeded successfully with is_demo = true.');
    }
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}
