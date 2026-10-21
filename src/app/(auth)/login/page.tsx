import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de BeHu para gestionar tus finanzas personales.",
};

export default function LoginPage() {
  return <LoginForm />;
}
