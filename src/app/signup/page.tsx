import type { Metadata } from "next";
import { SignupContent } from "./SignupContent";

export const metadata: Metadata = {
  title: "Create your account — VoyageAI",
};

export default function SignupPage() {
  return <SignupContent />;
}
