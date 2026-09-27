import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { robots: { index: false } };

export default function LoginPage() {
  return <div className="container"><Suspense><AuthForm mode="login" /></Suspense></div>;
}
