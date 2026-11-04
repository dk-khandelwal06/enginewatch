"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface VoiceContextType {
  isSupported: boolean;
  isEnabled: boolean;
  isSpeaking: boolean;
  toggleVoice: () => void;
  speakSection: (sectionId: string, narrationText: string) => void;
  stopVoice: () => void;
}

const VoiceContext = createContext<VoiceContextType>({
  isSupported: false,
  isEnabled: false,
  isSpeaking: false,
  toggleVoice: () => {},
  speakSection: () => {},
  stopVoice: () => {},
});

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const spokenSectionsRef = useRef<Set<string>>(new Set());
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stopVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    if (isEnabled) {
      stopVoice();
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
      // Speak introductory confirmation
      if (synthRef.current && isSupported) {
        const intro = new SpeechSynthesisUtterance("EngineWatch Voice Telemetry Guide active.");
        intro.rate = 1.0;
        intro.pitch = 0.95;
        synthRef.current.speak(intro);
      }
    }
  };

  const speakSection = (sectionId: string, narrationText: string) => {
    if (!isEnabled || !isSupported || !synthRef.current) return;
    if (spokenSectionsRef.current.has(sectionId)) return;

    // Do not interrupt user if currently typing in an input
    if (typeof document !== "undefined") {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }
    }

    spokenSectionsRef.current.add(sectionId);
    synthRef.current.cancel(); // Cancel any ongoing speech cleanly

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1.02;
    utterance.pitch = 0.96;

    // Select a pleasant English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("David") || v.name.includes("Daniel")) && v.lang.startsWith("en")
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  return (
    <VoiceContext.Provider
      value={{
        isSupported,
        isEnabled,
        isSpeaking,
        toggleVoice,
        speakSection,
        stopVoice,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);

