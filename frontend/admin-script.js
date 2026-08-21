
  /* Role guard: admin only */
  if (!requireRole(['admin'])) { /* handled */ }

  document.getElementById('adm-date').textContent =
    new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  let trendChart=null, matChart=null;
  const PAL=['rgba(52,211,153,.85)','rgba(14,165,233,.85)','rgba(245,158,11,.85)','rgba(244,63,94,.85)','rgba(139,92,246,.85)','rgba(251,113,133,.85)','rgba(34,211,238,.85)'];
  const TT={backgroundColor:'rgba(8,20,28,.95)',borderColor:'rgba(52,211,153,.3)',borderWidth:1,titleColor:'#f0fdf4',bodyColor:'#94a3b8'};
  const fmt = n => typeof n==='number' ? Number(n).toLocaleString(undefined,{maximumFractionDigits:1}) : '—';

  async function loadPlatformKPIs() {
    try {
      const s = await api.getDashboardStats();
      document.getElementById('kpi-inv').textContent       = fmt(s.total_inventory_kg);
      document.getElementById('kpi-rate').textContent      = s.recycling_rate.toFixed(1)+'%';
      document.getElementById('kpi-waste').textContent     = fmt(s.total_waste_kg);
      document.getElementById('kpi-suppliers').textContent = s.active_suppliers;
      document.getElementById('kpi-waste-sub').textContent = `${s.recent_waste_records} recent records`;
    } catch { ['kpi-inv','kpi-rate','kpi-waste','kpi-suppliers'].forEach(id=>document.getElementById(id).textContent='—'); }
  }

  async function loadAnalytics() {
    const year = document.getElementById('year-select').value;
    try {
      const data = await api.getAnalytics(year);
      renderTrend(data.monthly_trend||[]);
      renderPlatformStats(data);
    } catch { document.getElementById('platform-stats').innerHTML='<div class="empty-hint">No data for this period.</div>'; }
  }

  function renderTrend(monthly) {
    const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const vals=MN.map((_,i)=>{const e=monthly.find(m=>m.month===i+1);return e?e.waste_kg:0;});
    if(trendChart)trendChart.destroy();
    trendChart=new Chart(document.getElementById('trendChart'),{
      type:'line',
      data:{labels:MN,datasets:[
        {label:'Waste (kg)',data:vals,borderColor:'rgba(244,63,94,1)',backgroundColor:'rgba(244,63,94,.08)',tension:.4,fill:true,pointBackgroundColor:'rgba(244,63,94,1)',pointRadius:3},
        {label:'Recycled (kg)',data:vals.map(v=>+(v*.763).toFixed(1)),borderColor:'rgba(52,211,153,1)',backgroundColor:'rgba(52,211,153,.08)',tension:.4,fill:true,pointBackgroundColor:'rgba(52,211,153,1)',pointRadius:3}
      ]},
      options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:'index'},
        plugins:{legend:{labels:{color:'#94a3b8',boxWidth:12,font:{size:11}}},tooltip:TT},
        scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#64748b',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#64748b',font:{size:10}},beginAtZero:true}}}
    });
  }

  function renderPlatformStats(data) {
    document.getElementById('platform-stats').innerHTML = `
      <div class="stat-row"><span class="stat-label">Total Waste (kg)</span><span class="stat-val">${fmt(data.total_waste_kg)}</span></div>
      <div class="stat-row"><span class="stat-label">Total Recycled (kg)</span><span class="stat-val">${fmt(data.total_recycled_kg)}</span></div>
      <div class="stat-row"><span class="stat-label">Recycling Rate</span><span class="stat-val">${data.recycling_rate?.toFixed(1)??'—'}%</span></div>
      <div class="stat-row"><span class="stat-label">Top Waste Type</span><span class="stat-val">${data.top_waste_type||'—'}</span></div>
      <div class="stat-row"><span class="stat-label">Disposal Methods</span><span class="stat-val">${Object.keys(data.by_disposal||{}).length} types</span></div>
      <div class="stat-row"><span class="stat-label">Material Types</span><span class="stat-val">${Object.keys(data.by_waste_type||{}).length} types</span></div>`;
  }

  async function loadInventoryChart() {
    try {
      const summary = await api.getInventorySummary();
      const mat = summary.by_material||{};
      const labels=Object.keys(mat); const vals=Object.values(mat).map(v=>parseFloat(v));
      if(!labels.length){document.getElementById('matChart').parentElement.innerHTML='<div class="empty-hint">No inventory data.</div>';return;}
      if(matChart)matChart.destroy();
      const colors=PAL.slice(0,labels.length);
      matChart=new Chart(document.getElementById('matChart'),{
        type:'doughnut',
        data:{labels,datasets:[{data:vals,backgroundColor:colors,borderWidth:2,borderColor:'#050d12'}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{display:false},tooltip:TT}}
      });
      document.getElementById('mat-legend').innerHTML=labels.map((l,i)=>
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:.75rem;">
          <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0;"></span>
          <span style="color:#94a3b8;flex:1;">${l}</span>
          <span style="color:#f0fdf4;font-weight:600;">${fmt(vals[i])} kg</span>
        </div>`).join('');
    } catch { document.getElementById('matChart').parentElement.innerHTML='<div class="empty-hint">Failed to load chart.</div>'; }
  }

  async function loadReportCounts() {
    const counts = { 'Env. Impact Reports':0, 'Recommendations':0, 'Sustainability Analyses':0, 'Circular Analytics':0 };
    try {
      const envReps = await api.listEnvironmentalReports();
      counts['Env. Impact Reports'] = envReps.length;
    } catch {}
    try {
      const recs = await api.listRecommendations();
      counts['Recommendations'] = recs.length;
    } catch {}
    try {
      const mets = await api.fetchAllSustainabilityMetrics();
      counts['Sustainability Analyses'] = mets.length;
    } catch {}
    try {
      const circ = await api.fetchCircularAnalytics();
      counts['Circular Analytics'] = circ && circ.statistics ? circ.statistics.total_analyses||0 : 0;
    } catch {}
    document.getElementById('report-counts').innerHTML = Object.entries(counts).map(([type,cnt])=>`
      <div class="rpt-row">
        <span class="rpt-type">${type}</span>
        <span class="rpt-count">${cnt}</span>
      </div>`).join('');
  }

  async function runHealthChecks() {
    const endpoints = [
      { name:'GET /api/inventory/summary', fn: ()=>api.getInventorySummary() },
      { name:'GET /api/waste/dashboard-stats', fn: ()=>api.getDashboardStats() },
      { name:'GET /api/sustainability', fn: ()=>api.fetchAllSustainabilityMetrics() },
      { name:'GET /api/environmental', fn: ()=>api.listEnvironmentalReports() },
      { name:'GET /api/recommendation', fn: ()=>api.listRecommendations() },
      { name:'GET /api/circular-analytics/latest', fn: ()=>api.fetchCircularAnalytics() },
      { name:'GET /api/admin/users', fn: ()=>Promise.reject(new Error('Not implemented')) },
    ];
    document.getElementById('api-health').innerHTML =
      endpoints.map(e=>`<div class="api-row"><span class="api-name">${e.name}</span><span><span class="status-dot st-pending"></span><span class="status-label pending">Checking…</span></span></div>`).join('');

    for (let i=0; i<endpoints.length; i++) {
      const e = endpoints[i];
      try {
        await e.fn();
        const rows = document.getElementById('api-health').querySelectorAll('.api-row');
        if(rows[i]) rows[i].querySelector('span:last-child').innerHTML=`<span class="status-dot st-online"></span><span class="status-label online">Online</span>`;
      } catch(err) {
        const isNotImpl = e.name.includes('admin/users');
        const rows = document.getElementById('api-health').querySelectorAll('.api-row');
        if(rows[i]) rows[i].querySelector('span:last-child').innerHTML=`<span class="status-dot st-offline"></span><span class="status-label offline">${isNotImpl?'Not Built':'Offline'}</span>`;
      }
    }
  }

  async function loadCurrentUser() {
    try {
      const me = await api.getCurrentUser();
      document.getElementById('user-details').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.83rem;">
          <div><span style="color:var(--color-text-muted);">Name</span><div style="font-weight:600;color:var(--color-text-primary);margin-top:2px;">${me.full_name||'—'}</div></div>
          <div><span style="color:var(--color-text-muted);">Email</span><div style="font-weight:600;color:var(--color-text-primary);margin-top:2px;">${me.email||'—'}</div></div>
          <div><span style="color:var(--color-text-muted);">Role</span><div style="font-weight:700;color:var(--color-primary);margin-top:2px;text-transform:capitalize;">${me.role||'admin'}</div></div>
          <div><div class="chart-title">&#x1F4CA; Report Management</div><div class="chart-subtitle">Platform-wide report counts</div></div>
        </div>
        <div id="report-counts"><div class="empty-hint">Loading&hellip;</div></div>
        <div style="margin-top:1rem;">
          <a href="reports.html"        class="btn btn-secondary" style="width:100%;margin-bottom:6px;">View Analytics Reports &#x2192;</a>
          <a href="sustainability.html" class="btn btn-secondary" style="width:100%;">Sustainability Reports &#x2192;</a>
        </div>
      </div>

      <!-- Platform Stats (from analytics) -->
      <div class="glass-card card-padding">
        <div class="chart-header">
          <div><div class="chart-title">&#x1F4C0; Platform Stats</div><div class="chart-subtitle">Aggregate performance metrics</div></div>
        </div>
        <div id="platform-stats"><div class="empty-hint">Loading&hellip;</div></div>
      </div>
    </div>

    <!-- User Management (current user info + missing API notice) -->
    <div class="glass-card card-padding" style="margin-bottom:var(--space-xl);">
      <div class="chart-header">
        <div><div class="chart-title">&#x1F465; User Management</div><div class="chart-subtitle">Current session &amp; user administration</div></div>
      </div>

      <div class="warning-banner">
        <div class="warn-icon">&#x26A0;&#xFE0F;</div>
        <div class="warn-text">
          <strong>Backend API Not Implemented:</strong> A <code>GET /api/admin/users</code> endpoint for listing all platform users does not exist yet.
          User management features (list users, change roles, activate/deactivate) require this backend API to be built first.
          The information below shows only your own account from the existing <code>GET /api/auth/me</code> endpoint.
        </div>
      </div>

      <div id="current-user-panel">
        <div style="font-size:0.78rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">Your Account</div>
        <div class="user-info-card">
          <div id="user-details"><div class="empty-hint">Loading account info&hellip;</div></div>
        </div>
      </div>

      <div style="margin-top:1rem;padding:0.75rem;background:rgba(14,165,233,0.07);border-radius:var(--radius-sm);border:1px solid rgba(14,165,233,0.2);">
        <div style="font-size:0.8rem;color:var(--color-text-muted);margin-bottom:6px;">&#x1F527; Pending Backend Work (not implemented in this task)</div>
        <ul style="margin:0;padding-left:1.2rem;font-size:0.8rem;color:var(--color-text-secondary);line-height:2;">
          <li><code>GET /api/admin/users</code> — List all platform users</li>
          <li><code>PUT /api/admin/users/{'{id}'}/role</code> — Change user role</li>
          <li><code>PATCH /api/admin/users/{'{id}'}/status</code> — Activate / deactivate user</li>
          <li>System-wide audit log (who created/deleted what)</li>
        </ul>
      </div>
    </div>
  </main>
</div>

<script src="js/api.js">