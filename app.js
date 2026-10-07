const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];

const state = {
  pbt: 'all',
  metric: 'happiness',
  dimension: 'all',
  rankingChart: null,
  statusChart: null,
  dimensionChart: null
};

const STATUS_COLORS = { good:'#7db56b', mid:'#e8a437', low:'#db3b49' };

function formatNumber(value, digits = 2){
  const num = Number(value);
  return num.toLocaleString('ms-MY', {maximumFractionDigits: digits, minimumFractionDigits: num % 1 ? 0 : 0});
}

function getStatus(metric, value){
  if(metric === 'happiness') return value >= 80 ? {label:'Tinggi', key:'good'} : value >= 50 ? {label:'Sederhana', key:'mid'} : {label:'Perlu perhatian', key:'low'};
  if(metric === 'urbanisation') return value >= 90 ? {label:'Tinggi', key:'good'} : value >= 75 ? {label:'Sederhana', key:'mid'} : {label:'Perlu perhatian', key:'low'};
  if(metric === 'broadband') return value >= 99.95 ? {label:'Tinggi', key:'good'} : value >= 99.5 ? {label:'Sederhana', key:'mid'} : {label:'Perlu perhatian', key:'low'};
  if(metric === 'revenue') return value >= 100 ? {label:'Tinggi', key:'good'} : value >= 90 ? {label:'Sederhana', key:'mid'} : {label:'Perlu perhatian', key:'low'};
  if(metric === 'community') return value >= 20 ? {label:'Tinggi', key:'good'} : value >= 5 ? {label:'Sederhana', key:'mid'} : {label:'Perlu perhatian', key:'low'};
  return {label:'Data', key:'mid'};
}

function metricRows(metricKey = state.metric){
  const metric = METRICS[metricKey];
  return PBT.map((name, i)=>({
    name,
    short: name.replace('MB ','').replace('MP ','').replace('MD ','').replace('MBD ',''),
    value: metric.values[i],
    status: getStatus(metricKey, metric.values[i])
  })).sort((a,b)=>b.value - a.value);
}

function valueForPbt(name, metricKey = state.metric){
  const idx = PBT.indexOf(name);
  return idx >= 0 ? METRICS[metricKey].values[idx] : null;
}

function populateFilters(){
  $('#pbtSelect').innerHTML = `<option value="all">Semua PBT</option>` + PBT.map(x=>`<option value="${x}">${x}</option>`).join('');
  $('#metricSelect').innerHTML = Object.entries(METRICS).map(([key,val])=>`<option value="${key}">${val.label}</option>`).join('');
  $('#dimensionSelect').innerHTML = `<option value="all">Semua Dimensi</option>` + DIMENSIONS.map(d=>`<option value="${d.id}">Dimensi ${d.id} — ${d.name}</option>`).join('');
  $('#indicatorDimensionFilter').innerHTML = `<option value="all">Semua Dimensi</option>` + DIMENSIONS.map(d=>`<option value="${d.id}">Dimensi ${d.id} — ${d.name}</option>`).join('');
}

function bindEvents(){
  $('#applyBtn').addEventListener('click', applyFilters);
  $('#resetBtn').addEventListener('click', resetAll);
  $('#metricSelect').addEventListener('change', applyFilters);
  $('#pbtSelect').addEventListener('change', applyFilters);
  $('#dimensionSelect').addEventListener('change', ()=>{
    state.dimension = $('#dimensionSelect').value;
    $('#indicatorDimensionFilter').value = state.dimension;
    renderDimensions();
    renderIndicators();
  });
  $('#indicatorSearch').addEventListener('input', renderIndicators);
  $('#indicatorDimensionFilter').addEventListener('change', ()=>{
    state.dimension = $('#indicatorDimensionFilter').value;
    $('#dimensionSelect').value = state.dimension;
    renderDimensions();
    renderIndicators();
  });
  $$('.menu-item').forEach(btn=>btn.addEventListener('click', ()=>{
    $$('.menu-item').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(btn.dataset.target)?.scrollIntoView({behavior:'smooth'});
  }));
}

function applyFilters(){
  state.pbt = $('#pbtSelect').value;
  state.metric = $('#metricSelect').value;
  state.dimension = $('#dimensionSelect').value;
  $('#metricChip').textContent = METRICS[state.metric].short;
  renderAll();
}

function resetAll(){
  state.pbt = 'all';
  state.metric = 'happiness';
  state.dimension = 'all';
  $('#pbtSelect').value = 'all';
  $('#metricSelect').value = 'happiness';
  $('#dimensionSelect').value = 'all';
  $('#indicatorDimensionFilter').value = 'all';
  $('#indicatorSearch').value = '';
  $('#metricChip').textContent = METRICS[state.metric].short;
  renderAll();
}

function renderMap(){
  const svg = $('#selangorMap');
  const rows = metricRows();
  const lookup = Object.fromEntries(rows.map(r=>[r.name, r]));
  svg.innerHTML = `
    <defs>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#d5c0ad" flood-opacity="0.35"/>
      </filter>
    </defs>
    <g class="map-base-shape" filter="url(#softShadow)">
      <path d="M72 44 L248 62 L446 82 L532 160 L578 302 L570 438 L458 548 L316 552 L160 520 L104 460 L86 310 L96 116 Z" fill="#fff5ea" stroke="#f1dfcf" stroke-width="5" opacity="0.75"></path>
    </g>
  `;

  MAP_REGIONS.forEach(region=>{
    const row = lookup[region.name];
    const fill = STATUS_COLORS[row.status.key];
    const selected = state.pbt !== 'all' && state.pbt === region.name;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('data-name', region.name);
    group.classList.add('map-group');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', region.points);
    poly.setAttribute('fill', fill);
    poly.setAttribute('fill-opacity', selected ? '0.92' : '0.78');
    poly.setAttribute('class', `map-region${selected ? ' selected' : ''}`);
    poly.setAttribute('data-name', region.name);

    const labelX = averagePoints(region.points).x;
    const labelY = averagePoints(region.points).y;
    const lines = region.label;
    lines.forEach((line, idx)=>{
      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      shadow.setAttribute('x', labelX);
      shadow.setAttribute('y', labelY + idx*16 - ((lines.length-1)*7));
      shadow.setAttribute('class', `region-label shadow${line.length>12 ? ' small' : ''}`);
      shadow.textContent = line;
      group.appendChild(shadow);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX);
      text.setAttribute('y', labelY + idx*16 - ((lines.length-1)*7));
      text.setAttribute('class', `region-label${line.length>12 ? ' small' : ''}`);
      text.textContent = line;
      group.appendChild(text);
    });

    const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valueText.setAttribute('x', labelX);
    valueText.setAttribute('y', labelY + (lines.length>1 ? 24 : 18));
    valueText.setAttribute('class', 'region-value');
    valueText.textContent = `${formatNumber(row.value)}${METRICS[state.metric].unit}`;

    group.appendChild(poly);
    group.appendChild(valueText);
    svg.appendChild(group);

    group.addEventListener('click', ()=>{
      state.pbt = region.name;
      $('#pbtSelect').value = region.name;
      renderAll();
    });
  });
}

function averagePoints(pointsString){
  const pts = pointsString.split(' ').map(pair=>pair.split(',').map(Number));
  const x = pts.reduce((sum,p)=>sum+p[0],0)/pts.length;
  const y = pts.reduce((sum,p)=>sum+p[1],0)/pts.length;
  return {x, y};
}

function renderRanking(){
  const allRows = metricRows();
  const rows = state.pbt === 'all' ? allRows : allRows.filter(r=>r.name===state.pbt);
  const clipped = rows.map(r=> state.metric==='revenue' ? Math.min(r.value, 160) : r.value);
  if(state.rankingChart) state.rankingChart.destroy();
  state.rankingChart = new Chart($('#rankingChart'), {
    type:'bar',
    data:{
      labels: rows.map(r=>r.short),
      datasets:[{
        data: clipped,
        borderRadius: 8,
        backgroundColor: rows.map(r=>STATUS_COLORS[r.status.key])
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      indexAxis:'y',
      scales:{
        x:{beginAtZero:true, grid:{color:'rgba(31,47,88,.08)'}, ticks:{color:'#66738b'}},
        y:{grid:{display:false}, ticks:{color:'#1f2f58', font:{size:11}}}
      },
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:(ctx)=>`${METRICS[state.metric].label}: ${formatNumber(rows[ctx.dataIndex].value)}${METRICS[state.metric].unit}`}}
      }
    }
  });
}

function renderStatus(){
  const rows = state.pbt === 'all' ? metricRows() : metricRows().filter(r=>r.name===state.pbt);
  const counts = rows.reduce((acc, row)=>{acc[row.status.key] += 1; return acc;}, {good:0, mid:0, low:0});
  $('#countGood').textContent = counts.good;
  $('#countMid').textContent = counts.mid;
  $('#countLow').textContent = counts.low;
  if(state.statusChart) state.statusChart.destroy();
  state.statusChart = new Chart($('#statusChart'), {
    type:'doughnut',
    data:{labels:['Tinggi','Sederhana','Perlu perhatian'], datasets:[{data:[counts.good, counts.mid, counts.low], backgroundColor:[STATUS_COLORS.good, STATUS_COLORS.mid, STATUS_COLORS.low], borderWidth:4, borderColor:'#fff'}]},
    options:{responsive:true, maintainAspectRatio:false, cutout:'64%', plugins:{legend:{position:'bottom', labels:{boxWidth:12, color:'#45546f'}}, tooltip:{callbacks:{label:(ctx)=>`${ctx.label}: ${ctx.raw} PBT`}}}}
  });
}

function renderDimensionsChart(){
  if(!state.dimensionChart){
    state.dimensionChart = new Chart($('#dimensionChart'), {
      type:'doughnut',
      data:{labels:DIMENSIONS.map(d=>d.name), datasets:[{data:DIMENSIONS.map(d=>d.count), backgroundColor:DIMENSIONS.map(d=>d.color), borderColor:'#fff', borderWidth:4}]},
      options:{responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{legend:{position:'bottom', labels:{boxWidth:12, color:'#43516d'}}, tooltip:{callbacks:{label:(ctx)=>`${ctx.label}: ${ctx.raw} indikator`}}}}
    });
  }
}

function renderDimensions(){
  $('#dimensionList').innerHTML = DIMENSIONS.map(d=>`
    <div class="dimension-card ${state.dimension !== 'all' && String(d.id)===state.dimension ? 'active' : ''}" data-dim="${d.id}" style="--accent:${d.color}">
      <small>DIMENSI ${d.id}</small>
      <h3>${d.name}</h3>
      <span>${d.count} indikator</span>
    </div>
  `).join('');
  $$('#dimensionList .dimension-card').forEach(card=>card.addEventListener('click', ()=>{
    state.dimension = card.dataset.dim;
    $('#dimensionSelect').value = state.dimension;
    $('#indicatorDimensionFilter').value = state.dimension;
    renderDimensions();
    renderIndicators();
    document.querySelector('#indicatorBoard').scrollIntoView({behavior:'smooth'});
  }));
}

function renderProfile(){
  const rows = metricRows();
  const current = state.pbt === 'all' ? rows[0] : rows.find(r=>r.name===state.pbt);
  const title = state.pbt === 'all' ? 'Sorotan PBT Tertinggi Semasa' : current.name;
  const desc = state.pbt === 'all'
    ? `Paparan keseluruhan sedang aktif. PBT teratas bagi indikator ${METRICS[state.metric].short.toLowerCase()} ialah ${current.name}.`
    : `PBT ini sedang dipilih pada peta dan carta. Nilai dipaparkan berdasarkan indikator ${METRICS[state.metric].short.toLowerCase()}.`;
  const stat = current.status;
  const page = METRICS[state.metric].page;
  $('#profileBox').innerHTML = `
    <div class="profile-hero">
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>
    <div class="profile-metric">
      <div class="metric-card">
        <small>${METRICS[state.metric].label}</small>
        <strong>${formatNumber(current.value)}${METRICS[state.metric].unit}</strong>
        <span>Rujukan halaman ${page}</span>
      </div>
      <div class="metric-card">
        <small>Status Prestasi</small>
        <strong style="color:${STATUS_COLORS[stat.key]}">${stat.label}</strong>
        <span>Klasifikasi paparan dashboard</span>
      </div>
    </div>
  `;
}

function renderIndicators(){
  const query = $('#indicatorSearch').value.trim().toLowerCase();
  const dim = $('#indicatorDimensionFilter').value;
  const filtered = INDICATORS.filter(item=>(dim==='all' || String(item.dimension)===dim) && (!query || `${item.code} ${item.title}`.toLowerCase().includes(query)));
  $('#indicatorGrid').innerHTML = filtered.length ? filtered.map(item=>{
    const d = DIMENSIONS.find(x=>x.id===item.dimension);
    return `
      <div class="indicator-card">
        <div class="top"><span class="indicator-code">${item.code}</span><span class="indicator-page">Hal. ${item.page}</span></div>
        <h4>${item.title}</h4>
        <p>Dimensi ${item.dimension}: ${d.name}</p>
      </div>
    `;
  }).join('') : `
    <div class="indicator-card"><h4>Tiada padanan indikator</h4><p>Sila ubah kata carian atau dimensi yang dipilih.</p></div>
  `;
}

function renderAll(){
  renderMap();
  renderRanking();
  renderStatus();
  renderDimensions();
  renderProfile();
  renderIndicators();
}

function init(){
  populateFilters();
  bindEvents();
  renderDimensionsChart();
  $('#metricChip').textContent = METRICS[state.metric].short;
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
