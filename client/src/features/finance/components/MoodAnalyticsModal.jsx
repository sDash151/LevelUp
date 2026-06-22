import { Modal } from '@/design-system/components';
import { useMoodAnalytics } from '../hooks/useFinance';
import { CATEGORY_ICONS, formatCurrency } from '../utils';
import { useUser } from '@/features/auth/hooks/useAuth';
import { Loader2, Smile, Frown, Meh, TrendingUp, TrendingDown } from 'lucide-react';

export default function MoodAnalyticsModal({ isOpen, onClose }) {
  const { data, isLoading } = useMoodAnalytics();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mood Analytics" size="lg">
      <div className="p-5 max-h-[80vh] overflow-y-auto no-scrollbar" style={{ background: 'var(--th-bg)' }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-medium">Analyzing your emotional spending patterns...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-10 text-gray-500">No data available yet.</div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Insight */}
            <div className="p-5 rounded-2xl border shadow-sm text-center" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
              <h3 className="text-[16px] font-bold mb-2" style={{ color: 'var(--th-text)' }}>Emotional ROI</h3>
              <p className="text-[13px] leading-relaxed max-w-md mx-auto" style={{ color: 'var(--th-text-secondary)' }}>
                See exactly where your money brings you joy and where it causes regret. Use these insights to optimize your spending for happiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* HAPPY COLUMN */}
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--color-success)40' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#10B98120', color: '#10B981' }}>
                      <Smile className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>Happy Spending</h4>
                      <p className="text-[11px] font-medium" style={{ color: '#10B981' }}>What brings you joy</p>
                    </div>
                  </div>

                  {data.HAPPY?.categories.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--th-text-muted)' }}>Top Categories</h5>
                        <div className="space-y-2">
                          {data.HAPPY.categories.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs" style={{ background: 'var(--th-card-solid)' }}>{CATEGORY_ICONS[c.name] || '✨'}</span>
                                <div>
                                  <span className="text-[13px] font-bold block" style={{ color: 'var(--th-text)' }}>{c.name}</span>
                                  <span className="text-[10px] block" style={{ color: 'var(--th-text-secondary)' }}>{c.count} transactions</span>
                                </div>
                              </div>
                              <span className="text-[13px] font-bold" style={{ color: '#10B981' }}>{formatCurrency(c.amount, currency, true)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {data.HAPPY?.merchants.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--th-text-muted)' }}>Top Merchants</h5>
                          <div className="space-y-2">
                            {data.HAPPY.merchants.map((m, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                                <div>
                                  <span className="text-[13px] font-bold block" style={{ color: 'var(--th-text)' }}>{m.name}</span>
                                  <span className="text-[10px] block" style={{ color: 'var(--th-text-secondary)' }}>{m.count} transactions</span>
                                </div>
                                <span className="text-[13px] font-bold" style={{ color: '#10B981' }}>{formatCurrency(m.amount, currency, true)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[12px] text-gray-400 text-center py-4">No happy spending logged yet.</p>
                  )}
                </div>
              </div>

              {/* REGRET COLUMN */}
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--color-danger)40' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#EF444420', color: '#EF4444' }}>
                      <Frown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>Regret Spending</h4>
                      <p className="text-[11px] font-medium" style={{ color: '#EF4444' }}>What drains your energy</p>
                    </div>
                  </div>

                  {data.REGRET?.categories.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--th-text-muted)' }}>Top Categories</h5>
                        <div className="space-y-2">
                          {data.REGRET.categories.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs" style={{ background: 'var(--th-card-solid)' }}>{CATEGORY_ICONS[c.name] || '💸'}</span>
                                <div>
                                  <span className="text-[13px] font-bold block" style={{ color: 'var(--th-text)' }}>{c.name}</span>
                                  <span className="text-[10px] block" style={{ color: 'var(--th-text-secondary)' }}>{c.count} transactions</span>
                                </div>
                              </div>
                              <span className="text-[13px] font-bold" style={{ color: '#EF4444' }}>{formatCurrency(c.amount, currency, true)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {data.REGRET?.merchants.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--th-text-muted)' }}>Top Merchants</h5>
                          <div className="space-y-2">
                            {data.REGRET.merchants.map((m, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                                <div>
                                  <span className="text-[13px] font-bold block" style={{ color: 'var(--th-text)' }}>{m.name}</span>
                                  <span className="text-[10px] block" style={{ color: 'var(--th-text-secondary)' }}>{m.count} transactions</span>
                                </div>
                                <span className="text-[13px] font-bold" style={{ color: '#EF4444' }}>{formatCurrency(m.amount, currency, true)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[12px] text-gray-400 text-center py-4">No regret spending logged yet. Good job!</p>
                  )}
                </div>
              </div>
            </div>

            {/* NEUTRAL ROW (Optional/Small) */}
            {data.NEUTRAL?.categories.length > 0 && (
              <div className="p-5 rounded-2xl border shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                 <div className="flex items-center gap-2 mb-3">
                   <Meh className="w-4 h-4" style={{ color: 'var(--th-text-secondary)' }} />
                   <h4 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Neutral / Necessary Spending</h4>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {data.NEUTRAL.categories.slice(0, 4).map((c, i) => (
                     <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium" style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                       {CATEGORY_ICONS[c.name] || '🛒'} {c.name}
                     </div>
                   ))}
                   {data.NEUTRAL.categories.length > 4 && (
                     <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ color: 'var(--th-text-muted)' }}>
                       +{data.NEUTRAL.categories.length - 4} more
                     </div>
                   )}
                 </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Modal>
  );
}
