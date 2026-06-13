'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getStudentDashboardData() {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, mobile: true, wallet_balance: true, avatar: true, referral_code: true }
  });

  // Active subscriptions with course units & exams for progress calculation
  const activeSubscriptions = await prisma.subscriptions.findMany({
    where: { user_id: userId, status: 'active', expires_at: { gt: new Date() } },
    include: {
      courses: {
        select: {
          id: true, title: true, slug: true, thumbnail: true, category: true,
          course_units: {
            where: { is_active: true },
            include: { exams: { where: { is_active: true }, select: { id: true } } }
          },
          exams: { where: { is_active: true }, select: { id: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  // Recent completed exam attempts
  const recentAttempts = await prisma.exam_attempts.findMany({
    where: { user_id: userId, status: 'completed' },
    include: { exams: { select: { id: true, title: true, course_id: true } } },
    orderBy: { completed_at: 'desc' },
    take: 5
  });

  // Attempt aggregates per exam (for progress)
  const attemptAgg = await prisma.exam_attempts.groupBy({
    by: ['exam_id'],
    where: { user_id: userId, status: 'completed' },
    _count: { id: true },
    _max: { percentage: true }
  });

  const attemptCounts: Record<string, { cnt: number; best: number }> = {};
  for (const a of attemptAgg) {
    attemptCounts[a.exam_id.toString()] = {
      cnt: a._count.id,
      best: Number(a._max.percentage ?? 0)
    };
  }

  // Pending subscriptions count
  const pendingCount = await prisma.subscriptions.count({
    where: { user_id: userId, status: { in: ['pending', 'pending_gateway'] } }
  });

  // Referral count
  const referralCount = await prisma.referrals.count({
    where: { referrer_id: userId }
  });

  // Calculate overall progress across all active courses
  let totalUnitsAcross = 0;
  let masteredUnitsAcross = 0;

  for (const sub of activeSubscriptions) {
    const units = sub.courses?.course_units ?? [];
    const courseExams = sub.courses?.exams ?? [];
    const useExamsAsUnits = units.length === 0 && courseExams.length > 0;
    const totalUnits = useExamsAsUnits ? courseExams.length : units.length;
    totalUnitsAcross += totalUnits;

    if (useExamsAsUnits) {
      for (const exam of courseExams) {
        const agg = attemptCounts[exam.id.toString()];
        if (agg && Math.round(agg.best) >= 100) masteredUnitsAcross++;
      }
    } else {
      for (const unit of units) {
        let unitBest = 0;
        let unitCnt = 0;
        for (const exam of unit.exams) {
          const agg = attemptCounts[exam.id.toString()];
          if (agg) {
            unitBest = Math.max(unitBest, agg.best);
            unitCnt += agg.cnt;
          }
        }
        if (unitCnt > 0 && Math.round(unitBest) >= 100) masteredUnitsAcross++;
      }
    }
  }

  const overallProgress = totalUnitsAcross > 0
    ? Math.round((masteredUnitsAcross / totalUnitsAcross) * 100)
    : 0;

  return serializeData({
    user,
    activeSubscriptions,
    recentAttempts,
    attemptCounts,
    pendingCount,
    referralCount,
    overallProgress,
    stats: {
      enrolledCourses: activeSubscriptions.length,
      examsTaken: recentAttempts.length,
      walletBalance: user?.wallet_balance || 0
    }
  });
}

export async function getMyCourses() {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);

  const subscriptions = await prisma.subscriptions.findMany({
    where: { user_id: userId },
    include: {
      courses: {
        select: {
          id: true, title: true, slug: true, thumbnail: true, level: true, category: true,
          course_units: {
            where: { is_active: true },
            include: { exams: { where: { is_active: true }, select: { id: true } } }
          },
          exams: { where: { is_active: true }, select: { id: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  // Deduplicate by course_id, preferring active
  const seen = new Set<string>();
  const unique = subscriptions.filter(s => {
    const key = s.course_id.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Attempt aggregates for progress
  const attemptAgg = await prisma.exam_attempts.groupBy({
    by: ['exam_id'],
    where: { user_id: userId, status: 'completed' },
    _count: { id: true },
    _max: { percentage: true }
  });

  const attemptCounts: Record<string, { cnt: number; best: number }> = {};
  for (const a of attemptAgg) {
    attemptCounts[a.exam_id.toString()] = {
      cnt: a._count.id,
      best: Number(a._max.percentage ?? 0)
    };
  }

  return serializeData({ subscriptions: unique, attemptCounts });
}

export async function getSubscriptionHistory() {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);

  const subscriptions = await prisma.subscriptions.findMany({
    where: { user_id: userId },
    include: { courses: { select: { id: true, title: true, level: true } } },
    orderBy: { created_at: 'desc' }
  });

  return serializeData(subscriptions);
}

export async function getReferralData() {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { referral_code: true, wallet_balance: true }
  });

  const referrals = await prisma.referrals.findMany({
    where: { referrer_id: userId },
    include: {
      users_referrals_referred_idTousers: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  const totalEarned = referrals
    .filter(r => r.status === 'credited')
    .reduce((sum, r) => sum + Number(r.bonus_amount), 0);

  const pendingCount = referrals.filter(r => r.status !== 'credited').length;

  // Referral settings from DB
  const settingsRaw = await prisma.settings.findMany({
    where: {
      key: { in: ['referral_enabled', 'referral_reward_amount', 'referral_discount_type', 'referral_discount_value', 'referral_reward_usable_for'] }
    }
  });
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRaw) settingsMap[s.key] = s.value ?? '';

  const settings = {
    enabled: (settingsMap['referral_enabled'] ?? '1') === '1',
    reward_amount: parseFloat(settingsMap['referral_reward_amount'] ?? '0'),
    discount_type: settingsMap['referral_discount_type'] ?? 'flat',
    discount_value: parseFloat(settingsMap['referral_discount_value'] ?? '0'),
    usable_for: settingsMap['referral_reward_usable_for'] ?? 'both',
  };

  return serializeData({ user, referrals, totalEarned, pendingCount, settings });
}
