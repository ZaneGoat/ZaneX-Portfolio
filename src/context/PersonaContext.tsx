import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { sound } from "@/lib/sound";
import { useDeviceTelemetry, DeviceTelemetry } from "@/hooks/useDeviceTelemetry";

export type Persona = "guest" | "friend" | "operator";
export type DeviceChoice = "auto" | "phone" | "desktop";

interface PersonaContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;
  cyclePersona: () => void;
  // Device check & telemetry
  telemetry: DeviceTelemetry;
  deviceChoice: DeviceChoice;
  setDeviceChoice: (choice: DeviceChoice) => void;
  spoofActive: boolean;
  isHonest: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const PERSONA_STORAGE_KEY = "zanex_visitor_persona";
const DEVICE_STORAGE_KEY = "zanex_device_choice";

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersonaState] = useState<Persona>("guest");
  const [deviceChoice, setDeviceChoiceState] = useState<DeviceChoice>("auto");
  const telemetry = useDeviceTelemetry();

  useEffect(() => {
    try {
      const savedPersona = localStorage.getItem(PERSONA_STORAGE_KEY) as Persona | null;
      if (savedPersona && (savedPersona === "guest" || savedPersona === "friend" || savedPersona === "operator")) {
        setPersonaState(savedPersona);
      }

      const savedDevice = localStorage.getItem(DEVICE_STORAGE_KEY) as DeviceChoice | null;
      if (savedDevice && (savedDevice === "auto" || savedDevice === "phone" || savedDevice === "desktop")) {
        setDeviceChoiceState(savedDevice);
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

  const setDeviceChoice = (choice: DeviceChoice) => {
    setDeviceChoiceState(choice);
    try {
      localStorage.setItem(DEVICE_STORAGE_KEY, choice);
    } catch {}

    const isMatch =
      choice === "auto" ||
      (choice === "phone" && telemetry.isMobile) ||
      (choice === "desktop" && !telemetry.isMobile);

    if (isMatch) {
      sound.playSuccess();
      sound.haptic([25, 40]);
    } else {
      sound.playError();
      sound.haptic([60, 40, 80]);
    }
  };

  const spoofActive = useMemo(() => {
    if (deviceChoice === "auto") return false;
    if (deviceChoice === "phone" && !telemetry.isMobile) return true;
    if (deviceChoice === "desktop" && telemetry.isMobile) return true;
    return false;
  }, [deviceChoice, telemetry.isMobile]);

  const isHonest = useMemo(() => {
    if (deviceChoice === "auto") return true;
    return !spoofActive;
  }, [deviceChoice, spoofActive]);

  return (
    <PersonaContext.Provider
      value={{
        persona,
        setPersona,
        cyclePersona,
        telemetry,
        deviceChoice,
        setDeviceChoice,
        spoofActive,
        isHonest
      }}
    >
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
