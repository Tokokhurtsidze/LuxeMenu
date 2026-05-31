import Link from 'next/link'

export default function MenuNotFound() {
  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center text-center px-6">
      <p className="text-6xl mb-6 opacity-30">🍽</p>
      <h1 className="font-display text-3xl font-bold text-white mb-3">Menu Not Found</h1>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-8">
        This restaurant menu doesn&apos;t exist or is currently unavailable. Please scan the QR
        code again or contact your server.
      </p>
      <div className="flex items-center gap-3">
        <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold/30" />
        <span className="text-gold/40 text-xs">◆</span>
        <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold/30" />
      </div>
    </div>
  )
}
