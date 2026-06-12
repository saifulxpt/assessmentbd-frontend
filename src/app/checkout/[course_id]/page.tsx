'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCourseBySlug } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: Promise<{ course_id: string }> }) {
  const { course_id } = use(params);
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  // We are using the slug to fetch course details, but the parameter is named course_id
  useEffect(() => {
    const fetchCourse = async () => {
      const data = await getCourseBySlug(course_id);
      if (data) {
        setCourse(data);
      } else {
        setMessage({ type: 'error', text: 'Course not found' });
      }
      setLoading(false);
    };
    fetchCourse();
  }, [course_id]);

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">You must be logged in to purchase a course.</p>
          <Link href="/login" className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          course_id: course.id,
          payment_method: paymentMethod,
          sender_number: senderNumber,
          transaction_id: transactionId,
          amount: course.price
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Payment submitted successfully! Your course will be activated soon.' });
        setTimeout(() => {
          router.push('/user/my-courses');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Payment submission failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Payment Information</h2>
              
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How to pay manually:</h3>
                <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm">
                  <li>Send exactly <strong>৳{course.price}</strong> to our bKash/Nagad Merchant Number: <strong>017XXXXXXXX</strong></li>
                  <li>Copy the Transaction ID (TrxID) from the SMS.</li>
                  <li>Fill out the form below with your number and the TrxID.</li>
                </ol>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer flex items-center justify-center p-4 border rounded-lg ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold ring-2 ring-pink-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <input type="radio" name="payment_method" value="bkash" className="sr-only" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} />
                      bKash
                    </label>
                    <label className={`cursor-pointer flex items-center justify-center p-4 border rounded-lg ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-2 ring-orange-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <input type="radio" name="payment_method" value="nagad" className="sr-only" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} />
                      Nagad
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="sender_number" className="block text-sm font-medium text-gray-700">Sender Number</label>
                  <input
                    type="text"
                    id="sender_number"
                    required
                    placeholder="e.g. 01700000000"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    id="transaction_id"
                    required
                    placeholder="e.g. 8K3H9J2M"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting || message.type === 'success'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-colors disabled:opacity-50 text-lg"
                  >
                    {submitting ? 'Verifying...' : `Confirm Payment of ৳${course.price}`}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Order Summary</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {course.image_url && <img src={course.image_url} alt="Course" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.duration} hrs • {course.total_lessons} Lessons</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6 border-t border-b py-4">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>৳{course.price}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳0</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>৳{course.price}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
