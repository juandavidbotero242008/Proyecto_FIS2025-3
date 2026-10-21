import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en BeHu y empieza a controlar tus gastos y ahorros.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
