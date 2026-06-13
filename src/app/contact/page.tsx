import { prisma } from '@/lib/prisma';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'যোগাযোগ | AssessmentBD',
  description: 'যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন। আমাদের সাপোর্ট টিম সবসময় প্রস্তুত আপনাকে সাহায্য করতে.',
  keywords: 'assessmentbd contact, nsda exam help, assessment bd support, nsda preparation help bangladesh, assessmentbd customer support, যোগাযোগ'
};

export default async function ContactPage() {
  const settings = await prisma.settings.findMany({
    where: {
      key: { in: ['site_email', 'site_phone'] }
    }
  });

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.value) settingsMap[s.key] = s.value;
  }

  const siteEmail = settingsMap['site_email'] || 'support@nsdaprep.bd';
  const sitePhone = settingsMap['site_phone'] || '+880 1603-409757';

  return (
    <ContactClient 
      siteEmail={siteEmail} 
      sitePhone={sitePhone} 
    />
  );
}
