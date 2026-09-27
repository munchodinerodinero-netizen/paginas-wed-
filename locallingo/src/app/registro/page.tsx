import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { robots: { index: false } };

export default function RegisterPage() {
  return <div className="container"><Suspense><AuthForm mode="register" /></Suspense></div>;
}
