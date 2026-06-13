'use client';

import { useActionState, useState, useEffect } from 'react';
import { saveLandingSettingsAction } from '@/app/actions/admin-landing.actions';

interface Feature {
  title: string;
  desc: string;
}

interface Faq {
  q: string;
  a: string;
}

interface Review {
  name: string;
  role: string;
  quote: string;
}

export default function LandingSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(saveLandingSettingsAction, null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Features list state
  const [features, setFeatures] = useState<Feature[]>(() => {
    try {
      return JSON.parse(initialSettings['landing_features'] || '[]');
    } catch (e) {
      return [];
    }
  });

  const addFeature = () => {
    setFeatures([...features, { title: '', desc: '' }]);
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const updateFeature = (idx: number, key: keyof Feature, val: string) => {
    const updated = [...features];
    updated[idx][key] = val;
    setFeatures(updated);
  };

  // FAQs state
  const [faqs, setFaqs] = useState<Faq[]>(() => {
    try {
      return JSON.parse(initialSettings['landing_faqs'] || '[]');
    } catch (e) {
      return [];
    }
  });

  const addFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, key: keyof Faq, val: string) => {
    const updated = [...faqs];
    updated[idx][key] = val;
    setFaqs(updated);
  };

  const moveFaqUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...faqs];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setFaqs(updated);
  };

  const moveFaqDown = (idx: number) => {
    if (idx === faqs.length - 1) return;
    const updated = [...faqs];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setFaqs(updated);
  };

  // Testimonials state
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      return JSON.parse(initialSettings['landing_reviews'] || '[]');
    } catch (e) {
      return [];
    }
  });

  const addReview = () => {
    setReviews([...reviews, { name: '', role: '', quote: '' }]);
  };

  const removeReview = (idx: number) => {
    setReviews(reviews.filter((_, i) => i !== idx));
  };

  const updateReview = (idx: number, key: keyof Review, val: string) => {
    const updated = [...reviews];
    updated[idx][key] = val;
    setReviews(updated);
  };

  const moveReviewUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...reviews];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setReviews(updated);
  };

  const moveReviewDown = (idx: number) => {
    if (idx === reviews.length - 1) return;
    const updated = [...reviews];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setReviews(updated);
  };

  // Slider screenshots state
  const [existingSliderImages, setExistingSliderImages] = useState<string[]>(() => {
    try {
      return JSON.parse(initialSettings['landing_slider_images'] || '[]');
    } catch (e) {
      return [];
    }
  });

  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [newSliderFiles, setNewSliderFiles] = useState<{ id: number }[]>([{ id: Date.now() }]);

  const markImageDeleted = (path: string) => {
    setDeletedImages([...deletedImages, path]);
  };

  const addFileInput = () => {
    setNewSliderFiles([...newSliderFiles, { id: Date.now() }]);
  };

  const removeFileInput = (idx: number) => {
    setNewSliderFiles(newSliderFiles.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast Alert */}
      {showToast && (
        <div className="flash-ok">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Landing page settings saved successfully.</span>
        </div>
      )}

      {state?.error && (
        <div className="flash-err">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Hidden inputs to serialize JSON lists */}
        <input type="hidden" name="landing_features" value={JSON.stringify(features)} />
        <input type="hidden" name="landing_faqs" value={JSON.stringify(faqs)} />
        <input type="hidden" name="landing_reviews" value={JSON.stringify(reviews)} />

        {/* Deleted images array */}
        {deletedImages.map((path) => (
          <input key={path} type="hidden" name="delete_images[]" value={path} />
        ))}

        {/* ── 1. Hero Content ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
            Hero Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Heading</label>
              <input 
                type="text" 
                name="landing_hero_heading" 
                defaultValue={initialSettings['landing_hero_heading'] || ''}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                placeholder="e.g. আপনার NSDA স্কিল অ্যাসেসমেন্ট প্রস্তুতি শুরু করুন আজই!"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Subtext</label>
              <textarea 
                name="landing_hero_subtext" 
                rows={3} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                placeholder="Describe your value proposition..."
                defaultValue={initialSettings['landing_hero_subtext'] || ''}
              />
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Image (Optional)</label>
              {initialSettings['landing_hero_image'] && (
                <div className="mb-3 relative group inline-block">
                  <img src={`/${initialSettings['landing_hero_image']}`} className="h-24 w-auto rounded border border-slate-200 shadow-sm object-cover" />
                </div>
              )}
              <input 
                type="file" 
                name="landing_hero_image" 
                accept="image/*"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to use the default hero banner or placeholder.</p>
            </div>
          </div>
        </div>

        {/* ── 2. Slider Images ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            User Panel Screenshots (Slider)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Upload screenshots of the user panel. These will be displayed as an automated slider on the landing page to increase conversions.</p>
          
          {/* Existing Images */}
          {existingSliderImages.filter(img => !deletedImages.includes(img)).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {existingSliderImages.filter(img => !deletedImages.includes(img)).map((img, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
                  <img src={`/${img}`} className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <button 
                      type="button" 
                      onClick={() => markImageDeleted(img)} 
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Images Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Upload New Images</label>
            
            {newSliderFiles.map((input, index) => (
              <div key={input.id} className="flex items-center gap-3">
                <input 
                  type="file" 
                  name="slider_images[]" 
                  accept="image/*"
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {newSliderFiles.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeFileInput(index)} 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                    title="Remove"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
            ))}
            
            <div className="pt-2">
              <button 
                type="button" 
                onClick={addFileInput} 
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add another picture
              </button>
            </div>
          </div>
        </div>

        {/* ── 2.5 Comparison Image ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            Plan Comparison Image
          </h3>
          <p className="text-xs text-slate-500 mb-4">Upload the comparison table image that will be shown on the order page.</p>
          
          {initialSettings['landing_comparison_image'] && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Current Image:</p>
              <img src={`/${initialSettings['landing_comparison_image']}`} className="max-w-xs rounded border border-slate-200 shadow-sm" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Upload New Comparison Image (Optional)</label>
            <input 
              type="file" 
              name="landing_comparison_image" 
              accept="image/*"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>
        </div>

        {/* ── 3. Features List ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Key Features
          </h3>
          
          <div className="space-y-4 mb-4">
            {features.map((feature, index) => (
              <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <button 
                    type="button" 
                    onClick={() => removeFeature(index)} 
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors" 
                    title="Delete"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                <div className="mb-3 pr-10">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={feature.title} 
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="e.g. MCQ Question Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <input 
                    type="text" 
                    value={feature.desc} 
                    onChange={(e) => updateFeature(index, 'desc', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    placeholder="e.g. CS ভিত্তিক পূর্ণাঙ্গ MCQ সেট..."
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addFeature} 
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Feature
          </button>
        </div>

        {/* ── 4. FAQs ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4 mb-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                <div className="absolute top-2 right-2 flex gap-1">
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => moveFaqUp(index)} 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors" 
                      title="Move Up"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    </button>
                  )}
                  {index < faqs.length - 1 && (
                    <button 
                      type="button" 
                      onClick={() => moveFaqDown(index)} 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors" 
                      title="Move Down"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => removeFaq(index)} 
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors" 
                    title="Delete"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                
                <div className="mb-3 pr-24">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Question</label>
                  <input 
                    type="text" 
                    value={faq.q} 
                    onChange={(e) => updateFaq(index, 'q', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500" 
                    placeholder="e.g. Is this a physical class?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Answer</label>
                  <textarea 
                    value={faq.a} 
                    onChange={(e) => updateFaq(index, 'a', e.target.value)} 
                    rows={2}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500" 
                    placeholder="Answer..."
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addFaq} 
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add FAQ
          </button>
        </div>

        {/* ── 5. User Reviews ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            User Reviews (Testimonials)
          </h3>
          
          <div className="space-y-4 mb-4">
            {reviews.map((review, index) => (
              <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                <div className="absolute top-2 right-2 flex gap-1">
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => moveReviewUp(index)} 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors" 
                      title="Move Up"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    </button>
                  )}
                  {index < reviews.length - 1 && (
                    <button 
                      type="button" 
                      onClick={() => moveReviewDown(index)} 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors" 
                      title="Move Down"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => removeReview(index)} 
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors" 
                    title="Delete"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-24">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={review.name} 
                      onChange={(e) => updateReview(index, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500" 
                      placeholder="e.g. মো. রাহাত হোসেন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Occupation/Role</label>
                    <input 
                      type="text" 
                      value={review.role} 
                      onChange={(e) => updateReview(index, 'role', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500" 
                      placeholder="e.g. Level 3 Trainee"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Review/Quote</label>
                  <textarea 
                    value={review.quote} 
                    onChange={(e) => updateReview(index, 'quote', e.target.value)} 
                    rows={2}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500" 
                    placeholder="What they said..."
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addReview} 
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Review
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {isPending ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
