"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Registrar el Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✓ BeHu PWA Service Worker registrado con éxito:", registration.scope);
          })
          .catch((error) => {
            console.error("Error al registrar el Service Worker:", error);
          });
      });
    }

    // Verificar si ya está ejecutándose como aplicación instalada (standalone)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Capturar evento de instalación de Chrome / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Solo mostrar si no se ha descartado antes en esta sesión
      if (!sessionStorage.getItem("behu_pwa_dismissed")) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Mostrar banner para iOS si no es standalone y no se ha descartado
    if (isAppleDevice && !standaloneMode && !sessionStorage.getItem("behu_pwa_dismissed")) {
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowInstallBanner(false);
    sessionStorage.setItem("behu_pwa_dismissed", "true");
  };

  if (isStandalone || dismissed || !showInstallBanner) {
    return null;
  }

  return (
    <aside
      className="pwa-install-banner"
      role="region"
      aria-label="Aviso de instalación de aplicación"
    >
      <div className="pwa-content">
        <div className="pwa-icon">
          <Download size={18} />
        </div>
        <div className="pwa-text">
          <strong>Instala BeHu en tu móvil</strong>
          {isIOS ? (
            <span>
              Toca el botón <strong>Compartir <Share2 size={13} style={{ display: "inline", verticalAlign: "middle" }} /></strong> y selecciona <strong>&quot;Agregar a inicio&quot;</strong>.
            </span>
          ) : (
            <span>Úsala a pantalla completa como una app nativa, rápida y sin barras.</span>
          )}
        </div>
      </div>
      <div className="pwa-actions">
        {deferredPrompt && (
          <button onClick={handleInstallClick} className="btn btn-primary btn-sm">
            Instalar
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Cerrar aviso de instalación"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
