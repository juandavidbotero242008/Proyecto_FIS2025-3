import { getCurrentUser } from "@/lib/dal";
import MicroLearning from "@/components/MicroLearning";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aprende · Micro-Learning",
  description: "Módulos interactivos y quizzes cortos de educación financiera en BeHu.",
};

export default async function LearnPage() {
  const user = await getCurrentUser();

  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="page-header">
        <div>
          <h1>Educación Financiera Interactiva 🎓</h1>
          <p className="muted">
            Micro-módulos prácticos para dominar conceptos de ahorro, crédito e inversión y ganar insignias para tu perfil.
          </p>
        </div>
      </header>

      <MicroLearning
        completedLessons={user.completedLessons || []}
        badges={user.badges || []}
      />
    </div>
  );
}
