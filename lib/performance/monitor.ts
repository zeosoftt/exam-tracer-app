/**
 * Performance Monitoring Utilities
 * 
 * Tracks query performance, slow queries, and request metrics
 */

interface QueryMetrics {
  query: string;
  duration: number;
  params?: unknown;
}

interface RequestMetrics {
  method: string;
  path: string;
  duration: number;
  queryCount: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

// In-memory storage for development (not suitable for production)
const slowQueries: QueryMetrics[] = [];
const requestMetrics: RequestMetrics[] = [];

const SLOW_QUERY_THRESHOLD_MS = 100; // Log queries slower than 100ms
const MAX_STORED_METRICS = 100; // Keep only last 100 metrics

/**
 * Track a database query execution
 */
export function trackQuery(query: string, duration: number, params?: unknown): void {
  if (duration > SLOW_QUERY_THRESHOLD_MS) {
    slowQueries.push({ query, duration, params });
    
    // Keep only last N slow queries
    if (slowQueries.length > MAX_STORED_METRICS) {
      slowQueries.shift();
    }
    
    // Log slow query
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  SLOW QUERY: ${duration.toFixed(2)}ms - ${query.substring(0, 100)}`);
      if (params) {
        console.warn(`   Params:`, params);
      }
    }
  }
}

/**
 * Track a request's performance metrics
 */
export function trackRequest(
  method: string,
  path: string,
  duration: number,
  queryCount: number
): void {
  const memoryUsage = process.memoryUsage();
  
  const metrics: RequestMetrics = {
    method,
    path,
    duration,
    queryCount,
    memoryUsage,
  };
  
  requestMetrics.push(metrics);
  
  // Keep only last N requests
  if (requestMetrics.length > MAX_STORED_METRICS) {
    requestMetrics.shift();
  }
  
  // Log if request is slow or has many queries
  if (process.env.NODE_ENV === 'development') {
    if (duration > 500 || queryCount > 10) {
      console.warn(`⚠️  SLOW REQUEST: ${method} ${path}`);
      console.warn(`   Duration: ${duration.toFixed(2)}ms`);
      console.warn(`   Queries: ${queryCount}`);
      console.warn(`   Memory: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }
  }
}

/**
 * Get slow queries (for debugging)
 */
export function getSlowQueries(): QueryMetrics[] {
  return [...slowQueries].sort((a, b) => b.duration - a.duration);
}

/**
 * Get request metrics (for debugging)
 */
export function getRequestMetrics(): RequestMetrics[] {
  return [...requestMetrics].sort((a, b) => b.duration - a.duration);
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics(): void {
  slowQueries.length = 0;
  requestMetrics.length = 0;
}

/**
 * Wrap a Prisma query to track its performance
 * 
 * Usage:
 * const result = await trackPrismaQuery(
 *   () => prisma.user.findMany({ ... }),
 *   'user.findMany'
 * );
 */
export async function trackPrismaQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string,
  params?: unknown
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    trackQuery(queryName, duration, params);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackQuery(`${queryName} (ERROR)`, duration, params);
    throw error;
  }
}

/**
 * Middleware to track request performance
 */
export function createPerformanceMiddleware() {
  return async (req: Request, handler: () => Promise<Response>) => {
    const startTime = Date.now();
    const queryCount = 0;
    
    // This is a simple approach - in production, use Prisma middleware
    // to actually count queries
    const originalHandler = handler;
    
    try {
      const response = await originalHandler();
      const duration = Date.now() - startTime;
      
      // Extract method and path from request
      const method = req.method || 'GET';
      const url = new URL(req.url);
      const path = url.pathname;
      
      trackRequest(method, path, duration, queryCount);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const method = req.method || 'GET';
      const url = new URL(req.url);
      const path = url.pathname;
      
      trackRequest(method, path, duration, queryCount);
      throw error;
    }
  };
}
