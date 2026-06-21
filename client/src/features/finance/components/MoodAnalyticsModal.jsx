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
      <div className="p-5 max-h-[80vh] overflow-y-auto no-scrollbar bg-gray-50/50">
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
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Emotional ROI</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed max-w-md mx-auto">
                See exactly where your money brings you joy and where it causes regret. Use these insights to optimize your spending for happiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* HAPPY COLUMN */}
              <div className="space-y-5">
                <div className="bg-gradient-to-b from-green-50 to-white p-5 rounded-2xl border border-green-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Smile className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-green-900">Happy Spending</h4>
                      <p className="text-[11px] font-medium text-green-600">What brings you joy</p>
                    </div>
                  </div>

                  {data.HAPPY?.categories.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Categories</h5>
                        <div className="space-y-2">
                          {data.HAPPY.categories.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-50">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-lg text-xs">{CATEGORY_ICONS[c.name] || '✨'}</span>
                                <div>
                                  <span className="text-[13px] font-bold text-gray-900 block">{c.name}</span>
                                  <span className="text-[10px] text-gray-400 block">{c.count} transactions</span>
                                </div>
                              </div>
                              <span className="text-[13px] font-bold text-green-600">{formatCurrency(c.amount, currency, true)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {data.HAPPY?.merchants.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Merchants</h5>
                          <div className="space-y-2">
                            {data.HAPPY.merchants.map((m, i) => (
                              <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-50">
                                <div>
                                  <span className="text-[13px] font-bold text-gray-900 block">{m.name}</span>
                                  <span className="text-[10px] text-gray-400 block">{m.count} transactions</span>
                                </div>
                                <span className="text-[13px] font-bold text-green-600">{formatCurrency(m.amount, currency, true)}</span>
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
                <div className="bg-gradient-to-b from-red-50 to-white p-5 rounded-2xl border border-red-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Frown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-red-900">Regret Spending</h4>
                      <p className="text-[11px] font-medium text-red-600">What drains your energy</p>
                    </div>
                  </div>

                  {data.REGRET?.categories.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Categories</h5>
                        <div className="space-y-2">
                          {data.REGRET.categories.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-50">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-lg text-xs">{CATEGORY_ICONS[c.name] || '💸'}</span>
                                <div>
                                  <span className="text-[13px] font-bold text-gray-900 block">{c.name}</span>
                                  <span className="text-[10px] text-gray-400 block">{c.count} transactions</span>
                                </div>
                              </div>
                              <span className="text-[13px] font-bold text-red-600">{formatCurrency(c.amount, currency, true)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {data.REGRET?.merchants.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Merchants</h5>
                          <div className="space-y-2">
                            {data.REGRET.merchants.map((m, i) => (
                              <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-50">
                                <div>
                                  <span className="text-[13px] font-bold text-gray-900 block">{m.name}</span>
                                  <span className="text-[10px] text-gray-400 block">{m.count} transactions</span>
                                </div>
                                <span className="text-[13px] font-bold text-red-600">{formatCurrency(m.amount, currency, true)}</span>
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
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                   <Meh className="w-4 h-4 text-gray-400" />
                   <h4 className="text-[13px] font-bold text-gray-600">Neutral Spending</h4>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {data.NEUTRAL.categories.slice(0, 4).map((c, i) => (
                     <div key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg text-[12px] font-medium text-gray-600 border border-gray-100">
                       {c.name} <span className="font-bold ml-1">{formatCurrency(c.amount, currency, true)}</span>
                     </div>
                   ))}
                 </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Modal>
  );
}
