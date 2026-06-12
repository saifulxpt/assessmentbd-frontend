"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaStar, FaWhatsapp } from 'react-icons/fa';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from our newly created Laravel API
    // Replace localhost with actual API domain later
    axios.get('http://127.0.0.1:8000/api/frontend/landing')
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching landing data", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* URGENCY BANNER */}
      <div className="bg-amber-500 text-amber-950 font-bold text-sm py-2.5 px-4 text-center relative z-50 flex items-center justify-center gap-2 shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        🔥 স্পেশাল অফার: Pro প্ল্যানে ৫০% মানি-ব্যাক গ্যারান্টি! অফারটি যেকোনো সময় শেষ হতে পারে।
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-black leading-tight mb-5 text-4xl sm:text-5xl text-slate-900">
                <span className="text-red-600">NYC (ফেইল)</span> হওয়ার ভয় আর নয়!<br/>
                <span className="text-blue-700">Assessment পাসের শতভাগ প্রস্তুতি</span>
              </h1>
              <p className="text-lg leading-loose mb-8 text-slate-600 max-w-xl mx-auto lg:mx-0">
                ইন্টারনেটে ছড়ানো অগোছালো শিট পড়ে পরীক্ষা দেওয়ার দিন শেষ। আমাদের ১০০% রিয়েল-প্যাটার্ন Question Bank ও Model Test দিয়ে আজই আপনার প্রস্তুতি নিশ্চিত করুন।
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button className="px-8 py-4 text-lg text-white rounded-2xl shadow-lg font-black bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transition-transform">
                  Question Bank নিন
                </button>
                <a href="https://wa.me/8801778654560" target="_blank" rel="noreferrer" className="px-8 py-4 text-lg font-bold border-2 border-green-200 text-green-700 bg-green-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                  <FaWhatsapp className="w-5 h-5" /> WhatsApp করুন
                </a>
              </div>
            </div>
            
            <div className="relative w-full max-w-md mx-auto flex justify-center">
               <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-2xl border-[10px] border-slate-50">
                  <div className="w-[320px] h-[400px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-blue-700 to-blue-800">
                      <h3 className="text-white font-black text-xl">Platform Preview</h3>
                      <p className="text-blue-200 text-sm mt-2">Next.js UI Placeholder</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-blue-700 py-4 overflow-hidden">
        <div className="flex justify-center gap-8 sm:gap-12 whitespace-nowrap overflow-x-auto px-4">
          {['CS Based Preparation','UoC Based Content','নিয়মিত প্রশ্ন আপডেট','Assessment Focused'].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-amber-400">✔</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* PRICING & COURSES LOADING */}
      <section className="py-20 bg-slate-50" id="checkout">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-10 text-slate-900">আপনার কোর্স সিলেক্ট করুন</h2>
          
          {loading ? (
             <div className="text-center text-slate-500 py-10">কোর্স লোড হচ্ছে...</div>
          ) : (
             <div className="grid sm:grid-cols-2 gap-6">
                {data?.courses?.map((course: any) => (
                  <div key={course.id} className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 cursor-pointer shadow-sm transition-all">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-500">Free/Paid: {course.is_free ? 'Free' : 'Paid'}</p>
                  </div>
                ))}
             </div>
          )}
        </div>
      </section>
      
    </div>
  );
}
