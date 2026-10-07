const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];

const state = {
  pbt: 'all',
  metric: 'happiness',
  dimension: 'all',
  rankingChart: null,
  statusChart: null,
  dimensionChart: null,
  map: null,
  pbtLayer: null,
  pbtLayerByName: new Map()
};

const STATUS_COLORS = { good:'#7db56b', mid:'#e8a437', low:'#db3b49' };
const DIMENSION_START_PAGES = {1:2,2:4,3:11,4:31,5:37,6:44};
const PDF_PATH = 'source/slides_murninets_dashboard_SUO.pdf';
const PBT_GEOJSON_PATH = 'pbt-selangor.geojson';

function formatNumber(value, digits = 2){
  const num = Number(value);
  return num.toLocaleString('ms-MY', {maximumFractionDigits: digits, minimumFractionDigits: 0});
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
  })).sort((a,b)=>b.value-a.value);
}

function valueForPbt(name, metricKey = state.metric){
  const idx = PBT.indexOf(name);
  return idx >= 0 ? METRICS[metricKey].values[idx] : null;
}

function shortPbt(name){
  return name.replace('MBD ','').replace('MB ','').replace('MP ','').replace('MD ','');
}

function logoForPbt(name){
  return (typeof PBT_LOGOS !== 'undefined' && PBT_LOGOS[name]) ? PBT_LOGOS[name] : '';
}

function populateFilters(){
  $('#pbtSelect').innerHTML = '<option value="all">Semua PBT</option>' + PBT.map(x=>'<option value="'+x+'">'+x+'</option>').join('');
  $('#metricSelect').innerHTML = Object.entries(METRICS).map(([key,val])=>'<option value="'+key+'">'+val.label+'</option>').join('');
  $('#dimensionSelect').innerHTML = '<option value="all">Semua Dimensi</option>' + DIMENSIONS.map(d=>'<option value="'+d.id+'">Dimensi '+d.id+' — '+d.name+'</option>').join('');
  $('#indicatorDimensionFilter').innerHTML = '<option value="all">Semua Dimensi</option>' + DIMENSIONS.map(d=>'<option value="'+d.id+'">Dimensi '+d.id+' — '+d.name+'</option>').join('');
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
  state.pbt='all';
  state.metric='happiness';
  state.dimension='all';
  $('#pbtSelect').value='all';
  $('#metricSelect').value='happiness';
  $('#dimensionSelect').value='all';
  $('#indicatorDimensionFilter').value='all';
  $('#indicatorSearch').value='';
  $('#metricChip').textContent=METRICS[state.metric].short;
  renderAll();
  if(state.map && state.pbtLayer) state.map.fitBounds(state.pbtLayer.getBounds(),{padding:[20,20]});
}

function normalizePbtName(raw=''){
  const s=String(raw).toLowerCase().trim();
  if(s.includes('shah alam')) return 'MB Shah Alam';
  if(s.includes('petaling jaya')) return 'MB Petaling Jaya';
  if(s.includes('subang jaya')) return 'MB Subang Jaya';
  if(s.includes('diraja klang') || s.includes('bandaraya diraja klang') || s.endsWith('klang')) return 'MBD Klang';
  if(s.includes('ampang jaya')) return 'MP Ampang Jaya';
  if(s.includes('kajang')) return 'MP Kajang';
  if(s.includes('selayang')) return 'MP Selayang';
  if(s.includes('sepang')) return 'MP Sepang';
  if(s.includes('kuala langat')) return 'MP Kuala Langat';
  if(s.includes('kuala selangor')) return 'MP Kuala Selangor';
  if(s.includes('hulu selangor')) return 'MP Hulu Selangor';
  if(s.includes('sabak bernam')) return 'MD Sabak Bernam';
  return raw;
}

function featureRawName(feature){
  return feature?.properties?.NAMA_PBT ||
         feature?.properties?.web_name ||
         feature?.properties?.N_PBT1 ||
         feature?.properties?.name ||
         'PBT';
}

function mapStyle(feature){
  const pbt=normalizePbtName(featureRawName(feature));
  const value=valueForPbt(pbt);
  const status=value==null ? {key:'mid'} : getStatus(state.metric,value);
  const selected=state.pbt!=='all' && state.pbt===pbt;
  return {
    color:selected ? '#172b51' : '#ffffff',
    weight:selected ? 4.5 : 2.2,
    opacity:1,
    fillColor:value==null ? '#aeb6c2' : STATUS_COLORS[status.key],
    fillOpacity:selected ? .80 : .60
  };
}

async function loadPbtGeoJSON(){
  const response=await fetch(PBT_GEOJSON_PATH,{cache:'no-store'});
  if(!response.ok) throw new Error('Fail sempadan PBT tidak dapat dimuatkan');
  const data=await response.json();
  if(!data.features?.length) throw new Error('Fail sempadan PBT tidak mempunyai feature');
  return data;
}

function pbtLabelHtml(pbt){
  const logo=logoForPbt(pbt);
  return '<div class="pbt-label-inner">'+
    (logo ? '<img src="'+logo+'" alt="">' : '')+
    '<span>'+shortPbt(pbt)+'</span>'+
  '</div>';
}

function pbtPopupHtml(pbt){
  const logo=logoForPbt(pbt);
  const value=valueForPbt(pbt);
  const status=value==null ? null : getStatus(state.metric,value);
  return '<div class="pbt-popup">'+
    '<div class="pbt-popup-head">'+
      (logo ? '<img class="pbt-popup-logo" src="'+logo+'" alt="Logo '+pbt+'">' : '')+
      '<div><strong>'+pbt+'</strong><small>Negeri Selangor</small></div>'+
    '</div>'+
    '<span class="value">'+(value==null ? 'Tiada data' : formatNumber(value)+METRICS[state.metric].unit)+'</span>'+
    '<div class="pbt-popup-metric">'+METRICS[state.metric].label+'</div>'+
    (status ? '<div>Status: <b>'+status.label+'</b></div>' : '')+
    '<small class="pbt-popup-source">Sempadan: fail GeoJSON yang dilampirkan</small>'+
  '</div>';
}

async function initMap(){
  if(!window.L) return;
  state.map=L.map('selangorMap',{
    zoomControl:true,
    scrollWheelZoom:true,
    minZoom:8,
    maxZoom:14
  }).setView([3.25,101.45],9);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:18,
    attribution:'Imagery &copy; Esri'
  }).addTo(state.map);

  const geojson=await loadPbtGeoJSON();

  state.pbtLayer=L.geoJSON(geojson,{
    style:mapStyle,
    onEachFeature:(feature,layer)=>{
      const pbt=normalizePbtName(featureRawName(feature));
      state.pbtLayerByName.set(pbt,layer);

      layer.bindTooltip(pbtLabelHtml(pbt),{
        permanent:true,
        direction:'center',
        className:'pbt-label',
        opacity:1,
        interactive:true
      });

      layer.bindPopup(()=>pbtPopupHtml(pbt),{
        maxWidth:280,
        className:'premium-pbt-popup'
      });

      layer.on({
        mouseover:(e)=>{
          e.target.setStyle({weight:4.5,color:'#172b51',fillOpacity:.84});
          if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) e.target.bringToFront();
        },
        mouseout:(e)=>e.target.setStyle(mapStyle(feature)),
        click:()=>{
          state.pbt=pbt;
          $('#pbtSelect').value=pbt;
          renderRanking();
          renderStatus();
          renderProfile();
          updateMapStyles();
        }
      });
    }
  }).addTo(state.map);

  state.map.fitBounds(state.pbtLayer.getBounds(),{padding:[20,20]});

  const note=document.createElement('div');
  note.className='map-source-note';
  note.innerHTML='<b>Sempadan PBT:</b> fail GeoJSON yang anda lampirkan • 12 PBT';
  document.querySelector('.map-stage')?.appendChild(note);
}

function updateMapStyles(){
  if(!state.pbtLayer) return;
  state.pbtLayer.eachLayer(layer=>{
    layer.setStyle(mapStyle(layer.feature));
    const pbt=normalizePbtName(featureRawName(layer.feature));
    layer.setTooltipContent(pbtLabelHtml(pbt));
    layer.setPopupContent(pbtPopupHtml(pbt));
  });
  if(state.pbt!=='all'){
    const layer=state.pbtLayerByName.get(state.pbt);
    if(layer){
      state.map.fitBounds(layer.getBounds(),{padding:[35,35],maxZoom:11});
      layer.openPopup();
    }
  }
}

function renderRanking(){
  const allRows=metricRows();
  const rows=state.pbt==='all' ? allRows : allRows.filter(r=>r.name===state.pbt);
  const clipped=rows.map(r=>state.metric==='revenue' ? Math.min(r.value,160) : r.value);
  if(state.rankingChart) state.rankingChart.destroy();
  state.rankingChart=new Chart($('#rankingChart'),{
    type:'bar',
    data:{labels:rows.map(r=>r.short),datasets:[{data:clipped,borderRadius:8,backgroundColor:rows.map(r=>STATUS_COLORS[r.status.key])}]},
    options:{
      responsive:true,maintainAspectRatio:false,indexAxis:'y',
      scales:{
        x:{beginAtZero:true,grid:{color:'rgba(31,47,88,.08)'},ticks:{color:'#66738b'}},
        y:{grid:{display:false},ticks:{color:'#1f2f58',font:{size:11}}}
      },
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:(ctx)=>METRICS[state.metric].label+': '+formatNumber(rows[ctx.dataIndex].value)+METRICS[state.metric].unit}}
      }
    }
  });
}

function renderStatus(){
  const rows=state.pbt==='all' ? metricRows() : metricRows().filter(r=>r.name===state.pbt);
  const counts=rows.reduce((acc,row)=>{acc[row.status.key]+=1;return acc;},{good:0,mid:0,low:0});
  $('#countGood').textContent=counts.good;
  $('#countMid').textContent=counts.mid;
  $('#countLow').textContent=counts.low;
  if(state.statusChart) state.statusChart.destroy();
  state.statusChart=new Chart($('#statusChart'),{
    type:'doughnut',
    data:{labels:['Tinggi','Sederhana','Perlu perhatian'],datasets:[{data:[counts.good,counts.mid,counts.low],backgroundColor:[STATUS_COLORS.good,STATUS_COLORS.mid,STATUS_COLORS.low],borderWidth:4,borderColor:'#fff'}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'64%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,color:'#45546f'}},tooltip:{callbacks:{label:(ctx)=>ctx.label+': '+ctx.raw+' PBT'}}}}
  });
}

function renderDimensionsChart(){
  if(state.dimensionChart) return;
  state.dimensionChart=new Chart($('#dimensionChart'),{
    type:'doughnut',
    data:{labels:DIMENSIONS.map(d=>d.name),datasets:[{data:DIMENSIONS.map(d=>d.count),backgroundColor:DIMENSIONS.map(d=>d.color),borderColor:'#fff',borderWidth:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,color:'#43516d'}},tooltip:{callbacks:{label:(ctx)=>ctx.label+': '+ctx.raw+' indikator'}}}}
  });
}

function renderDimensions(){
  $('#dimensionList').innerHTML=DIMENSIONS.map(d=>{
    const page=DIMENSION_START_PAGES[d.id];
    return '<a class="dimension-card '+(state.dimension!=='all' && String(d.id)===state.dimension?'active':'')+'" href="'+PDF_PATH+'#page='+page+'" target="_blank" rel="noopener" style="--accent:'+d.color+'">'+
      '<small>DIMENSI '+d.id+'</small><h3>'+d.name+'</h3><span>'+d.count+' indikator</span><span class="pdf-jump">Buka PDF • Hal. '+page+'</span></a>';
  }).join('');
}

function renderProfile(){
  const rows=metricRows();
  const current=state.pbt==='all' ? rows[0] : rows.find(r=>r.name===state.pbt);
  const title=state.pbt==='all' ? 'Sorotan PBT Tertinggi Semasa' : current.name;
  const desc=state.pbt==='all'
    ? 'Paparan keseluruhan sedang aktif. PBT teratas bagi indikator '+METRICS[state.metric].short.toLowerCase()+' ialah '+current.name+'.'
    : 'PBT ini sedang dipilih pada peta dan carta. Nilai dipaparkan berdasarkan indikator '+METRICS[state.metric].short.toLowerCase()+'.';
  const stat=current.status;
  const logo=logoForPbt(current.name);
  $('#profileBox').innerHTML=
    '<div class="profile-hero profile-with-logo">'+
      (logo?'<div class="profile-logo-box"><img src="'+logo+'" alt="Logo '+current.name+'"></div>':'')+
      '<div><h3>'+title+'</h3><p>'+desc+'</p></div>'+
    '</div>'+
    '<div class="profile-metric">'+
      '<div class="metric-card"><small>'+METRICS[state.metric].label+'</small><strong>'+formatNumber(current.value)+METRICS[state.metric].unit+'</strong><span>Rujukan halaman '+METRICS[state.metric].page+'</span></div>'+
      '<div class="metric-card"><small>Status Prestasi</small><strong style="color:'+STATUS_COLORS[stat.key]+'">'+stat.label+'</strong><span>Klasifikasi paparan dashboard</span></div>'+
    '</div>';
}

function renderIndicators(){
  const query=$('#indicatorSearch').value.trim().toLowerCase();
  const dim=$('#indicatorDimensionFilter').value;
  const filtered=INDICATORS.filter(item=>(dim==='all'||String(item.dimension)===dim)&&(!query||(item.code+' '+item.title).toLowerCase().includes(query)));
  $('#indicatorGrid').innerHTML=filtered.length ? filtered.map(item=>{
    const d=DIMENSIONS.find(x=>x.id===item.dimension);
    return '<a class="indicator-card" href="'+PDF_PATH+'#page='+item.page+'" target="_blank" rel="noopener">'+
      '<div class="top"><span class="indicator-code">'+item.code+'</span><span class="indicator-page">Hal. '+item.page+'</span></div>'+
      '<h4>'+item.title+'</h4><p>Dimensi '+item.dimension+': '+d.name+'</p></a>';
  }).join('') : '<div class="indicator-card"><h4>Tiada padanan indikator</h4><p>Sila ubah kata carian atau dimensi yang dipilih.</p></div>';
}

function renderAll(){
  renderRanking();
  renderStatus();
  renderDimensions();
  renderProfile();
  renderIndicators();
  updateMapStyles();
}

async function init(){
  populateFilters();
  bindEvents();
  renderDimensionsChart();
  $('#metricChip').textContent=METRICS[state.metric].short;
  renderAll();
  try{
    await initMap();
    updateMapStyles();
  }catch(err){
    console.error(err);
    const mapEl=$('#selangorMap');
    if(mapEl) mapEl.innerHTML='<div style="padding:30px;color:#7a4a32;background:#fff5eb;height:100%;display:grid;place-items:center;text-align:center"><div><b>Peta GeoJSON tidak dapat dimuatkan.</b><br><small>Sila refresh halaman.</small></div></div>';
  }
}

document.addEventListener('DOMContentLoaded',init);
