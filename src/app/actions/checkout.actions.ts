'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { Decimal } from '@prisma/client/runtime/library';

// Helper to send BulkSMSBD SMS
async function sendSms(mobile: string, message: string, type: 'otp' | 'notification' | 'reminder' = 'notification') {
  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.value) settingsMap[s.key] = s.value;
  }

  const apiKey = settingsMap['sms_api_key'] || '';
  const senderId = settingsMap['sms_sender_id'] || 'NSDA';

  if (!apiKey) {
    console.warn('SMS NOT SENT: API key not configured.');
    await prisma.sms_logs.create({
      data: {
        mobile,
        message,
        type,
        status: 'failed',
        api_response: 'API key not configured in settings.'
      }
    });
    return { status: 'failed', error: 'API key not configured' };
  }

  try {
    const url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(mobile)}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(message)}`;
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(10000) });
    const responseBody = await res.text();

    const status = (
      responseBody.includes('1000') ||
      responseBody.includes('202') ||
      responseBody.toLowerCase().includes('success')
    ) ? 'sent' : 'failed';

    await prisma.sms_logs.create({
      data: {
        mobile,
        message,
        type,
        status,
        api_response: responseBody
      }
    });

    return { status };
  } catch (error: any) {
    console.error('SMS send error:', error);
    await prisma.sms_logs.create({
      data: {
        mobile,
        message,
        type,
        status: 'failed',
        api_response: `Connection error: ${error.message || error}`
      }
    });
    return { status: 'failed', error: error.message || error };
  }
}

// Trigger referral credit when first purchase is completed
async function creditReferrer(referredUser: any, settingsMap: Record<string, string>) {
  if (settingsMap['referral_enabled'] !== '1') return;

  const referralCode = referredUser.referred_by;
  if (!referralCode) return;

  const referrer = await prisma.users.findUnique({
    where: { referral_code: referralCode }
  });
  if (!referrer) return;

  // Check if referral transaction already exists
  const alreadyCredited = await prisma.referrals.findFirst({
    where: { referred_id: referredUser.id }
  });
  if (alreadyCredited) return;

  const bonus = parseFloat(settingsMap['referral_reward_amount'] || '0');
  if (bonus <= 0) return;

  await prisma.$transaction(async (tx) => {
    // Create referral credit entry
    const referral = await tx.referrals.create({
      data: {
        referrer_id: referrer.id,
        referred_id: referredUser.id,
        bonus_amount: new Decimal(bonus),
        status: 'credited',
        credited_at: new Date()
      }
    });

    // Increment referrer wallet
    await tx.users.update({
      where: { id: referrer.id },
      data: { wallet_balance: { increment: bonus } }
    });

    // Create wallet transaction
    await tx.wallet_transactions.create({
      data: {
        user_id: referrer.id,
        amount: new Decimal(bonus),
        type: 'credit',
        source: 'referral',
        description: `Referral bonus for inviting ${referredUser.name}`,
        reference_id: referral.id
      }
    });
  });

  const smsText = `অভিনন্দন! আপনার রেফার করা ইউজার সাবস্ক্রিপশন কেনায় আপনি ${bonus} টাকা বোনাস পেয়েছেন। - AssessmentBD`;
  await sendSms(referrer.mobile || '', smsText, 'notification');
}

// Validate Coupon helper
async function validateCoupon(code: string, userId: bigint, courseId: bigint, plan: string, settingsMap: Record<string, string>) {
  if (settingsMap['coupon_enabled'] !== '1') {
    return { coupon: null, error: 'কুপন সুবিধাটি বর্তমানে নিষ্ক্রিয় রয়েছে।' };
  }

  const coupon = await prisma.coupons.findUnique({
    where: { code: code.toUpperCase().trim() }
  });

  if (!coupon || !coupon.is_active) {
    return { coupon: null, error: 'কুপন কোডটি সঠিক নয়।' };
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { coupon: null, error: 'এই কুপনটির মেয়াদ শেষ হয়ে গেছে।' };
  }

  // Check maximum usage limits
  const pendingCount = await prisma.subscriptions.count({
    where: { coupon_code: coupon.code, status: 'pending' }
  });
  if (coupon.max_uses > 0 && (coupon.used_count + pendingCount) >= coupon.max_uses) {
    return { coupon: null, error: 'এই কুপনটির ব্যবহারের সীমা অতিক্রম করেছে।' };
  }

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return { coupon: null, error: 'ইউজার পাওয়া যায়নি।' };

  // First purchase checking
  if (coupon.first_purchase_only && user.first_purchase_done) {
    return { coupon: null, error: 'এই কুপনটি শুধুমাত্র প্রথমবার কেনাকাটার জন্য প্রযোজ্য।' };
  }

  // Course restriction
  if (coupon.course_id && coupon.course_id !== courseId) {
    return { coupon: null, error: 'এই কুপনটি এই কোর্সের জন্য প্রযোজ্য নয়।' };
  }

  // Plan restriction
  if (coupon.plan_restriction !== 'all' && coupon.plan_restriction !== plan) {
    return { coupon: null, error: `এই কুপনটি শুধুমাত্র ${coupon.plan_restriction} প্ল্যানের জন্য প্রযোজ্য।` };
  }

  // Max uses per user
  if (coupon.max_uses_per_user > 0) {
    const userUsage = await prisma.subscriptions.count({
      where: {
        user_id: userId,
        coupon_code: coupon.code,
        status: { in: ['active', 'expired', 'pending'] }
      }
    });
    if (userUsage >= coupon.max_uses_per_user) {
      return { coupon: null, error: 'আপনি ইতিমধ্যে এই কুপনটি সর্বোচ্চ সংখ্যক বার ব্যবহার করেছেন।' };
    }
  }

  return { coupon, error: null };
}

// Action to check coupon validation asynchronously for user UI feedback
export async function validateCouponAction(code: string, courseId: string, plan: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { success: false, error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
  }

  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.value) settingsMap[s.key] = s.value;
  }

  const result = await validateCoupon(
    code,
    BigInt(session.userId),
    BigInt(courseId),
    plan,
    settingsMap
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    discount_type: result.coupon?.discount_type,
    discount_value: result.coupon?.discount_value.toString()
  };
}

export async function checkoutAction(prevState: any, formData: FormData) {
  const session = await getSession();
  
  const courseIdRaw = formData.get('course_id') as string;
  const plan = formData.get('plan') as string; // 'basic' | 'pro'
  const paymentMethod = formData.get('payment_method') as string; // 'bkash' | 'nagad' | 'wallet' | 'manual'
  const senderNumber = formData.get('sender_number') as string;
  const couponCodeRaw = formData.get('coupon_code') as string;

  if (!courseIdRaw) {
    return { error: 'অনুগ্রহ করে একটি Occupation সিলেক্ট করুন।' };
  }
  if (!plan || !['basic', 'pro'].includes(plan)) {
    return { error: 'সঠিক প্ল্যান সিলেক্ট করুন।' };
  }
  if (!paymentMethod || !['bkash', 'nagad', 'wallet', 'manual'].includes(paymentMethod)) {
    return { error: 'পেমেন্ট পদ্ধতি সিলেক্ট করুন।' };
  }
  if (['bkash', 'nagad', 'manual'].includes(paymentMethod) && !senderNumber) {
    return { error: 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা দেওয়া আবশ্যক।' };
  }

  const courseId = BigInt(courseIdRaw);

  try {
    const course = await prisma.courses.findUnique({
      where: { id: courseId, is_active: true }
    });
    if (!course) {
      return { error: 'সিলেক্টকৃত Occupation টি পাওয়া যায়নি অথবা নিষ্ক্রিয় আছে।' };
    }

    // Verify course has questions
    const mcqCount = await prisma.questions.count({
      where: { course_id: course.id, question_type: 'mcq' }
    });
    const writtenCount = await prisma.unit_written_qas.count({
      where: {
        course_units: {
          course_id: course.id,
          is_active: true
        }
      }
    });

    if (mcqCount === 0 && writtenCount === 0) {
      return { error: 'এই কোর্সে এখনো কোনো প্রশ্ন যোগ করা হয়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।' };
    }

    let user: any = null;

    if (session && session.userId) {
      user = await prisma.users.findUnique({
        where: { id: BigInt(session.userId) }
      });
    } else {
      // Guest Registration
      const name = formData.get('name') as string;
      const mobile = formData.get('mobile') as string;
      const password = formData.get('password') as string;

      if (!name || !mobile || !password) {
        return { error: 'নাম, মোবাইল নম্বর এবং পাসওয়ার্ড দেওয়া আবশ্যক।' };
      }
      if (!/^01[3-9]\d{8}$/.test(mobile)) {
        return { error: 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' };
      }
      if (password.length < 6) {
        return { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
      }

      const existingUser = await prisma.users.findUnique({
        where: { mobile }
      });

      if (existingUser) {
        // Verify password to prevent hijacking
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
          return { error: 'এই মোবাইল নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট আছে, কিন্তু পাসওয়ার্ড ভুল। সঠিক পাসওয়ার্ড দিন।' };
        }
        user = existingUser;
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Generate unique referral code
        let referralCode = '';
        let codeExists = true;
        while (codeExists) {
          referralCode = Math.floor(10000000 + Math.random() * 90000000).toString();
          const checkCode = await prisma.users.findUnique({ where: { referral_code: referralCode } });
          if (!checkCode) codeExists = false;
        }

        user = await prisma.users.create({
          data: {
            name,
            mobile,
            password: hashedPassword,
            referral_code: referralCode,
            is_active: true,
            is_verified: false,
            wallet_balance: new Decimal(0),
            first_purchase_done: false,
            is_admin: false,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // Automatically log the guest user in
      await createSession(user.id.toString(), 'student');
    }

    if (!user) {
      return { error: 'ইউজার প্রসেস করতে ত্রুটি হয়েছে।' };
    }

    // Check if already subscribed to this course
    const activeSub = await prisma.subscriptions.findFirst({
      where: {
        user_id: user.id,
        course_id: course.id,
        status: 'active',
        expires_at: { gt: new Date() }
      }
    });
    if (activeSub) {
      return { redirect: '/user/my-courses', message: 'আপনি ইতোমধ্যে এই কোর্সে সাবস্ক্রাইব করেছেন।' };
    }

    // Delete any previous abandoned gateway subscription requests to clean up
    await prisma.subscriptions.deleteMany({
      where: {
        user_id: user.id,
        course_id: course.id,
        status: 'pending_gateway'
      }
    });

    // Check for existing pending manual payments
    const pendingSub = await prisma.subscriptions.findFirst({
      where: {
        user_id: user.id,
        course_id: course.id,
        status: 'pending'
      }
    });
    if (pendingSub) {
      return { error: 'আপনার একটি ম্যানুয়াল payment ইতোমধ্যে প্রক্রিয়াধীন আছে। অনুমোদনের জন্য অপেক্ষা করুন।' };
    }

    // Get settings
    const settings = await prisma.settings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      if (s.value) settingsMap[s.key] = s.value;
    }

    if (paymentMethod === 'wallet' && settingsMap['referral_reward_usable_for'] === 'withdraw') {
      return { error: 'Wallet balance শুধুমাত্র উত্তোলন করা যাবে, এটি কোনো কোর্স কেনার জন্য ব্যবহার করা যাবে না।' };
    }

    const basicPrice = parseFloat(settingsMap['basic_plan_price'] || '99');
    const proPrice = parseFloat(settingsMap['pro_plan_price'] || '299');
    const basePrice = plan === 'pro' ? proPrice : basicPrice;

    // Pricing calculation
    let referralDiscount = 0;
    let couponDiscount = 0;
    let couponApplied: any = null;

    // 1. Referral Discount
    if (!user.first_purchase_done && user.referred_by && settingsMap['referral_enabled'] === '1') {
      const discountType = settingsMap['referral_discount_type'] || 'flat';
      const discountVal = parseFloat(settingsMap['referral_discount_value'] || '0');
      if (discountVal > 0) {
        referralDiscount = discountType === 'percent'
          ? Math.round(basePrice * discountVal / 100)
          : Math.min(discountVal, basePrice);
      }
    }

    // 2. Coupon Discount
    if (couponCodeRaw && settingsMap['coupon_enabled'] === '1') {
      const cRes = await validateCoupon(couponCodeRaw, user.id, course.id, plan, settingsMap);
      if (cRes.coupon) {
        const c = cRes.coupon;
        const discountVal = parseFloat(c.discount_value.toString());
        couponDiscount = c.discount_type === 'percent'
          ? Math.round(basePrice * discountVal / 100)
          : Math.min(discountVal, basePrice);

        // Stack with referral?
        if (settingsMap['coupon_stack_referral'] !== '1') {
          if (couponDiscount >= referralDiscount) {
            referralDiscount = 0;
          } else {
            couponDiscount = 0;
          }
        }
        if (couponDiscount > 0) {
          couponApplied = c;
        }
      } else {
        return { error: cRes.error };
      }
    }

    const totalDiscount = Math.min(referralDiscount + couponDiscount, basePrice);
    const finalPrice = Math.max(0, basePrice - totalDiscount);

    const subData = {
      plan: plan as 'basic' | 'pro',
      amount_paid: new Decimal(finalPrice),
      discount_applied: new Decimal(totalDiscount),
      coupon_code: couponApplied ? couponApplied.code : null,
      payment_method: paymentMethod as any,
      transaction_id: senderNumber ? `Num: ${senderNumber}` : ''
    };

    // Wallet transaction pathway
    if (paymentMethod === 'wallet') {
      const userBalance = parseFloat(user.wallet_balance.toString());
      if (userBalance < finalPrice) {
        return { error: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।' };
      }

      await prisma.$transaction(async (tx) => {
        // Find previous active sub to archive
        const prevActive = await tx.subscriptions.findFirst({
          where: { user_id: user.id, course_id: course.id, status: 'active' },
          orderBy: { expires_at: 'desc' }
        });

        let startsAt = new Date();
        let expiresAt = new Date();
        const days = plan === 'pro' ? 90 : 30;

        if (prevActive) {
          startsAt = prevActive.starts_at || new Date();
          const oldExpires = prevActive.expires_at ? new Date(prevActive.expires_at) : new Date();
          const isFuture = oldExpires > new Date();

          if (plan === 'pro' && prevActive.plan === 'basic') {
            expiresAt = isFuture 
              ? new Date(oldExpires.getTime() + 60 * 24 * 60 * 60 * 1000)
              : new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000);
          } else {
            expiresAt = isFuture 
              ? new Date(oldExpires.getTime() + days * 24 * 60 * 60 * 1000)
              : new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
          }

          // Expire previous subscription
          await tx.subscriptions.update({
            where: { id: prevActive.id },
            data: { status: 'expired' }
          });
        } else {
          expiresAt = new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
        }

        // Create active subscription
        const sub = await tx.subscriptions.create({
          data: {
            user_id: user.id,
            course_id: course.id,
            plan: subData.plan,
            amount_paid: subData.amount_paid,
            discount_applied: subData.discount_applied,
            coupon_code: subData.coupon_code,
            payment_method: 'wallet',
            transaction_id: 'Wallet Payment',
            status: 'active',
            starts_at: startsAt,
            expires_at: expiresAt,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Deduct from wallet
        await tx.users.update({
          where: { id: user.id },
          data: { wallet_balance: { decrement: finalPrice } }
        });

        // Create transaction log
        await tx.wallet_transactions.create({
          data: {
            user_id: user.id,
            amount: new Decimal(finalPrice),
            type: 'debit',
            source: 'payment',
            description: 'Course subscription payment',
            reference_id: sub.id
          }
        });

        // Increment coupon count
        if (subData.coupon_code) {
          await tx.coupons.update({
            where: { code: subData.coupon_code },
            data: { used_count: { increment: 1 } }
          });
        }
      });

      // Mark first purchase and credit referrer
      const updatedUser = await prisma.users.findUnique({ where: { id: user.id } });
      if (updatedUser && !updatedUser.first_purchase_done) {
        await prisma.users.update({
          where: { id: user.id },
          data: { first_purchase_done: true }
        });
        await creditReferrer(updatedUser, settingsMap);
      }

      return { redirect: '/user/my-courses', message: 'অর্ডার সফল হয়েছে! আপনার ওয়ালেট পেমেন্টের মাধ্যমে কোর্সটি সক্রিয় করা হয়েছে!' };
    }

    // Manual payments pathway
    await prisma.subscriptions.create({
      data: {
        user_id: user.id,
        course_id: course.id,
        plan: subData.plan,
        amount_paid: subData.amount_paid,
        discount_applied: subData.discount_applied,
        coupon_code: subData.coupon_code,
        payment_method: subData.payment_method,
        transaction_id: subData.transaction_id,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return { redirect: '/user/subscription-history', message: 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে। Payment ভেরিফাই করে দ্রুত কোর্সটি অ্যাক্টিভেট করা হবে!' };

  } catch (err: any) {
    console.error('Checkout error:', err);
    return { error: 'পেমেন্ট প্রসেস করার সময় একটি অনাকাঙ্ক্ষিত ত্রুটি হয়েছে।' };
  }
}
