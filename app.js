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
const STATUS_LABELS = { good:'Mampan', mid:'Sederhana Mampan', low:'Kurang Mampan' };

function formatNumber(value, digits = 2){
  const num = Number(value);
  return num.toLocaleString('ms-MY', {maximumFractionDigits: digits, minimumFractionDigits: num % 1 ? 0 : 0});
}

function getStatus(metric, value){
  if(metric === 'happiness') return value >= 80 ? {label:STATUS_LABELS.good, key:'good'} : value >= 50 ? {label:STATUS_LABELS.mid, key:'mid'} : {label:STATUS_LABELS.low, key:'low'};
  if(metric === 'urbanisation') return value >= 90 ? {label:STATUS_LABELS.good, key:'good'} : value >= 75 ? {label:STATUS_LABELS.mid, key:'mid'} : {label:STATUS_LABELS.low, key:'low'};
  if(metric === 'broadband') return value >= 99.95 ? {label:STATUS_LABELS.good, key:'good'} : value >= 99.5 ? {label:STATUS_LABELS.mid, key:'mid'} : {label:STATUS_LABELS.low, key:'low'};
  if(metric === 'revenue') return value >= 100 ? {label:STATUS_LABELS.good, key:'good'} : value >= 90 ? {label:STATUS_LABELS.mid, key:'mid'} : {label:STATUS_LABELS.low, key:'low'};
  if(metric === 'community') return value >= 20 ? {label:STATUS_LABELS.good, key:'good'} : value >= 5 ? {label:STATUS_LABELS.mid, key:'mid'} : {label:STATUS_LABELS.low, key:'low'};
  return {label:'Data', key:'mid'};
}

function metricRows(metricKey = state.metric){
  const metric = METRICS[metricKey];
  return PBT.map((name, i)=>({
    name,
    short: name.replace('MB ','').replace('MP ','').replace('MD ','').replace('MBD ',''),
    value: metric.values[i],
    status: getStatus(metricKey, metric.values[i]),
    rank: i + 1
  })).sort((a,b)=>b.value - a.value).map((row, idx)=>({...row, rank: idx + 1}));
}

function valueForPbt(name, metricKey = state.metric){
  const idx = PBT.indexOf(name);
  return idx >= 0 ? METRICS[metricKey].values[idx] : null;
}

function getPbtLogo(name){
  try {
    return typeof PBT_LOGOS !== 'undefined' ? PBT_LOGOS[name] || '' : '';
  } catch(e){
    return '';
  }
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
        borderRadius: 10,
        borderSkipped:false,
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
    data:{labels:[STATUS_LABELS.good,STATUS_LABELS.mid,STATUS_LABELS.low], datasets:[{data:[counts.good, counts.mid, counts.low], backgroundColor:[STATUS_COLORS.good, STATUS_COLORS.mid, STATUS_COLORS.low], borderWidth:4, borderColor:'#fff'}]},
    options:{responsive:true, maintainAspectRatio:false, cutout:'64%', plugins:{legend:{position:'bottom', labels:{boxWidth:12, color:'#45546f'}}, tooltip:{callbacks:{label:(ctx)=>`${ctx.label}: ${ctx.raw} PBT`}}}}
  });
}

function renderDimensionCenter(){
  const wrap = $('.chart-3d-wrap');
  if(!wrap) return;
  let badge = wrap.querySelector('.dimension-center-badge');
  if(!badge){
    badge = document.createElement('div');
    badge.className = 'dimension-center-badge';
    wrap.appendChild(badge);
  }
  badge.innerHTML = `<strong>${INDICATORS.length}</strong><small>Jumlah<br>Indikator</small>`;
}

function renderDimensionsChart(){
  const ctx = $('#dimensionChart');
  const labels = DIMENSIONS.map(d=>d.name);
  const counts = DIMENSIONS.map(d=>d.count);
  const colors = DIMENSIONS.map(d=>d.color);
  const shadowColors = colors.map(c => c + '66');

  if(state.dimensionChart) state.dimensionChart.destroy();
  state.dimensionChart = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels,
      datasets:[
        {
          data: counts,
          backgroundColor: shadowColors,
          borderWidth:0,
          radius:'92%',
          cutout:'58%',
          circumference:360,
          rotation:-90,
          spacing:2
        },
        {
          data: counts,
          backgroundColor: colors,
          borderColor:'#fff',
          borderWidth:4,
          radius:'84%',
          cutout:'54%',
          spacing:3,
          hoverOffset:8
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      layout:{padding:{top:10,bottom:10}},
      plugins:{
        legend:{position:'bottom', labels:{boxWidth:12, color:'#43516d', padding:14}},
        tooltip:{callbacks:{label:(ctx)=>`${ctx.label}: ${ctx.raw} indikator`}}
      }
    }
  });
  renderDimensionCenter();
  renderDimensionSummary();
}

function renderDimensionSummary(){
  const top = [...DIMENSIONS].sort((a,b)=>b.count-a.count).slice(0,4);
  const holder = $('#dimensionSummary');
  if(!holder) return;
  holder.innerHTML = top.map(d=>`<div class="dimension-summary-card" style="--dim-color:${d.color}"><b>${d.name}</b><span>${d.count}</span><small>indikator berdaftar dalam dimensi ini</small></div>`).join('');
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
  const logo = getPbtLogo(current.name);
  const logoHtml = logo ? `<img src="${logo}" alt="${current.name}">` : `<span style="font-size:18px;font-weight:900;color:#dc5a2d">${current.short.slice(0,2).toUpperCase()}</span>`;
  $('#profileBox').innerHTML = `
    <div class="profile-hero">
      <div class="profile-hero-logo">${logoHtml}</div>
      <div class="profile-hero-text">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
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
  renderProfileInsights(current, rows);
}

function renderProfileInsights(current, rows){
  const medianRow = rows[Math.floor((rows.length - 1) / 2)];
  const best = rows[0];
  const diff = best && current ? (best.value - current.value) : 0;
  $('#profileInsights').innerHTML = `
    <div class="insight-chip">
      <b>Kedudukan Semasa</b>
      <span>#${current.rank}</span>
      <small>daripada ${rows.length} PBT</small>
    </div>
    <div class="insight-chip">
      <b>Penanda Aras Negeri</b>
      <span>${formatNumber(best.value)}${METRICS[state.metric].unit}</span>
      <small>${best.short}</small>
    </div>
    <div class="insight-chip">
      <b>Jurang ke Teratas</b>
      <span>${formatNumber(Math.max(diff,0))}${METRICS[state.metric].unit}</span>
      <small>Median semasa: ${formatNumber(medianRow.value)}${METRICS[state.metric].unit}</small>
    </div>
  `;

  const top3 = rows.slice(0,3);
  $('#profileTopList').innerHTML = top3.map(item=>`
    <div class="top-rank-item">
      <div class="top-rank-no">${item.rank}</div>
      <div>
        <div class="top-rank-name">${item.short}</div>
        <div class="top-rank-meta">${item.status.label}</div>
      </div>
      <div class="top-rank-value">${formatNumber(item.value)}${METRICS[state.metric].unit}</div>
    </div>
  `).join('');
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
  renderDimensionsChart();
}

function init(){
  populateFilters();
  bindEvents();
  $('#metricChip').textContent = METRICS[state.metric].short;
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
