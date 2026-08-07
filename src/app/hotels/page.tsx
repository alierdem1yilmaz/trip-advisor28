import type { Metadata } from "next";
import { HotelsContent } from "./HotelsContent";

export const metadata: Metadata = {
  title: "Hotels — VoyageAI",
};

export default function HotelsPage() {
  return <HotelsContent />;
}
