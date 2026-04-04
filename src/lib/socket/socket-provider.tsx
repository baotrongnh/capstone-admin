"use client";

import { setSocketAuthToken, socket } from "@/lib/socket/socket";
import { useAuthStore } from "@/stores/auth.store";
import { type ReactNode, useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 30_000;

export default function SocketProvider({ children }: { children: ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!accessToken) {
      setSocketAuthToken(null);
      socket.disconnect();
      return;
    }

    const handleConnect = () => {
      console.info("[socket] connected", { id: socket.id });
    };

    const handleDisconnect = (reason: string) => {
      console.info("[socket] disconnected", { reason });
    };

    const handleConnectError = (error: Error) => {
      console.error("[socket] connect error", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    setSocketAuthToken(accessToken);
    socket.connect();

    const heartbeatId = window.setInterval(() => {
      if (socket.connected) {
        socket.emit("chat:heartbeat");
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(heartbeatId);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [isHydrated, accessToken]);

  return <>{children}</>;
}
