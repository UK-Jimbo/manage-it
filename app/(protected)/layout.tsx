import { SessionMonitor } from "@/components/session-monitor";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionMonitor />
      {children}
    </>
  );
}
