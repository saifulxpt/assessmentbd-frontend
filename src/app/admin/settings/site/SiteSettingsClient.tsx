'use client';

import { useActionState, useState, useEffect } from 'react';
import { saveSettings } from '@/app/actions/admin-settings.actions';

export default function SiteSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(saveSettings, null);
  const [activeTab, setActiveTab] = useState<string>('contact');

  // Success state alert
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Dynamic FAQs State
  const [faqs, setFaqs] = useState<{ section: string; q: string; a: string }[]>(() => {
    if (initialSettings['site_faqs']) {
      try {
        const parsed = JSON.parse(initialSettings['site_faqs']);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [{ section: 'Home', q: '', a: '' }];
  });

  const addFaq = () => {
    setFaqs([...faqs, { section: 'Home', q: '', a: '' }]);
  };

  const removeFaq = (index: number) => {
    const updated = [...faqs];
    updated.splice(index, 1);
    setFaqs(updated);
  };

  const updateFaq = (index: number, key: 'section' | 'q' | 'a', value: string) => {
    const updated = [...faqs];
    updated[index][key] = value;
    setFaqs(updated);
  };

  // Notice Bar State
  const [announcementText, setAnnouncementText] = useState(initialSettings['announcement_text'] || '');
  const [announcementBg, setAnnouncementBg] = useState(initialSettings['announcement_bg'] || '#0b57d0');

  const tabs = [
    { id: 'contact',      icon: 'phone',          label: 'Contact & Social' },
    { id: 'hero',         icon: 'layout-template',label: 'Homepage Hero' },
    { id: 'pricing',      icon: 'tag',            'label': 'Pricing & Skills' },
    { id: 'faq',          icon: 'message-circle', label: 'FAQ' },
    { id: 'seo',          icon: 'search',         label: 'SEO' },
    { id: 'announcement', icon: 'megaphone',      label: 'Notice Bar' },
  ];

  const renderIcon = (name: string) => {
    switch (name) {
      case 'phone':
        return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
      case 'layout-template':
        return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>;
      case 'tag':
        return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 2 10 10-10 10L2 12Z"/><circle cx="12" cy="12" r="1"/></svg>;
      case 'message-circle':
        return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
      case 'search':
        return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
      case 'megaphone':
        return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      {/* Toast Alert */}
      {showToast && (
        <div className="flash-ok">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Site settings saved successfully.</span>
        </div>
      )}

      {state?.error && (
        <div className="flash-err">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{state.error}</span>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] transition-all ${
              activeTab === tab.id 
                ? 'bg-white shadow text-emerald-600 font-bold' 
                : 'text-slate-500 font-semibold hover:text-slate-700'
            }`}
          >
            {renderIcon(tab.icon)}
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction}>
        {/* Hidden FAQ json serialization */}
        <input type="hidden" name="site_faqs" value={JSON.stringify(faqs)} />

        {/* ═══ CONTACT & SOCIAL ═══ */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="sd-card p-6 border-2 border-emerald-200 bg-emerald-50/10">
              <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Which Gmail should receive Contact Form messages?
              </h3>
              <p className="text-[12px] text-slate-500 font-medium mb-4">When a visitor fills out the contact form, a notification will be sent to this Gmail address.</p>
              <input 
                type="email" 
                name="contact_email"
                defaultValue={initialSettings['contact_email'] || ''}
                className="sd-input text-base font-semibold"
                placeholder="yourname@gmail.com"
              />
              <p className="text-[11px] text-amber-600 font-semibold mt-2">⚠️ Just entering a Gmail address is not enough — you must configure Gmail SMTP once under the <strong>API Settings</strong> tab.</p>
            </div>

            <div className="sd-card p-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Site Contact Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Displayed Email (Shows on Website)</label>
                  <input type="email" name="site_email" defaultValue={initialSettings['site_email'] || 'support@nsdaprep.bd'} className="sd-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input type="text" name="site_phone" defaultValue={initialSettings['site_phone'] || '+880 1XXX-XXXXXX'} className="sd-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Service Hours</label>
                  <input type="text" name="site_phone_hours" defaultValue={initialSettings['site_phone_hours'] || '10:00 AM to 8:00 PM'} className="sd-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp Number</label>
                  <input type="text" name="site_whatsapp" defaultValue={initialSettings['site_whatsapp'] || ''} className="sd-input" placeholder="880XXXXXXXXXX" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Address</label>
                  <input type="text" name="site_address" defaultValue={initialSettings['site_address'] || ''} className="sd-input" placeholder="Dhaka, Bangladesh" />
                </div>
              </div>
            </div>

            <div className="sd-card p-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                Payment Number (Shows during Course purchase)
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">bKash Number *</label>
                  <input type="text" name="bkash_number" defaultValue={initialSettings['bkash_number'] || ''} required className="sd-input" placeholder="01XXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">bKash Type</label>
                  <select name="bkash_type" defaultValue={initialSettings['bkash_type'] || 'Send Money'} className="sd-input">
                    <option value="Send Money">Send Money</option>
                    <option value="Payment">Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nagad Number</label>
                  <input type="text" name="nagad_number" defaultValue={initialSettings['nagad_number'] || ''} className="sd-input" placeholder="01XXXXXXXXX (Leave empty to hide)" />
                </div>
              </div>
            </div>

            <div className="sd-card p-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
                Footer Description
              </h3>
              <textarea 
                name="footer_description" 
                rows={2} 
                className="sd-input !h-auto" 
                defaultValue={initialSettings['footer_description'] || 'The most modern and effective practice platform in Bangladesh for NSDA level assessment exams.'} 
              />
            </div>

            <div className="sd-card p-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Social Media Links
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <input type="url" name="social_facebook" defaultValue={initialSettings['social_facebook'] || ''} className="sd-input" placeholder="https://facebook.com/nsdaprep" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                  </div>
                  <input type="url" name="social_youtube" defaultValue={initialSettings['social_youtube'] || ''} className="sd-input" placeholder="https://youtube.com/@nsdaprep" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  </div>
                  <input type="url" name="social_linkedin" defaultValue={initialSettings['social_linkedin'] || ''} className="sd-input" placeholder="https://linkedin.com/company/nsdaprep" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ HERO ═══ */}
        {activeTab === 'hero' && (
          <div className="sd-card p-6 space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>
              Homepage Hero Section
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Badge Text (small badge above headline)</label>
              <input type="text" name="hero_badge" defaultValue={initialSettings['hero_badge'] || '#1 NSDA Assessment Tools in BD'} className="sd-input" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Main Heading</label>
              <input type="text" name="hero_heading" defaultValue={initialSettings['hero_heading'] || 'Make your NSDA assessment preparation smarter'} className="sd-input" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subtext / Description</label>
              <textarea name="hero_subtext" rows={2} className="sd-input !h-auto" defaultValue={initialSettings['hero_subtext'] || "Bangladesh's first complete skill development practice platform featuring hundreds of NSDA level assessment questions, live mock tests, and real-time analytics."} />
            </div>
          </div>
        )}

        {/* ═══ PRICING & SKILLS ═══ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="sd-card p-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                Subscription Plan Pricing
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">These two values will be used everywhere (course page, pricing page).</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Basic Plan — Price (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                    <input type="number" name="basic_plan_price" defaultValue={initialSettings['basic_plan_price'] || '99'} min="0" step="1" className="sd-input !pl-8" placeholder="99" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">1 Month (30 days)</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pro Plan — Price (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                    <input type="number" name="pro_plan_price" defaultValue={initialSettings['pro_plan_price'] || '299'} min="0" step="1" className="sd-input !pl-8" placeholder="299" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">3 Months (90 days) · with support</p>
                </div>
              </div>
            </div>

            <div className="sd-card p-6">
              <h3 className="text-[15px] font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 2 10 10-10 10L2 12Z"/><circle cx="12" cy="12" r="1"/></svg>
                Homepage Pricing Card
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Plan Name</label>
                  <input type="text" name="pricing_plan_name" defaultValue={initialSettings['pricing_plan_name'] || 'Premium Plan'} className="sd-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (Numbers only)</label>
                  <input type="text" name="pricing_amount" defaultValue={initialSettings['pricing_amount'] || '100'} className="sd-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price Period</label>
                  <input type="text" name="pricing_period" defaultValue={initialSettings['pricing_period'] || 'per course / per month'} className="sd-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Referral Offer Text</label>
                  <input type="text" name="pricing_referral_text" defaultValue={initialSettings['pricing_referral_text'] || '🎁 10% discount with a referral code!'} className="sd-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Features List (Write each feature on a new line)</label>
                  <textarea name="pricing_features" rows={4} className="sd-input !h-auto font-mono text-[12px]" defaultValue={initialSettings['pricing_features'] || "Access to full question bank\nUnlimited mock tests\nInstant results and solutions"} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FAQ ═══ */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="text-[15px] font-bold text-slate-800">Dynamic FAQs</h3>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Manage FAQs for different pages of your website.</p>
              </div>
            </div>

            {faqs.map((faq, index) => (
              <div key={index} className="sd-card p-6 relative border-2 border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                <button 
                  type="button" 
                  onClick={() => removeFaq(index)} 
                  className="absolute top-4 right-4 text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors" 
                  title="Remove FAQ"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
                <div className="space-y-4 pr-12">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Page / Section</label>
                    <select 
                      value={faq.section} 
                      onChange={(e) => updateFaq(index, 'section', e.target.value)} 
                      className="sd-input"
                    >
                      <option value="Home">Home Page</option>
                      <option value="Pricing">Pricing Page</option>
                      <option value="About">About Page</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Question</label>
                    <input 
                      type="text" 
                      value={faq.q} 
                      onChange={(e) => updateFaq(index, 'q', e.target.value)} 
                      className="sd-input" 
                      placeholder="e.g. What is AssessmentBD?"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Answer</label>
                    <textarea 
                      value={faq.a} 
                      onChange={(e) => updateFaq(index, 'a', e.target.value)} 
                      rows={3} 
                      className="sd-input !h-auto" 
                      placeholder="Enter the detailed answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addFaq} 
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 p-4 rounded-[1.25rem] transition-all font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 
              Add New FAQ
            </button>
          </div>
        )}

        {/* ═══ SEO ═══ */}
        {activeTab === 'seo' && (
          <div className="sd-card p-6 space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              SEO Settings
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Page Title (browser tab/Google search)</label>
              <input type="text" name="seo_title" defaultValue={initialSettings['seo_title'] || 'NSDA Exam Prep | NSDA Assessment Question & Tools Bangladesh'} className="sd-input" />
              <p className="text-[11px] text-slate-400 mt-1">Keep up to 60 characters</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Meta Description</label>
              <textarea name="seo_description" rows={3} className="sd-input !h-auto" defaultValue={initialSettings['seo_description'] || 'The best NSDA Assessment Tools and Question Bank in Bangladesh. Prepare with real-time mock tests, anti-cheat system, and a 100% mobile-friendly environment.'} />
              <p className="text-[11px] text-slate-400 mt-1">Keep up to 160 characters</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Meta Keywords (Separate with commas)</label>
              <input type="text" name="seo_keywords" defaultValue={initialSettings['seo_keywords'] || 'nsda, nsda tools, assessment question, nsda level course, online exam bd'} className="sd-input" />
            </div>
          </div>
        )}

        {/* ═══ ANNOUNCEMENT ═══ */}
        {activeTab === 'announcement' && (
          <div className="sd-card p-6 space-y-5">
            <h3 className="text-[15px] font-bold text-slate-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>
              Announcement / Notice Bar
              <span className="text-[11px] font-medium text-slate-400">— Scrolling text below header</span>
            </h3>

            {/* Live Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 bg-slate-50 border-b border-slate-200">Preview</div>
              <div className="flex items-center gap-3 px-4 py-2.5 overflow-hidden" style={{ backgroundColor: announcementBg }}>
                <span className="shrink-0 text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>
                </span>
                <div className="overflow-hidden whitespace-nowrap flex-1" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                  <span className="inline-block text-white text-sm font-semibold animate-marquee">
                    {announcementText || 'Write your announcement text here...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[14px] font-bold text-slate-800">Enable Notice Bar</p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">If disabled, it will not show on the website</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="announcement_enabled" value="0" />
                <input 
                  type="checkbox" 
                  name="announcement_enabled" 
                  value="1" 
                  defaultChecked={initialSettings['announcement_enabled'] === '1'} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Text */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Announcement Text (which will scroll)</label>
              <textarea 
                name="announcement_text" 
                rows={3} 
                className="sd-input !h-auto"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="📢 Special Offer: 10% discount if you subscribe this month! | Contact: 01XXXXXXXXX" 
              />
              <p className="text-[11px] text-slate-400 mt-1">Use " | " to separate multiple notices</p>
            </div>

            {/* Color & Speed */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Background Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    name="announcement_bg" 
                    value={announcementBg}
                    onChange={(e) => setAnnouncementBg(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white" 
                  />
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries({
                      '#0b57d0': 'Blue',
                      '#dc2626': 'Red',
                      '#16a34a': 'Green',
                      '#b45309': 'Amber',
                      '#7c3aed': 'Purple',
                      '#0f172a': 'Dark'
                    }).map(([color, name]) => (
                      <button 
                        key={color} 
                        type="button" 
                        onClick={() => setAnnouncementBg(color)}
                        className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-all ${
                          announcementBg === color ? 'ring-2 ring-offset-1 ring-slate-400' : ''
                        }`}
                        style={{ backgroundColor: color }} 
                        title={name} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Scroll Speed</label>
                <select name="announcement_speed" defaultValue={initialSettings['announcement_speed'] || 'normal'} className="sd-input">
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-brand w-full sm:w-auto justify-center px-10 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {isPending ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
