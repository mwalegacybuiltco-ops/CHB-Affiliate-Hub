
const STORAGE_KEY = 'chb_full_hub_leads_v1';

function missingLink(name) {
  alert(name + ' link has not been added yet.');
}

function safeText(value) {
  return (value || '').replace(/[&<>"]/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}

function getLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch(e) {
    return [];
  }
}

function saveLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function addLead() {
  const name = document.getElementById('leadName').value.trim();
  const source = document.getElementById('leadSource').value.trim();
  const followUp = document.getElementById('leadFollowUp').value;
  const status = document.getElementById('leadStatus').value;
  const notes = document.getElementById('leadNotes').value.trim();

  if (!name) {
    alert('Add a lead name first.');
    return;
  }

  const leads = getLeads();
  leads.unshift({
    id: Date.now(),
    name,
    source,
    followUp,
    status,
    notes,
    createdAt: new Date().toLocaleString()
  });
  saveLeads(leads);
  clearLeadForm();
  renderLeads();
}

function clearLeadForm() {
  document.getElementById('leadName').value = '';
  document.getElementById('leadSource').value = '';
  document.getElementById('leadFollowUp').value = '';
  document.getElementById('leadStatus').value = 'New';
  document.getElementById('leadNotes').value = '';
}

function deleteLead(id) {
  const leads = getLeads().filter(l => l.id !== id);
  saveLeads(leads);
  renderLeads();
}

function exportLeads() {
  const leads = getLeads();
  if (!leads.length) {
    alert('No leads to export yet.');
    return;
  }
  const headers = ['Name','Source','Follow Up','Status','Notes','Created'];
  const rows = leads.map(l => [
    l.name || '',
    l.source || '',
    l.followUp || '',
    l.status || '',
    (l.notes || '').replace(/\n/g, ' '),
    l.createdAt || ''
  ]);
  const csv = [headers].concat(rows).map(row =>
    row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')
  ).join('\n');

  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chb-leads-export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderLeads() {
  const leads = getLeads();
  const box = document.getElementById('leadList');
  const total = document.getElementById('leadCount');
  const followups = document.getElementById('followUpCount');

  if (total) total.textContent = leads.length;
  if (followups) followups.textContent = leads.filter(l => l.followUp).length;

  if (!box) return;

  if (!leads.length) {
    box.innerHTML = '<div class="empty">No leads added yet.</div>';
    return;
  }

  box.innerHTML = leads.map(l => `
    <div class="lead-item">
      <div class="lead-top">
        <div>
          <div class="lead-name">${safeText(l.name)}</div>
          <div class="lead-meta">Created: ${safeText(l.createdAt || '')}</div>
        </div>
        <div class="badge">${safeText(l.status || 'New')}</div>
      </div>
      <div class="lead-meta">
        <strong>Source:</strong> ${safeText(l.source || '—')}<br>
        <strong>Follow Up:</strong> ${safeText(l.followUp || '—')}<br>
        <strong>Notes:</strong> ${safeText(l.notes || '—')}
      </div>
      <div class="lead-actions">
        <button class="mini-btn btn-primary" onclick="deleteLead(${l.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

window.onload = function() {
  renderLeads();
};
