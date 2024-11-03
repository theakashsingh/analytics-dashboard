/* eslint-disable react/prop-types */
import { StatsOverview } from './component/StatsOverview ';
import { OverviewCharts } from './component/charts/OverviewCharts';
import { GeographyCharts } from './component/charts/GeographyCharts';
import { ModelsCharts } from './component/charts/ModelsCharts';
import { TimelineCharts } from './component/charts/TimelineCharts';
import { UtilitiesCharts } from './component/charts/UtilitiesCharts';

export const DashboardContent = ({ data, activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <StatsOverview stats={data.stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <OverviewCharts data={data} />
            </div>
          </>
        );
      
      case 'geography':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GeographyCharts data={data} />
          </div>
        );
      
      case 'models':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ModelsCharts data={data} />
          </div>
        );
      
      case 'timeline':
        return (
          <div className="grid grid-cols-1 gap-8">
            <TimelineCharts data={data} />
          </div>
        );
      
      case 'utilities':
        return (
          <div className="grid grid-cols-1 gap-8">
            <UtilitiesCharts data={data} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {renderContent()}
    </div>
  );
};