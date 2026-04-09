import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing in .env');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🚀 Seeding CaterMe Mumbai database...\n');

    const adminPassword = await bcrypt.hash('mumbai2026', 10);
    const catererPassword = await bcrypt.hash('caterer123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // ═══════════════════════════════════════════════════════════════════════
    // 1. ADMIN
    // ═══════════════════════════════════════════════════════════════════════
    await prisma.admin.upsert({
      where: { email: 'admin@caterme.com' },
      update: { password: adminPassword },
      create: { email: 'admin@caterme.com', name: 'Mumbai Admin', password: adminPassword },
    });
    console.log('✅ Admin seeded');

    // ═══════════════════════════════════════════════════════════════════════
    // 2. CATERERS
    // ═══════════════════════════════════════════════════════════════════════
    const caterersData = [
      { name: 'Mehroof Caterers', username: 'mehroof_admin', city: 'Mumbai', phone: '9876543210', address: 'Andheri West, Mumbai',
        menus: [
          { name: 'Coastal Lover', description: 'Fresh Malvani seafood special', pricePerHead: 780, minHeadcount: 20, isNonVeg: true, items: ['Surmai Fry','Prawns Curry','Tisriya Masala','Solkadhi','Steamed Rice','Amboli','Kokum Sharbat','Modak'] },
          { name: 'Konkan Veg Delight', description: 'Authentic vegetarian coastal spices', pricePerHead: 550, minHeadcount: 15, isNonVeg: false, items: ['Kaju Biya Bhaji','Bharli Vangi','Dal Tosh','Neer Dosa','Ukadiche Modak','Phanasaji Bhaji','Amba Panha'] },
        ]},
      { name: 'Royal Rajputana Kitchen', username: 'royal_admin', city: 'Mumbai', phone: '9123456789', address: 'Colaba, Mumbai',
        menus: [
          { name: 'Maharaja Veg Thali', description: 'Grand Rajasthani delicacies', pricePerHead: 950, minHeadcount: 50, isNonVeg: false, items: ['Dal Baati','Churma','Gatte ki Sabzi','Ker Sangri','Bajra Roti','Panchratna Dal','Malpua','Buttermilk'] },
        ]},
      { name: 'Bombay Bites Catering', username: 'bombaybites', city: 'Mumbai', phone: '9988776655', address: 'Bandra West, Mumbai',
        menus: [
          { name: 'Street Food Festival', description: 'Mumbai street food paradise', pricePerHead: 450, minHeadcount: 30, isNonVeg: false, items: ['Pav Bhaji','Vada Pav','Pani Puri','Sev Puri','Bhel Puri','Ragda Pattice','Misal Pav','Cutting Chai'] },
        ]},
    ];

    for (const c of caterersData) {
      await prisma.caterer.upsert({
        where: { username: c.username },
        update: { name: c.name },
        create: { name: c.name, username: c.username, password: catererPassword, city: c.city, phone: c.phone, address: c.address, menus: { create: c.menus } },
      });
      console.log(`✅ Caterer seeded: ${c.name}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. CUSTOMER
    // ═══════════════════════════════════════════════════════════════════════
    await prisma.customer.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: { email: 'test@example.com', name: 'John Doe', phoneNumber: '1234567890', password: customerPassword },
    });
    console.log('✅ Customer seeded');

    // ═══════════════════════════════════════════════════════════════════════
    // 4. EVENT CATEGORIES
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📂 Seeding event categories...');

    // Clear old data for clean reseed
    await prisma.orderDishSelection.deleteMany({});
    await prisma.skeletonSlotDish.deleteMany({});
    await prisma.skeletonSlot.deleteMany({});
    await prisma.menuSkeleton.deleteMany({});
    await prisma.dish.deleteMany({});
    await prisma.eventCategory.deleteMany({});

    const CATEGORIES = [
      { name: 'WEDDING_RECEPTION', label: 'Wedding Reception', description: 'Grand buffet spreads for the biggest day of your life', icon: '💍', sortOrder: 1 },
      { name: 'ENGAGEMENT', label: 'Engagement Ceremony', description: 'Elegant semi-formal celebration', icon: '💎', sortOrder: 2 },
      { name: 'MEHENDI_SANGEET', label: 'Mehendi & Sangeet', description: 'Vibrant celebration with street food and party bites', icon: '🎶', sortOrder: 3 },
      { name: 'CORPORATE', label: 'Corporate Event', description: 'Professional dining for conferences and team events', icon: '🏢', sortOrder: 4 },
      { name: 'BIRTHDAY', label: 'Birthday Party', description: 'Fun celebration menus for all ages', icon: '🎂', sortOrder: 5 },
      { name: 'HOUSE_PARTY', label: 'House Party', description: 'Intimate gathering with comfort food', icon: '🏠', sortOrder: 6 },
      { name: 'RELIGIOUS', label: 'Religious / Pooja', description: 'Pure vegetarian traditional spreads', icon: '🪔', sortOrder: 7 },
      { name: 'GALA_DINNER', label: 'Gala Dinner & Cocktail', description: 'Premium fine dining experience', icon: '🥂', sortOrder: 8 },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const created = await prisma.eventCategory.create({ data: { ...cat, isActive: true } });
      categoryMap[cat.name] = created.id;
      console.log(`  ✅ ${cat.icon} ${cat.label}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. DISH LIBRARY (120+ Mumbai-authentic dishes)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🍽️ Seeding dish library...');

    const DISHES = [
      // WELCOME DRINKS
      { name: 'Kokum Sharbat', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'COASTAL' },
      { name: 'Aam Panha', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Sweet Lassi', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Mango Lassi', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Masala Chaas', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Virgin Mojito', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'CONTINENTAL' },
      { name: 'Jaljeera', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Rose Sharbat', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'MUGHLAI' },
      { name: 'Kala Khatta', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Sol Kadhi', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'COASTAL' },
      { name: 'Filter Coffee', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'SOUTH_INDIAN' },
      { name: 'Masala Chai', category: 'WELCOME_DRINK', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      // CHAAT / LIVE COUNTERS
      { name: 'Pani Puri Counter', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Sev Puri', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Dahi Puri', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Bhel Puri', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Ragda Pattice', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Papdi Chaat', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Dahi Bhalla', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Aloo Tikki Chaat', category: 'CHAAT_COUNTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      // LIVE STATIONS
      { name: 'Dosa Station', category: 'LIVE_COUNTER', isNonVeg: false, cuisine: 'SOUTH_INDIAN', isPremium: true },
      { name: 'Pasta Counter', category: 'LIVE_COUNTER', isNonVeg: false, cuisine: 'CONTINENTAL', isPremium: true },
      { name: 'Pizza Counter', category: 'LIVE_COUNTER', isNonVeg: false, cuisine: 'CONTINENTAL', isPremium: true },
      { name: 'Pav Bhaji Live', category: 'LIVE_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Tawa Pulao Live', category: 'LIVE_COUNTER', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Shawarma Counter', category: 'LIVE_COUNTER', isNonVeg: true, cuisine: 'MIDDLE_EASTERN', isPremium: true },
      // VEG STARTERS
      { name: 'Paneer Tikka', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Hara Bhara Kebab', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Veg Seekh Kebab', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Corn Cheese Balls', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'INDO_CHINESE' },
      { name: 'Paneer Malai Tikka', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'NORTH_INDIAN', isPremium: true },
      { name: 'Crispy Corn', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'INDO_CHINESE' },
      { name: 'Mushroom Galouti', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'MUGHLAI', isPremium: true },
      { name: 'Dahi Ke Sholay', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Spring Roll', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'INDO_CHINESE' },
      { name: 'Stuffed Mushroom', category: 'VEG_STARTER', isNonVeg: false, cuisine: 'CONTINENTAL', isPremium: true },
      // NON-VEG STARTERS
      { name: 'Chicken Tikka', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Tandoori Chicken', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Chicken Malai Tikka', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Mutton Seekh Kebab', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'MUGHLAI', isPremium: true },
      { name: 'Prawns Koliwada', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'COASTAL' },
      { name: 'Fish Tikka', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'COASTAL' },
      { name: 'Surmai Fry', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'COASTAL' },
      { name: 'Chicken 65', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'SOUTH_INDIAN' },
      { name: 'Butter Garlic Prawns', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'COASTAL', isPremium: true },
      { name: 'Chilli Chicken', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'INDO_CHINESE' },
      { name: 'Mutton Galouti Kebab', category: 'NONVEG_STARTER', isNonVeg: true, cuisine: 'MUGHLAI', isPremium: true },
      // VEG MAINS
      { name: 'Paneer Butter Masala', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Shahi Paneer', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'MUGHLAI', isPremium: true },
      { name: 'Kadai Paneer', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Palak Paneer', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Navratan Korma', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'MUGHLAI' },
      { name: 'Malai Kofta', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN', isPremium: true },
      { name: 'Chana Masala', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Bharli Vangi', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Methi Malai Mutter', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Kaju Curry', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN', isPremium: true },
      { name: 'Mixed Veg Kolhapuri', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Aloo Gobi', category: 'VEG_MAIN', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      // NON-VEG MAINS
      { name: 'Butter Chicken', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Chicken Tikka Masala', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Chicken Kadai', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Mutton Rogan Josh', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'MUGHLAI', isPremium: true },
      { name: 'Prawn Masala', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'COASTAL' },
      { name: 'Fish Curry Malvani', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'COASTAL' },
      { name: 'Mutton Kolhapuri', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'MAHARASHTRIAN', isPremium: true },
      { name: 'Chicken Korma', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'MUGHLAI' },
      { name: 'Chicken Handi', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'NORTH_INDIAN' },
      { name: 'Surmai Curry', category: 'NONVEG_MAIN', isNonVeg: true, cuisine: 'COASTAL' },
      // DAL
      { name: 'Dal Makhani', category: 'DAL', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Dal Tadka', category: 'DAL', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Dal Fry', category: 'DAL', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Panchratna Dal', category: 'DAL', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Amti', category: 'DAL', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Moong Dal Tadka', category: 'DAL', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      // BREAD
      { name: 'Butter Naan', category: 'BREAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Garlic Naan', category: 'BREAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Tandoori Roti', category: 'BREAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Rumali Roti', category: 'BREAD', isNonVeg: false, cuisine: 'MUGHLAI' },
      { name: 'Laccha Paratha', category: 'BREAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Missi Roti', category: 'BREAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Neer Dosa', category: 'BREAD', isNonVeg: false, cuisine: 'COASTAL' },
      { name: 'Pav', category: 'BREAD', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      // RICE
      { name: 'Veg Biryani Dum', category: 'RICE', isNonVeg: false, cuisine: 'MUGHLAI' },
      { name: 'Jeera Rice', category: 'RICE', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Masala Bhat', category: 'RICE', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Coconut Rice', category: 'RICE', isNonVeg: false, cuisine: 'COASTAL' },
      { name: 'Veg Pulao', category: 'RICE', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Chicken Biryani Hyderabadi', category: 'RICE', isNonVeg: true, cuisine: 'SOUTH_INDIAN' },
      { name: 'Mutton Biryani', category: 'RICE', isNonVeg: true, cuisine: 'MUGHLAI', isPremium: true },
      { name: 'Prawn Biryani', category: 'RICE', isNonVeg: true, cuisine: 'COASTAL', isPremium: true },
      // RAITA & SALAD
      { name: 'Boondi Raita', category: 'RAITA_SALAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Mixed Raita', category: 'RAITA_SALAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Kachumber Salad', category: 'RAITA_SALAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Green Salad', category: 'RAITA_SALAD', isNonVeg: false, cuisine: 'CONTINENTAL' },
      { name: 'Papad Basket', category: 'RAITA_SALAD', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      // DESSERTS
      { name: 'Gulab Jamun', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Rasmalai', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN', isPremium: true },
      { name: 'Gajar Ka Halwa', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Jalebi with Rabri', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Steamed Modak', category: 'DESSERT', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Basundi', category: 'DESSERT', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Shrikhand', category: 'DESSERT', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Kulfi Assorted', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Motichoor Ladoo', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Puran Poli', category: 'DESSERT', isNonVeg: false, cuisine: 'MAHARASHTRIAN' },
      { name: 'Ice Cream Station', category: 'DESSERT', isNonVeg: false, cuisine: 'CONTINENTAL', isPremium: true },
      { name: 'Phirni', category: 'DESSERT', isNonVeg: false, cuisine: 'MUGHLAI' },
      { name: 'Malpua', category: 'DESSERT', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      // PAAN COUNTER
      { name: 'Meetha Paan', category: 'PAAN_COUNTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
      { name: 'Chocolate Paan', category: 'PAAN_COUNTER', isNonVeg: false, cuisine: 'FUSION', isPremium: true },
      { name: 'Mukhwas Assortment', category: 'PAAN_COUNTER', isNonVeg: false, cuisine: 'NORTH_INDIAN' },
    ];

    const createdDishes = await Promise.all(
      DISHES.map((d) => prisma.dish.create({ data: { name: d.name, category: d.category, isNonVeg: d.isNonVeg, cuisine: d.cuisine || null, isPremium: d.isPremium || false, isActive: true, tags: [] } }))
    );
    const byCategory = (cat: string) => createdDishes.filter((d) => d.category === cat).map((d) => d.id);
    console.log(`✅ ${createdDishes.length} dishes seeded`);

    // ═══════════════════════════════════════════════════════════════════════
    // 6. MENU SKELETONS (20+ across all categories)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📋 Seeding menu skeletons...');

    type SlotDef = { category: string; label: string; min: number; max: number; required?: boolean };
    type SkeletonDef = { name: string; catKey: string; occasion: string; desc: string; price: number; minH: number; maxH: number; slots: SlotDef[] };

    const SKELETONS: SkeletonDef[] = [
      // WEDDING RECEPTION
      { name: 'Royal Wedding Feast', catKey: 'WEDDING_RECEPTION', occasion: 'WEDDING', desc: 'Grand package for 200-1000 guests with live counters', price: 1500, minH: 200, maxH: 1000,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 2, max: 3 },
          { category: 'CHAAT_COUNTER', label: 'Chaat Counter', min: 2, max: 4 },
          { category: 'LIVE_COUNTER', label: 'Live Stations', min: 1, max: 3 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 3, max: 6 },
          { category: 'NONVEG_STARTER', label: 'Non-Veg Starters', min: 3, max: 6 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 4, max: 6 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 3, max: 5 },
          { category: 'DAL', label: 'Dal', min: 2, max: 2 },
          { category: 'BREAD', label: 'Breads', min: 3, max: 4 },
          { category: 'RICE', label: 'Rice & Biryani', min: 2, max: 3 },
          { category: 'RAITA_SALAD', label: 'Raita & Salad', min: 2, max: 3 },
          { category: 'DESSERT', label: 'Desserts', min: 5, max: 8 },
          { category: 'PAAN_COUNTER', label: 'Paan Counter', min: 1, max: 3, required: false },
        ]},
      { name: 'Grand Shaadi Package', catKey: 'WEDDING_RECEPTION', occasion: 'WEDDING', desc: 'Mid-size wedding for 100-500 guests', price: 1100, minH: 100, maxH: 500,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 2, max: 2 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 2, max: 4 },
          { category: 'NONVEG_STARTER', label: 'Non-Veg Starters', min: 2, max: 4 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 3, max: 4 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 3, max: 4 },
          { category: 'DAL', label: 'Dal', min: 1, max: 2 },
          { category: 'BREAD', label: 'Breads', min: 3, max: 3 },
          { category: 'RICE', label: 'Rice & Biryani', min: 2, max: 2 },
          { category: 'DESSERT', label: 'Desserts', min: 4, max: 6 },
        ]},
      { name: 'Premium Wedding Pure Veg', catKey: 'WEDDING_RECEPTION', occasion: 'WEDDING', desc: 'All-vegetarian grand wedding feast', price: 1200, minH: 100, maxH: 800,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 2, max: 3 },
          { category: 'CHAAT_COUNTER', label: 'Chaat Counter', min: 3, max: 5 },
          { category: 'LIVE_COUNTER', label: 'Live Stations', min: 1, max: 2 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 4, max: 6 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 5, max: 7 },
          { category: 'DAL', label: 'Dal', min: 2, max: 2 },
          { category: 'BREAD', label: 'Breads', min: 3, max: 4 },
          { category: 'RICE', label: 'Rice', min: 2, max: 3 },
          { category: 'RAITA_SALAD', label: 'Raita & Salad', min: 2, max: 3 },
          { category: 'DESSERT', label: 'Desserts', min: 5, max: 8 },
          { category: 'PAAN_COUNTER', label: 'Paan Counter', min: 1, max: 2, required: false },
        ]},
      // ENGAGEMENT
      { name: 'Engagement Celebration', catKey: 'ENGAGEMENT', occasion: 'ENGAGEMENT', desc: 'Elegant semi-formal gathering for 50-300', price: 900, minH: 50, maxH: 300,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 2, max: 2 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 2, max: 3 },
          { category: 'NONVEG_STARTER', label: 'Non-Veg Starters', min: 2, max: 3 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 3, max: 4 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 2, max: 3 },
          { category: 'DAL', label: 'Dal', min: 1, max: 1 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 3 },
          { category: 'RICE', label: 'Rice', min: 1, max: 2 },
          { category: 'DESSERT', label: 'Desserts', min: 3, max: 4 },
        ]},
      // MEHENDI & SANGEET
      { name: 'Mehendi Fiesta', catKey: 'MEHENDI_SANGEET', occasion: 'MEHENDI', desc: 'Fun street food + mains for 50-400', price: 750, minH: 50, maxH: 400,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Refreshments', min: 1, max: 2 },
          { category: 'CHAAT_COUNTER', label: 'Chaat Counter', min: 3, max: 5 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 2, max: 3 },
          { category: 'VEG_MAIN', label: 'Main Course', min: 2, max: 3 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 2 },
          { category: 'RICE', label: 'Rice', min: 1, max: 1 },
          { category: 'DESSERT', label: 'Desserts', min: 3, max: 4 },
        ]},
      { name: 'Sangeet Night Bash', catKey: 'MEHENDI_SANGEET', occasion: 'SANGEET', desc: 'Party food for the dance night', price: 950, minH: 100, maxH: 500,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 2, max: 3 },
          { category: 'LIVE_COUNTER', label: 'Live Stations', min: 1, max: 2 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 3, max: 4 },
          { category: 'NONVEG_STARTER', label: 'Non-Veg Starters', min: 2, max: 4 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 3, max: 4 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 2, max: 3 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 3 },
          { category: 'RICE', label: 'Rice & Biryani', min: 1, max: 2 },
          { category: 'DESSERT', label: 'Desserts', min: 3, max: 5 },
        ]},
      // CORPORATE
      { name: 'Corporate Lunch Standard', catKey: 'CORPORATE', occasion: 'CORPORATE', desc: 'Professional lunch for 20-200 pax', price: 550, minH: 20, maxH: 200,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drink', min: 1, max: 1 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 1, max: 2 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 2, max: 3 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 1, max: 2 },
          { category: 'DAL', label: 'Dal', min: 1, max: 1 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 2 },
          { category: 'RICE', label: 'Rice', min: 1, max: 1 },
          { category: 'RAITA_SALAD', label: 'Raita & Salad', min: 1, max: 2 },
          { category: 'DESSERT', label: 'Dessert', min: 2, max: 3 },
        ]},
      { name: 'Corporate Premium Dinner', catKey: 'CORPORATE', occasion: 'CORPORATE', desc: 'Premium dinner for client events', price: 850, minH: 30, maxH: 300,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 2, max: 2 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 2, max: 3 },
          { category: 'NONVEG_STARTER', label: 'Non-Veg Starters', min: 2, max: 3 },
          { category: 'LIVE_COUNTER', label: 'Live Counter', min: 1, max: 1 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 3, max: 4 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 2, max: 3 },
          { category: 'DAL', label: 'Dal', min: 1, max: 1 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 3 },
          { category: 'RICE', label: 'Rice', min: 1, max: 2 },
          { category: 'DESSERT', label: 'Desserts', min: 3, max: 4 },
        ]},
      // BIRTHDAY
      { name: 'Birthday Blast', catKey: 'BIRTHDAY', occasion: 'BIRTHDAY', desc: 'Fun celebration for 15-100 guests', price: 650, minH: 15, maxH: 100,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drink', min: 1, max: 2 },
          { category: 'VEG_STARTER', label: 'Starters Veg', min: 2, max: 3 },
          { category: 'NONVEG_STARTER', label: 'Starters Non-Veg', min: 1, max: 2 },
          { category: 'VEG_MAIN', label: 'Mains Veg', min: 2, max: 3 },
          { category: 'NONVEG_MAIN', label: 'Mains Non-Veg', min: 1, max: 2 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 2 },
          { category: 'RICE', label: 'Rice', min: 1, max: 1 },
          { category: 'DESSERT', label: 'Desserts', min: 3, max: 4 },
        ]},
      // HOUSE PARTY
      { name: 'House Party Comfort', catKey: 'HOUSE_PARTY', occasion: 'HOUSE_PARTY', desc: 'Comfort food for 10-40 guests', price: 500, minH: 10, maxH: 40,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Drinks', min: 1, max: 1 },
          { category: 'VEG_STARTER', label: 'Starters', min: 2, max: 2 },
          { category: 'VEG_MAIN', label: 'Mains Veg', min: 2, max: 2 },
          { category: 'NONVEG_MAIN', label: 'Mains Non-Veg', min: 1, max: 2 },
          { category: 'DAL', label: 'Dal', min: 1, max: 1 },
          { category: 'BREAD', label: 'Bread', min: 1, max: 2 },
          { category: 'RICE', label: 'Rice', min: 1, max: 1 },
          { category: 'DESSERT', label: 'Desserts', min: 2, max: 2 },
        ]},
      // RELIGIOUS / POOJA
      { name: 'Satvik Bhojan Thali', catKey: 'RELIGIOUS', occasion: 'RELIGIOUS', desc: 'Pure veg, no onion-garlic traditional spread', price: 450, minH: 20, maxH: 200,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Sherbet', min: 1, max: 1 },
          { category: 'VEG_STARTER', label: 'Starters', min: 1, max: 2 },
          { category: 'VEG_MAIN', label: 'Main Course', min: 3, max: 4 },
          { category: 'DAL', label: 'Dal', min: 1, max: 1 },
          { category: 'BREAD', label: 'Roti / Puri', min: 1, max: 2 },
          { category: 'RICE', label: 'Rice', min: 1, max: 1 },
          { category: 'DESSERT', label: 'Prasad & Sweets', min: 2, max: 3 },
        ]},
      { name: 'Festive Special', catKey: 'RELIGIOUS', occasion: 'FESTIVAL', desc: 'Festival special with sweets-heavy menu', price: 600, minH: 30, maxH: 300,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Drinks', min: 1, max: 2 },
          { category: 'CHAAT_COUNTER', label: 'Chaat Counter', min: 2, max: 3 },
          { category: 'VEG_STARTER', label: 'Starters', min: 2, max: 3 },
          { category: 'VEG_MAIN', label: 'Main Course', min: 3, max: 5 },
          { category: 'DAL', label: 'Dal', min: 1, max: 2 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 3 },
          { category: 'RICE', label: 'Rice', min: 1, max: 2 },
          { category: 'DESSERT', label: 'Sweets & Mithai', min: 4, max: 6 },
        ]},
      // GALA DINNER
      { name: 'Gala Reception Dinner', catKey: 'GALA_DINNER', occasion: 'GALA', desc: 'Premium multi-course fine dining', price: 1500, minH: 100, maxH: 500,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Welcome Cocktails', min: 2, max: 3 },
          { category: 'LIVE_COUNTER', label: 'Live Stations', min: 2, max: 3 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 3, max: 5 },
          { category: 'NONVEG_STARTER', label: 'Non-Veg Starters', min: 3, max: 5 },
          { category: 'VEG_MAIN', label: 'Main Course Veg', min: 3, max: 5 },
          { category: 'NONVEG_MAIN', label: 'Main Course Non-Veg', min: 3, max: 4 },
          { category: 'DAL', label: 'Dal', min: 1, max: 2 },
          { category: 'BREAD', label: 'Breads', min: 3, max: 4 },
          { category: 'RICE', label: 'Rice & Biryani', min: 2, max: 3 },
          { category: 'DESSERT', label: 'Premium Desserts', min: 5, max: 7 },
          { category: 'PAAN_COUNTER', label: 'Paan Counter', min: 1, max: 3, required: false },
        ]},
      { name: 'Mumbai Coastal Feast', catKey: 'GALA_DINNER', occasion: 'COASTAL', desc: 'Authentic Konkan & Koli flavours', price: 1000, minH: 30, maxH: 200,
        slots: [
          { category: 'WELCOME_DRINK', label: 'Coastal Drinks', min: 1, max: 2 },
          { category: 'VEG_STARTER', label: 'Veg Starters', min: 1, max: 2 },
          { category: 'NONVEG_STARTER', label: 'Seafood Starters', min: 2, max: 4 },
          { category: 'VEG_MAIN', label: 'Veg Mains', min: 2, max: 3 },
          { category: 'NONVEG_MAIN', label: 'Seafood Mains', min: 3, max: 4 },
          { category: 'DAL', label: 'Dal', min: 1, max: 1 },
          { category: 'BREAD', label: 'Breads', min: 2, max: 3 },
          { category: 'RICE', label: 'Rice', min: 2, max: 2 },
          { category: 'DESSERT', label: 'Desserts', min: 2, max: 3 },
        ]},
    ];

    for (const s of SKELETONS) {
      const skeleton = await prisma.menuSkeleton.create({
        data: {
          name: s.name, occasion: s.occasion, description: s.desc,
          basePrice: s.price, minHeadcount: s.minH, maxHeadcount: s.maxH,
          isActive: true, categoryId: categoryMap[s.catKey],
        },
      });

      for (let i = 0; i < s.slots.length; i++) {
        const sl = s.slots[i];
        const dishIds = byCategory(sl.category);
        const slot = await prisma.skeletonSlot.create({
          data: {
            skeletonId: skeleton.id, category: sl.category, label: sl.label,
            minChoices: sl.min, maxChoices: sl.max, sortOrder: i,
            isRequired: sl.required !== false,
          },
        });
        if (dishIds.length > 0) {
          await prisma.skeletonSlotDish.createMany({
            data: dishIds.map((dishId) => ({ slotId: slot.id, dishId })),
          });
        }
      }
      console.log(`  ✅ ${s.name} (${s.catKey})`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('  Admin:    admin@caterme.com / mumbai2026');
    console.log('  Caterer:  mehroof_admin / caterer123');
    console.log('  Customer: test@example.com / customer123');

  } catch (error) {
    console.error('❌ Error during seed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
