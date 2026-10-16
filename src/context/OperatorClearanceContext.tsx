import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sound } from "@/lib/sound";
import { toast } from "sonner";

export interface ClearanceState {
  identityUnlocked: boolean; // Node 1: Real Name, Handle, Base & Bio
  hardwareUnlocked: boolean; // Node 2: Hardware Rig, EC registers & Kali Kernel
  projectsUnlocked: boolean; // Node 3: Classified Project Dossiers
}

const DEFAULT_CLEARANCE: ClearanceState = {
  identityUnlocked: false,
  hardwareUnlocked: false,
  projectsUnlocked: false,
};

const STORAGE_KEY = "zanex_operator_clearance";

interface OperatorClearanceContextType {
  clearance: ClearanceState;
  clearanceLevel: number; // 0, 1, 2, 3
  isAllUnlocked: boolean;
  unlockNode: (node: keyof ClearanceState) => void;
  unlockAll: () => void;
  resetClearance: () => void;
}

const OperatorClearanceContext = createContext<OperatorClearanceContextType | undefined>(undefined);

export const OperatorClearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clearance, setClearance] = useState<ClearanceState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CLEARANCE, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_CLEARANCE;
  });

  const saveClearance = useCallback((newState: ClearanceState) => {
    setClearance(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  }, []);

  const unlockNode = useCallback((node: keyof ClearanceState) => {
    setClearance(prev => {
      if (prev[node]) return prev;
      const updated = { ...prev, [node]: true };
      saveClearance(updated);

      sound.playSuccess();
      sound.haptic([50, 30, 80]);

      let nodeName = "SECURITY NODE";
      if (node === "identityUnlocked") nodeName = "NODE 1: RECON IDENTITY";
      if (node === "hardwareUnlocked") nodeName = "NODE 2: HARDWARE RIG & EC KERNEL";
      if (node === "projectsUnlocked") nodeName = "NODE 3: BLACK-OPS ARCHIVES";

      toast.success(`[CLASSIFIED DOSSIER] ${nodeName} DECLASSIFIED!`, {
        description: "Clearance Level elevated. Redaction removed from operative profile."
      });

      return updated;
    });
  }, [saveClearance]);

  const unlockAll = useCallback(() => {
    const full: ClearanceState = {
      identityUnlocked: true,
      hardwareUnlocked: true,
      projectsUnlocked: true,
    };
    saveClearance(full);
    sound.playZane();
    toast.success("LEVEL 99 MASTER OPERATOR CLEARANCE GRANTED!", {
      description: "All classified redactions decrypted across the entire dossier."
    });
  }, [saveClearance]);

  const resetClearance = useCallback(() => {
    saveClearance(DEFAULT_CLEARANCE);
    sound.playEmpPulse();
    toast.info("CLASSIFIED PROTOCOL RE-ENGAGED", {
      description: "Dossier re-encrypted to Level 0 clearance."
    });
  }, [saveClearance]);

  const clearanceLevel =
    (clearance.identityUnlocked ? 1 : 0) +
    (clearance.hardwareUnlocked ? 1 : 0) +
    (clearance.projectsUnlocked ? 1 : 0);

  const isAllUnlocked = clearanceLevel === 3;

  return (
    <OperatorClearanceContext.Provider
      value={{
        clearance,
        clearanceLevel,
        isAllUnlocked,
        unlockNode,
        unlockAll,
        resetClearance
      }}
    >
      {children}
    </OperatorClearanceContext.Provider>
  );
};

export const useOperatorClearance = () => {
  const ctx = useContext(OperatorClearanceContext);
  if (!ctx) {
    throw new Error("useOperatorClearance must be used within OperatorClearanceProvider");
  }
  return ctx;
};
