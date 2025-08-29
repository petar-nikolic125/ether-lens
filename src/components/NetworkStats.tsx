import { Card } from "@/components/ui/card";
import { TrendingUp, Activity, Zap, DollarSign } from "lucide-react";

export const NetworkStats = () => {
  // Mock data - in real app this would come from API
  const stats = [
    {
      title: "ETH Price",
      value: "$4,352.33",
      change: "+1.94%",
      icon: DollarSign,
      color: "text-chart-2",
    },
    {
      title: "Gas Price",
      value: "28 Gwei",
      change: "Standard",
      icon: Zap,
      color: "text-warning",
    },
    {
      title: "Latest Block",
      value: "20,629,847",
      change: "8 secs ago",
      icon: Activity,
      color: "text-ethereum",
    },
    {
      title: "Daily Txns",
      value: "1.2M",
      change: "24h volume",
      icon: TrendingUp,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};