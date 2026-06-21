/**
 * Analytics Scoring Engine
 *
 * Centralized scoring calculations for the Life Intelligence Center.
 * Every axis is scored 0-100 and the overall life score is a weighted
 * average of the six axes.
 */

class AnalyticsScoring {
  // ───────── axis weights ─────────
  #weights = {
    mind: 0.15,
    body: 0.20,
    career: 0.15,
    money: 0.20,
    discipline: 0.20,
    reflection: 0.10,
  };

  // ───────── helpers ─────────

  /** Clamp a value between 0 and 100. */
  _clamp(value) {
    return Math.max(0, Math.min(Number(value) || 0, 100));
  }

  /** Safely read a numeric value, defaulting to 0. */
  _safe(value) {
    return Number(value) || 0;
  }

  // ───────── 1. Life Score ─────────

  /**
   * Weighted average of the six axis scores.
   * @param {{ mind: number, body: number, career: number, money: number, discipline: number, reflection: number }} axisScores
   * @returns {{ score: number, label: string }}
   */
  calculateLifeScore(axisScores = {}) {
    const axes = {
      mind: this._safe(axisScores.mind),
      body: this._safe(axisScores.body),
      career: this._safe(axisScores.career),
      money: this._safe(axisScores.money),
      discipline: this._safe(axisScores.discipline),
      reflection: this._safe(axisScores.reflection),
    };

    const score = this._clamp(
      axes.mind * this.#weights.mind +
      axes.body * this.#weights.body +
      axes.career * this.#weights.career +
      axes.money * this.#weights.money +
      axes.discipline * this.#weights.discipline +
      axes.reflection * this.#weights.reflection,
    );

    return { score: Math.round(score * 100) / 100, label: this.getScoreLabel(score) };
  }

  // ───────── 2. Mind Score ─────────

  /**
   * 60 % DSA readiness  +  40 % learning-habit completion.
   * @param {object} dsaData   – { readinessPct, totalSolved, streak }
   * @param {object} habitData – { habitsWithStreak } (array of habit objects)
   */
  calculateMindScore(dsaData = {}, habitData = {}) {
    const readiness = this._safe(dsaData.readinessPct);

    // Filter learning-related habits and compute average completion
    const habits = Array.isArray(habitData.habitsWithStreak) ? habitData.habitsWithStreak : [];
    const learningHabits = habits.filter(
      (h) => h.category && ['LEARNING', 'EDUCATION', 'STUDY', 'DSA'].includes(h.category.toUpperCase()),
    );

    let learningCompletion = 0;
    if (learningHabits.length > 0) {
      const totalPct = learningHabits.reduce((sum, h) => sum + this._safe(h.completionPct ?? h.weeklyPct), 0);
      learningCompletion = totalPct / learningHabits.length;
    }

    return this._clamp(readiness * 0.6 + learningCompletion * 0.4);
  }

  // ───────── 3. Body Score ─────────

  /**
   * 40 % workout consistency  +  30 % streak factor  +  30 % nutrition adherence.
   * @param {object} fitnessData – { streak, thisWeek, nutritionSummary }
   */
  calculateBodyScore(fitnessData = {}) {
    const thisWeek = fitnessData.thisWeek || {};
    const workoutConsistency = this._clamp((this._safe(thisWeek.count) / 5) * 100);

    const streak = this._safe(fitnessData.streak);
    const streakFactor = this._clamp(Math.min(streak / 7, 1) * 100);

    const nutrition = fitnessData.nutritionSummary || {};
    const nutritionAdherence = this._clamp(this._safe(nutrition.adherencePct ?? nutrition.score));

    return this._clamp(
      workoutConsistency * 0.4 +
      streakFactor * 0.3 +
      nutritionAdherence * 0.3,
    );
  }

  // ───────── 4. Career Score ─────────

  /**
   * 35 % job activity  +  35 % project output  +  30 % career-goal progress.
   * @param {object} jobData     – { responseRate, interviews, offers, total }
   * @param {object} projectData – { total, shipped }
   * @param {object} goalData    – from goalsService.getStats()
   */
  calculateCareerScore(jobData = {}, projectData = {}, goalData = {}) {
    // Job activity: blend of response rate and interview/offer conversion
    const responseRate = this._safe(jobData.responseRate);
    const totalApps = this._safe(jobData.total);
    const interviews = this._safe(jobData.interviews);
    const offers = this._safe(jobData.offers);

    let jobActivity = 0;
    if (totalApps > 0) {
      const interviewRate = (interviews / totalApps) * 100;
      const offerRate = (offers / totalApps) * 100;
      jobActivity = this._clamp(responseRate * 0.5 + interviewRate * 0.3 + offerRate * 0.2);
    }

    // Project output: ratio of shipped to total
    const totalProjects = this._safe(projectData.total);
    const shipped = this._safe(projectData.shipped);
    const projectOutput = totalProjects > 0
      ? this._clamp((shipped / totalProjects) * 100)
      : 0;

    // Career / learning goal progress
    const goals = Array.isArray(goalData.goals) ? goalData.goals : [];
    const careerGoals = goals.filter(
      (g) => g.category && ['CAREER', 'LEARNING'].includes(g.category.toUpperCase()),
    );

    let goalProgress = 0;
    if (careerGoals.length > 0) {
      const totalProgress = careerGoals.reduce((sum, g) => sum + this._safe(g.progress), 0);
      goalProgress = this._clamp(totalProgress / careerGoals.length);
    }

    return this._clamp(
      jobActivity * 0.35 +
      projectOutput * 0.35 +
      goalProgress * 0.30,
    );
  }

  // ───────── 5. Money Score ─────────

  /**
   * Directly uses the finance freedom score (already 0-100).
   * @param {object} financeData – { freedomScore }
   */
  calculateMoneyScore(financeData = {}) {
    return this._clamp(this._safe(financeData.freedomScore));
  }

  // ───────── 6. Discipline Score ─────────

  /**
   * 40 % weeklyPct  +  30 % monthlyPct  +  30 % streak factor.
   * @param {object} habitData – { weeklyPct, monthlyPct, currentStreak, bestStreak }
   */
  calculateDisciplineScore(habitData = {}) {
    const weekly = this._safe(habitData.weeklyPct);
    const monthly = this._safe(habitData.monthlyPct);
    const currentStreak = this._safe(habitData.currentStreak);
    const streakFactor = this._clamp(Math.min(currentStreak / 30, 1) * 100);

    return this._clamp(
      weekly * 0.4 +
      monthly * 0.3 +
      streakFactor * 0.3,
    );
  }

  // ───────── 7. Reflection Score ─────────

  /**
   * 40 % monthly consistency  +  30 % streak factor  +  30 % growthScore.
   * @param {object} reflectionData – { streak, monthlyCount, avgMood, growthScore }
   */
  calculateReflectionScore(reflectionData = {}) {
    const monthlyCount = this._safe(reflectionData.monthlyCount);
    const monthlyConsistency = this._clamp((monthlyCount / 30) * 100);

    const streak = this._safe(reflectionData.streak);
    const streakFactor = this._clamp(Math.min(streak / 7, 1) * 100);

    const growthScore = this._clamp(this._safe(reflectionData.growthScore));

    return this._clamp(
      monthlyConsistency * 0.4 +
      streakFactor * 0.3 +
      growthScore * 0.3,
    );
  }

  // ───────── 8. Growth Velocity ─────────

  /**
   * Percentage change between current and previous life score.
   * @returns {number} – percentage (can be negative)
   */
  calculateGrowthVelocity(currentScore, previousScore) {
    const prev = this._safe(previousScore);
    if (prev === 0) return 0;

    const current = this._safe(currentScore);
    return Math.round(((current - prev) / prev) * 100 * 100) / 100;
  }

  // ───────── 9. Consistency Index ─────────

  /**
   * Cross-module consistency score.
   * 35 % habits weeklyPct  +  25 % fitness streak  +  25 % DSA streak  +  15 % reflection frequency.
   */
  calculateConsistencyIndex(habitData = {}, fitnessData = {}, dsaData = {}, reflectionData = {}) {
    const habitsWeekly = this._safe(habitData.weeklyPct);

    const fitnessStreak = this._safe(fitnessData.streak);
    const fitnessConsistency = this._clamp(Math.min(fitnessStreak / 7, 1) * 100);

    const dsaStreak = this._safe(dsaData.streak);
    const dsaConsistency = this._clamp(Math.min(dsaStreak / 7, 1) * 100);

    const monthlyCount = this._safe(reflectionData.monthlyCount);
    const reflectionFrequency = this._clamp((monthlyCount / 30) * 100);

    return this._clamp(
      habitsWeekly * 0.35 +
      fitnessConsistency * 0.25 +
      dsaConsistency * 0.25 +
      reflectionFrequency * 0.15,
    );
  }

  // ───────── 10. Momentum ─────────

  /**
   * Simple linear-regression slope over the last N daily snapshots' lifeScore values.
   * @param {Array<{ lifeScore: number }>} snapshots – ordered oldest → newest
   * @returns {{ score: number, state: 'Rising'|'Stable'|'Falling' }}
   */
  calculateMomentum(snapshots = []) {
    const scores = (Array.isArray(snapshots) ? snapshots : [])
      .map((s) => this._safe(s.lifeScore));

    if (scores.length < 2) {
      return { score: 0, state: 'Stable' };
    }

    // Simple linear regression: y = a + b*x
    const n = scores.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += scores[i];
      sumXY += i * scores[i];
      sumX2 += i * i;
    }

    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator !== 0
      ? (n * sumXY - sumX * sumY) / denominator
      : 0;

    const roundedSlope = Math.round(slope * 100) / 100;

    let state = 'Stable';
    if (roundedSlope > 1) state = 'Rising';
    else if (roundedSlope < -1) state = 'Falling';

    return { score: roundedSlope, state };
  }

  // ───────── 11. Score Label ─────────

  /**
   * Human-readable label for a 0-100 score.
   */
  getScoreLabel(score) {
    const s = this._safe(score);
    if (s >= 80) return 'Excellent';
    if (s >= 65) return 'Good Progress';
    if (s >= 45) return 'Keep it up!';
    if (s >= 25) return 'Needs Work';
    return 'Getting Started';
  }
}

export const analyticsScoring = new AnalyticsScoring();
