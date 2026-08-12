import type { Metadata } from "next";
import { LoginContent } from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign in — VoyageAI",
};

export default function LoginPage() {
  return <LoginContent />;
}
