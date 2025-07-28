import axios from 'axios';
import { Event as CalendarEvent } from 'react-big-calendar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'activity' | 'calendar' | 'quickActions' | 'performance';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  config?: any;
}

interface Activity {
  id: string;
  type: 'tender' | 'bid' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  avatar?: string;
  status?: 'success' | 'warning' | 'error';
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  target?: number;
  color: string;
}

interface DashboardStats {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  pendingBids: number;
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  revenueChange: number;
}

interface DashboardData {
  stats: DashboardStats;
  activities: Activity[];
  performanceMetrics: PerformanceMetric[];
  calendarEvents: CalendarEvent[];
  alerts: any[];
  charts: {
    tenderTrend: any[];
    bidAnalytics: any[];
    userActivity: any[];
    revenueChart: any[];
  };
}

interface DashboardFilter {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  departments?: string[];
}

interface QuickActionConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  route?: string;
  action?: string;
  params?: any;
  permissions?: string[];
}

const dashboardService = {
  // Dashboard Statistics
  async getStats(filter?: DashboardFilter): Promise<DashboardStats> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, { params: filter });
    return response.data;
  },

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/activities`, { params: { limit } });
    return response.data;
  },

  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/performance-metrics`);
    return response.data;
  },

  async getCalendarEvents(month?: Date): Promise<CalendarEvent[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/calendar-events`, {
      params: month ? { month: month.toISOString() } : undefined
    });
    return response.data.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  },

  // Widget Configuration
  async getWidgetConfiguration(): Promise<Widget[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/widgets`);
      return response.data;
    } catch (error) {
      // Fallback to local storage if API fails
      const saved = localStorage.getItem('dashboardWidgets');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async saveWidgetConfiguration(widgets: Widget[]): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/dashboard/widgets`, { widgets });
    } catch (error) {
      // Fallback to local storage if API fails
      localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    }
  },

  // Chart Data
  async getChartData(chartType: string, filter?: DashboardFilter): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/charts/${chartType}`, { params: filter });
    return response.data;
  },

  async getTenderAnalytics(period: 'week' | 'month' | 'quarter' | 'year'): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/tenders`, { params: { period } });
    return response.data;
  },

  async getBidAnalytics(period: 'week' | 'month' | 'quarter' | 'year'): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/bids`, { params: { period } });
    return response.data;
  },

  async getUserAnalytics(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/users`);
    return response.data;
  },

  async getRevenueAnalytics(period: 'week' | 'month' | 'quarter' | 'year'): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/revenue`, { params: { period } });
    return response.data;
  },

  // Quick Actions
  async getQuickActions(): Promise<QuickActionConfig[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/quick-actions`);
    return response.data;
  },

  async saveQuickActions(actions: QuickActionConfig[]): Promise<void> {
    await axios.post(`${API_BASE_URL}/dashboard/quick-actions`, { actions });
  },

  async executeQuickAction(actionId: string, params?: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/dashboard/quick-actions/${actionId}/execute`, params);
    return response.data;
  },

  // Alerts and Notifications
  async getDashboardAlerts(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/alerts`);
    return response.data;
  },

  async dismissAlert(alertId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/dashboard/alerts/${alertId}/dismiss`);
  },

  async getNotificationCount(): Promise<number> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/notifications/count`);
    return response.data.count;
  },

  // Performance Insights
  async getSystemHealth(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/system-health`);
    return response.data;
  },

  async getKPIs(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/kpis`);
    return response.data;
  },

  async getPerformanceTrends(metric: string, period: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/performance-trends`, {
      params: { metric, period }
    });
    return response.data;
  },

  // Export and Reports
  async exportDashboard(format: 'pdf' | 'excel' | 'png'): Promise<Blob> {
    const response = await axios.post(`${API_BASE_URL}/dashboard/export`, 
      { format },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async generateReport(reportType: string, filter: DashboardFilter): Promise<Blob> {
    const response = await axios.post(`${API_BASE_URL}/dashboard/reports/${reportType}`, 
      filter,
      { responseType: 'blob' }
    );
    return response.data;
  },

  async scheduledReport(schedule: any): Promise<void> {
    await axios.post(`${API_BASE_URL}/dashboard/reports/schedule`, schedule);
  },

  // Real-time Updates
  subscribeToUpdates(callback: (data: any) => void): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/dashboard/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return eventSource;
  },

  // User Preferences
  async getUserPreferences(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/preferences`);
    return response.data;
  },

  async saveUserPreferences(preferences: any): Promise<void> {
    await axios.post(`${API_BASE_URL}/dashboard/preferences`, preferences);
  },

  // Search and Filters
  async searchDashboard(query: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/search`, { params: { query } });
    return response.data;
  },

  async getFilterOptions(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/filter-options`);
    return response.data;
  },

  // Data Refresh
  async refreshWidget(widgetId: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/dashboard/widgets/${widgetId}/refresh`);
    return response.data;
  },

  async refreshAllData(): Promise<DashboardData> {
    const response = await axios.post(`${API_BASE_URL}/dashboard/refresh-all`);
    return response.data;
  },

  // Caching
  async clearCache(): Promise<void> {
    await axios.post(`${API_BASE_URL}/dashboard/cache/clear`);
    localStorage.removeItem('dashboardCache');
  },

  async preloadData(): Promise<void> {
    await axios.post(`${API_BASE_URL}/dashboard/preload`);
  },

  // Utility Functions
  formatMetricValue(value: number, unit: string): string {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === '$') {
      return `$${value.toLocaleString()}`;
    } else if (unit === 'k') {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  },

  getMetricColor(trend: 'up' | 'down' | 'stable', isPositiveGood: boolean = true): string {
    if (trend === 'stable') return '#grey';
    if (trend === 'up') return isPositiveGood ? '#4caf50' : '#f44336';
    return isPositiveGood ? '#f44336' : '#4caf50';
  },

  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
};

export default dashboardService;
