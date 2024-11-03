/* eslint-disable react/prop-types */
import { Car, Battery, TrendingUp, Zap } from 'lucide-react';
import { StatsCard } from './StatsCard';

export const StatsOverview = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatsCard
      title="Total EVs"
      value={stats.totalCount.toLocaleString()}
      subtext={`${stats.bev}% BEV | ${stats.phev}% PHEV`}
      icon={Car}
    />
    <StatsCard
      title="Average Range"
      value={`${stats.averageRange} mi`}
      subtext={`Max: ${stats.electricRangeStats.max} mi`}
      icon={Battery}
    />
    <StatsCard
      title="Market Leader"
      value={stats.marketLeader}
      subtext={`${stats.uniqueMakes} Makes`}
      icon={TrendingUp}
    />
    <StatsCard
      title="CAFV Eligible"
      value={`${stats.cafvEligible}%`}
      subtext="Clean Alternative Fuel Vehicles"
      icon={Zap}
    />
  </div>
);
