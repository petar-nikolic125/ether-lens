import { TrendingUp, Activity, Zap, DollarSign } from "lucide-react";

export const NetworkStats = () => {
  // This component is deprecated - use EthereumDashboard for live network stats
  const stats: any[] = [];

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
              <div
                  key={stat.title}
                  className="ot-card-glass rounded-2xl p-6 group hover-lift ot-border-gradient cursor-pointer"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  aria-label={stat.title}
              >
                <div className="relative">
                  {/* soft hover wash */}
                  <div className={`absolute inset-0 ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="text-xs font-space px-2 py-1 rounded-lg bg-secondary/40 border border-border/50 text-muted-foreground">
                    {stat.change}
                  </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-2xl font-bold font-space group-hover:text-foreground transition-colors">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground font-inter">{stat.title}</p>
                    </div>
                  </div>
                </div>
              </div>
          );
        })}
      </div>
  );
};
