/**
 * CCX SCN Network Fidelity Controller (network.js)
 * ARCHITECTURAL DIRECTIVE: Node-level risk surveillance logic.
 */

import { computeNetworkAverages } from './engine.js';
import { loadState } from './utils.js';
import { 
  renderNetworkSummary, 
  renderNetworkGrid, 
  renderNodeTable,
  injectGlobalFooter,
  showNoState
} from './ui.js';

export function handleNetworkHydration() {
  const priorState = loadState('diagnostic');
  
  if (!priorState) {
    showNoState('networkGrid');
    return;
  }

  injectGlobalFooter(priorState);

  const nodes = priorState.nodes;
  // Sort nodes by integrity (risk-first: lowest score first)
  const sortedNodes = [...nodes].sort((a, b) => a.fidelity - b.fidelity);
  
  const avgs = computeNetworkAverages(nodes);

  renderNetworkSummary(avgs);
  renderNetworkGrid('networkGrid', nodes);
  
  const tableBody = document.getElementById('nodeTableBody');
  const tableControls = document.getElementById('table-controls');
  if (tableBody) {
    renderNodeTable(tableBody, sortedNodes, 5);
    if (tableControls && nodes.length > 5) {
      tableControls.style.display = 'flex';
    }
  }
}

export function bindNetworkListeners(nodes) {
  let isExpanded = false;
  const toggleBtn = document.getElementById('toggleTable');
  const tableBody = document.getElementById('nodeTableBody');
  
  // Ensure we use the sorted nodes for the toggle listener as well
  const sortedNodes = nodes ? [...nodes].sort((a, b) => a.fidelity - b.fidelity) : null;

  toggleBtn?.addEventListener('click', () => {
    isExpanded = !isExpanded;
    if (tableBody && sortedNodes) {
      renderNodeTable(tableBody, sortedNodes, isExpanded ? null : 5);
      toggleBtn.textContent = isExpanded ? 'Collapse Trace Layer' : 'View Full Compliance Trace';
    }
  });

  document.getElementById('export')?.addEventListener('click', () => {
    if (!sortedNodes) return;
    const header = 'touchpoint_id,completeness,traceability,integrity_score,risk_tier';
    const rows = sortedNodes.map(n => [
      n.id,
      (n.screening * 100).toFixed(2) + '%',
      (n.referral * 100).toFixed(2) + '%',
      (n.fidelity * 100).toFixed(2) + '%',
      `"${n.tier}"`
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ccx-compliance-trace-ledger.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}
