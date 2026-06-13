import { prisma, getCachedSettings } from '@/lib/prisma';
import PricingClient from './PricingClient';

export const metadata = {
  title: 'NSDA Assessment প্রস্তুতি — Basic ও Pro Plan | AssessmentBD',
  description: 'NSDA CBT&A Assessment-এর জন্য Competency Standard (CS) অনুযায়ী UoC-wise Question Bank, Model Assessment ও Expert Support। Basic Plan ৳১০০/মাস, Pro Plan ৳৩০০/৩ মাস। NYC হলে ৫০% Money-back।',
  keywords: 'nsda assessment preparation plan, cbt&a model assessment subscription, nsda question bank price bangladesh, unit of competency question bank, nsda assessment question bank, assessmentbd pricing, nsda nyc refund guarantee, nsda pro plan'
};

export default async function PricingPage() {
  const settingsMap = await getCachedSettings();

  const basicPrice = settingsMap['basic_plan_price'] || '99';
  const proPrice = settingsMap['pro_plan_price'] || '299';
  const faqsJson = settingsMap['site_faqs'] || '[]';


  let faqs: any[] = [];
  try {
    faqs = JSON.parse(faqsJson);
  } catch (e) {}

  const pricingFaqs = faqs.filter((f: any) => f.section === 'Pricing');

  return (
    <PricingClient 
      basicPrice={basicPrice} 
      proPrice={proPrice} 
      pricingFaqs={pricingFaqs} 
    />
  );
}
