const mysql = require('mysql2/promise');
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient({
  log: ['error'],
});

async function main() {
  console.log('Connecting to MySQL legacy database...');
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'assessmentbd_legacy',
  });
  console.log('Connected to MySQL successfully.');

  try {
    // 1. SETTINGS
    console.log('--- Migrating Settings ---');
    let [settings] = [];
    try { [settings] = await connection.execute('SELECT * FROM settings'); } catch {}
    for (const s of settings) {
      await prisma.settings.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, created_at: s.created_at, updated_at: s.updated_at }
      });
    }
    console.log(`Migrated ${settings.length} settings.`);

    // 2. USERS
    console.log('--- Migrating Users ---');
    let [users] = [];
    try { [users] = await connection.execute('SELECT * FROM users'); } catch {}
    let userCount = 0;
    for (const u of users) {
      const existingUser = await prisma.users.findFirst({ where: { mobile: u.mobile } });
      if (!existingUser) {
        await prisma.users.create({
          data: {
            id: BigInt(u.id),
            name: u.name,
            mobile: u.mobile,
            password: u.password,
            is_active: Boolean(u.is_active ?? 1),
            is_admin: Boolean(u.is_admin ?? 0),
            admin_role: u.admin_role || null,
            wallet_balance: u.wallet_balance || 0,
            created_at: u.created_at || new Date(),
            updated_at: u.updated_at || new Date()
          }
        });
        userCount++;
      }
    }
    console.log(`Migrated ${userCount} new users.`);

    // 3. COURSES
    console.log('--- Migrating Courses ---');
    let [courses] = [];
    try { [courses] = await connection.execute('SELECT * FROM courses'); } catch {}
    let courseCount = 0;
    for (const c of courses) {
      const existingCourse = await prisma.courses.findFirst({ where: { slug: c.slug } });
      if (!existingCourse) {
        await prisma.courses.create({
          data: {
            id: BigInt(c.id),
            title: c.title,
            slug: c.slug,
            description: c.description || '',
            thumbnail: c.thumbnail || c.image_url || null,
            price: Number(c.price || 0),
            discount_price: c.discount_price ? Number(c.discount_price) : null,
            is_active: Boolean(c.is_active ?? 1),
            level: c.level || 'all',
            category: c.category || 'general',
            sector: c.sector || null,
            sort_order: Number(c.sort_order || 0),
            created_at: c.created_at || new Date(),
            updated_at: c.updated_at || new Date()
          }
        });
        courseCount++;
      }
    }
    console.log(`Migrated ${courseCount} new courses.`);

    // 4. COURSE UNITS
    console.log('--- Migrating Course Units ---');
    let units = [];
    try { [units] = await connection.execute('SELECT * FROM course_units'); } 
    catch { try { [units] = await connection.execute('SELECT * FROM units'); } catch { console.log("No units table found"); } }
    
    let unitCount = 0;
    for (const u of units) {
      const existingCourse = await prisma.courses.findUnique({ where: { id: BigInt(u.course_id) } });
      if (existingCourse) {
        await prisma.course_units.upsert({
          where: { id: BigInt(u.id) },
          update: {
            title: u.title,
            description: u.description || null,
            type: u.type || 'text',
            video_url: u.video_url || null,
            sort_order: Number(u.sort_order || 0),
            is_active: Boolean(u.is_active ?? 1),
          },
          create: {
            id: BigInt(u.id),
            course_id: BigInt(u.course_id),
            title: u.title,
            description: u.description || null,
            type: u.type || 'text',
            video_url: u.video_url || null,
            sort_order: Number(u.sort_order || 0),
            is_active: Boolean(u.is_active ?? 1),
            created_at: u.created_at || new Date(),
            updated_at: u.updated_at || new Date()
          }
        });
        unitCount++;
      }
    }
    console.log(`Migrated ${unitCount} units.`);

    // 5. EXAMS
    console.log('--- Migrating Exams ---');
    let [exams] = [];
    try { [exams] = await connection.execute('SELECT * FROM exams'); } catch {}
    let examCount = 0;
    for (const e of exams) {
      const existingCourse = await prisma.courses.findUnique({ where: { id: BigInt(e.course_id) } });
      if (existingCourse) {
        await prisma.exams.upsert({
          where: { id: BigInt(e.id) },
          update: {
            title: e.title,
            description: e.description || null,
            duration_minutes: Number(e.duration_minutes || 0),
            total_marks: Number(e.total_marks || 0),
            pass_marks: Number(e.pass_marks || 0),
            is_active: Boolean(e.is_active ?? 1),
            course_unit_id: e.course_unit_id ? BigInt(e.course_unit_id) : null
          },
          create: {
            id: BigInt(e.id),
            course_id: BigInt(e.course_id),
            course_unit_id: e.course_unit_id ? BigInt(e.course_unit_id) : null,
            title: e.title,
            description: e.description || null,
            duration_minutes: Number(e.duration_minutes || 0),
            total_marks: Number(e.total_marks || 0),
            pass_marks: Number(e.pass_marks || 0),
            is_active: Boolean(e.is_active ?? 1),
            created_at: e.created_at || new Date(),
            updated_at: e.updated_at || new Date()
          }
        });
        examCount++;
      }
    }
    console.log(`Migrated ${examCount} exams.`);

    // 6. QUESTIONS
    console.log('--- Migrating Questions ---');
    let [questions] = [];
    try { [questions] = await connection.execute('SELECT * FROM questions'); } catch {}
    let qCount = 0;
    for (const q of questions) {
      const existingExam = await prisma.exams.findUnique({ where: { id: BigInt(q.exam_id) } });
      if (existingExam) {
        await prisma.questions.upsert({
          where: { id: BigInt(q.id) },
          update: {
            question_text: q.question_text,
            question_type: q.question_type || 'mcq',
            marks: Number(q.marks || 1),
          },
          create: {
            id: BigInt(q.id),
            exam_id: BigInt(q.exam_id),
            question_text: q.question_text,
            question_type: q.question_type || 'mcq',
            marks: Number(q.marks || 1),
            created_at: q.created_at || new Date(),
            updated_at: q.updated_at || new Date()
          }
        });
        qCount++;
      }
    }
    console.log(`Migrated ${qCount} questions.`);

    // 7. QUESTION OPTIONS
    console.log('--- Migrating Question Options ---');
    let [options] = [];
    try { [options] = await connection.execute('SELECT * FROM question_options'); } catch {}
    let optCount = 0;
    for (const o of options) {
      const existingQuestion = await prisma.questions.findUnique({ where: { id: BigInt(o.question_id) } });
      if (existingQuestion) {
        await prisma.question_options.upsert({
          where: { id: BigInt(o.id) },
          update: {
            option_text: o.option_text,
            is_correct: Boolean(o.is_correct ?? 0),
          },
          create: {
            id: BigInt(o.id),
            question_id: BigInt(o.question_id),
            option_text: o.option_text,
            is_correct: Boolean(o.is_correct ?? 0),
          }
        });
        optCount++;
      }
    }
    console.log(`Migrated ${optCount} question options.`);

    // 8. SUBSCRIPTIONS
    console.log('--- Migrating Subscriptions ---');
    let [subs] = [];
    try { [subs] = await connection.execute('SELECT * FROM subscriptions'); } catch {}
    let subCount = 0;
    for (const s of subs) {
      const existingUser = await prisma.users.findUnique({ where: { id: BigInt(s.user_id) } });
      const existingCourse = await prisma.courses.findUnique({ where: { id: BigInt(s.course_id) } });
      if (existingUser && existingCourse) {
        await prisma.subscriptions.upsert({
          where: { id: BigInt(s.id) },
          update: {
            status: s.status || 'active',
          },
          create: {
            id: BigInt(s.id),
            user_id: BigInt(s.user_id),
            course_id: BigInt(s.course_id),
            status: s.status || 'active',
            created_at: s.created_at || new Date(),
            updated_at: s.updated_at || new Date()
          }
        });
        subCount++;
      }
    }
    console.log(`Migrated ${subCount} subscriptions.`);

    // 9. EXAM RESULTS
    console.log('--- Migrating Exam Results ---');
    let [results] = [];
    try { [results] = await connection.execute('SELECT * FROM exam_results'); } catch {}
    let resCount = 0;
    for (const r of results) {
      const existingUser = await prisma.users.findUnique({ where: { id: BigInt(r.user_id) } });
      const existingExam = await prisma.exams.findUnique({ where: { id: BigInt(r.exam_id) } });
      if (existingUser && existingExam) {
        
        let answersData = r.answers;
        if (typeof answersData === 'string') {
          try { answersData = JSON.parse(answersData); } catch { answersData = []; }
        }

        await prisma.exam_results.upsert({
          where: { id: BigInt(r.id) },
          update: {
            obtained_marks: Number(r.obtained_marks || 0),
            total_marks: Number(r.total_marks || 0),
            status: r.status || 'Fail',
            answers: answersData || [],
          },
          create: {
            id: BigInt(r.id),
            user_id: BigInt(r.user_id),
            exam_id: BigInt(r.exam_id),
            course_id: r.course_id ? BigInt(r.course_id) : existingExam.course_id,
            obtained_marks: Number(r.obtained_marks || 0),
            total_marks: Number(r.total_marks || 0),
            status: r.status || 'Fail',
            answers: answersData || [],
            created_at: r.created_at || new Date(),
            updated_at: r.updated_at || new Date()
          }
        });
        resCount++;
      }
    }
    console.log(`Migrated ${resCount} exam results.`);

    console.log('✅ All data migrated successfully!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
    await prisma.$disconnect();
  }
}

main();
