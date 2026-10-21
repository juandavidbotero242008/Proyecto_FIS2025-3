"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, TrendingUp, User, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/format";

type AssistantContext = {
  name: string;
  role: "SENIOR" | "JUNIOR";
  currency: string;
  score: number;
  availableBalance: number;
  thisMonthExpense: number;
  thisWeekExpense: number;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  frozenInGoals: number;
};

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  tips?: string[];
  recommendationType?: "inversion" | "ahorro" | "limites" | "general";
};

export default function BeHuMiniAssistant({ ctx }: { ctx: AssistantContext }) {
  const isSenior = ctx.role === "SENIOR";

  const defaultPrompts = isSenior
    ? [
        "¿En qué puedo invertir mis excedentes de liquidez?",
        "¿Cómo diversificar el patrimonio y fondos de bajo riesgo (CDTs)?",
        "¿Cómo estructurar el fondo de emergencia familiar?",
        "¿Cómo optimizar los presupuestos asignados a mis dependientes?",
      ]
    : [
        "¿Cómo puedo cumplir mi meta de ahorro más rápido?",
        "¿Qué es un gasto hormiga y cómo evitarlo en mis salidas?",
        "¿Cómo mantener mi consumo dentro del límite semanal?",
        "¿Cómo subir mi Score BeHu para construir mi historial crediticio?",
      ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: isSenior
        ? `¡Hola ${ctx.name.split(" ")[0]}! Soy BeHu Mini, tu asistente patrimonial. Con un saldo disponible de ${formatMoney(
            ctx.availableBalance,
            ctx.currency
          )} y un Score de ${ctx.score}/100, estoy listo para asesorarte en inversión de bajo riesgo (CDTs, fondos conservadores) y optimización del presupuesto familiar.`
        : `¡Hola ${ctx.name.split(" ")[0]}! Soy BeHu Mini, tu copiloto financiero personal. Tu saldo disponible para gastar es ${formatMoney(
            ctx.availableBalance,
            ctx.currency
          )} y tienes ${formatMoney(
            ctx.frozenInGoals,
            ctx.currency
          )} congelados en metas. ¿Qué te gustaría aprender o resolver hoy?`,
      recommendationType: isSenior ? "inversion" : "ahorro",
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const handleAsk = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const response = generateAIResponse(queryText, ctx);
      setMessages((prev) => [...prev, response]);
      setThinking(false);
    }, 600);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 600 }}>
      {/* Encabezado del Asistente */}
      <div
        style={{
          padding: "16px 20px",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: isSenior ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: isSenior ? "var(--primary)" : "var(--success)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ fontSize: 15, margin: 0 }}>BeHu Mini Assistant (HU-05)</h3>
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 10,
                  background: isSenior ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: isSenior ? "#60a5fa" : "#34d399",
                  fontWeight: 600,
                }}
              >
                {isSenior ? "Modo Inversión & Familia" : "Modo Educación & Metas"}
              </span>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Inteligencia financiera contextualizada con tus datos en tiempo real
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <Sparkles size={14} color="var(--warning)" />
          Score: <strong style={{ color: "var(--text)" }}>{ctx.score}/100</strong>
        </div>
      </div>

      {/* Sugerencias Rápidas */}
      <div
        style={{
          padding: "10px 16px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 8,
          overflowX: "auto",
        }}
      >
        {defaultPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: 11.5,
              whiteSpace: "nowrap",
              padding: "4px 10px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 20,
            }}
            onClick={() => handleAsk(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Historial de Mensajes */}
      <div
        style={{
          flex: 1,
          padding: 20,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                gap: 10,
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "var(--primary)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  background: isUser ? "var(--primary)" : "var(--surface)",
                  color: isUser ? "#ffffff" : "var(--text)",
                  border: isUser ? "none" : "1px solid var(--border)",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>

                {m.tips && m.tips.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: isUser ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, opacity: 0.8 }}>
                      Puntos Clave:
                    </span>
                    <ul style={{ paddingLeft: 18, marginTop: 4, fontSize: 12.5 }}>
                      {m.tips.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: 3 }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {isUser && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {thinking && (
          <div style={{ display: "flex", gap: 10, alignSelf: "flex-start" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.15)",
                color: "var(--primary)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Bot size={16} />
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radius)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Analizando tus balances y generando recomendaciones...
            </div>
          </div>
        )}
      </div>

      {/* Input de consulta */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(input);
        }}
        style={{
          padding: 14,
          background: "var(--bg-elevated)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 10,
        }}
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isSenior
              ? "Pregúntale a BeHu Mini sobre CDTs, fondos de inversión, fondos de emergencia..."
              : "Pregúntale a BeHu Mini sobre cómo ahorrar, tus límites de gasto o Score..."
          }
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!input.trim() || thinking}>
          <Send size={16} /> Enviar
        </button>
      </form>
    </div>
  );
}

/**
 * Generador de recomendaciones dinámicas orientadas por rol (HU-05)
 */
function generateAIResponse(query: string, ctx: AssistantContext): Message {
  const q = query.toLowerCase();
  const isSenior = ctx.role === "SENIOR";

  if (isSenior) {
    if (q.includes("invertir") || q.includes("cdt") || q.includes("inversión") || q.includes("excedente")) {
      return {
        id: String(Date.now()),
        sender: "assistant",
        text: `📊 Recomendación de Inversión Senior para ${ctx.name}:\n\nTienes un saldo disponible de ${formatMoney(
          ctx.availableBalance,
          ctx.currency
        )}. Para perfiles con patrimonio familiar, la prioridad es preservar capital con rentabilidad real:`,
        tips: [
          `CDTs Bancarios a 180 o 360 días: Ofrecen tasas fijas garantizadas y están respaldados por el seguro de depósitos.`,
          `Fondos de Inversión Colectiva (FIC) de Renta Fija: Liquidez semanal o a 30 días con diversificación en deuda soberana.`,
          `Regla de liquidez: Mantén siempre en cuenta corriente/ahorros entre 1.5 y 2 meses de gastos familiares (${formatMoney(
            ctx.thisMonthExpense * 1.5,
            ctx.currency
          )}) y destina el resto a CDTs escalonados.`,
        ],
        recommendationType: "inversion",
      };
    }

    if (q.includes("emergencia") || q.includes("fondo")) {
      return {
        id: String(Date.now()),
        sender: "assistant",
        text: `🛡️ Estrategia de Fondo de Emergencia Familiar:\n\nTus gastos del mes actual suman ${formatMoney(
          ctx.thisMonthExpense,
          ctx.currency
        )}.`,
        tips: [
          `Meta recomendada: 3 a 6 meses de gastos del hogar (${formatMoney(ctx.thisMonthExpense * 4, ctx.currency)}).`,
          `Ubicación ideal: Cuentas de alto rendimiento con liquidez a la vista o CDTs escalonados en vencimientos mensuales.`,
          `No inviertas el fondo de emergencia en activos volátiles (acciones o cripto).`,
        ],
        recommendationType: "ahorro",
      };
    }

    return {
      id: String(Date.now()),
      sender: "assistant",
      text: `💼 Análisis Patrimonial Senior para ${ctx.name}:\n\nTu comportamiento financiero refleja un Score BeHu de ${ctx.score}/100. Como acudiente, mantener un presupuesto ordenado te permite educar con el ejemplo a los miembros Junior a tu cargo y asegurar liquidez para imprevistos.`,
      tips: [
        "Revisa periódicamente el módulo de Gestión Familiar para asignar presupuestos controlados.",
        "Asegúrate de que cada miembro Junior tenga metas de ahorro activas.",
      ],
      recommendationType: "general",
    };
  }

  // Perfil Junior (Educación, Metas y Límites)
  if (q.includes("meta") || q.includes("ahorr")) {
    return {
      id: String(Date.now()),
      sender: "assistant",
      text: `🎯 Asesoría de Metas para Perfil Junior:\n\nActualmente tienes ${formatMoney(
        ctx.frozenInGoals,
        ctx.currency
      )} protegidos y congelados en tus metas de ahorro (HU-06).`,
      tips: [
        `Abona el 20% de cada presupuesto que recibas antes de empezar a gastar.`,
        `Al tener el saldo congelado en BeHu, previenes compras impulsivas cuando sales con amigos.`,
        `Cumplir tus metas a tiempo incrementa directamente tu Score de Salud Financiera.`,
      ],
      recommendationType: "ahorro",
    };
  }

  if (q.includes("límite") || q.includes("semanal") || q.includes("mesada")) {
    const weeklyLimit = ctx.weeklyLimit ?? 200;
    const remaining = Math.max(0, weeklyLimit - ctx.thisWeekExpense);
    return {
      id: String(Date.now()),
      sender: "assistant",
      text: `⚖️ Control de Límites de Gasto (HU-04):\n\nEsta semana has gastado ${formatMoney(
        ctx.thisWeekExpense,
        ctx.currency
      )} de tu límite de ${formatMoney(weeklyLimit, ctx.currency)}.`,
      tips: [
        `Saldo restante para gastar esta semana: ${formatMoney(remaining, ctx.currency)}.`,
        `Si intentas registrar un gasto que supere tu límite diario, BeHu activará una alerta de compra impulsiva para proteger tu bolsillo.`,
        `Aprender a respetar este límite semanal te preparará para administrar sueldos y créditos reales en el futuro.`,
      ],
      recommendationType: "limites",
    };
  }

  if (q.includes("score") || q.includes("crédito") || q.includes("historial")) {
    return {
      id: String(Date.now()),
      sender: "assistant",
      text: `📈 Cómo potenciar tu Score BeHu (Actualmente: ${ctx.score}/100):\n\nEl Score simula los modelos crediticios bancarios reales (DataCrédito/TransUnion).`,
      tips: [
        `+5 Puntos por cada módulo de Micro-Learning completado en la pestaña 'Aprende'.`,
        `+10 Puntos por terminar la semana por debajo de tu límite de gasto asignado.`,
        `-6 Puntos cuando realizas gastos clasificados como impulsivos.`,
        `Un score superior a 80 puntos demuestra que eres un usuario confiable y disciplinado.`,
      ],
      recommendationType: "inversion",
    };
  }

  // Default Junior
  return {
    id: String(Date.now()),
    sender: "assistant",
    text: `🌟 Consejos de Educación Financiera para ${ctx.name}:\n\nTu saldo disponible actual es de ${formatMoney(
      ctx.availableBalance,
      ctx.currency
    )}. Te sugiero aplicar la regla 50/30/20 y revisar tus límites semanales antes de hacer compras de antojos.`,
    tips: [
      "Divide tus gastos entre lo que realmente necesitas y lo que solo es un gusto pasajero.",
      "Visita la sección 'Aprende' para realizar micro-quizzes y desbloquear insignias.",
    ],
    recommendationType: "ahorro",
  };
}
