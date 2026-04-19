/**
 * Workflow Transformation Engine Demo Logic
 * CCX Engineering - Forensic Interaction Layer
 */

import { startLatencyCountdown } from './utils.js';

export function initLandingDemo() {
  const trigger = document.getElementById('triggerDemo');
  if (trigger) {
    trigger.addEventListener('click', runDemoAnimation);
  }

  // Tab switching logic for Outputs
  const outputTabBtns = document.querySelectorAll('.output-tab-btn');
  outputTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const outputType = btn.dataset.output;
      
      // Update buttons
      outputTabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.color = '#888';
        b.style.borderBottom = 'none';
      });
      btn.classList.add('active');
      btn.style.color = 'var(--ccx-frame-regulatory)';
      btn.style.borderBottom = '2px solid var(--ccx-status-live)';

      // Update content
      const contents = document.querySelectorAll('.output-content');
      contents.forEach(c => c.classList.add('hidden'));
      const target = document.getElementById(`out-${outputType}`);
      if (target) target.classList.remove('hidden');
    });
  });


  // Bifurcated View Toggle Logic
  const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
  const centerPanel = document.getElementById('centerPanel');
  const bridge = document.querySelector('.transformation-trace-bridge');
  const causalOverlay = document.getElementById('causalOverlay');

  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      
      // Update UI buttons
      viewToggleBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#888';
      });
      btn.classList.add('active');
      btn.style.background = '#fff';
      btn.style.color = 'var(--ccx-frame-regulatory)';

      if (view === 'bifurcated') {
        if (centerPanel) centerPanel.style.display = 'none';
        if (bridge) bridge.style.display = 'none';
        if (causalOverlay) causalOverlay.style.display = 'none';
      } else {
        if (centerPanel) centerPanel.style.display = 'block';
        if (bridge) bridge.style.display = 'flex';
        if (causalOverlay) causalOverlay.style.display = 'block';
      }
    });
  });
}

export function runDemoAnimation() {
  const canvas = document.getElementById('demoCanvas');
  const initialMsg = document.getElementById('initialMsg');
  const counter = document.getElementById('demoCounter');
  const trigger = document.getElementById('triggerDemo');
  const processingState = document.getElementById('processingState');
  const outputContainer = document.getElementById('outputContainer');
  const outputRationale = document.getElementById('outputRationale');
  const fragmentRows = document.querySelectorAll('.fragment-row');
  const logicSteps = document.querySelectorAll('.logic-step');
  
  if (!canvas || !trigger) return;

  // Reset UI
  trigger.disabled = true;
  if (initialMsg) {
    initialMsg.style.display = 'block';
  }
  if (outputContainer) {
    outputContainer.classList.add('hidden');
    outputContainer.style.opacity = '0';
    // Reset tabs to master
    const tabBtns = document.querySelectorAll('.output-tab-btn');
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.style.color = '#888';
      b.style.borderBottom = 'none';
    });
    const masterBtn = document.querySelector('.output-tab-btn[data-output="master"]');
    if (masterBtn) {
      masterBtn.classList.add('active');
      masterBtn.style.color = 'var(--ccx-frame-regulatory)';
      masterBtn.style.borderBottom = '2px solid var(--ccx-status-live)';
    }
    const tabContents = document.querySelectorAll('.output-content');
    tabContents.forEach(c => c.classList.add('hidden'));
    const masterContent = document.getElementById('out-master');
    if (masterContent) masterContent.classList.remove('hidden');
  }
  if (outputRationale) {
    outputRationale.classList.add('hidden');
    outputRationale.style.opacity = '0';
  }
  counter.textContent = '0.00s';
  processingState.textContent = 'INITIATING RECONSTRUCTION...';
  
  fragmentRows.forEach(row => { 
    row.style.opacity = '1'; 
    row.style.color = '#555';
    row.style.fontWeight = '400';
  });
  logicSteps.forEach(step => { 
    step.style.background = 'rgba(11, 31, 51, 0.1)'; 
    const span = step.querySelector('span');
    if (span) {
      span.style.color = '#999';
      span.style.fontWeight = '400';
    }
  });

  // Step 1: Fragment Recognition
  setTimeout(() => {
    processingState.textContent = 'ANALYZING SOURCE FRAGMENTS...';
    fragmentRows.forEach((row, i) => {
      setTimeout(() => {
        row.style.color = 'var(--ccx-frame-regulatory)';
        row.style.fontWeight = '600';
      }, i * 200);
    });
  }, 500);

  // Step 2: Reconstruction Passage
  setTimeout(() => {
    processingState.textContent = 'DETERMINISTIC RECONSTRUCTION ACTIVE...';
    logicSteps.forEach((step, i) => {
      setTimeout(() => {
        step.style.background = 'var(--ccx-status-live)';
        const span = step.querySelector('span');
        if (span) {
          span.style.color = 'var(--ccx-frame-regulatory)';
          span.style.fontWeight = '600';
        }
      }, i * 300);
    });
  }, 1200);

  // Counter Animation
  let currentCounter = 0;
  const counterInterval = setInterval(() => {
    currentCounter += 0.02;
    if (currentCounter >= 0.50) {
      counter.textContent = '0.50s';
      clearInterval(counterInterval);
    } else {
      counter.textContent = currentCounter.toFixed(2) + 's';
    }
  }, 40);

  // Step 3: Artifact Generation
  setTimeout(() => {
    if (initialMsg) initialMsg.style.display = 'none';
    if (outputContainer) {
      outputContainer.classList.remove('hidden');
      setTimeout(() => {
        outputContainer.style.opacity = '1';
      }, 50);
    }
    if (outputRationale) {
      outputRationale.classList.remove('hidden');
      setTimeout(() => {
        outputRationale.style.opacity = '1';
      }, 500);
    }
    completeDemo();
  }, 2600);

  function completeDemo() {
    processingState.textContent = 'AUDIT RECORD SECURE // RECOUPMENT RISK VALIDATED';
    startLatencyCountdown();

    setTimeout(() => {
      trigger.disabled = false;
      trigger.textContent = 'Reset Audit Trace';
    }, 2000);
  }
}
