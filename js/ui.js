/**
 * CCXNY Presentation Layer (ui.js)
 * Standards: Zero-Logic, Defensive DOM, XSS Prevention.
 */

import { formatCurrency, safeText } from './utils.js';

export function bindEventToElement(id, eventType, handler) {
  const element = document.getElementById(id);
  if (element) element.addEventListener(eventType, handler);
}

export function getDiagnosticInputValue() {
  const el = document.getElementById('volInput'); // Fixed ID based on index.html
  return el ? el.value : 0;
}

export function updatePersonaUIState(activePersona) {
  const display = document.getElementById('persona-label-display');
  if (display) {
    const labels = {
      'cbo': 'CBO / Provider Node',
      'scn': 'SCN / Executive',
      'payer': 'MCO / Risk Owner'
    };
    display.textContent = labels[activePersona.toLowerCase()] || activePersona;
  }

  // Update button group active state
  const buttons = document.querySelectorAll('.persona-btn');
  buttons.forEach(btn => {
    if (btn.dataset.persona === activePersona) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

export function toggleActionLoading(id, isLoading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = isLoading;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Processing...';
  } else {
    btn.textContent = btn.dataset.originalText || 'Generate Profile';
  }
}

export function isLedgerChainPresent() {
  return document.getElementById('worm-chain-output') !== null;
}

export function syncNodeTableIfPresent(nodes) {
  const tableBody = document.getElementById('nodeTableBody');
  if (tableBody) renderNodeTable(tableBody, nodes);
}

export function renderInterpretation(persona, state) {
  const container = document.getElementById('interpretation');
  if (!container || !state) return;
  container.textContent = '';
  const p1 = document.createElement('p');
  const p2 = document.createElement('p');
  const normalizedPersona = String(persona || '').toLowerCase().trim();
  const volume = Number(state.volume) || 0;
  const operational = Number(state.operational) || 0;
  const totalLoss = Number(state.totalLoss) || 0;
  const audit = Number(state.audit) || 0;

  switch (normalizedPersona) {
    case 'cbo':
      p1.textContent = `At a monthly volume of ${volume.toLocaleString()} encounters, cross-system alignment signals identify fragmented integrity patterns. This represents the administrative capacity captured or lost through existing documentation structure.`;
      p2.textContent = `Analysis reconstructs a projected operational friction of ${formatCurrency(operational)}, informing where corrective action may be required to protect funding stability.`;
      break;
    case 'scn':
      p1.textContent = `Network aggregate documentation signals indicate a systemic liability exposure of ${formatCurrency(totalLoss)}. Signal variability suggests prioritized documentation review for specific system touchpoints.`;
      p2.textContent = `These signals help interpret where system-wide workflow changes or capacity investment may be required to mitigate compliance risk across the SCN.`;
      break;
    case 'payer':
      p1.textContent = `Systemic signal inconsistencies project a Medicaid recoupment risk reaching ${formatCurrency(totalLoss + audit)}. Network status signals are directional interpretations based on research benchmarks for Year 1-2 SCN conditions.`;
      p2.textContent = `Documentation alignment and integrity management are recommended to minimize NYHER reporting exposure via existing systems.`;
      break;
    default:
      p1.textContent = 'Select a stakeholder persona to view sidecar interpretation.';
      break;
  }
  container.append(p1, p2);
}

export function renderNodeTable(container, nodes, limit = 5) {
  if (!container || !Array.isArray(nodes)) return;
  container.textContent = '';
  
  const displayNodes = limit ? nodes.slice(0, limit) : nodes;
  
  displayNodes.forEach(node => {
    const tr = document.createElement('tr');
    
    const tdId = document.createElement('td');
    tdId.textContent = `Touchpoint ${node.id}`;
    
    const tdScreening = document.createElement('td');
    tdScreening.textContent = (node.screening * 100).toFixed(1) + '%';
    
    const tdReferral = document.createElement('td');
    tdReferral.textContent = (node.referral * 100).toFixed(1) + '%';
    
    const tdFidelity = document.createElement('td');
    tdFidelity.textContent = (node.fidelity * 100).toFixed(1) + '%';
    tdFidelity.title = "Cross-System Integrity Score";
    
    const tdTier = document.createElement('td');
    tdTier.textContent = node.tier;
    
    if (node.tier === 'High Integrity') {
      tdTier.style.color = 'var(--ccx-status-live)';
    } else if (node.tier === 'Documentation Risk') {
      tdTier.style.color = 'var(--ccx-outcome-gold)';
    } else {
      tdTier.style.color = '#EF4444'; // High risk red
    }
    
    tr.append(tdId, tdScreening, tdReferral, tdFidelity, tdTier);
    container.appendChild(tr);
  });
}

export function injectGlobalFooter(payload) {
  safeText('version', `v${payload.version} | Data: ${payload.dataVersion}`);
  safeText('hud-timestamp', new Date().toISOString().split('.')[0] + 'Z');
}

export function renderExposureBoard(persona, payload) {
  safeText('val-operational', formatCurrency(payload.operational));
  safeText('band-operational', `${formatCurrency(payload.operationalBand.low)} – ${formatCurrency(payload.operationalBand.high)}`);
  
  safeText('val-denial', formatCurrency(payload.denial));
  safeText('band-denial', `${formatCurrency(payload.denialBand.low)} – ${formatCurrency(payload.denialBand.high)}`);
  
  safeText('val-audit', formatCurrency(payload.audit));
  safeText('band-audit', `${formatCurrency(payload.auditBand.low)} – ${formatCurrency(payload.auditBand.high)}`);
  
  safeText('val-total', `${formatCurrency(payload.totalBand.low)} – ${formatCurrency(payload.totalBand.high)}`);

  // Persona-specific highlighting
  const cards = document.querySelectorAll('.kpi-card');
  cards.forEach(card => card.classList.remove('focus-kpi'));
  
  const p = String(persona).toLowerCase();
  if (p === 'cbo' && cards[0]) cards[0].classList.add('focus-kpi');
  if (p === 'scn' && cards[2]) cards[2].classList.add('focus-kpi');
  if (p === 'payer' && cards[3]) cards[3].classList.add('focus-kpi');
}

export function renderNetworkGrid(containerId, nodes) {
  const container = document.getElementById(containerId);
  if (!container || !Array.isArray(nodes)) return;
  container.textContent = '';
  nodes.forEach((node, index) => {
    const div = document.createElement('div');
    const isPulse = index % 15 === 0; // Add some "Live" pulse nodes
    div.className = `node ${node.tier === 'High Integrity' ? 'stable' : node.tier === 'Documentation Risk' ? 'medium' : 'high'} ${isPulse ? 'pulse' : ''}`;
    div.title = `TOUCHPOINT_${node.id} | CROSS_SYSTEM_INTEGRITY: ${(node.fidelity * 100).toFixed(1)}% | TIER: ${node.tier.toUpperCase()}`;
    
    // Forensic hover detail
    div.addEventListener('mouseenter', () => {
      const display = document.getElementById('node-forensic-display');
      if (display) {
        display.textContent = `ALIGNMENT_LAYER_ACTIVE: TOUCHPOINT_${node.id} [${node.tier.toUpperCase()}] | SYSTEM_INTEGRITY_${(node.fidelity * 100).toFixed(1)}%`;
      }
    });

    container.appendChild(div);
  });
}

export function renderNetworkSummary(avgs) {
  safeText('summary-screening', (avgs.screeningAvg * 100).toFixed(1) + '%');
  safeText('summary-referral', (avgs.referralAvg * 100).toFixed(1) + '%');
  safeText('summary-fidelity', (avgs.fidelityAvg * 100).toFixed(1) + '%');
}

export function renderScenario(payload) {
  const container = document.getElementById('scenarioBox');
  if (!container) return;
  container.textContent = '';
  const h3 = document.createElement('h3');
  h3.textContent = 'Operational Alignment Profile';
  h3.className = 'eyebrow';
  h3.style.marginBottom = '1rem';
  const p = document.createElement('p');
  p.textContent = `At ${payload.volume.toLocaleString()} encounters, the system observes a fragmented documentation alignment pattern. This directional interpretation illustrates potential exposure pathways across existing infrastructure.`;
  container.append(h3, p);
}

export function renderWormChain(containerId, blocks) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.textContent = '';
  blocks.forEach((block, index) => {
    const div = document.createElement('div');
    div.className = 'block';
    div.style.padding = '0.5rem 0';
    div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    div.textContent = `[${index}] ${new Date(block.timestamp).toISOString()} | ${block.action} | Hash: ${block.hash.substring(0, 8)}...`;
    container.appendChild(div);
  });
}

export function renderAuditResults(results) {
  safeText('sampled', formatCurrency(results.sampled));
  safeText('extrapolated', formatCurrency(results.extrapolated));
  const rangeLow = results.extrapolated * 0.85;
  const rangeHigh = results.extrapolated * 1.15;
  safeText('range', `${formatCurrency(rangeLow)} – ${formatCurrency(rangeHigh)}`);
  const panel = document.getElementById('resultsPanel');
  if (panel) panel.classList.remove('hidden');
}

export function renderStateBridgeSummary(containerId, state) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.textContent = '';
  const table = document.createElement('table');
  table.className = 'results-table';
  const rows = [
    ['Monthly Volume', state.volume.toLocaleString()],
    ['Documentation Rework Risk', formatCurrency(state.operational)],
    ['Estimated Audit Exposure', formatCurrency(state.audit)]
  ];
  rows.forEach(([label, value]) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = label;
    th.className = 'eyebrow';
    const td = document.createElement('td');
    td.textContent = value;
    td.style.textAlign = 'right';
    tr.append(th, td);
    table.appendChild(tr);
  });
  container.appendChild(table);
}

export function updateLogicVerifiedStatus(isValid) {
  const statusEl = document.getElementById('logic-verified-status');
  if (!statusEl) return;
  
  statusEl.textContent = isValid ? 'LOGIC VERIFIED' : 'INTEGRITY COMPROMISED';
  statusEl.style.color = isValid ? 'var(--ccx-status-live)' : '#EF4444';
  
  const badge = document.querySelector('.seal-badge');
  if (badge) {
    badge.textContent = isValid ? 'Logic Verified' : 'Integrity Error';
    badge.style.borderColor = isValid ? 'var(--ccx-outcome-gold)' : '#EF4444';
    badge.style.color = isValid ? 'var(--ccx-outcome-gold)' : '#EF4444';
  }
}

export function showFormFeedback(message, isError = false) {
  const feedback = document.getElementById('formFeedback');
  if (!feedback) return;
  
  feedback.textContent = message;
  feedback.className = 'hud-panel'; 
  feedback.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
  feedback.style.color = isError ? '#EF4444' : 'var(--ccx-status-live)';
  feedback.style.borderColor = isError ? '#EF4444' : 'var(--ccx-status-live)';
  feedback.style.padding = '1rem';
  feedback.style.fontSize = '0.85rem';
  feedback.classList.remove('hidden');
}

export function clearFormFeedback() {
  const feedback = document.getElementById('formFeedback');
  if (feedback) feedback.classList.add('hidden');
}

export function showNoState(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.textContent = '';
    const p = document.createElement('p');
    p.className = 'no-state-msg';
    p.textContent = 'Awaiting data — run the analysis on index page diagnostic first.';
    container.appendChild(p);
  }
}

