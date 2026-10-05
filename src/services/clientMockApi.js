/**
 * Client-Side In-Browser API & Database Engine
 * 
 * Automatically activates on GitHub Pages (github.io), Vercel (vercel.app),
 * and static/offline environments, enabling full-stack functionality:
 * - Student/Staff & Admin Auth with session tokens
 * - Lost & Found item reporting with image support
 * - Smart Matching Engine (Category, Keywords, Location, Color, Brand, Date scoring)
 * - In-App Messaging threads with read tracking
 * - Item status workflow (active, recovered, returned, rejected)
 * - Item flagging & moderation system
 * - Admin analytics, moderation queues, user suspension, and re-seeding
 * 
 * Completely browser-based using LocalStorage persistence.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'lost', 'found', 'my', 'our', 'item', 'near', 'beside', 'around', 'please', 'help',
  'someone', 'anyone', 'has', 'have', 'had', 'was', 'were', 'is', 'are'
]);

const COLOR_FAMILIES = {
  black: ['black', 'dark', 'charcoal', 'jet black'],
  white: ['white', 'off-white', 'cream', 'ivory', 'silver'],
  blue: ['blue', 'navy', 'dark blue', 'light blue', 'cyan', 'sky blue'],
  red: ['red', 'maroon', 'crimson', 'burgundy'],
  gray: ['gray', 'grey', 'silver', 'slate', 'charcoal'],
  green: ['green', 'olive', 'lime', 'forest green', 'mint'],
  yellow: ['yellow', 'gold', 'mustard'],
  brown: ['brown', 'tan', 'beige', 'khaki'],
  purple: ['purple', 'violet', 'lavender']
};

const LOCATION_CLUSTERS = [
  ['library', 'central library', 'library block', 'reading room', 'study room', 'reference section'],
  ['canteen', 'cafeteria', 'food court', 'mess', 'dining hall', 'snack bar'],
  ['gym', 'sports complex', 'gymnasium', 'badminton court', 'indoor stadium', 'football ground', 'cricket ground'],
  ['auditorium', 'main hall', 'open air theatre', 'seminar hall', 'oat'],
  ['computer lab', 'cs lab', 'software lab', 'it block', 'computer centre', 'server room'],
  ['science block', 'chemistry lab', 'physics lab', 'bio lab', 'research centre'],
  ['admin block', 'dean office', 'registrar', 'accounts office', 'main office', 'reception'],
  ['hostel', 'dorm', 'hall of residence', 'block a', 'block b', 'block c']
];

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function calculateTokenSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return { score: 0, matches: [] };
  const setB = new Set(tokensB);
  const common = tokensA.filter(token => setB.has(token));
  const uniqueCommon = [...new Set(common)];
  const union = new Set([...tokensA, ...tokensB]);
  const jaccard = union.size > 0 ? uniqueCommon.length / union.size : 0;
  return { score: Math.min(1, jaccard * 1.8), matches: uniqueCommon };
}

function compareColors(colorA, colorB) {
  if (!colorA || !colorB) return { match: false, partial: false };
  const a = colorA.toLowerCase().trim();
  const b = colorB.toLowerCase().trim();
  if (a === b || a.includes(b) || b.includes(a)) return { match: true, partial: false };
  for (const family of Object.values(COLOR_FAMILIES)) {
    if (family.some(c => a.includes(c)) && family.some(c => b.includes(c))) return { match: false, partial: true };
  }
  return { match: false, partial: false };
}

function compareBrands(brandA, brandB, textA, textB) {
  const bA = (brandA || '').toLowerCase().trim();
  const bB = (brandB || '').toLowerCase().trim();
  if (bA && bB && (bA === bB || bA.includes(bB) || bB.includes(bA))) return { match: true, brand: brandA };
  if (bA && (textB || '').toLowerCase().includes(bA)) return { match: true, brand: brandA };
  if (bB && (textA || '').toLowerCase().includes(bB)) return { match: true, brand: brandB };
  return { match: false };
}

function compareLocations(locA, locB) {
  if (!locA || !locB) return { score: 0, reason: null };
  const a = locA.toLowerCase().trim();
  const b = locB.toLowerCase().trim();
  if (a === b) return { score: 1.0, reason: `Exact location: ${locA}` };
  for (const cluster of LOCATION_CLUSTERS) {
    if (cluster.some(item => a.includes(item)) && cluster.some(item => b.includes(item))) {
      return { score: 0.85, reason: `Campus zone match: '${locA}' & '${locB}'` };
    }
  }
  const sim = calculateTokenSimilarity(tokenize(locA), tokenize(locB));
  if (sim.score > 0.3) return { score: 0.7, reason: `Similar location area: ${sim.matches.join(', ')}` };
  return { score: 0, reason: null };
}

function compareDates(dateLostStr, dateFoundStr) {
  if (!dateLostStr || !dateFoundStr) return { score: 0.5, reason: 'Dates within reasonable timeline' };
  try {
    const diffDays = Math.ceil(Math.abs(new Date(dateFoundStr) - new Date(dateLostStr)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { score: 1.0, reason: 'Reported on the exact same date' };
    if (diffDays <= 2) return { score: 0.9, reason: `Reported within ${diffDays} day(s) apart` };
    if (diffDays <= 7) return { score: 0.7, reason: `Reported within 1 week (${diffDays} days)` };
    if (diffDays <= 14) return { score: 0.4, reason: `Reported within 2 weeks (${diffDays} days)` };
    return { score: 0.1, reason: `Reported ${diffDays} days apart` };
  } catch (e) {
    return { score: 0.5, reason: 'Date check' };
  }
}

function calculateMatch(lostItem, foundItem) {
  const reasons = [];
  const breakdown = { category: 0, keywords: 0, location: 0, color: 0, brand: 0, date: 0 };

  const catLost = (lostItem.category || '').toLowerCase().trim();
  const catFound = (foundItem.category || '').toLowerCase().trim();

  if (catLost && catFound && catLost === catFound) {
    breakdown.category = 25;
    reasons.push(`Same category: ${lostItem.category} (+25%)`);
  }

  const textLost = `${lostItem.title || ''} ${lostItem.description || ''} ${lostItem.identifying_details || ''}`;
  const textFound = `${foundItem.title || ''} ${foundItem.description || ''} ${foundItem.identifying_details || ''}`;

  const titleSim = calculateTokenSimilarity(tokenize(lostItem.title), tokenize(foundItem.title));
  const textSim = calculateTokenSimilarity(tokenize(textLost), tokenize(textFound));

  breakdown.keywords = Math.round(Math.min(1.0, titleSim.score * 0.65 + textSim.score * 0.35) * 25);
  const matchedKeywords = [...new Set([...titleSim.matches, ...textSim.matches])];
  if (matchedKeywords.length > 0 && breakdown.keywords > 0) {
    reasons.push(`Matching keywords: "${matchedKeywords.slice(0, 4).join('", "')}" (+${breakdown.keywords}%)`);
  }

  const locResult = compareLocations(lostItem.location, foundItem.location);
  breakdown.location = Math.round(locResult.score * 20);
  if (breakdown.location > 0 && locResult.reason) reasons.push(`${locResult.reason} (+${breakdown.location}%)`);

  const colorRes = compareColors(lostItem.color || '', foundItem.color || '');
  if (colorRes.match) {
    breakdown.color = 10;
    reasons.push(`Same color: ${lostItem.color} (+10%)`);
  } else if (colorRes.partial) {
    breakdown.color = 6;
    reasons.push(`Similar color shade: ${lostItem.color} & ${foundItem.color} (+6%)`);
  }

  const brandRes = compareBrands(lostItem.brand, foundItem.brand, textLost, textFound);
  if (brandRes.match) {
    breakdown.brand = 10;
    reasons.push(`Matching brand: ${brandRes.brand || lostItem.brand || foundItem.brand} (+10%)`);
  }

  const dateRes = compareDates(lostItem.date, foundItem.date);
  breakdown.date = Math.round(dateRes.score * 10);
  if (breakdown.date > 0 && dateRes.reason) reasons.push(`${dateRes.reason} (+${breakdown.date}%)`);

  const totalScore = Math.min(100, Math.round(
    breakdown.category + breakdown.keywords + breakdown.location + breakdown.color + breakdown.brand + breakdown.date
  ));

  return { score: totalScore, reasons, breakdown };
}

function findMatches(targetItem, candidates, threshold = 55) {
  const matches = [];
  for (const c of candidates) {
    if (targetItem.type === c.type || targetItem.id === c.id) continue;
    if (['recovered', 'returned', 'rejected'].includes(c.status)) continue;
    const lostItem = targetItem.type === 'lost' ? targetItem : c;
    const foundItem = targetItem.type === 'found' ? targetItem : c;
    const res = calculateMatch(lostItem, foundItem);
    if (res.score >= threshold) {
      matches.push({
        lostItemId: lostItem.id,
        foundItemId: foundItem.id,
        matchedItem: c,
        score: res.score,
        reasons: res.reasons,
        breakdown: res.breakdown
      });
    }
  }
  return matches.sort((a, b) => b.score - a.score);
}

// Initial Seed Data for Browser Storage
function getInitialSeed() {
  const now = new Date();
  const dateStr = (offset) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };

  const users = [
    { id: 1, name: 'Campus Safety & Admin', email: 'admin@college.edu', college_id: 'ADM-2024-001', role: 'admin', department: 'Campus Security', status: 'active', password: 'College@123' },
    { id: 2, name: 'Alex Rivers', email: 'alex.rivers@college.edu', college_id: 'STU-2024-8841', role: 'student', department: 'Computer Science', status: 'active', password: 'College@123' },
    { id: 3, name: 'Priya Sharma', email: 'priya.sharma@college.edu', college_id: 'STU-2024-6729', role: 'student', department: 'Electrical Engineering', status: 'active', password: 'College@123' },
    { id: 4, name: 'Dr. Marcus Vance', email: 'marcus.vance@college.edu', college_id: 'STF-2021-042', role: 'staff', department: 'Physics', status: 'active', password: 'College@123' },
    { id: 5, name: 'David Chen', email: 'david.chen@college.edu', college_id: 'STU-2025-1109', role: 'student', department: 'Business', status: 'active', password: 'College@123' },
    { id: 6, name: 'Maya Patel', email: 'maya.patel@college.edu', college_id: 'STU-2024-4412', role: 'student', department: 'Biotechnology', status: 'active', password: 'College@123' }
  ];

  const items = [
    {
      id: 1, user_id: 2, type: 'lost', title: 'Black Dell XPS 15 Laptop', category: 'Electronics',
      description: 'Lost my black Dell XPS laptop inside a grey neoprene sleeve with CS stickers.',
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      color: 'Black', brand: 'Dell', location: 'Central Library, 2nd Floor Quiet Study Area',
      date: dateStr(2), approximate_time: '03:30 PM', identifying_details: 'GitHub sticker on lid, ends in -78B', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 2, user_id: 3, type: 'found', title: 'Black Dell Laptop in sleeve', category: 'Electronics',
      description: 'Found a dark Dell laptop on table 14 near the stacks in the Library Block.',
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      color: 'Black', brand: 'Dell', location: 'Library Block, Table 14 near stacks',
      date: dateStr(2), approximate_time: '04:15 PM', identifying_details: 'Programming decals, handed to help desk', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 3, user_id: 5, type: 'lost', title: 'Apple AirPods Pro 2nd Gen', category: 'Electronics',
      description: 'Lost my white Apple AirPods Pro case with earbuds inside during orientation.',
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      color: 'White', brand: 'Apple', location: 'Main Auditorium, Row J',
      date: dateStr(3), approximate_time: '11:15 AM', identifying_details: 'Silicone case with tiny carabiner', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 4, user_id: 4, type: 'found', title: 'White Wireless Earbuds with charging case', category: 'Electronics',
      description: 'Found white Apple wireless earphones under seat 22 after seminar.',
      image_url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
      color: 'White', brand: 'Apple', location: 'Auditorium Hall, Seat 22',
      date: dateStr(3), approximate_time: '01:00 PM', identifying_details: 'Small silver clip on case', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 5, user_id: 6, type: 'lost', title: 'Navy Blue Hydro Flask Water Bottle', category: 'Water Bottles',
      description: 'Lost my insulated stainless steel navy blue 32oz bottle during practice.',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      color: 'Blue', brand: 'Hydro Flask', location: 'Campus Gym / Fitness Center',
      date: dateStr(1), approximate_time: '06:00 PM', identifying_details: 'Small dent on bottom rim', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 6, user_id: 3, type: 'found', title: 'Blue Metal Water Bottle', category: 'Water Bottles',
      description: 'Found a blue insulated drinking flask on bleachers near court.',
      image_url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&auto=format&fit=crop&q=80',
      color: 'Blue', brand: 'Hydro Flask', location: 'Sports Complex / Indoor Court',
      date: dateStr(1), approximate_time: '07:15 PM', identifying_details: 'Stickers on one side', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 7, user_id: 2, type: 'lost', title: 'College Student ID Card - Alex Rivers', category: 'IDs & Cards',
      description: 'Lost my official RFID student identity smart card during lunch.',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      color: 'White', brand: 'Campus ID', location: 'Main Canteen / Food Court',
      date: dateStr(4), approximate_time: '01:45 PM', identifying_details: 'Red lanyard, ends in 8841', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 8, user_id: 5, type: 'found', title: 'Student Smart ID Card with Red Lanyard', category: 'IDs & Cards',
      description: 'Found an engineering student ID badge on stairs leading to Main Block.',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      color: 'White', brand: 'Campus ID', location: 'Main Block, Canteen Pathway',
      date: dateStr(4), approximate_time: '02:30 PM', identifying_details: 'Engineering student photo', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 9, user_id: 6, type: 'lost', title: 'Casio FX-991EX Scientific Calculator', category: 'Books & Stationery',
      description: 'Left my black Casio ClassWiz calculator in exam hall after calculus test.',
      image_url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=600&auto=format&fit=crop&q=80',
      color: 'Black', brand: 'Casio', location: 'Science Block, Room 302',
      date: dateStr(5), approximate_time: '12:00 PM', identifying_details: 'M.P. scratched inside battery cover', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 10, user_id: 4, type: 'found', title: 'Set of Dorm Keys with Green Lanyard', category: 'Keys',
      description: 'Found 3 brass keys on green campus lanyard on the bench outside union.',
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      color: 'Green', brand: 'MasterLock', location: 'Student Union Plaza',
      date: dateStr(6), approximate_time: '05:00 PM', identifying_details: 'One key marked D-204', status: 'active',
      created_at: now.toISOString()
    },
    {
      id: 11, user_id: 5, type: 'lost', title: 'North Face Surge Backpack - Black', category: 'Bags & Wallets',
      description: 'Black backpack with laptop compartment left near charging station.',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      color: 'Black', brand: 'The North Face', location: 'Computer Centre, Ground Floor Lounge',
      date: dateStr(10), approximate_time: '02:00 PM', identifying_details: 'Economics syllabus binder inside', status: 'recovered',
      created_at: now.toISOString()
    },
    {
      id: 12, user_id: 3, type: 'found', title: 'Tortoise Shell Prescription Eyeglasses', category: 'Clothing & Accessories',
      description: 'Found designer optical glasses in brown leather case on reading table.',
      image_url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f68?w=600&auto=format&fit=crop&q=80',
      color: 'Brown', brand: 'Ray-Ban', location: 'Central Library, 1st Floor',
      date: dateStr(7), approximate_time: '10:30 AM', identifying_details: 'Case stamped with optical clinic name', status: 'active',
      created_at: now.toISOString()
    }
  ];

  const messages = [
    {
      id: 1, sender_id: 2, receiver_id: 3, item_id: 1,
      message: 'Hi Priya! I saw the smart match for the Dell laptop found in Library Block. Does it have a Python sticker?',
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), read_status: 1
    },
    {
      id: 2, sender_id: 3, receiver_id: 2, item_id: 1,
      message: 'Yes, it definitely does! I handed it directly to the Central Library 1st floor information desk so it stays safe.',
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), read_status: 1
    },
    {
      id: 3, sender_id: 2, receiver_id: 3, item_id: 1,
      message: 'That is amazing, thank you so much! Heading to the library desk now with my student ID to claim it.',
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), read_status: 0
    }
  ];

  const reports = [
    {
      id: 1, reporter_id: 5, item_id: 12, reason: 'Possible duplicate listing',
      details: 'Looks like someone might have posted this item twice under different categories.',
      status: 'pending', created_at: now.toISOString()
    }
  ];

  return { users, items, messages, reports };
}

function loadStorage() {
  const stored = localStorage.getItem('campus_db_v1');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.items)) {
        return parsed;
      }
    } catch (e) {}
  }
  const seed = getInitialSeed();
  saveStorage(seed);
  return seed;
}

function saveStorage(data) {
  try {
    localStorage.setItem('campus_db_v1', JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

function getAuthUser(headers) {
  let auth = '';
  if (headers) {
    if (typeof headers.get === 'function') {
      auth = headers.get('Authorization') || headers.get('authorization') || '';
    } else {
      auth = headers.Authorization || headers.authorization || '';
    }
  }
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  const db = loadStorage();
  try {
    const payload = JSON.parse(atob(token));
    return db.users.find(u => u.id === payload.id) || null;
  } catch (e) {
    return null;
  }
}

function maskUser(user) {
  if (!user) return null;
  const parts = user.name.split(' ');
  const maskedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : user.name;
  const maskedId = user.college_id ? `${user.college_id.slice(0, 3)}****${user.college_id.slice(-2)}` : 'ID-PROTECTED';
  return {
    id: user.id,
    name: maskedName,
    maskedCollegeId: maskedId,
    role: user.role,
    department: user.department || 'Campus Member'
  };
}

// Router & Fetch Interceptor for Client Mock API
export function initClientMockApi() {
  if (typeof window === 'undefined') return;

  const isStaticHost = 
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.protocol === 'file:' ||
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

  const fetchFn = window.fetch || globalThis.fetch;
  const originalFetch = fetchFn ? fetchFn.bind(window || globalThis) : null;

  window.fetch = async (url, options = {}) => {
    const urlStr = typeof url === 'string' ? url : (url?.url || '');

    // Intercept all /api calls
    if (urlStr.startsWith('/api') || urlStr.startsWith('api/') || urlStr.includes('/api/')) {
      if (isStaticHost) {
        return handleMockRequest(urlStr, options);
      }

      // If running locally, try the real backend first
      try {
        const response = await originalFetch(url, options);
        const contentType = response.headers.get('content-type') || '';
        // If local backend returned 404 HTML instead of JSON, fall back to mock engine
        if (!response.ok && contentType.includes('text/html')) {
          console.warn('[MockApi] Backend returned HTML for API request. Falling back to in-browser engine.');
          return handleMockRequest(urlStr, options);
        }
        return response;
      } catch (err) {
        console.warn('[MockApi] Local backend unreachable. Falling back to in-browser engine.');
        return handleMockRequest(urlStr, options);
      }
    }

    return originalFetch(url, options);
  };

  console.log('[CampusFinder] In-browser API engine active and ready.');
}

async function handleMockRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const db = loadStorage();
  const currentUser = getAuthUser(options.headers);
  const parsedUrl = new URL(url, window.location.origin || 'http://localhost');
  const path = parsedUrl.pathname.replace(/^\/api/, '');
  const searchParams = parsedUrl.searchParams;

  let body = {};
  let imageFile = null;

  if (options.body) {
    if (typeof options.body === 'string') {
      try { body = JSON.parse(options.body); } catch (e) {}
    } else if (options.body instanceof FormData) {
      for (const [key, val] of options.body.entries()) {
        if (key === 'image' && val instanceof File && val.size > 0) {
          imageFile = val;
        } else {
          body[key] = val;
        }
      }
    }
  }

  const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // 1. Health
  if (path === '/health') {
    return jsonResponse({ status: 'ok', system: 'CampusFinder Client Engine', version: '1.0.0-browser-engine' });
  }

  // 2. Auth Login
  if (path === '/auth/login' && method === 'POST') {
    const { identifier, password } = body;
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      return jsonResponse({ error: 'Please enter your email or Student/Staff ID' }, 400);
    }

    const user = db.users.find(u => 
      u.email.toLowerCase() === cleanId.toLowerCase() ||
      u.college_id.toUpperCase() === cleanId.toUpperCase()
    );

    if (!user) return jsonResponse({ error: 'Invalid college email or Student/Staff ID' }, 401);

    if (user.status === 'suspended') {
      return jsonResponse({ error: 'Account suspended. Please contact campus security.' }, 403);
    }

    // Check password if set on user, or allow standard demo password
    if (user.password && password && user.password !== password && password !== 'College@123') {
      return jsonResponse({ error: 'Incorrect password. Please verify and try again.' }, 401);
    }

    const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    return jsonResponse({ message: 'Logged in successfully', token, user });
  }

  // 3. Auth Register
  if (path === '/auth/register' && method === 'POST') {
    const { name, email, college_id, password, role, department, phone } = body;
    if (!name || !email || !college_id || !password) {
      return jsonResponse({ error: 'Please fill in all required fields (Name, Email, ID, Password)' }, 400);
    }
    if (password.length < 6) {
      return jsonResponse({ error: 'Password must be at least 6 characters' }, 400);
    }
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return jsonResponse({ error: 'An account with this college email already exists' }, 400);
    }
    if (db.users.some(u => u.college_id.toUpperCase() === college_id.toUpperCase().trim())) {
      return jsonResponse({ error: 'An account with this Student/Staff ID already exists' }, 400);
    }
    const newUser = {
      id: db.users.length + 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      college_id: college_id.trim().toUpperCase(),
      role: role || 'student',
      department: department?.trim() || 'Campus Member',
      phone: phone?.trim() || '',
      password: password,
      status: 'active'
    };
    db.users.push(newUser);
    saveStorage(db);
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }));
    return jsonResponse({ message: 'Account registered successfully', token, user: newUser }, 201);
  }

  // 4. Auth Me
  if (path === '/auth/me') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const unread = (db.messages || []).filter(m => m.receiver_id === currentUser.id && m.read_status === 0).length;
    const lostCount = db.items.filter(i => i.user_id === currentUser.id && i.type === 'lost').length;
    const foundCount = db.items.filter(i => i.user_id === currentUser.id && i.type === 'found').length;
    const recoveredCount = db.items.filter(i => i.user_id === currentUser.id && ['recovered', 'returned'].includes(i.status)).length;
    return jsonResponse({
      user: currentUser,
      unreadMessagesCount: unread,
      stats: { lost: lostCount, found: foundCount, recovered: recoveredCount }
    });
  }

  // 5. Items List & Filter
  if (path === '/items' && method === 'GET') {
    let result = [...db.items];
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const status = searchParams.get('status') || 'active';
    const q = searchParams.get('q');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = searchParams.get('sort') || 'newest';
    const limit = searchParams.get('limit');

    if (type && type !== 'all') result = result.filter(i => i.type === type.toLowerCase());
    if (status && status !== 'all') result = result.filter(i => i.status === status);
    if (category && category !== 'All') result = result.filter(i => i.category.toLowerCase() === category.toLowerCase());
    if (location && location !== 'All') result = result.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
    if (dateFrom) result = result.filter(i => i.date >= dateFrom);
    if (dateTo) result = result.filter(i => i.date <= dateTo);
    if (q) {
      const term = q.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        (i.brand && i.brand.toLowerCase().includes(term)) ||
        (i.color && i.color.toLowerCase().includes(term)) ||
        i.location.toLowerCase().includes(term)
      );
    }

    if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at));
    } else if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    }

    let enhanced = result.map(i => {
      const reporterUser = db.users.find(u => u.id === i.user_id);
      const oppositeItems = db.items.filter(o => o.type !== i.type && o.status === 'active');
      const matches = findMatches(i, oppositeItems, 55);
      return {
        ...i,
        reporter: maskUser(reporterUser),
        potentialMatchesCount: matches.length
      };
    });

    if (sort === 'matches') {
      enhanced.sort((a, b) => b.potentialMatchesCount - a.potentialMatchesCount);
    }

    if (limit) {
      enhanced = enhanced.slice(0, parseInt(limit));
    }

    return jsonResponse({ items: enhanced });
  }

  // 6. My Items
  if (path === '/items/my/all') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const myItems = db.items.filter(i => i.user_id === currentUser.id).map(i => {
      const oppositeItems = db.items.filter(o => o.type !== i.type && o.status === 'active');
      const matches = findMatches(i, oppositeItems, 55);
      return { ...i, potentialMatchesCount: matches.length };
    });
    return jsonResponse({ items: myItems });
  }

  // 7. Single Item Detail & Smart Matches
  const singleItemMatch = path.match(/^\/items\/(\d+)$/);
  if (singleItemMatch && method === 'GET') {
    const id = parseInt(singleItemMatch[1]);
    const item = db.items.find(i => i.id === id);
    if (!item) return jsonResponse({ error: 'Item not found' }, 404);

    const reporterUser = db.users.find(u => u.id === item.user_id);
    const oppositeItems = db.items.filter(o => o.type !== item.type && o.status === 'active');
    const rawMatches = findMatches(item, oppositeItems, 50);

    const matchesFormatted = rawMatches.map(m => {
      const matchedReporter = db.users.find(u => u.id === m.matchedItem.user_id);
      return {
        matchedItem: { ...m.matchedItem, reporter: maskUser(matchedReporter) },
        score: m.score,
        reasons: m.reasons,
        breakdown: m.breakdown
      };
    });

    const isOwner = currentUser?.id === item.user_id;
    const isAdmin = currentUser?.role === 'admin';

    return jsonResponse({
      item: { ...item, reporter: isOwner || isAdmin ? reporterUser : maskUser(reporterUser) },
      matches: matchesFormatted,
      isOwner,
      isAdmin
    });
  }

  // 8. Create Item
  if (path === '/items' && method === 'POST') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const now = new Date().toISOString();

    let imageUrl = null;
    if (imageFile) {
      try {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(imageFile);
        });
      } catch (e) {
        console.warn('Image conversion fallback', e);
      }
    }

    if (!imageUrl) {
      const categoryPhotos = {
        'Electronics': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
        'Keys': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
        'IDs & Cards': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        'Water Bottles': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
        'Bags & Wallets': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        'Books & Stationery': 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=600&auto=format&fit=crop&q=80',
        'Clothing & Accessories': 'https://images.unsplash.com/photo-1591076482161-42ce6da69f68?w=600&auto=format&fit=crop&q=80'
      };
      imageUrl = categoryPhotos[body.category] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
    }

    const newItem = {
      id: db.items.length + 1,
      user_id: currentUser.id,
      type: body.type,
      title: body.title,
      category: body.category,
      description: body.description,
      color: body.color || '',
      brand: body.brand || '',
      location: body.location,
      date: body.date,
      approximate_time: body.approximate_time || '',
      identifying_details: body.identifying_details || '',
      image_url: imageUrl,
      status: 'active',
      created_at: now
    };
    db.items.unshift(newItem);
    saveStorage(db);

    const oppositeItems = db.items.filter(o => o.type !== newItem.type && o.status === 'active');
    const matches = findMatches(newItem, oppositeItems, 55);

    return jsonResponse({
      message: `${newItem.type} report created successfully!`,
      item: newItem,
      matchesFoundCount: matches.length,
      matches: matches.slice(0, 3)
    }, 201);
  }

  // 9. Update Status
  const statusMatch = path.match(/^\/items\/(\d+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const id = parseInt(statusMatch[1]);
    const item = db.items.find(i => i.id === id);
    if (!item) return jsonResponse({ error: 'Item not found' }, 404);
    item.status = body.status;
    saveStorage(db);
    return jsonResponse({ message: `Item marked as ${body.status}`, status: body.status });
  }

  // 10. Delete Item
  if (singleItemMatch && method === 'DELETE') {
    const id = parseInt(singleItemMatch[1]);
    db.items = db.items.filter(i => i.id !== id);
    db.reports = (db.reports || []).filter(r => r.item_id !== id);
    saveStorage(db);
    return jsonResponse({ message: 'Item deleted successfully' });
  }

  // 11. Flag/Report an Item
  const reportItemMatch = path.match(/^\/items\/(\d+)\/report$/);
  if (reportItemMatch && method === 'POST') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const itemId = parseInt(reportItemMatch[1]);
    const item = db.items.find(i => i.id === itemId);
    if (!item) return jsonResponse({ error: 'Item not found' }, 404);

    const newReport = {
      id: ((db.reports || []).length) + 1,
      reporter_id: currentUser.id,
      item_id: itemId,
      reason: body.reason || 'Flagged for moderation',
      details: body.details || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.reports = db.reports || [];
    db.reports.push(newReport);
    saveStorage(db);
    return jsonResponse({ message: 'Report submitted to campus administration for review' }, 201);
  }

  // 12. Live Match Preview
  if (path === '/matches/preview' && method === 'POST') {
    const oppositeType = body.type === 'lost' ? 'found' : 'lost';
    const candidates = db.items.filter(i => i.type === oppositeType && i.status === 'active');
    const matches = findMatches({ ...body, id: 0 }, candidates, 55);
    return jsonResponse({
      matches: matches.slice(0, 4).map(m => ({
        matchedItem: m.matchedItem,
        score: m.score,
        reasons: m.reasons,
        breakdown: m.breakdown
      }))
    });
  }

  // 13. Matches list
  if (path === '/matches') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const myItems = db.items.filter(i => i.user_id === currentUser.id && i.status === 'active');
    const oppositeItems = db.items.filter(i => i.user_id !== currentUser.id && i.status === 'active');
    const allMatches = [];
    for (const item of myItems) {
      const found = findMatches(item, oppositeItems, 55);
      for (const f of found) {
        allMatches.push({
          id: allMatches.length + 1,
          lost_item_id: item.type === 'lost' ? item.id : f.matchedItem.id,
          found_item_id: item.type === 'found' ? item.id : f.matchedItem.id,
          match_score: f.score,
          reasons: f.reasons,
          breakdown: f.breakdown,
          created_at: new Date().toISOString(),
          lostItem: item.type === 'lost' ? item : f.matchedItem,
          foundItem: item.type === 'found' ? item : f.matchedItem
        });
      }
    }
    return jsonResponse({ matches: allMatches });
  }

  // 14. Messages Conversations
  if (path === '/messages/conversations') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const map = new Map();
    const relevant = (db.messages || []).filter(m => m.sender_id === currentUser.id || m.receiver_id === currentUser.id);

    for (const msg of relevant) {
      const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
      const otherUser = db.users.find(u => u.id === otherId);
      const item = db.items.find(i => i.id === msg.item_id);
      const key = `${otherId}_${msg.item_id || 0}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          otherUser: maskUser(otherUser),
          itemId: msg.item_id,
          item,
          lastMessage: msg.message,
          lastMessageAt: msg.created_at,
          unreadCount: 0
        });
      }
      const c = map.get(key);
      c.lastMessage = msg.message;
      c.lastMessageAt = msg.created_at;
      if (msg.receiver_id === currentUser.id && msg.read_status === 0) c.unreadCount++;
    }
    return jsonResponse({ conversations: Array.from(map.values()) });
  }

  // 15. Message Thread
  const threadMatch = path.match(/^\/messages\/thread\/(\d+)\/(\d+)$/);
  if (threadMatch) {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const otherId = parseInt(threadMatch[1]);
    const itemId = parseInt(threadMatch[2]) || null;

    const msgs = (db.messages || []).filter(m => 
      ((m.sender_id === currentUser.id && m.receiver_id === otherId) ||
       (m.sender_id === otherId && m.receiver_id === currentUser.id)) &&
      (!itemId || m.item_id === itemId)
    );

    // mark read
    msgs.forEach(m => {
      if (m.receiver_id === currentUser.id) m.read_status = 1;
    });
    saveStorage(db);

    const other = db.users.find(u => u.id === otherId);
    const it = itemId ? db.items.find(i => i.id === itemId) : null;
    return jsonResponse({ messages: msgs, otherUser: maskUser(other), item: it });
  }

  // 16. Send Message
  if (path === '/messages' && method === 'POST') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const newMsg = {
      id: ((db.messages || []).length) + 1,
      sender_id: currentUser.id,
      receiver_id: parseInt(body.receiver_id),
      item_id: body.item_id ? parseInt(body.item_id) : null,
      message: body.message,
      created_at: new Date().toISOString(),
      read_status: 0
    };
    db.messages = db.messages || [];
    db.messages.push(newMsg);
    saveStorage(db);
    return jsonResponse({ message: 'Message sent successfully', data: newMsg }, 201);
  }

  // 17. Admin Stats
  if (path === '/admin/stats') {
    const totalLost = db.items.filter(i => i.type === 'lost').length;
    const totalFound = db.items.filter(i => i.type === 'found').length;
    const totalRecovered = db.items.filter(i => ['recovered', 'returned'].includes(i.status)).length;
    const totalActive = db.items.filter(i => i.status === 'active').length;

    const catMap = {};
    db.items.forEach(i => { catMap[i.category] = (catMap[i.category] || 0) + 1; });
    const categories = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    const locMap = {};
    db.items.forEach(i => { locMap[i.location] = (locMap[i.location] || 0) + 1; });
    const locations = Object.entries(locMap).map(([location, count]) => ({ location, count })).slice(0, 6);

    return jsonResponse({
      summary: {
        totalUsers: db.users.length,
        totalLost,
        totalFound,
        totalReports: db.items.length,
        totalRecovered,
        totalActive,
        totalMatches: 6,
        totalFlagged: (db.reports || []).filter(r => r.status === 'pending').length,
        recoveryRate: db.items.length > 0 ? Math.round((totalRecovered / db.items.length) * 100) : 0
      },
      categories,
      locations,
      recentReports: db.items.slice(0, 8)
    });
  }

  // 18. Admin Items
  if (path === '/admin/items' && method === 'GET') {
    const enhanced = db.items.map(i => {
      const u = db.users.find(user => user.id === i.user_id) || {};
      return {
        ...i,
        user_name: u.name,
        user_email: u.email,
        user_college_id: u.college_id,
        user_role: u.role,
        flag_count: (db.reports || []).filter(r => r.item_id === i.id && r.status === 'pending').length
      };
    });
    return jsonResponse({ items: enhanced });
  }

  // 19. Admin Item Status Update
  const adminItemStatusMatch = path.match(/^\/admin\/items\/(\d+)\/status$/);
  if (adminItemStatusMatch && method === 'PATCH') {
    if (!currentUser || currentUser.role !== 'admin') return jsonResponse({ error: 'Admin access required' }, 403);
    const itemId = parseInt(adminItemStatusMatch[1]);
    const item = db.items.find(i => i.id === itemId);
    if (!item) return jsonResponse({ error: 'Item not found' }, 404);
    item.status = body.status;
    saveStorage(db);
    return jsonResponse({ message: `Item marked as ${body.status}`, status: body.status });
  }

  // 20. Admin Item Delete
  const adminItemDeleteMatch = path.match(/^\/admin\/items\/(\d+)$/);
  if (adminItemDeleteMatch && method === 'DELETE') {
    if (!currentUser || currentUser.role !== 'admin') return jsonResponse({ error: 'Admin access required' }, 403);
    const itemId = parseInt(adminItemDeleteMatch[1]);
    db.items = db.items.filter(i => i.id !== itemId);
    db.reports = (db.reports || []).filter(r => r.item_id !== itemId);
    saveStorage(db);
    return jsonResponse({ message: 'Item deleted successfully' });
  }

  // 21. Admin Users
  if (path === '/admin/users' && method === 'GET') {
    const enhanced = db.users.map(u => ({
      ...u,
      lost_count: db.items.filter(i => i.user_id === u.id && i.type === 'lost').length,
      found_count: db.items.filter(i => i.user_id === u.id && i.type === 'found').length
    }));
    return jsonResponse({ users: enhanced });
  }

  // 22. Admin User Status Update
  const adminUserStatusMatch = path.match(/^\/admin\/users\/(\d+)$/);
  if (adminUserStatusMatch && method === 'PATCH') {
    if (!currentUser || currentUser.role !== 'admin') return jsonResponse({ error: 'Admin access required' }, 403);
    const userId = parseInt(adminUserStatusMatch[1]);
    const u = db.users.find(user => user.id === userId);
    if (!u) return jsonResponse({ error: 'User not found' }, 404);
    u.status = body.status;
    saveStorage(db);
    return jsonResponse({ message: `User status changed to ${body.status}`, user: u });
  }

  // 23. Admin Reports (Flagged queue)
  if (path === '/admin/reports' && method === 'GET') {
    const enhanced = (db.reports || []).map(r => {
      const rep = db.users.find(u => u.id === r.reporter_id) || {};
      const it = db.items.find(i => i.id === r.item_id) || {};
      const owner = db.users.find(u => u.id === it.user_id) || {};
      return {
        ...r,
        reporter_name: rep.name,
        reporter_college_id: rep.college_id,
        item_title: it.title,
        owner_name: owner.name,
        owner_college_id: owner.college_id
      };
    });
    return jsonResponse({ reports: enhanced });
  }

  // 24. Admin Resolve Report
  const adminReportResolveMatch = path.match(/^\/admin\/reports\/(\d+)\/resolve$/);
  if (adminReportResolveMatch && method === 'PATCH') {
    if (!currentUser || currentUser.role !== 'admin') return jsonResponse({ error: 'Admin access required' }, 403);
    const reportId = parseInt(adminReportResolveMatch[1]);
    const rep = (db.reports || []).find(r => r.id === reportId);
    if (!rep) return jsonResponse({ error: 'Report not found' }, 404);
    rep.status = body.action === 'dismiss' ? 'dismissed' : 'resolved';
    if (body.action === 'remove_item') {
      db.items = db.items.filter(i => i.id !== rep.item_id);
    }
    saveStorage(db);
    return jsonResponse({ message: 'Report resolved', report: rep });
  }

  // 25. Reseed Demo Data
  if (path === '/seed' && method === 'POST') {
    const fresh = getInitialSeed();
    saveStorage(fresh);
    return jsonResponse({ message: 'Demo data reset successfully!' });
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}
