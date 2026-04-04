import ChatSidebar from "@/components/chat/chat-sidebar"

export default function ChatLayout({ children, }: { children: React.ReactNode }) {
  return (
    <section className="h-[calc(100vh-90px)] min-h-0 overflow-hidden">
      <div className="grid h-full min-h-0 grid-cols-[320px_minmax(0,1fr)] overflow-hidden rounded-xl border border-gray-200 bg-white">
        <ChatSidebar />
        <div className="min-h-0 min-w-0 overflow-hidden">{children}</div>
      </div>
    </section>
  )
}
