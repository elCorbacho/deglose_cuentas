/**
 * DonutChart — animated SVG donut chart with hover effects
 * Adapted from 21st.dev
 */

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 22,
  animationDuration = 1,
  centerContent,
  className,
}) {
  const total = useMemo(() => data.reduce((sum, s) => sum + s.value, 0), [data])
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  let cumulativePercentage = 0

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--surface-container-low, #f6f3f2)"
          strokeWidth={strokeWidth}
          opacity={0.5}
        />

        {data.map((segment, index) => {
          if (segment.value === 0) return null
          const percentage = total === 0 ? 0 : (segment.value / total) * 100
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
          const strokeDashoffset = -(cumulativePercentage / 100) * circumference
          cumulativePercentage += percentage

          return (
            <motion.circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              initial={{ opacity: 0, strokeDashoffset: circumference }}
              animate={{ opacity: 1, strokeDashoffset }}
              transition={{
                opacity: { duration: 0.3, delay: index * 0.08 },
                strokeDashoffset: { duration: animationDuration, delay: index * 0.08, ease: 'easeOut' },
              }}
            />
          )
        })}
      </svg>

      {centerContent && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: size - strokeWidth * 2.5,
          height: size - strokeWidth * 2.5,
          pointerEvents: 'none',
        }}>
          {centerContent}
        </div>
      )}
    </div>
  )
}
