import { useAtom, useAtomValue } from 'jotai';
import { ruleBuilderRulesAtom, ruleBuilderDefaultConnectorAtom } from '@/store/atoms/ruleBuilder';
import { RuleCard } from './RuleCard';
import { isRule } from '@/lib/types/ruleBuilder';

export function LogicStack() {
  const [rules, setRules] = useAtom(ruleBuilderRulesAtom);
  const defaultConnector = useAtomValue(ruleBuilderDefaultConnectorAtom);

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-2">
      {rules.map((rule, index) => {
        if (!isRule(rule)) return null; // Skip rule groups for now

        return (
          <div key={rule.id}>
            {/* Connector between rules */}
            {index > 0 && (
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-zinc-700" />
                  <span className="px-2 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                    {defaultConnector}
                  </span>
                  <div className="h-px w-8 bg-zinc-700" />
                </div>
              </div>
            )}

            <RuleCard rule={rule} onDelete={() => handleDeleteRule(rule.id)} />
          </div>
        );
      })}
    </div>
  );
}
