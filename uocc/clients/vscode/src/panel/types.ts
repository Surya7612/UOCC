export type AnalyzeOut = {
  levels: { level: 1 | 2 | 3; text: string; steps?: string[] }[];
  complexity: { time: string; space: string };
  summary: string;
  suggested_tests?: { in: any[]; out: any }[];
};

export type EvaluateOut = {
  passCount: number;
  failCount: number;
  failures: { index: number; input: any[]; expected: any; got?: any; error?: string }[];
};


