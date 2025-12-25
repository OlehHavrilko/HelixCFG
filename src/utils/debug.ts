/**
 * Debug utilities for HelixCFG
 * Provides comprehensive logging, performance monitoring, and error tracking
 */

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  performanceTracking: boolean;
  errorTracking: boolean;
  consoleOutput: boolean;
}

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  count: number;
  total: number;
  average: number;
  max: number;
  min: number;
}

export interface ErrorLog {
  timestamp: number;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  component?: string;
}

class DebugSystem {
  private config: DebugConfig = {
    enabled: true,
    logLevel: 'debug',
    performanceTracking: true,
    errorTracking: true,
    consoleOutput: true,
  };

  private performanceMetrics: PerformanceMetric[] = [];
  private errorLogs: ErrorLog[] = [];
  private componentPerformance: Map<string, PerformanceMetric[]> = new Map();

  constructor() {
    this.initializeGlobalErrorHandling();
  }

  /**
   * Configure debug system
   */
  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && this.config.consoleOutput) {
      this.log('info', 'Debug system configured', { config: this.config });
    }
  }

  /**
   * Logging system
   */
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] < levels[this.config.logLevel]) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.config.consoleOutput) {
      switch (level) {
        case 'debug':
          console.debug(logEntry, context);
          break;
        case 'info':
          console.info(logEntry, context);
          break;
        case 'warn':
          console.warn(logEntry, context);
          break;
        case 'error':
          console.error(logEntry, context);
          break;
      }
    }

    // Store error logs
    if (level === 'error' || level === 'warn') {
      this.errorLogs.push({
        timestamp: Date.now(),
        level,
        message,
        context,
        stack: new Error().stack,
      });
    }
  }

  /**
   * Performance monitoring
   */
  startPerformanceMetric(name: string, metadata?: Record<string, any>): () => void {
    if (!this.config.performanceTracking) {
      return () => {};
    }

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);

    // Track component-specific performance
    if (metadata?.component) {
      const componentMetrics = this.componentPerformance.get(metadata.component) || [];
      componentMetrics.push(metric);
      this.componentPerformance.set(metadata.component, componentMetrics);
    }

    return () => {
      this.endPerformanceMetric(name);
    };
  }

  endPerformanceMetric(name: string): void {
    const metric = this.performanceMetrics.find(m => m.name === name && !m.endTime);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    summary: Record<string, PerformanceStats>;
    components: Record<string, PerformanceMetric[]>;
    recent: PerformanceMetric[];
  } {
    const completedMetrics = this.performanceMetrics.filter(m => m.duration !== undefined);
    
    const summary: Record<string, PerformanceStats> = {};
    completedMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, total: 0, average: 0, max: 0, min: Infinity };
      }
      summary[metric.name].count++;
      summary[metric.name].total += metric.duration!;
      summary[metric.name].max = Math.max(summary[metric.name].max, metric.duration!);
      summary[metric.name].min = Math.min(summary[metric.name].min, metric.duration!);
    });

    // Calculate averages
    Object.keys(summary).forEach(key => {
      summary[key].average = summary[key].total / summary[key].count;
      if (summary[key].min === Infinity) {
        summary[key].min = 0;
      }
    });

    return {
      summary,
      components: Object.fromEntries(this.componentPerformance),
      recent: completedMetrics.slice(-10),
    };
  }

  /**
   * Error tracking
   */
  logError(message: string, error: Error, context?: Record<string, any>): void {
    this.log('error', message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  getErrorsByComponent(component?: string): ErrorLog[] {
    return this.errorLogs.filter(log => !component || log.component === component);
  }

  /**
   * Build-specific debugging
   */
  debugBuildAnalysis(buildId: string, buildData: any, analysisResults: any): void {
    this.log('info', `Build analysis completed: ${buildId}`, {
      build: buildData,
      results: analysisResults,
      timestamp: new Date().toISOString(),
    });
  }

  debugCompatibilityCheck(componentIds: string[], results: any): void {
    this.log('debug', 'Compatibility check performed', {
      components: componentIds,
      results,
    });
  }

  debugRecommendationGeneration(issues: any[], recommendations: any[]): void {
    this.log('debug', 'Recommendations generated', {
      issueCount: issues.length,
      recommendationCount: recommendations.length,
      recommendations: recommendations.slice(0, 3), // Limit output
    });
  }

  /**
   * System health monitoring
   */
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'error';
    metrics: {
      performanceCount: number;
      errorCount: number;
      avgResponseTime: number;
      errorRate: number;
    };
    recentErrors: ErrorLog[];
    performanceAlerts: string[];
  } {
    const completedMetrics = this.performanceMetrics.filter(m => m.duration !== undefined);
    const avgResponseTime = completedMetrics.length > 0 
      ? completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length
      : 0;

    const recentErrors = this.errorLogs.filter(log => 
      Date.now() - log.timestamp < 300000 // Last 5 minutes
    );

    const errorRate = this.errorLogs.length / Math.max(this.performanceMetrics.length, 1);

    const alerts: string[] = [];
    if (avgResponseTime > 100) {
      alerts.push(`High average response time: ${avgResponseTime.toFixed(2)}ms`);
    }
    if (errorRate > 0.1) {
      alerts.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }
    if (recentErrors.length > 10) {
      alerts.push(`Many recent errors: ${recentErrors.length}`);
    }

    let status: 'healthy' | 'degraded' | 'error' = 'healthy';
    if (alerts.length > 2 || errorRate > 0.2) {
      status = 'error';
    } else if (alerts.length > 0 || errorRate > 0.05) {
      status = 'degraded';
    }

    return {
      status,
      metrics: {
        performanceCount: this.performanceMetrics.length,
        errorCount: this.errorLogs.length,
        avgResponseTime,
        errorRate,
      },
      recentErrors: recentErrors.slice(-5),
      performanceAlerts: alerts,
    };
  }

  /**
   * Export debug data
   */
  exportDebugData(): {
    timestamp: string;
    config: DebugConfig;
    performance: ReturnType<DebugSystem['getPerformanceReport']>;
    errors: ErrorLog[];
    health: ReturnType<DebugSystem['getSystemHealth']>;
  } {
    return {
      timestamp: new Date().toISOString(),
      config: this.config,
      performance: this.getPerformanceReport(),
      errors: this.getErrorLogs(),
      health: this.getSystemHealth(),
    };
  }

  /**
   * Clear debug data
   */
  clear(): void {
    this.performanceMetrics = [];
    this.errorLogs = [];
    this.componentPerformance.clear();
    this.log('info', 'Debug data cleared');
  }

  private initializeGlobalErrorHandling(): void {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError('Global error', event.error as Error, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.logError('Unhandled promise rejection', new Error(String(event.reason)), {
          type: 'promise_rejection',
        });
      });
    }
  }
}

// Create singleton instance
export const debugSystem = new DebugSystem();

// Convenience functions
export const debug = {
  log: (message: string, context?: Record<string, any>) => 
    debugSystem.log('debug', message, context),
  info: (message: string, context?: Record<string, any>) => 
    debugSystem.log('info', message, context),
  warn: (message: string, context?: Record<string, any>) => 
    debugSystem.log('warn', message, context),
  error: (message: string, context?: Record<string, any>) => 
    debugSystem.log('error', message, context),
  
  startTimer: (name: string, metadata?: Record<string, any>) => 
    debugSystem.startPerformanceMetric(name, metadata),
  endTimer: (name: string) => 
    debugSystem.endPerformanceMetric(name),
  
  buildAnalysis: (buildId: string, buildData: any, analysisResults: any) => 
    debugSystem.debugBuildAnalysis(buildId, buildData, analysisResults),
  compatibilityCheck: (componentIds: string[], results: any) => 
    debugSystem.debugCompatibilityCheck(componentIds, results),
  recommendationGeneration: (issues: any[], recommendations: any[]) => 
    debugSystem.debugRecommendationGeneration(issues, recommendations),
  
  getHealth: () => debugSystem.getSystemHealth(),
  getPerformance: () => debugSystem.getPerformanceReport(),
  getErrors: () => debugSystem.getErrorLogs(),
  export: () => debugSystem.exportDebugData(),
  clear: () => debugSystem.clear(),
};

// React DevTools integration
if (typeof window !== 'undefined' && (window as any).React) {
  (window as any).HelixCFG = {
    debug: debugSystem,
    exportData: () => debugSystem.exportDebugData(),
  };
}
