import { useState, useEffect } from "react";

export type DetectedOS = "iOS" | "Android" | "Linux" | "macOS" | "Windows" | "Unknown";
export type DeviceCategory = "phone" | "tablet" | "desktop";

export interface DeviceTelemetry {
  isMobile: boolean;
  os: DetectedOS;
  deviceCategory: DeviceCategory;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  dpr: number;
  touchCapable: boolean;
  pointerType: "touch" | "mouse" | "hybrid";
  orientation: "portrait" | "landscape";
  summary: string;
}

function detectOS(ua: string): DetectedOS {
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function getTelemetry(): DeviceTelemetry {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      os: "Unknown",
      deviceCategory: "desktop",
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1920,
      viewportHeight: 1080,
      dpr: 1,
      touchCapable: false,
      pointerType: "mouse",
      orientation: "landscape",
      summary: "Server / Headless"
    };
  }

  const ua = navigator.userAgent;
  const os = detectOS(ua);
  const touchCapable = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
  
  // Real physical screen monitor resolution (e.g., 1920x1080)
  const physicalWidth = window.screen?.width || window.innerWidth;
  const physicalHeight = window.screen?.height || window.innerHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const dpr = Number((window.devicePixelRatio || 1).toFixed(1));

  let deviceCategory: DeviceCategory = "desktop";
  if (/iPad|Tablet|PlayBook/.test(ua) || (touchCapable && viewportWidth >= 768 && viewportWidth <= 1024)) {
    deviceCategory = "tablet";
  } else if (/Mobi|Android|iPhone|iPod/.test(ua) || (touchCapable && viewportWidth < 768)) {
    deviceCategory = "phone";
  } else {
    deviceCategory = "desktop";
  }

  const isMobile = deviceCategory === "phone" || deviceCategory === "tablet";
  const pointerType: "touch" | "mouse" | "hybrid" =
    touchCapable && !window.matchMedia("(pointer: fine)").matches
      ? "touch"
      : touchCapable && window.matchMedia("(pointer: fine)").matches
      ? "hybrid"
      : "mouse";

  const orientation = physicalWidth >= physicalHeight ? "landscape" : "portrait";

  const summary = `${os} ${deviceCategory === "phone" ? "Mobile" : deviceCategory === "tablet" ? "Tablet" : "Workstation"} (${physicalWidth}×${physicalHeight} @ ${dpr}x, ${pointerType})`;

  return {
    isMobile,
    os,
    deviceCategory,
    screenWidth: physicalWidth,
    screenHeight: physicalHeight,
    viewportWidth,
    viewportHeight,
    dpr,
    touchCapable,
    pointerType,
    orientation,
    summary
  };
}

export function useDeviceTelemetry(): DeviceTelemetry {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(getTelemetry);

  useEffect(() => {
    const handleResize = () => {
      setTelemetry(getTelemetry());
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return telemetry;
}
