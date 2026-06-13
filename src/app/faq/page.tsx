import { prisma } from "@/lib/prisma";
import FaqClient from "@/components/FaqClient";

export const metadata = {
  title: "সচরাচর জিজ্ঞাসা (FAQ) | AssessmentBD",
  description: "AssessmentBD সম্পর্কে আপনার যেকোনো প্রশ্নের উত্তর এখানে সহজে খুঁজে নিন।",
};

export default async function FaqPage() {
  const settings = await prisma.settings.findUnique({
    where: { key: "site_faqs" }
  });

  let faqsList: any[] = [];
  if (settings && settings.value) {
    try {
      faqsList = JSON.parse(settings.value);
    } catch (e) {
      console.error("Error parsing FAQs settings JSON:", e);
    }
  }

  // Parse sections
  const sectionsSet = new Set<string>();
  faqsList.forEach((f: any) => {
    if (f.section) {
      sectionsSet.add(f.section);
    }
  });
  const sections = Array.from(sectionsSet);

  return <FaqClient faqsList={faqsList} sections={sections} />;
}
