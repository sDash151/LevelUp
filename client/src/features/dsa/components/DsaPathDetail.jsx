import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Filter, Search, MessageSquare, CheckCircle2 } from 'lucide-react';
import { DsaContinueSolving } from './DsaContinueSolving';
import { useDsaPath, useUpdateDsaNotes } from '../hooks/useDsa';

const TABS = ['Topics', 'Problems', 'Notes'];

const TOPIC_COLORS = [
  { keywords: ['array', 'matrix'], color: '#10b981' }, // Emerald
  { keywords: ['graph'], color: '#ec4899' }, // Pink
  { keywords: ['tree', 'bst', 'trie'], color: '#84cc16' }, // Lime
  { keywords: ['dynamic', 'dp'], color: '#f59e0b' }, // Amber
  { keywords: ['binary search'], color: '#0ea5e9' }, // Sky
  { keywords: ['sliding window', 'two pointer'], color: '#8b5cf6' }, // Violet
  { keywords: ['linkedlist', 'linked list'], color: '#3b82f6' }, // Blue
  { keywords: ['stack', 'queue'], color: '#eab308' }, // Yellow
  { keywords: ['string'], color: '#f43f5e' }, // Rose
  { keywords: ['math', 'bit'], color: '#06b6d4' }, // Cyan
  { keywords: ['recursion', 'backtracking'], color: '#d946ef' }, // Fuchsia
  { keywords: ['basic', 'intro', 'learn'], color: '#6366f1' }, // Indigo
];

function getTopicColor(topicName) {
  const lower = topicName.toLowerCase();
  for (const tc of TOPIC_COLORS) {
    if (tc.keywords.some(k => lower.includes(k))) return tc.color;
  }
  return '#8b5cf6'; // Vivid default
}

export function DsaPathDetail({ path, problems = [], onBack, onProblemClick }) {
  const [activeTab, setActiveTab] = useState('Topics');
  const [selectedProblemTopic, setSelectedProblemTopic] = useState('');
  
  // Notes UI state
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [selectedNoteProblem, setSelectedNoteProblem] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  const { data: pathDetail } = useDsaPath(path?.slug);
  const { mutate: updateNotes, isPending: isSavingNotes } = useUpdateDsaNotes();

  useEffect(() => {
    if (selectedNoteProblem) {
      setNoteContent(selectedNoteProblem.notes || '');
    } else {
      setNoteContent('');
    }
  }, [selectedNoteProblem]);

  const handleSaveNote = () => {
    if (!selectedNoteProblem) return;
    updateNotes({ id: selectedNoteProblem.id, notes: noteContent }, {
      onSuccess: () => {
        // optimistically update the local problem notes
        selectedNoteProblem.notes = noteContent;
        setIsSavedMsg(true);
        setTimeout(() => setIsSavedMsg(false), 2000);
      }
    });
  };

  const displayedNoteProblems = useMemo(() => {
    let list = problems.filter(p => p.title.toLowerCase().includes(noteSearchQuery.toLowerCase()));
    
    // If a problem is selected and we aren't actively searching, pin it to the top!
    if (selectedNoteProblem && !noteSearchQuery) {
      const selectedIdx = list.findIndex(p => p.id === selectedNoteProblem.id);
      if (selectedIdx > 0) {
        const selectedObj = list[selectedIdx];
        list.splice(selectedIdx, 1);
        list.unshift(selectedObj);
      }
    }
    return list;
  }, [problems, noteSearchQuery, selectedNoteProblem]);

  // Compute topic progress using full path detail and augment with nextProblem from paginated problems
  const topicsData = useMemo(() => {
    let sorted = [];
    if (pathDetail?.topics) {
      sorted = pathDetail.topics.map(t => {
        // Find next problem from the paginated problems array
        const next = problems.find(p => p.topic === t.topic && (p.status === 'IN_PROGRESS' || p.status === 'TODO' || !p.status));
        return {
          name: t.topic === 'Dynamic Programming' ? 'Dynamic Prog.' : t.topic,
          solved: t.solved,
          total: t.total,
          pct: t.completionPct,
          nextProblem: next ? next.title : null,
        };
      }).sort((a, b) => b.total - a.total);
    } else {
      // Fallback
      if (!problems.length) return [];
      const topicMap = {};
      problems.forEach(p => {
        if (!topicMap[p.topic]) topicMap[p.topic] = { name: p.topic, solved: 0, total: 0, nextProblem: null };
        topicMap[p.topic].total += 1;
        if (p.status === 'SOLVED') topicMap[p.topic].solved += 1;
        else if (!topicMap[p.topic].nextProblem) topicMap[p.topic].nextProblem = p.title;
      });
      sorted = Object.values(topicMap).map(t => ({
        ...t, name: t.name === 'Dynamic Programming' ? 'Dynamic Prog.' : t.name, pct: Math.round((t.solved / t.total) * 100) || 0
      })).sort((a, b) => b.total - a.total);
    }
    
    return sorted;
  }, [problems, pathDetail]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full space-y-4 pt-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 rounded-lg transition hover:bg-[var(--th-bg-secondary)]">
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--th-text)' }} />
          </button>
          <h2 className="text-base font-semibold" style={{ color: 'var(--th-text)' }}>{path?.name || 'Path Details'}</h2>
        </div>
        <button className="p-1.5 rounded-lg transition hover:bg-[var(--th-bg-secondary)]">
          <Filter className="w-4 h-4" style={{ color: 'var(--th-text)' }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--th-border)' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-[12px] font-medium transition relative pb-3"
            style={{ color: activeTab === tab ? 'var(--th-primary)' : 'var(--th-text-dim)' }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="pathDetailTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: 'var(--th-primary)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-10 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'Topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Topic Progress Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Topic Progress</h3>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {topicsData.map((topic, i) => {
                    const color = getTopicColor(topic.name);
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedProblemTopic(topic.name);
                          setActiveTab('Problems');
                        }}
                        className="group relative overflow-hidden rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" 
                        style={{ 
                          background: 'var(--th-card)', 
                          border: '1px solid var(--th-border)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = color;
                          e.currentTarget.style.boxShadow = `0 10px 30px -10px ${color}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--th-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Subtle background glow */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-30" style={{ background: color }} />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-5 h-5 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--th-bg)] border" style={{ borderColor: color }}>
                              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                            </div>
                            <span className="text-[12.5px] font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--th-text)' }} title={topic.name}>
                              {topic.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto relative z-10">
                          <div className="relative w-[48px] h-[48px] flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--th-border)" strokeWidth="2.5" />
                              <circle cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="100" strokeDashoffset={100 - topic.pct} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: 'var(--th-text)' }}>{topic.pct}%</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--th-text-dim)' }}>Progress</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{topic.solved}</span>
                              <span className="text-xs font-medium" style={{ color: 'var(--th-text-dim)' }}>/ {topic.total}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 text-[11px] truncate border-t relative z-10 transition-colors duration-300" style={{ borderColor: 'var(--th-border)' }}>
                          <span style={{ color: 'var(--th-text-dim)' }}>Next: </span>
                          <span className="font-medium group-hover:font-semibold transition-all duration-300" style={{ color: 'var(--th-text-muted)' }}>{topic.nextProblem || 'Path Completed 🎉'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'Problems' && (
            <motion.div
              key="problems"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <DsaContinueSolving 
                problems={problems} 
                totalCount={problems.length} 
                onProblemClick={onProblemClick}
                onAddNote={(p) => {
                  setSelectedNoteProblem(p);
                  setActiveTab('Notes');
                }}
                initialTopic={selectedProblemTopic}
              />
            </motion.div>
          )}

          {activeTab === 'Notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex gap-4 h-[500px]"
            >
              {/* Left pane: Problem List */}
              <div className="w-1/3 flex flex-col rounded-xl overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
                <div className="p-3 border-b" style={{ borderColor: 'var(--th-border)' }}>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-text-dim)' }} />
                    <input 
                      type="text"
                      placeholder="Search questions..."
                      value={noteSearchQuery}
                      onChange={e => setNoteSearchQuery(e.target.value)}
                      className="w-full bg-transparent outline-none pl-9 py-1.5 text-[12px]"
                      style={{ color: 'var(--th-text)' }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto hide-scrollbar p-2 space-y-1">
                  {displayedNoteProblems.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedNoteProblem(p)}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors text-[12px] font-medium flex items-center justify-between group"
                      style={{ 
                        background: selectedNoteProblem?.id === p.id ? 'var(--th-bg-secondary)' : 'transparent',
                        color: selectedNoteProblem?.id === p.id ? 'var(--th-primary)' : 'var(--th-text)' 
                      }}
                    >
                      <span className="truncate pr-2">{p.title}</span>
                      {p.notes && <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--th-primary)' }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right pane: Editor */}
              <div className="w-2/3 rounded-xl p-5 flex flex-col relative" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
                {selectedNoteProblem ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>{selectedNoteProblem.title}</h3>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--th-text-dim)' }}>{selectedNoteProblem.topic}</p>
                      </div>
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSavingNotes}
                        className="text-[11px] flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50" 
                        style={{ background: isSavedMsg ? '#10b981' : 'var(--th-primary)', color: '#fff', boxShadow: isSavedMsg ? 'none' : '0 4px 12px -4px var(--th-primary)' }}
                      >
                        {isSavedMsg ? <><CheckCircle2 className="w-3.5 h-3.5"/> Saved</> : 'Save Note'}
                      </button>
                    </div>
                    <textarea 
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      className="flex-1 w-full bg-transparent border outline-none resize-none text-[13px] leading-relaxed p-4 rounded-xl transition-colors focus:border-[var(--th-primary)]" 
                      style={{ color: 'var(--th-text-secondary)', borderColor: 'var(--th-border)' }}
                      placeholder={`Write your notes, edge cases, and approach for ${selectedNoteProblem.title}...`}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                    <MessageSquare className="w-10 h-10 mb-3" style={{ color: 'var(--th-text-dim)' }} />
                    <p className="text-[13px] font-medium" style={{ color: 'var(--th-text)' }}>Select a question</p>
                    <p className="text-[11px] mt-1 max-w-[200px]" style={{ color: 'var(--th-text-dim)' }}>Choose a problem from the left panel to view or add notes.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
