import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, Package } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Sales Promotion Analytics</h2>
        <p className="text-muted-foreground">Insights and metrics on promotion effectiveness</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">$2.4M</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-secondary" />
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8.3%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold">24.8%</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-accent" />
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15.2%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Products Sold</p>
            <p className="text-3xl font-bold">45.2K</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-warning" />
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +22.1%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">ROI</p>
            <p className="text-3xl font-bold">340%</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>Revenue and engagement by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Spring Sale 2024", revenue: "$854K", conversion: "28.5%", reach: "125K" },
              { name: "Flash Friday", revenue: "$623K", conversion: "31.2%", reach: "98K" },
              { name: "Bundle Deals", revenue: "$512K", conversion: "22.8%", reach: "110K" },
              { name: "Holiday Special", revenue: "$411K", conversion: "26.1%", reach: "87K" },
            ].map((campaign, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{campaign.name}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">Revenue: {campaign.revenue}</span>
                    <span className="text-xs text-muted-foreground">Conv: {campaign.conversion}</span>
                    <span className="text-xs text-muted-foreground">Reach: {campaign.reach}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Revenue by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Electronics", revenue: "$1.2M", percentage: 50 },
                { category: "Fashion", revenue: "$680K", percentage: 28 },
                { category: "Home & Garden", revenue: "$340K", percentage: 14 },
                { category: "Sports", revenue: "$180K", percentage: 8 },
              ].map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm text-muted-foreground">{cat.revenue}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Engagement by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { segment: "Premium", count: "12.5K", revenue: "$1.4M", avg: "$112" },
                { segment: "Regular", count: "34.2K", revenue: "$820K", avg: "$24" },
                { segment: "New", count: "18.7K", revenue: "$180K", avg: "$9.6" },
              ].map((seg, idx) => (
                <div key={idx} className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{seg.segment}</span>
                    <span className="text-sm text-muted-foreground">{seg.count} customers</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue: {seg.revenue}</span>
                    <span>Avg: {seg.avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
