"use client";

import { useState } from "react";
import { Award, CheckCircle2, ChevronRight, Sparkles, Trophy, X } from "lucide-react";
import { claimLessonBadge } from "@/actions/education";

export type Lesson = {
  id: string;
  title: string;
  category: "Ahorro" | "Presupuesto" | "Crédito" | "Inversión";
  duration: string;
  emoji: string;
  badge: string;
  summary: string;
  concept: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export const LESSONS: Lesson[] = [
  {
    id: "regla-50-30-20",
    title: "La Regla 50/30/20: Tu brújula de gasto",
    category: "Presupuesto",
    duration: "2 min",
    emoji: "🧭",
    badge: "Maestro del Presupuesto",
    summary: "Aprende a distribuir tus ingresos entre necesidades, gustos y ahorro.",
    concept: [
      "50% Necesidades: Gastos esenciales como alimentación, arriendo, transporte y salud.",
      "30% Deseos: Salidas, entretenimiento, compras no esenciales y hobbies.",
      "20% Ahorro e Inversión: Tu fondo de emergencia, metas futuras y amortización de deudas.",
    ],
    quiz: {
      question: "¿Qué porcentaje de tus ingresos recomienda esta regla destinar al ahorro y futuro?",
      options: ["El 50%", "El 30%", "El 20%", "Lo que sobre a fin de mes"],
      correctIndex: 2,
      explanation: "¡Correcto! El 20% debe pagarse a ti mismo primero para crear tu colchón financiero.",
    },
  },
  {
    id: "interes-compuesto-deuda",
    title: "El peligro del interés en tarjetas de crédito",
    category: "Crédito",
    duration: "3 min",
    emoji: "🛡️",
    badge: "Escudo Financiero",
    summary: "Descubre cómo evitar pagar el doble por tus compras al diferir cuotas.",
    concept: [
      "Una tarjeta de crédito es un préstamo a corto plazo, no dinero gratis.",
      "Si compras a 1 cuota y pagas a tiempo, usualmente no pagas intereses.",
      "Diferir compras pequeñas a 12 o 24 cuotas hace que termines pagando hasta el doble por los intereses corrientes.",
    ],
    quiz: {
      question: "¿Cuál es la mejor práctica al usar tarjeta de crédito para compras cotidianas?",
      options: [
        "Pagar el monto mínimo cada mes",
        "Pagar a 1 sola cuota (totalero) antes de la fecha límite",
        "Diferir todo a 24 meses",
        "Retirar efectivo de la tarjeta",
      ],
      correctIndex: 1,
      explanation: "¡Exacto! Pagar el total a 1 cuota te permite aprovechar beneficios y generar historial sin pagar intereses.",
    },
  },
  {
    id: "fondo-emergencia-metas",
    title: "Fondo de Emergencia y Metas Claras",
    category: "Ahorro",
    duration: "2 min",
    emoji: "🎯",
    badge: "Ahorrador Pro",
    summary: "Por qué congelar dinero para metas te protege de gastos impulsivos.",
    concept: [
      "Un fondo de emergencia debe cubrir entre 1 y 3 meses de tus gastos fijos básicos.",
      "Ponerle nombre, emoji y fecha a una meta incrementa en un 70% las probabilidades de completarla.",
      "Congelar el saldo de tus metas en BeHu evita que lo gastes en compras emocionales.",
    ],
    quiz: {
      question: "¿Para qué sirve congelar dinero en una meta de ahorro?",
      options: [
        "Para que el banco no me cobre",
        "Para apartarlo de mi saldo disponible y no gastarlo impulsivamente",
        "Para pagar impuestos",
        "No sirve de nada",
      ],
      correctIndex: 1,
      explanation: "¡Muy bien! El saldo congelado garantiza que tu dinero trabaje para tus sueños y no para antojos pasajeros.",
    },
  },
  {
    id: "cdt-inversion-basica",
    title: "Inversión Básica: ¿Qué es un CDT?",
    category: "Inversión",
    duration: "3 min",
    emoji: "📈",
    badge: "Inversionista Novato",
    summary: "Cómo hacer que tu dinero no pierda valor con la inflación de forma segura.",
    concept: [
      "Un CDT (Certificado de Depósito a Término) es un producto donde dejas tu dinero en el banco por un plazo fijo a cambio de una tasa fija garantizada.",
      "Tienen bajo riesgo y están protegidos por el seguro de depósitos del gobierno (Fogafín).",
      "Es el primer paso ideal para rentabilizar ahorros sin arriesgar tu capital en la bolsa.",
    ],
    quiz: {
      question: "¿Qué ventaja principal ofrece un CDT frente a dejar el dinero quieto bajo el colchón?",
      options: [
        "Genera rendimientos fijos y protege tu dinero de perder valor por la inflación",
        "Te permite retirar el dinero en cualquier segundo sin condiciones",
        "Tiene rendimiento infinito",
        "No tiene ninguna ventaja",
      ],
      correctIndex: 0,
      explanation: "¡Excelente! Un CDT asegura un rendimiento pactado sin riesgo de volatilidad.",
    },
  },
];

export default function MicroLearning({
  completedLessons = [],
  badges = [],
}: {
  completedLessons: string[];
  badges: string[];
}) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [awardedBadge, setAwardedBadge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setAwardedBadge(null);
  };

  const handleSubmitQuiz = async () => {
    if (selectedOption === null || !activeLesson) return;
    setQuizSubmitted(true);

    if (selectedOption === activeLesson.quiz.correctIndex) {
      setLoading(true);
      try {
        const res = await claimLessonBadge(activeLesson.id, activeLesson.badge);
        if (res.ok) {
          setAwardedBadge(activeLesson.badge);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* Insignias Obtenidas */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.06))" }}>
        <div className="row-between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={20} color="var(--warning)" />
            <h3 style={{ fontSize: 16 }}>Tus Insignias Financieras ({badges.length})</h3>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Cada lección completada suma +5 puntos a tu Score BeHu
          </span>
        </div>
        {badges.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Aún no has desbloqueado insignias. Completa tu primer módulo interactivo abajo para ganar tu primera medalla.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {badges.map((b) => (
              <span
                key={b}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                <Award size={15} /> {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Lecciones / Módulos de Micro-Learning (HU-09) */}
      <div className="grid-2">
        {LESSONS.map((l) => {
          const isDone = completedLessons.includes(l.id);
          return (
            <div
              key={l.id}
              className="card stack"
              style={{
                gap: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: isDone ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border)",
              }}
              onClick={() => handleStartLesson(l)}
            >
              <div className="row-between">
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: "var(--surface)",
                    color: "var(--text-dim)",
                    fontWeight: 600,
                  }}
                >
                  {l.category} · {l.duration}
                </span>
                {isDone ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Completado
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>
                    Insignia: {l.badge}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{l.emoji}</span>
                <div>
                  <h3 style={{ fontSize: 15, marginBottom: 4 }}>{l.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>{l.summary}</p>
                </div>
              </div>

              <div className="row-between" style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {isDone ? "Volver a repasar" : "Iniciar lección + Quiz"}
                </span>
                <ChevronRight size={16} color="var(--primary)" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Interactivo de Aprendizaje y Quiz */}
      {activeLesson && (
        <div className="modal-backdrop" onClick={() => setActiveLesson(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{activeLesson.emoji}</span>
                <h2>{activeLesson.title}</h2>
              </div>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setActiveLesson(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="stack" style={{ gap: 18, padding: "10px 0" }}>
              {/* Conceptos Clave */}
              <div style={{ background: "var(--surface)", padding: 16, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8 }}>
                  💡 Conceptos Clave
                </h4>
                <ul style={{ paddingLeft: 18, fontSize: 13.5, color: "var(--text)", lineHeight: 1.6 }}>
                  {activeLesson.concept.map((c, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quiz Interactivo (HU-09) */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <h4 style={{ fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={16} color="var(--primary)" /> Micro-Quiz de Evaluación:
                </h4>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
                  {activeLesson.quiz.question}
                </p>

                <div className="stack" style={{ gap: 8 }}>
                  {activeLesson.quiz.options.map((opt, idx) => {
                    let btnStyle = "var(--surface)";
                    let border = "1px solid var(--border)";

                    if (quizSubmitted) {
                      if (idx === activeLesson.quiz.correctIndex) {
                        btnStyle = "rgba(16, 185, 129, 0.2)";
                        border = "1px solid var(--success)";
                      } else if (idx === selectedOption) {
                        btnStyle = "rgba(244, 63, 94, 0.2)";
                        border = "1px solid var(--danger)";
                      }
                    } else if (selectedOption === idx) {
                      btnStyle = "var(--surface-hover)";
                      border = "1px solid var(--primary)";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: btnStyle,
                          border,
                          color: "var(--text)",
                          fontSize: 13.5,
                          cursor: quizSubmitted ? "default" : "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onClick={() => !quizSubmitted && setSelectedOption(idx)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explicación y resultado */}
                {quizSubmitted && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: "var(--radius-sm)",
                      background:
                        selectedOption === activeLesson.quiz.correctIndex
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(244, 63, 94, 0.15)",
                      border: `1px solid ${
                        selectedOption === activeLesson.quiz.correctIndex ? "var(--success)" : "var(--danger)"
                      }`,
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      {selectedOption === activeLesson.quiz.correctIndex ? "🎉 ¡Respuesta Correcta!" : "❌ Inténtalo de nuevo"}
                    </p>
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                      {activeLesson.quiz.explanation}
                    </p>
                  </div>
                )}

                {/* Notificación de Insignia Desbloqueada */}
                {awardedBadge && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: "var(--radius)",
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.2))",
                      border: "1px solid var(--success)",
                      textAlign: "center",
                      animation: "scaleIn 0.3s ease",
                    }}
                  >
                    <Trophy size={32} color="var(--warning)" style={{ margin: "0 auto 6px" }} />
                    <h3 style={{ fontSize: 15, color: "#34d399", marginBottom: 2 }}>
                      ¡Nueva Insignia Desbloqueada!
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text)" }}>
                      Ganaste la insignia <strong>&quot;{awardedBadge}&quot;</strong> y sumaste <strong>+5 puntos</strong> a tu Score BeHu.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setActiveLesson(null)}>
                Cerrar
              </button>
              {!quizSubmitted ? (
                <button
                  className="btn btn-primary"
                  disabled={selectedOption === null}
                  onClick={handleSubmitQuiz}
                >
                  Verificar Respuesta
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setActiveLesson(null)}>
                  Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
