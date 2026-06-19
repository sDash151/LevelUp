import { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Zap, Target, Trophy, Info } from 'lucide-react';

const TASK_ICONS = [Zap, Target, Trophy];

export function DsaTodayFocus({
  tasks = [],
  dailyProgress = 0,
  xpCurrent = 0,
  xpGoal = 180,
  onTaskClick,
}) {
  const [checked, setChecked] = useState({});

  const toggleTask = (idx) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
    if (onTaskClick && tasks[idx]) onTaskClick(tasks[idx]);
  };

  const circumference = 2 * Math.PI * 52;
  const remaining = Math.max(0, xpGoal - xpCurrent);
  const xpBarPct = Math.min(100, Math.round((xpCurrent / xpGoal) * 100));

  return (
    <>
      <style>{`
        .dsa-tasks-scroll {
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
        }
        .dsa-tasks-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .dsa-tasks-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .dsa-tasks-scroll::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 3px;
        }
        .dsa-tasks-scroll::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
        
        .dsa-focus-grid {
          display: grid;
          grid-template-columns: 1.2fr 1px 320px;
          min-height: 280px;
        }
        
        @media (max-width: 768px) {
          .dsa-focus-grid {
            display: flex;
            flex-direction: column;
            min-height: auto;
          }
          .dsa-divider {
            display: none;
          }
          .dsa-tasks-scroll {
            max-height: 400px;
            min-height: auto !important;
            height: auto !important;
            order: 2;
          }
          .dsa-stats-container {
            min-height: auto !important;
            height: auto !important;
            border-bottom: 1px solid #EBEBEB;
            order: 1;
          }
        }
      `}</style>
      <div
        style={{
          width: '100%',
          borderRadius: '16px',
          background: 'var(--th-card)',
          border: '1px solid var(--th-border)',
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          overflow: 'hidden',
        }}
      >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '14px 18px',
          borderBottom: '1px solid var(--th-border)',
        }}
      >
        <Flame style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
        <span
          style={{ fontSize: '15px', fontWeight: 600, color: 'var(--th-text)', letterSpacing: '-0.2px' }}
        >
          Today's DSA Focus
        </span>
        <span style={{ fontSize: '12px', color: 'var(--th-text-secondary)', marginLeft: 'auto' }}>
          Complete tasks · earn XP
        </span>
      </div>

      {/* ── Body: left tasks | divider | right stats ── */}
      <div className="dsa-focus-grid">

        {/* LEFT — Scrollable Tasks */}
        <div
          style={{
            height: '100%',
            overflowY: 'auto',
            padding: '4px 0',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="dsa-tasks-scroll"
        >
          {tasks.length === 0 && (
            <p
              style={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: 'var(--th-text-secondary)',
                padding: '16px 18px',
              }}
            >
              Solve a few problems to generate focus tasks.
            </p>
          )}

          {tasks.map((task, i) => {
            const Icon = TASK_ICONS[i % TASK_ICONS.length];
            const isDone = !!checked[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => toggleTask(i)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  borderBottom: i < tasks.length - 1 ? '1px solid var(--th-border)' : 'none',
                  background: isDone ? 'rgba(0,0,0,0.02)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                whileHover={{ background: 'var(--th-card-hover)' }}
              >
                {/* Checkbox */}
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {isDone ? (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '1.5px solid #22C55E',
                        background: '#22C55E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 3.5L3.5 6L9 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '1.5px solid var(--th-border)',
                        background: 'var(--th-card)',
                      }}
                    />
                  )}
                </div>

                {/* Icon */}
                <Icon
                  style={{
                    width: '17px',
                    height: '17px',
                    flexShrink: 0,
                    marginTop: '2px',
                    color: isDone ? 'var(--th-text-dim)' : '#F59E0B',
                    transition: 'color 0.12s',
                  }}
                />

                {/* Task Text */}
                <span
                  style={{
                    fontSize: '14px',
                    flex: 1,
                    color: isDone ? 'var(--th-text-muted)' : 'var(--th-text-secondary)',
                    textDecoration: isDone ? 'line-through' : 'none',
                    lineHeight: 1.5,
                    transition: 'color 0.12s',
                  }}
                >
                  {task.text}
                </span>

                {/* XP pill */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#92400E',
                    background: '#FEF3C7',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    marginTop: '1px',
                  }}
                >
                  +{task.xp} XP
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* VERTICAL DIVIDER */}
        <div style={{ background: 'var(--th-border)', alignSelf: 'stretch' }} className="dsa-divider" />

        {/* RIGHT — Progress Ring + XP Stats */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '18px 20px',
            gap: '0',
            height: '100%',
          }}
          className="dsa-stats-container"
        >
          {/* Progress Ring */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--th-border)',
            }}
          >
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg
                viewBox="0 0 120 120"
                style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
              >
                {/* Track */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--th-border)" strokeWidth="7" />
                {/* Progress */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - dailyProgress / 100)}
                  style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{ fontSize: '32px', fontWeight: 700, color: 'var(--th-text)', lineHeight: 1 }}
                >
                  {dailyProgress}%
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--th-text-secondary)', marginTop: '5px', fontWeight: 500 }}>
                  Daily progress
                </span>
              </div>
            </div>
          </div>

          {/* XP Goal + Bar */}
          <div style={{ paddingTop: '16px', marginBottom: '14px' }}>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--th-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              Daily XP Goal
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--th-text)', lineHeight: 1 }}>
                {xpCurrent}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--th-text-secondary)' }}>/ {xpGoal} XP</span>
            </div>
            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'var(--th-border)',
                borderRadius: '999px',
                marginTop: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${xpBarPct}%`,
                  background: '#F59E0B',
                  borderRadius: '999px',
                  transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
                }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--th-border)', marginBottom: '14px' }} />

          {/* Next Reward */}
          <div style={{ position: 'relative' }}>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--th-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
              }}
            >
              Next Reward
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Coin */}
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  $
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--th-text)', lineHeight: 1.2 }}>
                  +{remaining} XP
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    marginTop: '2px',
                  }}
                >
                  <span style={{ fontSize: '10px', color: 'var(--th-text-secondary)' }}>Streak Bonus</span>
                  <Info style={{ width: '10px', height: '10px', color: 'var(--th-text-secondary)' }} />
                </div>
              </div>
            </div>
            {/* Gift image - absolute positioned */}
            <img
              src="/Gift.png"
              alt="Gift"
              style={{ 
                position: 'absolute',
                top: '-17px',
                right: '-10px',
                width: '105px', 
                height: '105px', 
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

      </div>
      </div>
    </>
  );
}