/**
 * generateInsights.ts
 *
 * Pure logic that converts raw AuditResult data into structured,
 * human-readable insight objects for the AI Fairness Assistant panel.
 */

import type { AuditResult } from "../../api/fairnessApi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Severity = "Low" | "Moderate" | "High" | "Critical";

export interface InsightSummary {
  headline: string;
  body: string;
  severity: Severity;
}

export interface FairnessInterpretation {
  score: number; // 0-100
  label: string;
  explanation: string;
  verdict: "good" | "warning" | "danger";
}

export interface BiasGroupFinding {
  group: string;
  selectionRate: number;
  accuracy: number | null;
  count: number;
}

export interface BiasFinding {
  metric: string;
  value: number;
  threshold: number;
  severity: Severity;
  explanation: string;
}

export interface KeyBiasFindings {
  mostAffectedGroups: BiasGroupFinding[];
  triggeredMetrics: BiasFinding[];
  overallSeverity: Severity;
}

export interface ProxyVariable {
  feature: string;
  importance: number;
  proxyFor: string | null;
  explanation: string;
}

export interface WhyHappening {
  topFeatures: ProxyVariable[];
  explanation: string;
}

export interface Recommendation {
  category: "data" | "model" | "feature";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: string; // emoji
}

export interface RiskStatement {
  severity: Severity;
  statement: string;
  impacts: string[];
}

export interface AllInsights {
  summary: InsightSummary;
  fairnessInterpretation: FairnessInterpretation;
  keyBiasFindings: KeyBiasFindings;
  whyHappening: WhyHappening;
  recommendations: Recommendation[];
  riskStatement: RiskStatement;
}

// ---------------------------------------------------------------------------
// Proxy variable detection
// ---------------------------------------------------------------------------

const PROXY_MAP: Record<string, string> = {
  "zip code": "socio-economic status / geographic discrimination",
  "zipcode": "socio-economic status / geographic discrimination",
  "zip": "socio-economic status / geographic discrimination",
  "postal": "socio-economic status / geographic discrimination",
  "address": "socio-economic status / geographic discrimination",
  "prior salary": "income / gender pay-gap bias",
  "salary": "income-based bias",
  "income": "economic discrimination",
  "neighborhood": "racial / socio-economic proxy",
  "school": "socio-economic background proxy",
  "university": "socio-economic background proxy",
  "college": "socio-economic background proxy",
  "name": "racial / ethnic proxy",
  "first name": "racial / ethnic proxy",
  "last name": "racial / ethnic proxy",
  "age": "age discrimination",
  "gender": "gender discrimination",
  "sex": "gender discrimination",
  "race": "racial discrimination",
  "ethnicity": "ethnic discrimination",
  "marital status": "family status bias",
  "marital": "family status bias",
  "religion": "religious discrimination",
  "nationality": "national origin discrimination",
  "native": "national origin discrimination",
  "language": "cultural background proxy",
};

function detectProxy(featureName: string): string | null {
  const lower = featureName.toLowerCase().replace(/[_\-\.]/g, " ").trim();
  for (const [key, value] of Object.entries(PROXY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

function metricSeverity(value: number, thresholds: [number, number, number]): Severity {
  const abs = Math.abs(value);
  if (abs >= thresholds[2]) return "Critical";
  if (abs >= thresholds[1]) return "High";
  if (abs >= thresholds[0]) return "Moderate";
  return "Low";
}

function worstSeverity(severities: Severity[]): Severity {
  const order: Severity[] = ["Low", "Moderate", "High", "Critical"];
  let worst = 0;
  for (const s of severities) {
    worst = Math.max(worst, order.indexOf(s));
  }
  return order[worst];
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateInsights(result: AuditResult): AllInsights {
  const fm = result.fairness_metrics;
  const accuracy = result.accuracy ?? 0;
  const accuracyPct = (accuracy * 100).toFixed(1);

  // ── Fairness score (0-100) derived from selection_rate_ratio ──
  const fairnessScore = Math.round((fm.selection_rate_ratio ?? 0.5) * 100);

  // ── Group findings ──
  const groups: BiasGroupFinding[] = Object.entries(fm.by_group || {}).map(
    ([name, g]) => ({
      group: name,
      selectionRate: Math.round((g.selection_rate ?? 0) * 100),
      accuracy: g.accuracy != null ? Math.round(g.accuracy * 100) : null,
      count: g.count,
    })
  );
  groups.sort((a, b) => a.selectionRate - b.selectionRate);

  // ── Triggered metrics ──
  const triggered: BiasFinding[] = [];

  if (fm.selection_rate_gap != null && fm.selection_rate_gap > 0.05) {
    triggered.push({
      metric: "Selection Rate Gap",
      value: fm.selection_rate_gap,
      threshold: 0.1,
      severity: metricSeverity(fm.selection_rate_gap, [0.05, 0.1, 0.2]),
      explanation: `The difference between the highest and lowest group selection rates is ${(fm.selection_rate_gap * 100).toFixed(1)}%. Groups are not being treated equally.`,
    });
  }

  if (fm.demographic_parity_difference != null && Math.abs(fm.demographic_parity_difference) > 0.05) {
    triggered.push({
      metric: "Demographic Parity Difference",
      value: fm.demographic_parity_difference,
      threshold: 0.1,
      severity: metricSeverity(fm.demographic_parity_difference, [0.05, 0.1, 0.2]),
      explanation: `The model's positive outcome rate differs by ${(Math.abs(fm.demographic_parity_difference) * 100).toFixed(1)}% across groups. This means some groups are systematically favored over others.`,
    });
  }

  if (fm.equal_opportunity_difference != null && Math.abs(fm.equal_opportunity_difference) > 0.05) {
    triggered.push({
      metric: "Equal Opportunity Difference",
      value: fm.equal_opportunity_difference,
      threshold: 0.1,
      severity: metricSeverity(fm.equal_opportunity_difference, [0.05, 0.1, 0.2]),
      explanation: `Among qualified candidates, the model's true positive rate differs by ${(Math.abs(fm.equal_opportunity_difference) * 100).toFixed(1)}% across groups. Equally deserving individuals are treated differently.`,
    });
  }

  if (fm.equalized_odds_difference != null && Math.abs(fm.equalized_odds_difference) > 0.05) {
    triggered.push({
      metric: "Equalized Odds Difference",
      value: fm.equalized_odds_difference,
      threshold: 0.1,
      severity: metricSeverity(fm.equalized_odds_difference, [0.05, 0.1, 0.2]),
      explanation: `Both true positive and false positive rates vary significantly across groups, indicating the model's error patterns are not equal for all groups.`,
    });
  }

  const overallSeverity = triggered.length > 0
    ? worstSeverity(triggered.map((t) => t.severity))
    : "Low";

  // ── SHAP / Feature analysis ──
  const shapFeatures: ProxyVariable[] = (result.shap_summary?.top_features || []).map((f) => {
    const proxy = detectProxy(f.feature);
    return {
      feature: f.feature,
      importance: f.importance,
      proxyFor: proxy,
      explanation: proxy
        ? `"${f.feature}" may act as a proxy for ${proxy}. Consider removing or transforming this feature.`
        : `"${f.feature}" is a key driver of predictions. Review if it introduces unintended bias.`,
    };
  });

  const proxyFeatures = shapFeatures.filter((f) => f.proxyFor != null);
  const whyExplanation =
    proxyFeatures.length > 0
      ? `The model relies heavily on ${proxyFeatures.length} feature${proxyFeatures.length > 1 ? "s" : ""} that may serve as proxy variables for protected characteristics. ` +
        `Most notably, "${proxyFeatures[0].feature}" correlates with ${proxyFeatures[0].proxyFor}. ` +
        `Even when sensitive attributes are excluded from training, proxy variables can reintroduce bias.`
      : shapFeatures.length > 0
      ? `The top features driving predictions are ${shapFeatures.slice(0, 3).map((f) => `"${f.feature}"`).join(", ")}. Review whether any of these could indirectly encode sensitive information.`
      : `Feature importance data is not available. Consider training a local surrogate model to understand which features are driving predictions.`;

  // ── Recommendations ──
  const recommendations: Recommendation[] = [];

  if (overallSeverity === "Critical" || overallSeverity === "High") {
    recommendations.push({
      category: "data",
      title: "Rebalance Training Data",
      description:
        "The dataset likely underrepresents certain groups. Apply resampling (SMOTE), reweighting, or stratified sampling to ensure fair representation across all demographic groups.",
      priority: "high",
      icon: "📊",
    });
  }

  if (triggered.some((t) => t.metric === "Selection Rate Gap" && t.severity !== "Low")) {
    recommendations.push({
      category: "model",
      title: "Tune Decision Thresholds",
      description:
        "Apply group-specific decision thresholds to equalize selection rates. Use Fairlearn's ThresholdOptimizer or calibrate probabilities per group before applying a single cutoff.",
      priority: "high",
      icon: "⚙️",
    });
  }

  if (proxyFeatures.length > 0) {
    recommendations.push({
      category: "feature",
      title: "Remove or Transform Proxy Variables",
      description:
        `Features like ${proxyFeatures.map((f) => `"${f.feature}"`).join(", ")} may encode sensitive information indirectly. Consider removing them, applying fair representation learning, or using adversarial debiasing.`,
      priority: "high",
      icon: "🔍",
    });
  }

  recommendations.push({
    category: "model",
    title: "Apply Fairness Constraints During Training",
    description:
      "Use fairness-aware algorithms like Fairlearn's ExponentiatedGradient or AIF360's adversarial debiasing to enforce fairness constraints directly during model training.",
    priority: overallSeverity === "Critical" ? "high" : "medium",
    icon: "🛡️",
  });

  recommendations.push({
    category: "data",
    title: "Audit Data Collection Process",
    description:
      "Review how training data was collected. Historical biases in data collection (e.g., past discriminatory practices) can perpetuate bias in model predictions.",
    priority: "medium",
    icon: "📋",
  });

  if (groups.length > 0) {
    recommendations.push({
      category: "model",
      title: "Evaluate Per-Group Performance",
      description:
        "Before deployment, ensure model performance (accuracy, precision, recall) is consistent across all demographic groups. Disparate error rates can harm vulnerable populations.",
      priority: "medium",
      icon: "📈",
    });
  }

  // ── Summary ──
  const hasBias = overallSeverity !== "Low";
  const biasGroups = groups.length > 0
    ? groups
        .filter((g) => g.selectionRate < (groups[groups.length - 1]?.selectionRate ?? 100) * 0.85)
        .map((g) => g.group)
    : [];

  const summaryHeadline = hasBias
    ? `⚠️ Significant bias detected — ${overallSeverity} severity`
    : `✅ Model appears fair within acceptable thresholds`;

  const summaryBody = hasBias
    ? `This model achieves ${accuracyPct}% accuracy but shows ${overallSeverity.toLowerCase()} bias ${
        biasGroups.length > 0 ? `affecting ${biasGroups.join(", ")}` : "across demographic groups"
      }. ${
        triggered.length > 0
          ? `${triggered.length} fairness metric${triggered.length > 1 ? "s" : ""} exceeded safe thresholds.`
          : ""
      } Immediate review and mitigation ${overallSeverity === "Critical" ? "is required" : "is recommended"}.`
    : `This model achieves ${accuracyPct}% accuracy with a fairness score of ${fairnessScore}%. No significant bias was detected across the analyzed groups. Continue monitoring with regular audits.`;

  // ── Fairness interpretation ──
  const verdict: "good" | "warning" | "danger" =
    fairnessScore >= 80 ? "good" : fairnessScore >= 60 ? "warning" : "danger";

  const fairnessLabel =
    verdict === "good" ? "Fair" : verdict === "warning" ? "Needs Attention" : "Unfair";

  const fairnessExplanation =
    verdict === "good"
      ? `A score of ${fairnessScore}% means the model treats different groups nearly equally. The selection rates across groups are closely aligned, suggesting minimal disparate impact.`
      : verdict === "warning"
      ? `A score of ${fairnessScore}% indicates moderate disparity. Some groups receive favorable outcomes at notably different rates. While not critically unfair, improvements should be prioritized.`
      : `A score of ${fairnessScore}% indicates significant unfairness. Different groups experience vastly different outcomes from this model. This level of disparity likely violates fairness standards and requires immediate intervention.`;

  // ── Risk Statement ──
  const riskImpacts: string[] = [];
  if (overallSeverity === "Critical" || overallSeverity === "High") {
    riskImpacts.push("Discriminatory decisions that may violate anti-discrimination laws and regulations");
    riskImpacts.push("Reputational damage and loss of public trust if bias becomes public");
    riskImpacts.push("Financial liability from bias-related complaints and lawsuits");
  }
  if (overallSeverity === "Moderate") {
    riskImpacts.push("Systematically disadvantaging certain demographic groups in outcomes");
    riskImpacts.push("Potential regulatory scrutiny if bias patterns are discovered");
  }
  riskImpacts.push("Reduced model effectiveness due to biased training patterns");
  if (proxyFeatures.length > 0) {
    riskImpacts.push(
      `Indirect discrimination through proxy variables (${proxyFeatures.map((f) => f.feature).join(", ")})`
    );
  }

  const riskSeverityText: Record<Severity, string> = {
    Critical:
      "This model poses a critical risk if deployed. The detected bias may lead to systematically unfair decisions — such as denying qualified candidates or approving undeserving ones based on group membership. Deployment without mitigation is strongly discouraged.",
    High:
      "This model shows significant bias that could lead to unfair treatment of certain groups. In high-stakes domains like hiring, lending, or healthcare, this could result in real harm to individuals and legal exposure for the organization.",
    Moderate:
      "This model exhibits moderate bias patterns. While not immediately dangerous, these patterns may compound over time and disproportionately affect certain populations. Mitigation is recommended before production deployment.",
    Low:
      "This model shows minimal bias within standard thresholds. However, bias can emerge as data distributions shift. Continue monitoring with regular fairness audits.",
  };

  return {
    summary: {
      headline: summaryHeadline,
      body: summaryBody,
      severity: overallSeverity,
    },
    fairnessInterpretation: {
      score: fairnessScore,
      label: fairnessLabel,
      explanation: fairnessExplanation,
      verdict,
    },
    keyBiasFindings: {
      mostAffectedGroups: groups,
      triggeredMetrics: triggered,
      overallSeverity,
    },
    whyHappening: {
      topFeatures: shapFeatures,
      explanation: whyExplanation,
    },
    recommendations,
    riskStatement: {
      severity: overallSeverity,
      statement: riskSeverityText[overallSeverity],
      impacts: riskImpacts,
    },
  };
}
