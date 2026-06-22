import React from 'react';
import { Download } from 'lucide-react';
import { AnimatedPage } from '../../../design-system/components/AnimatedPage';
import { useFullAnalytics } from '../hooks/useAnalytics';

// New Section Components
import HeroMetrics from '../components/HeroMetrics';
import LifeRadarSection from '../components/LifeRadarSection';
import CrossModulePerformance from '../components/CrossModulePerformance';
import TrendCharts from '../components/TrendCharts';
import LifeROISection from '../components/LifeROISection';
import ReflectionIntelligence from '../components/ReflectionIntelligence';

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading, error } = useFullAnalytics();

  if (isLoading) {
    return (
      <AnimatedPage className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Crunching your life data...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-2xl text-center max-w-md border shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-sm opacity-80">We couldn't load your analytics. Please try again later.</p>
        </div>
      </AnimatedPage>
    );
  }

  const { hero, radar, crossModule, trends, roi, intelligence } = analyticsData || {};

  return (
    <AnimatedPage className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2 mb-1">
            Analytics <span className="text-xl font-normal opacity-70">📈</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Understand your progress, patterns & unlock your full potential</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="shadow-sm rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium w-full md:w-auto justify-center cursor-pointer transition-colors hover:opacity-80" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}>
            <span>📅</span> Jun 1 – Jun 21, 2026 ▾
          </div>
          <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 flex-shrink-0">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <HeroMetrics data={hero} />

      {/* Life Radar & AI Insights Row */}
      <LifeRadarSection data={radar} />

      {/* Cross-Module Performance Grid */}
      <CrossModulePerformance data={crossModule} />

      {/* Trend Charts */}
      <TrendCharts trends={trends} />

      {/* Life ROI & Streaks */}
      <LifeROISection data={roi} />

      {/* Reflection Intelligence & Prediction Engine */}
      <ReflectionIntelligence data={intelligence} />

    </AnimatedPage>
  );
}
