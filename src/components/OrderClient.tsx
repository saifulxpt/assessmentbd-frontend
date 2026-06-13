'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { checkoutAction, validateCouponAction } from '@/app/actions/checkout.actions';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  has_questions: boolean;
}

interface OrderClientProps {
  courses: Course[];
  settings: Record<string, string>;
  currentUser: any;
  basicPrice: number;
  proPrice: number;
  waNum: string;
  selectedCourseId: string;
  selectedPlan: string;
}

export default function OrderClient({
  courses,
  settings,
  currentUser,
  basicPrice,
  proPrice,
  waNum,
  selectedCourseId: initialCourseId,
  selectedPlan: initialPlan,
}: OrderClientProps) {
  const [isPending, startTransition] = useTransition();

  // Form states
  const [selectedPlan, setSelectedPlan] = useState(initialPlan === 'pro' ? 'pro' : 'basic');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('কোর্স সিলেক্ট করুন...');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseOpen, setCourseOpen] = useState(false);
  
  // Guest fields
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccessMessage, setCouponSuccessMessage] = useState('');

  // UI state
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [copiedNagad, setCopiedNagad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseTitleForModal, setSelectedCourseTitleForModal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(true);

  // Refs for scroll and observation
  const checkoutFormRef = useRef<HTMLDivElement>(null);
  const pricingSectionRef = useRef<HTMLDivElement>(null);

  // Dynamic values from settings
  const bkashNum = settings['bkash_number'] || '';
  const nagadNum = settings['nagad_number'] || '';
  const bkashType = settings['bkash_type'] || 'Send Money';
  const whatsappLink = `https://wa.me/${waNum}`;

  const heroHeading = settings['landing_hero_heading'] || '<span style="color:#dc2626;">NYC (ফেইল)</span> হওয়ার ভয় আর নয়!<br><span style="color:#1d4ed8;">Assessment পাসের শতভাগ প্রস্তুতি</span>';
  const heroSubtext = settings['landing_hero_subtext'] || 'ইন্টারনেটে ছড়ানো অগোছালো শিট পড়ে পরীক্ষা দেওয়ার দিন শেষ। আমাদের ১০০% রিয়েল-প্যাটার্ন Question Bank ও Model Test দিয়ে আজই আপনার প্রস্তুতি নিশ্চিত করুন।';
  const heroImage = settings['landing_hero_image'] || '';
  const comparisonImage = settings['landing_comparison_image'] || '';

  // Parse arrays
  let sliderImages: string[] = [];
  try {
    sliderImages = JSON.parse(settings['landing_slider_images'] || '[]');
  } catch (e) {
    sliderImages = [];
  }

  let dbFeatures: any[] = [];
  try {
    dbFeatures = JSON.parse(settings['landing_features'] || '[]');
  } catch (e) {
    dbFeatures = [];
  }

  if (dbFeatures.length === 0) {
    dbFeatures = [
      { title: 'MCQ Question Bank', desc: 'CS ভিত্তিক পূর্ণাঙ্গ MCQ সেট — প্রতিটি Unit-এর জন্য' },
      { title: 'Written Question Bank', desc: 'গুরুত্বপূর্ণ লিখিত প্রশ্ন ও সাজেশন' },
      { title: 'উত্তর ও ব্যাখ্যা', desc: 'প্রতিটি প্রশ্নের সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা' },
      { title: 'Model Assessment', desc: 'রিয়েল-টাইম মডেল পরীক্ষা — নিজেকে মূল্যায়ন করুন' },
      { title: 'Instant Result', desc: 'পরীক্ষা শেষে সাথে সাথেই স্বয়ংক্রিয় ফলাফল' },
      { title: 'Progress Dashboard', desc: 'দুর্বলতা চিহ্নিত করুন — উন্নতি ট্র্যাক করুন' },
    ];
  }

  let landingReviews: any[] = [];
  try {
    landingReviews = JSON.parse(settings['landing_reviews'] || '[]');
  } catch (e) {
    landingReviews = [];
  }

  if (landingReviews.length === 0) {
    landingReviews = [
      { quote: 'এখানে রেগুলার পরীক্ষা দিয়ে আমার কনফিডেন্স অনেক বেড়েছে। প্রশ্নগুলো সত্যিই স্ট্যান্ডার্ড।', name: 'মো. রাহাত হোসেন', role: 'Level 3 Trainee — Computer Operation' },
      { quote: 'ফাইনাল অ্যাসেসমেন্টের আগে মডেল টেস্ট দিয়ে নিজের ভুলগুলো ধরতে পেরেছিলাম। প্রথমবারেই পাস করলাম।', name: 'তাসলিমা বেগম', role: 'Level 4 Trainee — Graphic Design' },
      { quote: 'লিখিত প্রশ্নের উত্তর ও ব্যাখ্যাগুলো খুব সুন্দর সাজানো। আমি প্রথমবারেই Competent হয়েছি।', name: 'জুবায়ের আহমেদ', role: 'Level 3 Trainee — Electrical Installation' },
    ];
  }

  let landingFaqs: any[] = [];
  try {
    landingFaqs = JSON.parse(settings['landing_faqs'] || '[]');
  } catch (e) {
    landingFaqs = [];
  }

  if (landingFaqs.length === 0) {
    landingFaqs = [
      { q: 'সব প্রশ্ন কি রিয়েল অ্যাসেসমেন্ট থেকে নেওয়া?', a: 'আমাদের প্রশ্নব্যাংক CS, UoC, অ্যাসেসমেন্ট প্যাটার্ন এবং এক্সপার্ট ট্রেইনারদের মতামতের ভিত্তিতে তৈরি। এগুলো শতভাগ রিয়েল না হলেও অ্যাসেসমেন্ট পাসের জন্য যথেষ্ট প্রস্তুতি দেয়।' },
      { q: 'এখানে কি প্র্যাকটিক্যাল ট্রেনিং করানো হয়?', a: 'না। AssessmentBD শুধুমাত্র Written ও MCQ প্রস্তুতির জন্য একটি ডিজিটাল প্ল্যাটফর্ম। কোনো প্র্যাকটিক্যাল ট্রেনিং প্রদান করা হয় না।' },
      { q: 'যেকোনো ডিভাইস থেকে ব্যবহার করা যাবে?', a: 'হ্যাঁ, যেকোনো স্মার্টফোন, ট্যাবলেট বা কম্পিউটার থেকে লগইন করে প্র্যাকটিস করা যাবে।' },
      { q: '৫০% মানি-ব্যাক গ্যারান্টি কীভাবে কাজ করে?', a: 'Pro প্ল্যান নিয়ে ফাইনাল অ্যাসেসমেন্টে NYC হলে শর্তসাপেক্ষে ৫০% ক্যাশব্যাক পাবেন। বিস্তারিত আমাদের Refund Policy পেজে আছে।' },
      { q: 'পেমেন্ট করার পর কখন Access পাবো?', a: 'Online Gateway দিয়ে পেমেন্ট করলে সাথে সাথে। bKash/Nagad-এ করলে Admin Verify করার পর — সাধারণত ৩০ মিনিট থেকে কয়েক ঘণ্টার মধ্যে।' },
    ];
  }

  // Pre-select course from page props
  useEffect(() => {
    if (initialCourseId) {
      const match = courses.find(c => c.id === initialCourseId);
      if (match) {
        setSelectedCourseId(match.id);
        setSelectedCourseTitle(match.title);
      }
    }
  }, [initialCourseId, courses]);

  // Handle sticky bottom CTA visibility
  useEffect(() => {
    const handleScroll = () => {
      if (checkoutFormRef.current) {
        const rect = checkoutFormRef.current.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
        setStickyVisible(!isInViewport);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCheckout = () => {
    if (pricingSectionRef.current) {
      window.scrollTo({
        top: pricingSectionRef.current.offsetTop - 20,
        behavior: 'smooth',
      });
    }
  };

  const copyNum = (num: string, type: 'bkash' | 'nagad') => {
    navigator.clipboard.writeText(num).then(() => {
      if (type === 'bkash') {
        setCopiedBkash(true);
        setTimeout(() => setCopiedBkash(false), 2000);
      } else {
        setCopiedNagad(true);
        setTimeout(() => setCopiedNagad(false), 2000);
      }
    });
  };

  const handleSelectCourse = (course: Course) => {
    if (!course.has_questions) {
      setSelectedCourseTitleForModal(course.title);
      setShowModal(true);
      setCourseOpen(false);
      setCourseSearch('');
      return;
    }
    setSelectedCourseId(course.id);
    setSelectedCourseTitle(course.title);
    setCourseOpen(false);
    setCourseSearch('');
    setErrorMessage('');
  };

  // Filter courses based on search text
  const filteredCourses = courseSearch.trim().toLowerCase() === ''
    ? courses
    : courses.filter(c => c.title.toLowerCase().includes(courseSearch.trim().toLowerCase()));

  // Dynamic Coupon Validation
  const handleApplyCoupon = async () => {
    if (!selectedCourseId) {
      setCouponError('অনুগ্রহ করে কুপন অ্যাপ্লাই করার আগে একটি Occupation সিলেক্ট করুন।');
      return;
    }
    if (!couponCode) {
      setCouponError('কুপন কোডটি লিখুন।');
      return;
    }
    setCouponError('');
    setCouponSuccessMessage('');

    const res = await validateCouponAction(couponCode, selectedCourseId, selectedPlan);
    if (!res.success) {
      setCouponError(res.error || 'কুপন কোডটি সঠিক নয়।');
      setCouponDiscount(0);
    } else {
      setCouponSuccessMessage('কুপন কোডটি সফলভাবে প্রযোজ্য হয়েছে!');
      const type = res.discount_type;
      const val = parseFloat(res.discount_value || '0');
      const basePrice = selectedPlan === 'pro' ? proPrice : basicPrice;
      const discount = type === 'percent' ? Math.round(basePrice * val / 100) : val;
      setCouponDiscount(discount);
    }
  };

  const basePrice = selectedPlan === 'pro' ? proPrice : basicPrice;
  
  // Calculate referral discount preview for unverified referee
  let referralDiscount = 0;
  if (currentUser && !currentUser.first_purchase_done && settings['referral_enabled'] === '1') {
    const discountType = settings['referral_discount_type'] || 'flat';
    const discountVal = parseFloat(settings['referral_discount_value'] || '0');
    if (discountVal > 0) {
      referralDiscount = discountType === 'percent'
        ? Math.round(basePrice * discountVal / 100)
        : Math.min(discountVal, basePrice);
    }
  }

  // Handle stack discounts logic matching backend
  let totalDiscount = referralDiscount + couponDiscount;
  if (couponDiscount > 0 && settings['coupon_stack_referral'] !== '1') {
    if (couponDiscount >= referralDiscount) {
      totalDiscount = couponDiscount; // Coupon takes precedence
    } else {
      totalDiscount = referralDiscount; // Referral takes precedence
    }
  }
  totalDiscount = Math.min(totalDiscount, basePrice);
  const finalPrice = Math.max(0, basePrice - totalDiscount);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert('অনুগ্রহ করে আগে একটি Occupation সিলেক্ট করুন।');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('course_id', selectedCourseId);
    formData.append('plan', selectedPlan);
    formData.append('payment_method', paymentMethod);
    formData.append('sender_number', senderNumber);
    formData.append('coupon_code', couponCode);

    if (!currentUser) {
      formData.append('name', guestName);
      formData.append('mobile', guestMobile);
      formData.append('password', guestPassword);
    }

    startTransition(async () => {
      const result = await checkoutAction(null, formData);
      setIsSubmitting(false);

      if (result?.error) {
        setErrorMessage(result.error);
        // Scroll error into view
        const errorEl = document.getElementById('order-error');
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (result?.redirect) {
        setSuccessMessage(result.message || 'অর্ডার সফল হয়েছে!');
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1000);
      }
    });
  };

  const featureIcons = [
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'M13 10V3L4 14h7v7l9-11h-7z',
    'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-20">
      {/* Urgency Banner */}
      <div className="bg-amber-500 text-amber-950 font-bold text-[13px] sm:text-[14px] py-2.5 px-4 text-center relative z-20 flex items-center justify-center gap-2 shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        🔥 স্পেশাল অফার: Pro প্ল্যানে ৫০% মানি-ব্যাক গ্যারান্টি! অফারটি যেকোনো সময় শেষ হতে পারে।
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-br from-blue-50/50 via-slate-50 to-amber-50/30">
        <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Copy */}
            <div className="text-center lg:text-left">
              <h1 
                className="font-black leading-tight mb-5" 
                style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.02em', color: '#0f172a' }}
                dangerouslySetInnerHTML={{ __html: heroHeading }}
              />

              <p 
                className="text-[1.05rem] leading-loose mb-8 max-w-xl mx-auto lg:mx-0 text-slate-600 font-medium"
                dangerouslySetInnerHTML={{ __html: heroSubtext }}
              />

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={scrollToCheckout} 
                  className="px-8 py-4 text-[16px] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-black flex items-center justify-center gap-2 w-full sm:w-auto hover:-translate-y-0.5" 
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 15px 30px rgba(37, 99, 235, 0.3)' }}
                >
                  Question Bank নিন
                </button>
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[16px] font-bold border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.776.467 3.441 1.28 4.888L2 22l5.247-1.255A9.96 9.96 0 0012.004 22C17.53 22 22 17.523 22 12c0-5.522-4.47-10-9.996-10zm0 18a7.962 7.962 0 01-4.087-1.125l-.293-.174-3.114.745.783-2.955-.192-.303A7.953 7.953 0 014 12c0-4.411 3.589-8 8.004-8 4.418 0 7.996 3.589 7.996 8s-3.578 8-7.996 8z"/>
                  </svg>
                  WhatsApp করুন
                </a>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative w-full max-w-xs sm:max-w-md mx-auto lg:max-w-none flex justify-center lg:justify-end">
              <div className="absolute top-10 bottom-10 left-10 right-10 bg-blue-500/10 opacity-20 blur-[60px] rounded-full" />
              
              <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-2xl border-[6px] sm:border-[10px] border-slate-100 max-h-[300px] sm:max-h-[380px] lg:max-h-[420px] transition-transform duration-500 hover:-translate-y-1">
                {heroImage ? (
                  <img src={heroImage.startsWith('uploads') ? `https://server.assessmentbd.com/storage/${heroImage}` : heroImage} className="w-full h-auto object-contain object-top" alt="Preview" />
                ) : sliderImages.length > 0 ? (
                  <img src={sliderImages[0].startsWith('uploads') ? `https://server.assessmentbd.com/storage/${sliderImages[0]}` : sliderImages[0]} className="w-full h-auto object-contain object-top" alt="Preview" />
                ) : (
                  <div className="w-[320px] h-[400px] flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-blue-700 to-blue-900">
                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <h3 className="font-black text-xl">Platform Preview</h3>
                    <p className="text-blue-200 text-xs mt-2">Admin Panel থেকে Screenshot যোগ করুন</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar marquee */}
      <div className="bg-blue-700 py-3.5 overflow-hidden">
        <div className="flex sm:justify-center overflow-hidden">
          <div className="flex gap-8 whitespace-nowrap animate-[marquee-scroll_22s_linear_infinite] sm:animate-none sm:gap-12">
            {['CS Based Preparation', 'UoC Based Content', 'নিয়মিত প্রশ্ন আপডেট', 'Assessment Focused', 'Mobile Friendly', 'Expert Reviewed', 'Instant Result', 'Model Assessment'].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-white font-bold text-[14px] shrink-0">
                <svg className="w-4 h-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pain Point Section */}
      <section className="py-14 sm:py-20 bg-[#fffcf2] border-b border-yellow-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-black text-red-600 mb-8 text-[24px] sm:text-[36px]">কেন বেশিরভাগ ট্রেইনি Assessment-এ ফেইল (NYC) করে?</h2>
          
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">সঠিক গাইডলাইনের অভাব</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">ইন্টারনেটে ছড়ানো অগোছালো ও ভুল শিট পড়ে পরীক্ষা দিতে যাওয়া সবচেয়ে বড় ভুল।</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">প্রশ্নের প্যাটার্ন না জানা</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">CBT&A সিস্টেমে কীভাবে প্রশ্ন আসে সে সম্পর্কে আগে থেকে কোনো ধারণা না থাকা।</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">Model Test না দেওয়া</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">পরীক্ষার আগে রিয়েল-টাইম টাইম ম্যানেজমেন্ট প্র্যাকটিস না করার কারণে সময়ের অভাবে ফেইল করা।</p>
            </div>
          </div>
          <p className="text-slate-800 font-black mt-10 text-[18px]">এই সমস্যাগুলোর ১০০% সমাধান দিতেই <span className="text-blue-600">AssessmentBD</span>-এর জন্ম!</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-black text-slate-900 mb-4 text-[24px] sm:text-[36px]">Question Bank-এ যা যা পাচ্ছেন</h2>
            <p className="text-[16px] max-w-2xl mx-auto text-slate-500">একটি সাবস্ক্রিপশনে NSDA Assessment-এর সম্পূর্ণ প্রস্তুতির সুযোগ।</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {dbFeatures.map((f, i) => (
              <div key={i} className="bg-white border-2 border-slate-200 rounded-[20px] p-6 text-center transition-all duration-300 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-blue-50">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={featureIcons[i % featureIcons.length]}/>
                  </svg>
                </div>
                <h3 className="font-black text-[15px] sm:text-[17px] mb-2 text-slate-800">{f.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counters */}
      <div className="py-10 bg-gradient-to-r from-blue-700 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            ['১০০০+', 'সক্রিয় ট্রেইনি'],
            ['৫০+', 'Occupation Available'],
            ['৫০০০+', 'প্রশ্ন সংযোজিত'],
            ['৯৫%', 'Competent Rate']
          ].map((s, idx) => (
            <div key={idx}>
              <p className="font-black text-[2rem] leading-none mb-1">{s[0]}</p>
              <p className="text-blue-200 text-[13px] font-semibold">{s[1]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Us */}
      <section className="py-14 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-black text-slate-900 mb-4 text-[24px] sm:text-[36px]">কেন AssessmentBD বেছে নেবেন?</h2>
            <p className="text-[15px] max-w-xl mx-auto text-slate-500">আমাদের প্ল্যাটফর্ম TVET Trainee-দের কথা মাথায় রেখে তৈরি।</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'সব Unit Cover করার লক্ষ্য', desc: 'প্রতিটি Occupation-এর সব Unit-এর প্রশ্ন কভার করার জন্য নিয়মিত কাজ চলছে।' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'গোছানো ও দ্রুত Preparation', desc: 'অগোছালো শীটের বদলে সুন্দর ডিজিটাল প্ল্যাটফর্মে সাজানো প্রস্তুতি।' },
              { icon: 'M12 18h.01M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', title: 'যেকোনো ডিভাইসে Access', desc: 'স্মার্টফোন, ট্যাবলেট বা কম্পিউটার — যেকোনো ডিভাইস থেকে যেকোনো সময়।' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'নিয়মিত প্রশ্ন আপডেট', desc: 'NSDA গাইডলাইন অনুযায়ী নিয়মিত নতুন প্রশ্ন ও কন্টেন্ট আপডেট হয়।' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Pro-তে মানি-ব্যাক গ্যারান্টি', desc: 'Pro প্ল্যানে NYC হলে শর্তসাপেক্ষে ৫০% ক্যাশব্যাক পাওয়ার নিশ্চয়তা।' },
              { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'সাশ্রয়ী মূল্য', desc: 'সব ট্রেইনির সামর্থ্যের কথা বিবেচনা করে সবচেয়ে কম দামে কোয়ালিটি কন্টেন্ট।' },
            ].map((w, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center bg-blue-50">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={w.icon}/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-[16px] mb-1 text-slate-800">{w.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swiper Slider Screenshots Fallback */}
      {sliderImages.length > 0 && (
        <section className="py-14 sm:py-20 bg-slate-50 border-t border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center">
              <div className="md:col-span-5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  Platform Preview
                </div>
                <h2 className="font-black text-slate-900 mb-6 leading-tight text-[30px] sm:text-[40px]">
                  AssessmentBD <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">কেমন দেখতে</span>
                </h2>
                <p className="text-slate-500 text-[16px] leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  প্রশ্ন ব্যাংকে প্রবেশ করার আগে একনজর দেখে নিন আমাদের ইন্টারফেসটি। এটি এমনভাবে ডিজাইন করা হয়েছে যা আপনার পরীক্ষার সর্বোচ্চ প্রস্তুতি নিশ্চিত করবে।
                </p>
                <div className="flex justify-center md:justify-start">
                  <button onClick={scrollToCheckout} className="px-10 py-4 text-[16px] text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl font-black flex items-center gap-2 hover:-translate-y-0.5 bg-gradient-to-br from-blue-600 to-blue-800">
                    প্রস্তুতি শুরু করুন
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Showcase Image List / Carousel */}
              <div className="md:col-span-7 flex justify-center gap-4 overflow-x-auto py-4 max-w-full">
                {sliderImages.slice(0, 3).map((img, idx) => (
                  <div key={idx} className="w-[180px] sm:w-[220px] h-auto rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-100 shrink-0 transform transition duration-500 hover:-translate-y-1">
                    <img src={img.startsWith('uploads') ? `https://server.assessmentbd.com/storage/${img}` : img} alt="Platform Screenshot" className="w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-black text-slate-900 mb-4 text-[24px] sm:text-[36px]">মাত্র ৩টি ধাপে শুরু করুন</h2>
          <p className="text-[15px] mb-12 sm:mb-16 text-slate-500">নিবন্ধন থেকে প্রশ্ন ব্যাংক অ্যাক্সেস — সবকিছু অনলাইনে।</p>
          
          <div className="grid sm:grid-cols-3 gap-6 relative">
            {[
              { n: '১', bc: '#dbeafe', bg: '#f0f7ff', tc: '#1d4ed8', title: 'Occupation সিলেক্ট করুন', desc: 'নিচের Form-এ Dropdown থেকে আপনার Occupation খুঁজে সিলেক্ট করুন।' },
              { n: '২', bc: '#fde68a', bg: '#fffdf0', tc: '#b45309', title: 'Plan নির্বাচন করে Payment করুন', desc: 'Basic বা Pro প্ল্যান বেছে নিন এবং bKash, Nagad বা Online-এ পেমেন্ট করুন।' },
              { n: '৩', bc: '#bbf7d0', bg: '#f0fdf4', tc: '#15803d', title: 'Login করে Practice করুন', desc: 'আপনার মোবাইল নম্বর দিয়ে লগইন করুন — প্রশ্ন ব্যাংক সাথে সাথে আনলক হবে।' }
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-[2.2rem] left-[calc(50%+2.5rem)] right-0 h-px" style={{ background: `linear-gradient(90deg, ${step.bc}, transparent)` }} />
                )}
                <div className="rounded-2xl p-7 border-2 text-center h-full flex flex-col justify-between" style={{ borderColor: step.bc, background: step.bg }}>
                  <div>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[1.1rem] font-black mx-auto mb-5 shadow-sm" style={{ background: step.tc }}>{step.n}</div>
                    <h3 className="font-black text-[16px] mb-2 text-slate-800">{step.title}</h3>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 sm:py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-black text-slate-900 mb-4 text-[24px] sm:text-[36px]">ট্রেইনিরা কী বলছেন</h2>
            <p className="text-[15px] text-slate-500">হাজারো ট্রেইনি AssessmentBD ব্যবহার করে প্রথমবারেই Competent হয়েছেন।</p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-5">
            {landingReviews.map((t, idx) => (
              <div key={idx} className="bg-white border-[1.5px] border-slate-100 rounded-[20px] p-7 shadow-sm transition duration-300 hover:border-blue-200 hover:shadow-md">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, starIdx) => (
                    <svg key={starIdx} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="italic text-[14px] leading-relaxed mb-5 text-slate-600">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-[14px] bg-blue-700">{t.name.substring(0, 1)}</div>
                  <div>
                    <p className="font-black text-[14px] text-slate-800">{t.name}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Form Anchor */}
      <section ref={pricingSectionRef} id="pricing-checkout" className="py-14 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-black text-slate-900 mb-3 text-[22px] sm:text-[32px]">আপনার Occupation-এর Question Bank নিন</h2>
            <p className="text-[14px] text-slate-500">একটি Occupation, একটি সাবস্ক্রিপশন — পুরো Assessment প্রস্তুতি।</p>
          </div>

          {/* Comparison image banner */}
          {comparisonImage && (
            <div className="max-w-3xl mx-auto mb-16 px-4 sm:px-0">
              <img src={comparisonImage.startsWith('uploads') ? `https://server.assessmentbd.com/storage/${comparisonImage}` : comparisonImage} alt="Plan Comparison" className="w-full h-auto rounded-2xl sm:rounded-[24px] shadow-sm border border-slate-200" />
            </div>
          )}

          {/* Form container */}
          <div ref={checkoutFormRef} className="bg-white rounded-[28px] overflow-hidden shadow-lg border border-slate-100 max-w-3xl mx-auto" id="checkout-form">
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-6 sm:py-7 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-white font-black text-[18px] leading-tight">অর্ডার কনফার্ম করুন</h2>
                <p className="text-blue-200 text-[13px] font-medium">নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন</p>
              </div>
              <div className="ml-auto items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl hidden sm:flex">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-white text-[12px] font-bold">Secured</span>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Errors/Success flash displays */}
              {errorMessage && (
                <div id="order-error" className="flex items-start gap-3 p-4 rounded-2xl border-l-4 bg-red-50 border-red-500">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="font-bold text-red-700 text-[14px]">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 p-4 rounded-2xl border-l-4 bg-green-50 border-green-500">
                  <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="font-bold text-green-700 text-[14px]">{successMessage}</p>
                </div>
              )}

              {/* Interactive Plan Selector */}
              <div>
                <label className="block text-[14px] font-bold mb-3 text-slate-700">প্ল্যান সিলেক্ট করুন <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Basic */}
                  <label className="cursor-pointer group relative block">
                    <input 
                      type="radio" 
                      name="plan" 
                      value="basic" 
                      checked={selectedPlan === 'basic'} 
                      onChange={() => { setSelectedPlan('basic'); setCouponDiscount(0); setCouponSuccessMessage(''); }} 
                      className="sr-only" 
                    />
                    <div className={`h-full rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300 bg-white flex flex-col justify-between hover:border-blue-300 ${selectedPlan === 'basic' ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-100 shadow-sm' : 'border-slate-200'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[13px] sm:text-[15px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors ${selectedPlan === 'basic' ? '!text-blue-700' : ''}`}>Basic</span>
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white ${selectedPlan === 'basic' ? 'border-blue-500 bg-blue-500' : 'border-slate-300 group-hover:border-blue-300'}`}>
                            <svg className={`w-3.5 h-3.5 text-white transition-opacity ${selectedPlan === 'basic' ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        </div>
                        <div className={`font-black text-[1.4rem] sm:text-[1.8rem] leading-none mb-1 text-slate-800 ${selectedPlan === 'basic' ? '!text-blue-700' : ''}`}>
                          ৳{basicPrice}
                        </div>
                        <div className="text-[12px] sm:text-[14px] text-slate-400 font-bold">১ মাস ফুল এক্সেস</div>
                      </div>
                    </div>
                  </label>

                  {/* Pro */}
                  <label className="cursor-pointer group relative block">
                    <input 
                      type="radio" 
                      name="plan" 
                      value="pro" 
                      checked={selectedPlan === 'pro'} 
                      onChange={() => { setSelectedPlan('pro'); setCouponDiscount(0); setCouponSuccessMessage(''); }} 
                      className="sr-only" 
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider shadow-sm z-10 whitespace-nowrap flex items-center gap-1 border border-amber-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      সেরা মান
                    </div>
                    <div className={`h-full rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300 bg-white flex flex-col justify-between hover:border-amber-300 ${selectedPlan === 'pro' ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-100 shadow-sm' : 'border-slate-200'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[13px] sm:text-[15px] font-black uppercase tracking-widest text-slate-500 group-hover:text-amber-500 transition-colors ${selectedPlan === 'pro' ? '!text-amber-600' : ''}`}>Pro</span>
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white ${selectedPlan === 'pro' ? 'border-amber-500 bg-amber-500' : 'border-slate-300 group-hover:border-amber-300'}`}>
                            <svg className={`w-3.5 h-3.5 text-white transition-opacity ${selectedPlan === 'pro' ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        </div>
                        <div className={`font-black text-[1.4rem] sm:text-[1.8rem] leading-none mb-1 text-slate-800 ${selectedPlan === 'pro' ? '!text-amber-600' : ''}`}>
                          ৳{proPrice}
                        </div>
                        <div className="text-[12px] sm:text-[14px] text-slate-400 font-bold">৩ মাস ফুল এক্সেস</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Course Selection */}
              <div className="relative">
                <label className="block text-[14px] font-bold mb-2 text-slate-700">আপনার Occupation সিলেক্ট করুন <span className="text-red-500">*</span></label>
                <div 
                  onClick={() => setCourseOpen(!courseOpen)} 
                  className={`w-full padding-input px-4 py-3 bg-slate-50 border-2 rounded-xl flex items-center justify-between cursor-pointer select-none transition ${courseOpen ? 'border-blue-500 ring-4 ring-blue-100 bg-white' : 'border-slate-200'}`}
                >
                  <span className={`truncate text-[15px] font-bold ${selectedCourseId === '' ? 'text-slate-400 font-medium' : 'text-slate-900'}`}>
                    {selectedCourseTitle}
                  </span>
                  <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${courseOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>

                {courseOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[50]">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                      <input 
                        type="text" 
                        value={courseSearch} 
                        onChange={(e) => setCourseSearch(e.target.value)} 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-full px-4 py-2 text-[14px] border border-slate-200 rounded-xl outline-none focus:border-blue-500" 
                        placeholder="Occupation-এর নাম লিখুন..." 
                      />
                    </div>
                    <ul className="max-h-64 overflow-y-auto p-2 space-y-0.5">
                      {filteredCourses.map((course) => (
                        <li 
                          key={course.id} 
                          onClick={(e) => { e.stopPropagation(); handleSelectCourse(course); }}
                          className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition ${selectedCourseId === course.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span className="text-[14px] truncate mr-2 font-semibold">{course.title}</span>
                          {course.has_questions && (
                            <span className="shrink-0 text-[9px] font-black text-white bg-green-500 rounded-full px-2 py-0.5">AVAILABLE</span>
                          )}
                        </li>
                      ))}
                      {filteredCourses.length === 0 && (
                        <li className="py-5 text-center font-semibold text-[14px] text-slate-400">কোনো Occupation পাওয়া যায়নি।</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Guest registration fields */}
              {!currentUser && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[14px] font-bold mb-2 text-slate-700">আপনার নাম <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)} 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition" 
                      placeholder="পূর্ণ নাম লিখুন" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-bold mb-2 text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={guestMobile} 
                        onChange={(e) => setGuestMobile(e.target.value.replace(/[^0-9]/g, ''))} 
                        required 
                        maxLength={11}
                        pattern="01[3-9][0-9]{8}"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-mono font-bold transition" 
                        placeholder="01XXXXXXXXX" 
                      />
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold mb-2 text-slate-700">পাসওয়ার্ড তৈরি করুন <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          type={showPwd ? 'text' : 'password'} 
                          value={guestPassword} 
                          onChange={(e) => setGuestPassword(e.target.value)} 
                          required 
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-mono transition" 
                          placeholder="কমপক্ষে ৬ সংখ্যা" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPwd(!showPwd)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPwd ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logged in state display */}
              {currentUser && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-900 text-[14px]">লগইন করা আছে: {currentUser.name}</p>
                    <p className="font-mono text-[13px] text-blue-700">{currentUser.mobile}</p>
                  </div>
                  {parseFloat(currentUser.wallet_balance) > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">ওয়ালেট ব্যালেন্স</p>
                      <p className="font-bold text-slate-800 text-[14px]">৳{parseInt(currentUser.wallet_balance)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-[14px] font-bold mb-3 text-slate-700">পেমেন্ট পদ্ধতি <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                  {bkashNum && (
                    <label className="cursor-pointer group block">
                      <input 
                        type="radio" 
                        name="payment_method" 
                        value="bkash" 
                        checked={paymentMethod === 'bkash'} 
                        onChange={() => setPaymentMethod('bkash')} 
                        className="sr-only" 
                      />
                      <div className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50/50 shadow-sm ring-2 ring-pink-100' : 'border-slate-200bg-white'}`}>
                        <div className="w-10 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0 group-hover:border-pink-200">
                          <span className="font-black text-[12px] text-pink-600">bKash</span>
                        </div>
                        <span className="font-black text-[14px] sm:text-[15px] text-slate-850">bKash</span>
                        {paymentMethod === 'bkash' && (
                          <svg className="w-5 h-5 ml-auto text-pink-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                    </label>
                  )}

                  {nagadNum && (
                    <label className="cursor-pointer group block">
                      <input 
                        type="radio" 
                        name="payment_method" 
                        value="nagad" 
                        checked={paymentMethod === 'nagad'} 
                        onChange={() => setPaymentMethod('nagad')} 
                        className="sr-only" 
                      />
                      <div className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-100' : 'border-slate-200 bg-white'}`}>
                        <div className="w-10 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0 group-hover:border-orange-200">
                          <span className="font-black text-[12px] text-orange-600">Nagad</span>
                        </div>
                        <span className="font-black text-[14px] sm:text-[15px] text-slate-850">Nagad</span>
                        {paymentMethod === 'nagad' && (
                          <svg className="w-5 h-5 ml-auto text-orange-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                    </label>
                  )}

                  {/* Wallet payment option (Rendered if user is logged in, has balance, and settings allow) */}
                  {currentUser && parseFloat(currentUser.wallet_balance) >= finalPrice && settings['referral_reward_usable_for'] !== 'withdraw' && (
                    <label className="cursor-pointer group block col-span-1 sm:col-span-2">
                      <input 
                        type="radio" 
                        name="payment_method" 
                        value="wallet" 
                        checked={paymentMethod === 'wallet'} 
                        onChange={() => setPaymentMethod('wallet')} 
                        className="sr-only" 
                      />
                      <div className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-100' : 'border-slate-200 bg-white'}`}>
                        <div className="w-10 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0">
                          <span className="font-black text-[12px] text-blue-600">Wallet</span>
                        </div>
                        <span className="font-black text-[14px] sm:text-[15px] text-slate-850">পেমেন্ট করুন ওয়ালেট ব্যালেন্স থেকে (৳{parseInt(currentUser.wallet_balance)} আছে)</span>
                        {paymentMethod === 'wallet' && (
                          <svg className="w-5 h-5 ml-auto text-blue-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                    </label>
                  )}
                </div>

                {/* Instructions for Manual bKash/Nagad */}
                {['bkash', 'nagad'].includes(paymentMethod) && (
                  <div className="mt-4 rounded-2xl border border-slate-200 p-5 bg-slate-50/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <p className="font-bold text-[14px] mb-4 text-center text-slate-600">
                      নিচের নম্বরে <strong className="text-blue-700">{bkashType}</strong> করুন:
                    </p>

                    {paymentMethod === 'bkash' && bkashNum && (
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-pink-100 mb-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[11px] text-pink-600 bg-pink-50 px-2 py-1 rounded-md">bKash</span>
                          <span className="font-mono font-black text-[1.1rem] sm:text-[1.2rem] tracking-widest text-slate-800">{bkashNum}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => copyNum(bkashNum, 'bkash')} 
                          className="shrink-0 flex items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg px-3 sm:px-4 py-2 transition-colors font-bold text-[12px] sm:text-[13px]"
                        >
                          {copiedBkash ? (
                            <span className="flex items-center gap-1.5 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                              কপি হয়েছে!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                              </svg>
                              <span className="hidden sm:inline">কপি করুন</span><span className="sm:hidden">কপি</span>
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {paymentMethod === 'nagad' && nagadNum && (
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-orange-100 mb-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Nagad</span>
                          <span className="font-mono font-black text-[1.1rem] sm:text-[1.2rem] tracking-widest text-slate-800">{nagadNum}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => copyNum(nagadNum, 'nagad')} 
                          className="shrink-0 flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg px-3 sm:px-4 py-2 transition-colors font-bold text-[12px] sm:text-[13px]"
                        >
                          {copiedNagad ? (
                            <span className="flex items-center gap-1.5 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                              কপি হয়েছে!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                              </svg>
                              <span className="hidden sm:inline">কপি করুন</span><span className="sm:hidden">কপি</span>
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <label className="block text-[13px] font-bold mb-2 text-slate-700">যে নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={senderNumber} 
                          onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                          required={['bkash', 'nagad'].includes(paymentMethod)}
                          maxLength={11}
                          pattern="01[3-9][0-9]{8}"
                          className={`w-full px-4 py-3 border-2 bg-white rounded-xl outline-none focus:border-blue-500 font-mono font-bold pr-10 ${senderNumber.length === 11 ? 'border-green-400' : 'border-slate-200'}`} 
                          placeholder="01XXXXXXXXX" 
                        />
                        {senderNumber.length === 11 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Code section */}
              <div className="border-t border-slate-100 pt-4">
                <button 
                  type="button" 
                  onClick={() => setCouponOpen(!couponOpen)} 
                  className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span>{couponOpen ? 'কুপন কোড বাদ দিন' : 'কুপন কোড আছে? ক্লিক করুন'}</span>
                </button>
                
                {couponOpen && (
                  <div className="mt-3 flex gap-2">
                    <div className="flex-grow">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)} 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono font-bold uppercase tracking-wider" 
                        placeholder="কুপন কোড লিখুন..." 
                      />
                      {couponError && (
                        <p className="text-red-500 text-[12px] font-bold mt-1.5">{couponError}</p>
                      )}
                      {couponSuccessMessage && (
                        <p className="text-green-600 text-[12px] font-bold mt-1.5">{couponSuccessMessage}</p>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      className="px-6 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition h-[48px]"
                    >
                      প্রয়োগ
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing breakdown & checkout button */}
              <div className="pt-4 border-t border-slate-100">
                {totalDiscount > 0 && (
                  <div className="space-y-2 text-sm font-semibold text-slate-500 mb-4">
                    <div className="flex justify-between">
                      <span>মূল্য:</span>
                      <span>৳{basePrice}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>ছাড়:</span>
                      <span>-৳{totalDiscount}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-5">
                  <span className="font-black text-[16px] text-slate-700">সর্বমোট পরিশোধযোগ্য:</span>
                  <span className="font-black text-[2rem] leading-none text-blue-700">৳{finalPrice}</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || isPending}
                  className="relative overflow-hidden w-full h-14 justify-center text-[17px] rounded-xl text-white font-black shadow-lg transition-transform active:scale-95 flex items-center gap-2 border-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5" 
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
                >
                  {isSubmitting || isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      প্রসেস হচ্ছে...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      অর্ডার কনফার্ম করুন
                    </span>
                  )}
                </button>

                {/* Trust Seal */}
                <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
                  <svg className="w-8 h-8 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <div>
                    <h4 className="font-bold text-green-800 text-[14px]">১০০% মানি-ব্যাক গ্যারান্টি</h4>
                    <p className="text-green-700 text-[12px] leading-relaxed">Pro প্ল্যান নিয়ে ফাইনাল অ্যাসেসমেন্টে NYC হলে শর্তসাপেক্ষে ৫০% ক্যাশব্যাক। আপনার পেমেন্ট সম্পূর্ণ নিরাপদ ও সুরক্ষিত।</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {landingFaqs.length > 0 && (
        <section className="py-14 sm:py-20 bg-slate-50 border-t border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-black text-slate-900 mb-4 text-[24px] sm:text-[36px]">সাধারণ জিজ্ঞাসা</h2>
              <p className="text-[15px] text-slate-500">আমাদের সম্পর্কে প্রায়ই জানতে চাওয়া প্রশ্নের উত্তর।</p>
            </div>
            
            <FaqAccordion items={landingFaqs} />
          </div>
        </section>
      )}

      {/* Financial Assistance */}
      <section className="py-14 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl p-8 sm:p-10 border border-sky-200 bg-sky-50/50">
            <h3 className="font-black text-[1.3rem] mb-3 text-slate-900">আর্থিক সহায়তা প্রয়োজন?</h3>
            <p className="text-[15px] mb-6 leading-relaxed text-slate-600">আপনার আর্থিক অবস্থা যদি সত্যিই কঠিন হয় এবং সাবস্ক্রিপশন ফি দেওয়া সম্ভব না হয়, তবে আমাদের ইমেইল করুন। আমরা আপনার বিষয়টি বিবেচনা করব।</p>
            <a href={`mailto:${settings['contact_email'] || 'support@assessmentbd.com'}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-sky-300 hover:border-sky-400 font-bold text-[15px] text-blue-700 transition">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              ইমেইল করুন
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 text-white text-center relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900">
        <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-10 bg-radial-white" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-10 bg-radial-amber" />
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-black mb-5 text-[24px] sm:text-[36px] tracking-tight">আজই শুরু করুন। আর দেরি নয়।</h2>
          <p className="text-blue-200 text-[17px] mb-10">
            আপনার Occupation-এর Question Bank নিন — মাত্র ৳{basicPrice} থেকে শুরু।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={scrollToCheckout} className="text-white px-10 py-4 rounded-xl font-black text-[17px] shadow-xl hover:shadow-2xl transition-all duration-300 bg-amber-500 hover:bg-amber-600 hover:-translate-y-0.5">
              Question Bank নিন — ৳{basicPrice} থেকে
            </button>
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-black text-[17px] transition-colors border-2 border-white/20 hover:bg-white/10"
              style={{ background: 'rgba(255, 255, 255, 0.12)' }}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      {/* Mobile Sticky bottom CTA bar */}
      {stickyVisible && (
        <div id="mobile-sticky-bar" className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3.5 flex gap-3 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-2xl transition duration-300">
          <button onClick={scrollToCheckout} className="flex-grow font-black text-[15px] text-white rounded-xl py-3.5 flex items-center justify-center gap-1.5 bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg border-none hover:opacity-95">
            Question Bank নিন
          </button>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-14 rounded-xl flex items-center justify-center border border-green-200 bg-green-50 hover:bg-green-100">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.776.467 3.441 1.28 4.888L2 22l5.247-1.255A9.96 9.96 0 0012.004 22C17.53 22 22 17.523 22 12c0-5.522-4.47-10-9.996-10z"/>
            </svg>
          </a>
        </div>
      )}

      {/* Unavailable Occupation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-7 shadow-2xl relative">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl bg-amber-50 border border-amber-100">⚠️</div>
              <h3 className="font-black text-[1.2rem] mb-2 text-slate-800">দুঃখিত!</h3>
              <p className="text-[14px] leading-relaxed text-slate-500">
                <strong className="text-blue-800">{selectedCourseTitleForModal}</strong> Occupation-এর Question Bank এখনো আপলোড করা হয়নি।
                খুব শীঘ্রই যুক্ত করা হবে। প্রয়োজন হলে WhatsApp-এ জানাতে পারেন।
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <a 
                href={`${whatsappLink}?text=${encodeURIComponent('আমার এই Occupation-এর Question Bank প্রয়োজন: ' + selectedCourseTitleForModal)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-[15px] text-white transition bg-green-500 hover:bg-green-600"
                onClick={() => setShowModal(false)}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.776.467 3.441 1.28 4.888L2 22l5.247-1.255A9.96 9.96 0 0012.004 22C17.53 22 22 17.523 22 12c0-5.522-4.47-10-9.996-10z"/>
                </svg>
                WhatsApp-এ জানান
              </a>
              <button 
                onClick={() => setShowModal(false)} 
                type="button" 
                className="py-3 rounded-xl font-bold text-[14px] bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible FAQ Accordion helper
function FaqAccordion({ items }: { items: any[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {items.map((faq, idx) => {
        const isOpen = activeIdx === idx;
        return (
          <div key={idx} className={`border border-slate-200 rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-blue-300' : 'hover:border-blue-100 bg-white'}`}>
            <button 
              onClick={() => toggle(idx)} 
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <span className="font-black text-[15px] sm:text-[16px] pr-4 leading-snug text-slate-800">{faq.q}</span>
              <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-[14px] sm:text-[15px] leading-relaxed border-t border-slate-100 pt-4 text-slate-500">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
