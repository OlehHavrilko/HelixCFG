import { useAppStore } from '../app/store';
import { Component } from '../domain/model/types';

export function BuildSummary() {
  const { report, getSelectedComponents, getPriceForComponent } = useAppStore();

  const selected = getSelectedComponents();

  return (
    <div className="bg-gray-800 p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Build Summary</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Selected Components:</h3>
        <ul>
          {selected.map((comp: Component) => {
            const price = getPriceForComponent(comp.id);
            return (
              <li key={comp.id} className="text-sm">
                {comp.brand} {comp.model} - ${price?.value || 0}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Total: ${report?.totalPrice || 0}</h3>
      </div>
      {report && (
        <div>
          <div className="mb-2">
            <h3 className="font-semibold text-red-400">Errors: {report.errors.length}</h3>
            {report.errors.map((err, i) => (
              <p key={i} className="text-sm text-red-300">{err.message}</p>
            ))}
          </div>
          <div className="mb-2">
            <h3 className="font-semibold text-yellow-400">Warnings: {report.warnings.length}</h3>
            {report.warnings.map((warn, i) => (
              <p key={i} className="text-sm text-yellow-300">{warn.message}</p>
            ))}
          </div>
          <div>
            <h3 className="font-semibold text-blue-400">Recommendations: {report.recommendations.length}</h3>
            {report.recommendations.map((rec, i) => (
              <p key={i} className="text-sm text-blue-300">{rec.message}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
