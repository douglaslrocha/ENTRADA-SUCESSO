class PerfProfiler {
  private static metrics: Record<string, {
    calls: number;
    totalTime: number;
    maxTime: number;
  }> = {};

  public static measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const end = performance.now();
      const duration = end - start;
      this.record(name, duration);
    }
  }

  public static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const end = performance.now();
      const duration = end - start;
      this.record(name, duration);
    }
  }

  private static record(name: string, duration: number) {
    if (!this.metrics[name]) {
      this.metrics[name] = { calls: 0, totalTime: 0, maxTime: 0 };
    }
    const metric = this.metrics[name];
    metric.calls++;
    metric.totalTime += duration;
    if (duration > metric.maxTime) {
      metric.maxTime = duration;
    }

    // Print to console on every 1st, 5th, or 10th call (or debounced) so it is highly visible in DevTools & logs
    const avg = metric.totalTime / metric.calls;
    console.log(`[PERF PROFUL] ${name} -> Call #${metric.calls} | Current: ${duration.toFixed(2)}ms | Avg: ${avg.toFixed(2)}ms | Peak: ${metric.maxTime.toFixed(2)}ms`);
    
    // Also expose to window for client checking
    if (typeof window !== 'undefined') {
      (window as any).__perf_metrics = this.metrics;
    }
  }

  public static getReport(): string {
    const lines = ['=== RELATÓRIO DE PERFORMANCE COGNITIVO ==='];
    Object.entries(this.metrics).forEach(([name, m]) => {
      const avg = m.totalTime / m.calls;
      lines.push(`Função: ${name}`);
      lines.push(`  Chamadas: ${m.calls}`);
      lines.push(`  Tempo total: ${m.totalTime.toFixed(2)}ms`);
      lines.push(`  Tempo médio: ${avg.toFixed(2)}ms`);
      lines.push(`  Maior pico: ${m.maxTime.toFixed(2)}ms`);
    });
    return lines.join('\n');
  }
}

if (typeof window !== 'undefined') {
  (window as any).getPerfReport = () => {
    console.log(PerfProfiler.getReport());
    return PerfProfiler.getReport();
  };
}

export { PerfProfiler };
