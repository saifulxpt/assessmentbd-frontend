import { getCachedSettings } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export async function generateMetadata() {
  const settingsMap = await getCachedSettings();

  return {
    title: settingsMap["seo_title"] || "NSDA Exam Prep | NSDA Assessment Question & Tools Bangladesh",
    description: settingsMap["seo_description"] || "বাংলাদেশের সেরা NSDA Assessment Tools এবং Question Bank। রিয়েল-টাইম CBT&A Model Assessment, অ্যান্টি-চিট সিস্টেম এবং ১০০% মোবাইল ফ্রেন্ডলি পরিবেশে প্রস্তুতি নিন।",
    keywords: settingsMap["seo_keywords"] || "nsda, nsda tools, assessment question, nsda level course, online exam bd"
  };
}

export default async function HomePage() {
  const settingsMap = await getCachedSettings();

  return <HomeClient settings={settingsMap} />;
}

