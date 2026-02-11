import { Layout } from '@/components/ui/Layout';
import { Card } from '@/components/ui/Card';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { ProgressionChart } from './components/simulation/ProgressionCharts';
import { useSimulation } from '@/hooks/useSimulation';

export default function App() {
  const results = useSimulation();

  // Guard clause to handle initialization
  if (!results || results.length === 0) {
    return (
      <Layout>
        <div className="p-10 text-white text-center">
          Initializing Simulation Engine...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
        
        {/* Left Column: Input Levers */}
        <div className="lg:col-span-4">
          <ControlPanel />
        </div>

        {/* Right Column: Visualization Output */}
        <div className="lg:col-span-8">
          <Card title="Live Progression Forecast" subtitle="Visualizing the expected journey for each player cohort.">
            <ProgressionChart />
          </Card>
        </div>

      </div>
    </Layout>
  );
}