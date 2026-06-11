import type { Metadata } from "next";
import DailyWordsManager from "@/components/daily-words/DailyWordsManager";

export const metadata: Metadata = {
  title: "Neno la Siku | KanisaSoft",
  description: "Simamia Neno la Siku la kanisa.",
};

export default function DailyWordsPage() {
  return <DailyWordsManager />;
}

