const bcrypt = require('bcryptjs');
const db = require('./db');
const { calculateMatch } = require('./services/smartMatchService');

async function seed() {
  console.log('🌱 Initializing database and seeding realistic college data...');
  await db.initDb();

  // Clean existing data for clean demo state
  db.exec(`
    DELETE FROM reports;
    DELETE FROM messages;
    DELETE FROM matches;
    DELETE FROM items;
    DELETE FROM users;
  `);

  // 1. Create Users
  const passwordHash = await bcrypt.hash('College@123', 10);
  const now = new Date();
  const dateStr = (offsetDays = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().slice(0, 10);
  };

  const users = [
    {
      name: 'Campus Safety & Admin',
      email: 'admin@college.edu',
      college_id: 'ADM-2024-001',
      role: 'admin',
      department: 'Campus Security & Student Affairs',
      phone: '+1 (555) 019-2834'
    },
    {
      name: 'Alex Rivers',
      email: 'alex.rivers@college.edu',
      college_id: 'STU-2024-8841',
      role: 'student',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 014-9921'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      college_id: 'STU-2024-6729',
      role: 'student',
      department: 'Electrical Engineering',
      phone: '+1 (555) 018-7744'
    },
    {
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@college.edu',
      college_id: 'STF-2021-042',
      role: 'staff',
      department: 'Department of Physics & Materials Science',
      phone: '+1 (555) 011-3312'
    },
    {
      name: 'David Chen',
      email: 'david.chen@college.edu',
      college_id: 'STU-2025-1109',
      role: 'student',
      department: 'Business Administration',
      phone: '+1 (555) 017-8823'
    },
    {
      name: 'Maya Patel',
      email: 'maya.patel@college.edu',
      college_id: 'STU-2024-4412',
      role: 'student',
      department: 'Biotechnology',
      phone: '+1 (555) 012-4491'
    }
  ];

  const userIds = {};
  for (const u of users) {
    const res = db.run(
      `INSERT INTO users (name, email, college_id, password_hash, role, department, phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [u.name, u.email, u.college_id, passwordHash, u.role, u.department, u.phone, now.toISOString()]
    );
    userIds[u.email] = res.lastInsertRowid;
  }
  console.log(`✅ Created ${users.length} users with password: 'College@123'`);

  // 2. Realistic College Items
  const sampleItems = [
    // PAIR 1: Dell Laptop (Expected high match ~90%+)
    {
      user_id: userIds['alex.rivers@college.edu'],
      type: 'lost',
      title: 'Black Dell XPS 15 Laptop',
      category: 'Electronics',
      description: 'Lost my black Dell XPS laptop inside a grey neoprene sleeve. Has university CS sticker on the top cover.',
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      color: 'Black',
      brand: 'Dell',
      location: 'Central Library, 2nd Floor Quiet Study Area',
      date: dateStr(2),
      approximate_time: '03:30 PM',
      identifying_details: 'GitHub Octocat sticker on the lid and Python sticker on the palm rest. Service tag ends in -78B.',
      status: 'active'
    },
    {
      user_id: userIds['priya.sharma@college.edu'],
      type: 'found',
      title: 'Black Dell Laptop in sleeve',
      category: 'Electronics',
      description: 'Found a dark Dell laptop left behind on table 14 near the computer stacks in the Library Block.',
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      color: 'Black',
      brand: 'Dell',
      location: 'Library Block, Table 14 near stacks',
      date: dateStr(2),
      approximate_time: '04:15 PM',
      identifying_details: 'Has programming decals on the top lid. Handed over to the 1st floor help desk.',
      status: 'active'
    },

    // PAIR 2: AirPods / Wireless Earbuds (High match ~85%+)
    {
      user_id: userIds['david.chen@college.edu'],
      type: 'lost',
      title: 'Apple AirPods Pro 2nd Gen',
      category: 'Electronics',
      description: 'Lost my white Apple AirPods Pro case with earbuds inside during the freshman orientation lecture.',
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      color: 'White',
      brand: 'Apple',
      location: 'Main Auditorium, Row J',
      date: dateStr(3),
      approximate_time: '11:15 AM',
      identifying_details: 'Matte translucent silicone case with a tiny metal carabiner attached.',
      status: 'active'
    },
    {
      user_id: userIds['marcus.vance@college.edu'],
      type: 'found',
      title: 'White Wireless Earbuds with charging case',
      category: 'Electronics',
      description: 'Found white Apple wireless earphones under seat 22 after the physics department seminar.',
      image_url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
      color: 'White',
      brand: 'Apple',
      location: 'Auditorium Hall, Seat 22',
      date: dateStr(3),
      approximate_time: '01:00 PM',
      identifying_details: 'Case has a small silver clip. Safely kept in Physics faculty office room 210.',
      status: 'active'
    },

    // PAIR 3: Blue Water Bottle (Gym / Sports Complex match ~80%+)
    {
      user_id: userIds['maya.patel@college.edu'],
      type: 'lost',
      title: 'Navy Blue Hydro Flask Water Bottle',
      category: 'Water Bottles',
      description: 'Lost my insulated stainless steel navy blue 32oz water bottle during basketball practice.',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      color: 'Blue',
      brand: 'Hydro Flask',
      location: 'Campus Gym / Fitness Center',
      date: dateStr(1),
      approximate_time: '06:00 PM',
      identifying_details: 'Has a small dent on the bottom rim and National Park sticker.',
      status: 'active'
    },
    {
      user_id: userIds['priya.sharma@college.edu'],
      type: 'found',
      title: 'Blue Metal Water Bottle',
      category: 'Water Bottles',
      description: 'Found a blue insulated drinking flask on the bleachers near the badminton courts.',
      image_url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&auto=format&fit=crop&q=80',
      color: 'Blue',
      brand: 'Hydro Flask',
      location: 'Sports Complex / Indoor Court',
      date: dateStr(1),
      approximate_time: '07:15 PM',
      identifying_details: 'Stickers on one side, black lid with flexible strap.',
      status: 'active'
    },

    // PAIR 4: Student ID Card (Canteen / Main Block match ~78%+)
    {
      user_id: userIds['alex.rivers@college.edu'],
      type: 'lost',
      title: 'College Student ID Card - Alex Rivers',
      category: 'IDs & Cards',
      description: 'Lost my official RFID college identity smart card during lunch hours.',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      color: 'White',
      brand: 'Campus ID',
      location: 'Main Canteen / Food Court',
      date: dateStr(4),
      approximate_time: '01:45 PM',
      identifying_details: 'Red lanyard with university crest. Student ID number ends in 8841.',
      status: 'active'
    },
    {
      user_id: userIds['david.chen@college.edu'],
      type: 'found',
      title: 'Student Smart ID Card with Red Lanyard',
      category: 'IDs & Cards',
      description: 'Found an engineering student ID badge on the stairs leading to Main Block Canteen walkway.',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      color: 'White',
      brand: 'Campus ID',
      location: 'Main Block, Canteen Pathway',
      date: dateStr(4),
      approximate_time: '02:30 PM',
      identifying_details: 'Engineering student photo, red college lanyard.',
      status: 'active'
    },

    // ADDITIONAL ITEMS: Calculator, Keys, Backpack, Glasses
    {
      user_id: userIds['maya.patel@college.edu'],
      type: 'lost',
      title: 'Casio FX-991EX Scientific Calculator',
      category: 'Books & Stationery',
      description: 'Left my black Casio ClassWiz calculator in the exam hall right after the calculus test.',
      image_url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=600&auto=format&fit=crop&q=80',
      color: 'Black',
      brand: 'Casio',
      location: 'Science Block, Room 302',
      date: dateStr(5),
      approximate_time: '12:00 PM',
      identifying_details: 'Initial "M.P." scratched faintly on the inside battery cover.',
      status: 'active'
    },
    {
      user_id: userIds['marcus.vance@college.edu'],
      type: 'found',
      title: 'Set of Dorm Keys with Green Lanyard',
      category: 'Keys',
      description: 'Found 3 brass keys on a green campus lanyard on the bench outside the student union building.',
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      color: 'Green',
      brand: 'MasterLock',
      location: 'Student Union Plaza',
      date: dateStr(6),
      approximate_time: '05:00 PM',
      identifying_details: 'One key is marked "D-204" in black marker.',
      status: 'active'
    },
    {
      user_id: userIds['david.chen@college.edu'],
      type: 'lost',
      title: 'North Face Surge Backpack - Black',
      category: 'Bags & Wallets',
      description: 'Black backpack with laptop compartment accidentally left near the charging stations.',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      color: 'Black',
      brand: 'The North Face',
      location: 'Computer Centre, Ground Floor Lounge',
      date: dateStr(10),
      approximate_time: '02:00 PM',
      identifying_details: 'Contains notebook and economics course syllabus binder.',
      status: 'recovered'
    },
    {
      user_id: userIds['priya.sharma@college.edu'],
      type: 'found',
      title: 'Tortoise Shell Prescription Eyeglasses',
      category: 'Clothing & Accessories',
      description: 'Found designer optical glasses in a brown leather magnetic case on the reading table.',
      image_url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f68?w=600&auto=format&fit=crop&q=80',
      color: 'Brown',
      brand: 'Ray-Ban',
      location: 'Central Library, 1st Floor Newspaper Section',
      date: dateStr(7),
      approximate_time: '10:30 AM',
      identifying_details: 'Case stamped with optical clinic name.',
      status: 'active'
    }
  ];

  const itemIds = [];
  for (const item of sampleItems) {
    const res = db.run(
      `INSERT INTO items (
        user_id, type, title, category, description, image_url,
        color, brand, location, date, approximate_time, identifying_details,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.user_id,
        item.type,
        item.title,
        item.category,
        item.description,
        item.image_url,
        item.color,
        item.brand,
        item.location,
        item.date,
        item.approximate_time,
        item.identifying_details,
        item.status,
        now.toISOString(),
        now.toISOString()
      ]
    );
    itemIds.push(res.lastInsertRowid);
  }
  console.log(`✅ Created ${sampleItems.length} realistic lost & found reports`);

  // 3. Compute and Insert Initial Matches
  const allLost = db.query('SELECT * FROM items WHERE type = "lost"');
  const allFound = db.query('SELECT * FROM items WHERE type = "found"');

  let matchCount = 0;
  for (const lost of allLost) {
    for (const found of allFound) {
      const match = calculateMatch(lost, found);
      if (match.score >= 50) {
        db.run(
          `INSERT INTO matches (lost_item_id, found_item_id, match_score, match_reason, status, created_at)
           VALUES (?, ?, ?, ?, 'potential', ?)`,
          [
            lost.id,
            found.id,
            match.score,
            JSON.stringify({ reasons: match.reasons, breakdown: match.breakdown }),
            now.toISOString()
          ]
        );
        matchCount++;
      }
    }
  }
  console.log(`✅ Calculated and recorded ${matchCount} smart matches`);

  // 4. Sample In-App Messages (Alex Rivers inquiring Priya Sharma regarding the Dell laptop)
  const laptopLost = db.get('SELECT id FROM items WHERE title LIKE "%Dell XPS%"');
  if (laptopLost) {
    const msgTime1 = new Date(now.getTime() - 3600000 * 5).toISOString();
    const msgTime2 = new Date(now.getTime() - 3600000 * 4).toISOString();
    const msgTime3 = new Date(now.getTime() - 3600000 * 2).toISOString();

    db.run(
      `INSERT INTO messages (sender_id, receiver_id, item_id, message, created_at, read_status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        userIds['alex.rivers@college.edu'],
        userIds['priya.sharma@college.edu'],
        laptopLost.id,
        'Hi! I saw the smart match for the Dell laptop found in Library Block. Does it have a Python sticker on the palm rest?',
        msgTime1
      ]
    );

    db.run(
      `INSERT INTO messages (sender_id, receiver_id, item_id, message, created_at, read_status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        userIds['priya.sharma@college.edu'],
        userIds['alex.rivers@college.edu'],
        laptopLost.id,
        'Yes, it definitely does! I handed it directly to the Central Library 1st floor information desk so it stays safe.',
        msgTime2
      ]
    );

    db.run(
      `INSERT INTO messages (sender_id, receiver_id, item_id, message, created_at, read_status)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [
        userIds['alex.rivers@college.edu'],
        userIds['priya.sharma@college.edu'],
        laptopLost.id,
        'That is amazing, thank you so much! Heading to the library desk now with my student ID to claim it.',
        msgTime3
      ]
    );
    console.log('✅ Seeded message thread between student reporter and finder');
  }

  // 5. Sample Flagged Report for Admin Moderation
  const glassesFound = db.get('SELECT id FROM items WHERE title LIKE "%Eyeglasses%"');
  if (glassesFound) {
    db.run(
      `INSERT INTO reports (reporter_id, item_id, reason, details, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [
        userIds['david.chen@college.edu'],
        glassesFound.id,
        'Possible duplicate listing',
        'Looks like someone might have posted this item twice under different categories.',
        now.toISOString()
      ]
    );
    console.log('✅ Seeded 1 flagged report for administrator review queue');
  }

  console.log('🎉 Database seeding completed successfully!');
}

if (require.main === module) {
  seed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
