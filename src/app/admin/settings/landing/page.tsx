import { getSettings } from '@/app/actions/admin-settings.actions';
import LandingSettingsClient from './LandingSettingsClient';

export const metadata = {
  title: 'Landing Page Settings | Admin Dashboard',
};

export default async function AdminLandingSettingsPage() {
  const settings = await getSettings();

  // Apply default features if empty
  if (!settings['landing_features']) {
    settings['landing_features'] = JSON.stringify([
      { title: 'MCQ Question Bank', desc: 'CS ভিত্তিক পূর্ণাঙ্গ MCQ সেট — প্রতিটি Unit-এর জন্য' },
      { title: 'Written Question Bank', desc: 'গুরুত্বপূর্ণ লিখিত প্রশ্ন ও সাজেশন' },
      { title: 'উত্তর ও ব্যাখ্যা', desc: 'প্রতিটি প্রশ্নের সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা' },
      { title: 'Model Assessment', desc: 'রিয়েল-টাইম মডেল পরীক্ষা — নিজেকে মূল্যায়ন করুন' },
      { title: 'Instant Result', desc: 'পরীক্ষা শেষে সাথে সাথেই স্বয়ংক্রিয় ফলাফল' },
      { title: 'Progress Dashboard', desc: 'দুর্বলতা চিহ্নিত করুন — উন্নতি ট্র্যাক করুন' }
    ]);
  }

  // Apply default FAQs if empty
  if (!settings['landing_faqs']) {
    settings['landing_faqs'] = JSON.stringify([
      { q: 'সব প্রশ্ন কি রিয়েল অ্যাসেসমেন্ট থেকে নেওয়া?', a: 'আমাদের প্রশ্নব্যাংক CS, UoC, অ্যাসেসমেন্ট প্যাটার্ন এবং এক্সপার্ট ট্রেইনারদের মতামতের ভিত্তিতে তৈরি। এগুলো শতভাগ রিয়েল না হলেও অ্যাসেসমেন্ট পাসের জন্য যথেষ্ট প্রস্তুতি দেয়।' },
      { q: 'এখানে কি প্র্যাকটিক্যাল ট্রেনিং করানো হয়?', a: 'না। AssessmentBD শুধুমাত্র Written ও MCQ প্রস্তুতির জন্য একটি ডিজিটাল প্ল্যাটফর্ম। কোনো প্র্যাকটিক্যাল ট্রেনিং প্রদান করা হয় না।' },
      { q: 'যেকোনো ডিভাইস থেকে ব্যবহার করা যাবে?', a: 'হ্যাঁ, যেকোনো স্মার্টফোন, ট্যাবলেট বা কম্পিউটার থেকে লগইন করে প্র্যাকটিস করা যাবে।' },
      { q: '৫০% মানি-ব্যাক গ্যারান্টি কীভাবে কাজ করে?', a: 'Pro প্ল্যান নিয়ে ফাইনাল অ্যাসেসমেন্টে NYC হলে শর্তসাপেক্ষে ৫০% ক্যাশব্যাক পাবেন। বিস্তারিত আমাদের Refund Policy পেজে আছে।' },
      { q: 'পেমেন্ট করার পর কখন Access পাবো?', a: 'Online Gateway দিয়ে পেমেন্ট করলে সাথে সাথে। bKash/Nagad-এ করলে Admin Verify করার পর — সাধারণত ৩০ মিনিট থেকে কয়েক ঘণ্টার মধ্যে।' }
    ]);
  }

  // Apply default reviews if empty
  if (!settings['landing_reviews']) {
    settings['landing_reviews'] = JSON.stringify([
      { quote: 'এখানে রেগুলার পরীক্ষা দিয়ে আমার কনফিডেন্স অনেক বেড়েছে। প্রশ্নগুলো সত্যিই স্ট্যান্ডার্ড।', name: 'মো. রাহাত হোসেন', role: 'Level 3 Trainee — Computer Operation' },
      { quote: 'ফাইনাল অ্যাসেসমেন্টের আগে মডেল টেস্ট দিয়ে নিজের ভুলগুলো ধরতে পেরেছিলাম। প্রথমবারেই পাস করলাম।', name: 'তাসলিমা বেগম', role: 'Level 4 Trainee — Graphic Design' },
      { quote: 'লিখিত প্রশ্নের উত্তর ও ব্যাখ্যাগুলো খুব সুন্দর সাজানো। আমি প্রথমবারেই Competent হয়েছি।', name: 'জুবায়ের আহমেদ', role: 'Level 3 Trainee — Electrical Installation' }
    ]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sd-ph">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1>Landing Page Settings</h1>
            <p>Customize the conversion-focused landing page elements</p>
          </div>
          <a href="/admin/settings" className="btn-outline shrink-0">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Settings
          </a>
        </div>
      </div>

      <LandingSettingsClient initialSettings={settings} />
    </div>
  );
}
