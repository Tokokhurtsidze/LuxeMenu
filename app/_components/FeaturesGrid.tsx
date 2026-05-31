'use client'

import { motion } from 'framer-motion'
import { useWebLocale } from '@/contexts/WebLocaleContext'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const card = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function FeaturesGrid() {
  const { t } = useWebLocale()

  const features = [
    { emoji: '⚡', title: t.f1title, desc: t.f1desc },
    { emoji: '🍷', title: t.f2title, desc: t.f2desc },
    { emoji: '⚙️', title: t.f3title, desc: t.f3desc },
    { emoji: '🌐', title: t.f4title, desc: t.f4desc },
    { emoji: '🎨', title: t.f5title, desc: t.f5desc },
    { emoji: '📱', title: t.f6title, desc: t.f6desc },
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {features.map((f, i) => (
        <motion.div
          key={i}
          variants={card}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="relative rounded-2xl p-6 group cursor-default overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }}
          />
          <div className="text-4xl mb-4 leading-none">{f.emoji}</div>
          <h3 className="font-display text-lg text-white mb-2">{f.title}</h3>
          <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
