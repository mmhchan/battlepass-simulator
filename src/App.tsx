import { Layout } from '@/components/ui/Layout';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { ProgressionChart } from '@/components/simulation/ProgressionChart';
import { PersonaCard } from '@/components/simulation/PersonaCard';
import { useSimulation } from '@/hooks/useSimulation';
import { useSeasonStore } from '@/store/useSeasonStore';
import { NarrativeSummary } from '@/components/simulation/NarrativeSummary';
import { MAX_PERSONAS } from '@/config/constants';

export default function App() {
  const results = useSimulation();
  const { personas, addPersona } = useSeasonStore();

  const isLoading = personas.length > 0 && (!results || results.length === 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-sage-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-sage-500 font-medium">Calculating Season Forecast...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto px-8 py-8 flex-1 flex flex-col">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Left: Controls */}
          <div className="lg:col-span-3 xl:col-span-2">
            <ControlPanel />
          </div>

          {/* Right: Chart + Personas */}
          <div className="lg:col-span-9 xl:col-span-10 flex flex-col gap-8">
            <div className="bg-white border border-sage-200 rounded-xl p-8 flex-1 flex flex-col shadow-sm">
              <h3 className="text-lg font-bold text-sage-900 mb-4">Season Forecast</h3>
              <ProgressionChart />
              <NarrativeSummary />
            </div>

            {/* Persona Management */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-sage-900 inline-flex items-center gap-2">
                  Player Segments
                  <span className={`text-xs font-medium transition-colors duration-500 ${personas.length === 0
                      ? 'text-sage-600'
                      : 'text-sage-400'
                    }`}>
                    {personas.length}/{MAX_PERSONAS}
                  </span>
                </h3>

                <button
                  onClick={addPersona}
                  disabled={personas.length >= MAX_PERSONAS}
                  className={`
                  px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-lg active:scale-95
                  ${personas.length === 0
                      ? 'bg-sage-600 hover:bg-sage-700 shadow-sage-600/30 animate-pulse-strong ring-2 ring-sage-300'
                      : 'bg-sage-600 hover:bg-sage-700 shadow-sage-600/10'}
                  disabled:bg-sage-200 disabled:text-sage-400 disabled:shadow-none disabled:animate-none
                `}
                >
                  {personas.length >= MAX_PERSONAS ? 'Limit Reached' : '+ Add Persona'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {results.map((res) => (
                  <PersonaCard
                    key={res.persona.id}
                    persona={res.persona}
                    result={res}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
