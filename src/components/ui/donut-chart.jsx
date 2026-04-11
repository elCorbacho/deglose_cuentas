/**
 * DonutChart — animated SVG donut chart with hover effects
 * Adapted from 21st.dev
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 22,
  animationDuration = 1,
  centerContent,
  className,
}) {
  const total = useMemo(() => data.reduce((sum, s) => sum + s.value, 0), [data]);
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const segmentData = useMemo(
    () =>
      data.reduce((acc, segment) => {
        const cumulative =
          acc.length > 0 ? acc[acc.length - 1].cumulative + acc[acc.length - 1].percentage : 0;
        const percentage = total === 0 ? 0 : (segment.value / total) * 100;
        acc.push({ ...segment, percentage, cumulative });
        return acc;
      }, []),
    [data, total]
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
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

        {segmentData.map(({ percentage, cumulative, ...segment }, index) => {
          if (segment.value === 0) return null;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -(cumulative / 100) * circumference;

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
                strokeDashoffset: {
                  duration: animationDuration,
                  delay: index * 0.08,
                  ease: 'easeOut',
                },
              }}
            />
          );
        })}
      </svg>

      {centerContent && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: size - strokeWidth * 2.5,
            height: size - strokeWidth * 2.5,
            pointerEvents: 'none',
          }}
        >
          {centerContent}
        </div>
      )}
    </div>
  );
}
