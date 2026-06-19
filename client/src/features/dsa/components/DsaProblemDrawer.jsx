import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, CheckCircle2, Clock, Star, Tag, Timer, Building2, Route, BookOpen, ArrowRight } from 'lucide-react';

const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444', Unknown: '#6b7280' };
const TABS = ['Overview', 'Notes', 'Revision', 'Similar'];

export function DsaProblemDrawer({ problem, isOpen, onClose, onSolve, onRevise, onUpdateNotes, userProgress, revisionHistory = [], initialTab = 'Overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notes, setNotes] = useState(userProgress?.notes || '');
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setNotes(userProgress?.notes || '');
    }
  }, [isOpen, initialTab, problem?.id, userProgress?.notes]);

  if (!problem) return null;

  const status = userProgress?.status || 'TODO';
  const diffColor = DIFF_COLORS[problem.difficulty] || '#6b7280';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] z-50 overflow-y-auto"
            style={{ background: 'var(--th-bg)', borderLeft: '1px solid var(--th-border)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-4 flex items-start gap-3" style={{ background: 'var(--th-bg)', borderBottom: '1px solid var(--th-border)' }}>
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{problem.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ color: diffColor, background: `${diffColor}18` }}>
                    {problem.difficulty}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{problem.platform}</span>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition hover:opacity-70" style={{ background: 'var(--th-border)' }}>
                <X className="w-4 h-4" style={{ color: 'var(--th-text-muted)' }} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 px-4 pt-2" style={{ borderBottom: '1px solid var(--th-border)' }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-2 text-[11px] font-medium relative transition"
                  style={{ color: activeTab === tab ? 'var(--th-primary)' : 'var(--th-text-muted)' }}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="drawerTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--th-primary)' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'Overview' && (
                <div className="space-y-4">
                  {/* Actions */}
                  <div className="flex gap-2">
                    {status !== 'SOLVED' ? (
                      <button onClick={() => onSolve?.(problem.id)} className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition hover:opacity-90" style={{ background: '#10b981', color: '#fff' }}>
                        <CheckCircle2 className="w-4 h-4" /> Mark Solved
                      </button>
                    ) : (
                      <div className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5" style={{ background: '#10b98118', color: '#10b981' }}>
                        <CheckCircle2 className="w-4 h-4" /> Solved
                      </div>
                    )}
                    <button onClick={() => onRevise?.(problem.id, 'good')} className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition hover:opacity-90" style={{ background: '#3b82f618', color: '#3b82f6', border: '1px solid #3b82f630' }}>
                      <Clock className="w-4 h-4" /> Start Revision
                    </button>
                  </div>
                  {problem.leetcodeUrl && (
                    <a href={problem.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 py-2 rounded-xl text-[12px] font-medium justify-center transition hover:opacity-80" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
                      <ExternalLink className="w-3.5 h-3.5" /> Open Problem
                    </a>
                  )}

                  {/* Info grid */}
                  <div className="space-y-3 pt-2">
                    {problem.paths?.length > 0 && (
                      <InfoRow icon={Route} label="Paths" value={problem.paths.map(p => p.pathName).join(', ')} />
                    )}
                    {problem.paths?.[0]?.topic && <InfoRow icon={BookOpen} label="Topic" value={problem.paths[0].topic} />}
                    {problem.paths?.[0]?.subtopic && <InfoRow icon={BookOpen} label="Subtopic" value={problem.paths[0].subtopic} />}
                    <InfoRow icon={Timer} label="Est. Time" value={`${problem.estimatedTime || 20} min`} />
                    {problem.tags?.length > 0 && (
                      <div className="flex items-start gap-2.5">
                        <Tag className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--th-text-dim)' }}>Tags</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {problem.tags.map(t => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-muted)', border: '1px solid var(--th-border)' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {problem.patterns?.length > 0 && (
                      <InfoRow icon={Star} label="Patterns" value={problem.patterns.join(', ')} />
                    )}
                    {problem.companies?.length > 0 && (
                      <InfoRow icon={Building2} label="Companies" value={problem.companies.join(', ')} />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Notes' && (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes, approach, or key insights..."
                    className="w-full h-48 p-3 rounded-xl text-[12px] resize-none outline-none"
                    style={{ background: 'var(--th-input)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}
                  />
                  <button 
                    onClick={() => {
                      onUpdateNotes?.(problem.id, notes);
                      setIsSavedMsg(true);
                      setTimeout(() => setIsSavedMsg(false), 2000);
                    }} 
                    className="w-full py-2.5 rounded-xl text-[12px] font-semibold transition hover:opacity-90 flex items-center justify-center gap-2" 
                    style={{ background: isSavedMsg ? '#10b981' : 'var(--th-primary)', color: isSavedMsg ? '#fff' : '#000' }}
                  >
                    {isSavedMsg ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Notes'}
                  </button>
                </div>
              )}

              {activeTab === 'Revision' && (
                <div className="space-y-4">
                  <div className="rounded-xl p-3" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--th-text)' }}>Next Revision Due</p>
                    <p className="text-[13px] font-bold mt-1" style={{ color: userProgress?.revisionDue ? 'var(--th-primary)' : 'var(--th-text-dim)' }}>
                      {userProgress?.revisionDue ? new Date(userProgress.revisionDue).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>

                  <p className="text-[11px] font-medium" style={{ color: 'var(--th-text)' }}>How was this revision?</p>
                  <div className="flex gap-2">
                    {['good', 'ok', 'bad'].map(perf => (
                      <button key={perf} onClick={() => onRevise?.(problem.id, perf)}
                        className="flex-1 py-2 rounded-xl text-[12px] font-semibold capitalize transition hover:opacity-90"
                        style={{
                          background: perf === 'good' ? '#10b98118' : perf === 'ok' ? '#f59e0b18' : '#ef444418',
                          color: perf === 'good' ? '#10b981' : perf === 'ok' ? '#f59e0b' : '#ef4444',
                          border: `1px solid ${perf === 'good' ? '#10b98130' : perf === 'ok' ? '#f59e0b30' : '#ef444430'}`,
                        }}
                      >
                        {perf === 'good' ? '👍 Good' : perf === 'ok' ? '🤔 OK' : '👎 Bad'}
                      </button>
                    ))}
                  </div>

                  {/* Revision History */}
                  {revisionHistory.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--th-text)' }}>History</p>
                      <div className="space-y-2">
                        {revisionHistory.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--th-text-muted)' }}>
                            <span>{new Date(r.revisionDate).toLocaleDateString()}</span>
                            <span className="capitalize px-1.5 py-0.5 rounded text-[10px]" style={{
                              background: r.performance === 'good' ? '#10b98118' : r.performance === 'ok' ? '#f59e0b18' : '#ef444418',
                              color: r.performance === 'good' ? '#10b981' : r.performance === 'ok' ? '#f59e0b' : '#ef4444',
                            }}>
                              {r.performance}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Similar' && (
                <div className="space-y-3">
                  {problem.paths?.length > 1 ? (
                    problem.paths.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                        <Route className="w-4 h-4 shrink-0" style={{ color: 'var(--th-primary)' }} />
                        <div className="flex-1">
                          <p className="text-[12px] font-medium" style={{ color: 'var(--th-text)' }}>{p.pathName}</p>
                          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{p.topic}{p.subtopic ? ` > ${p.subtopic}` : ''}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] italic py-4" style={{ color: 'var(--th-text-muted)' }}>This problem appears in only one path.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
      <div>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--th-text-dim)' }}>{label}</p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text)' }}>{value}</p>
      </div>
    </div>
  );
}
