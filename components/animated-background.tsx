'use client'

import { useEffect, useState } from 'react'

function Particle({ delay, duration, left }: { delay: number; duration: number; left: number }) {
  return (
    <div
      className="particle"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<
    Array<{ id: number; delay: number; duration: number; left: number }>
  >([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      left: Math.random() * 100,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <>
      <div className="animated-bg" />
      <div className="grid-overlay" />
      <div className="particles">
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            delay={particle.delay}
            duration={particle.duration}
            left={particle.left}
          />
        ))}
      </div>
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute h-[500px] w-[500px] animate-float rounded-full"
          style={{
            top: '10%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(207, 161, 59, 0.16) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute h-[400px] w-[400px] animate-float rounded-full"
          style={{
            bottom: '20%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(116, 118, 55, 0.16) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '-3s',
          }}
        />
        <div
          className="absolute h-[300px] w-[300px] animate-float rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(239, 190, 118, 0.14) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '-5s',
          }}
        />
      </div>
    </>
  )
}
