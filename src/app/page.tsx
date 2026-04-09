import HomeClient from "@/components/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rate My Opener",
  description: "Paste your dating opener and get instant AI-powered feedback. Find out if your first message will get a reply.",
};

export default function Home() {
  return <HomeClient />;
}