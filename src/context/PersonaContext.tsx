import React, { createContext, useContext, useState, useEffect } from "react";
import { sound } from "@/lib/sound";

export type Persona = "guest" | "friend" | "operator";

interface PersonaContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;
  cyclePersona: () => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const PERSONA_STORAGE_KEY = "zanex_visitor_persona";

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersonaState] = useState<Persona>("guest");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSONA_STORAGE_KEY) as Persona | null;
      if (saved && (saved === "guest" || saved === "friend" || saved === "operator")) {
        setPersonaState(saved);
      }
    } catch {}
  }, []);

  const setPersona = (next: Persona) => {
    setPersonaState(next);
    try {
      localStorage.setItem(PERSONA_STORAGE_KEY, next);
    } catch {}
    sound.playClick();
    sound.haptic(next === "friend" ? [25, 40] : next === "operator" ? [50, 30] : 20);
  };

  const cyclePersona = () => {
    const list: Persona[] = ["guest", "friend", "operator"];
    const idx = list.indexOf(persona);
    const next = list[(idx + 1) % list.length];
    setPersona(next);
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona, cyclePersona }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
};
