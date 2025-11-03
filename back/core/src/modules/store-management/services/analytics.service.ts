export class AnalyticsService {
  // Replace with real HTTP call to Order Management later
  async getSalesSummary(_storeId: string, _range: string) {
    return { total: 0, orders: 0, aov: 0 };
  }
}
