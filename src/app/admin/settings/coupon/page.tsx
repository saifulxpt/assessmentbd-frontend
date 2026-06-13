import { getSettings } from '@/app/actions/admin-settings.actions';
import { prisma } from '@/lib/prisma';
import CouponSettingsClient from './CouponSettingsClient';

export const metadata = {
  title: 'Coupon Management | Admin Dashboard',
};

export default async function AdminCouponSettingsPage() {
  const [settings, coupons, courses] = await Promise.all([
    getSettings(),
    prisma.coupons.findMany({
      include: {
        courses: { select: { title: true } }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.courses.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      select: { id: true, title: true }
    })
  ]);

  // Serialize BigInts
  const serializedCoupons = coupons.map((c) => ({
    id: Number(c.id),
    code: c.code,
    discount_type: c.discount_type,
    discount_value: Number(c.discount_value),
    max_uses: c.max_uses,
    max_uses_per_user: c.max_uses_per_user,
    used_count: c.used_count,
    first_purchase_only: c.first_purchase_only,
    expires_at: c.expires_at ? c.expires_at.toISOString() : null,
    is_active: c.is_active,
    course_id: c.course_id ? Number(c.course_id) : null,
    plan_restriction: c.plan_restriction,
    course_title: c.courses?.title || null
  }));

  const serializedCourses = courses.map((c) => ({
    id: Number(c.id),
    title: c.title
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sd-ph">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1>Coupon Management</h1>
            <p>Create coupon codes and configure system settings</p>
          </div>
          <a href="/admin/settings" className="btn-outline shrink-0">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </a>
        </div>
      </div>

      <CouponSettingsClient 
        initialSettings={settings} 
        coupons={serializedCoupons} 
        courses={serializedCourses} 
      />
    </div>
  );
}
