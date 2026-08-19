import { useRef, useState } from "react";
import type { GlobalCal } from "@calcom/embed-core";

export interface CalThemeConfig {
  brandColor?: string;
  borderRadius?: number;
}

export interface CalWidgetProps {
  eventSlug: string;
  triggerLabel: string;
  mode: "popup";
  theme?: CalThemeConfig;
  prefillName?: string;
  prefillEmail?: string;
  prefillNotes?: string;
  className?: string;
  onOpen?: () => void;
  onBookingSuccess?: () => void;
}

type SdkState = "idle" | "loading" | "ready";

export default function CalWidget({
  eventSlug,
  triggerLabel,
  theme,
  prefillName,
  prefillEmail,
  prefillNotes,
  className,
  onOpen,
  onBookingSuccess,
}: CalWidgetProps) {
  const [sdkState, setSdkState] = useState<SdkState>("idle");
  const calRef = useRef<GlobalCal | null>(null);

  if (!eventSlug) {
    console.error("CalWidget: missing required `eventSlug` prop — the trigger button is disabled.");
  }

  const openModal = async () => {
    let cal = calRef.current;
    if (!cal) {
      setSdkState("loading");
      const { getCalApi } = await import("@calcom/embed-react");
      cal = (await getCalApi()) as GlobalCal;
      calRef.current = cal;
      setSdkState("ready");
    }

    cal("ui", {
      styles: theme?.brandColor ? { branding: { brandColor: theme.brandColor } } : undefined,
      ...(theme?.borderRadius !== undefined ? { borderRadius: theme.borderRadius } : {}),
    });

    if (onOpen) {
      cal("on", { action: "linkReady", callback: onOpen });
    }
    if (onBookingSuccess) {
      cal("on", { action: "bookingSuccessfulV2", callback: onBookingSuccess });
    }

    cal("modal", {
      calLink: eventSlug,
      config: {
        ...(prefillName ? { name: prefillName } : {}),
        ...(prefillEmail ? { email: prefillEmail } : {}),
        ...(prefillNotes ? { notes: prefillNotes } : {}),
      },
    });
  };

  return (
    <button
      type="button"
      disabled={!eventSlug || sdkState === "loading"}
      onClick={openModal}
      className={className}
    >
      {sdkState === "loading" ? (
        <span aria-hidden="true" className="inline-block animate-spin">
          ⟳
        </span>
      ) : (
        triggerLabel
      )}
    </button>
  );
}
