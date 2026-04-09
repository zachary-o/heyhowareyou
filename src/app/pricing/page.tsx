import PricingClient from "@/components/PricingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Get Flames to rate and improve your dating openers. Pay per use or unlock Top Openers with a one-time payment.",
};

export default function PricingPage() {
  return <PricingClient />;
}