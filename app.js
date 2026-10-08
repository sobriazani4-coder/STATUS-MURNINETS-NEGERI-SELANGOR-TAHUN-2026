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
  if(metric === 'happiness') return value >= 80 ? {label:'Mampan', key:'good'} : value >= 50 ? {label:'Sederhana Mampan', key:'mid'} : {label:'Kurang Mampan', key:'low'};
  if(metric === 'urbanisation') return value >= 90 ? {label:'Mampan', key:'good'} : value >= 75 ? {label:'Sederhana Mampan', key:'mid'} : {label:'Kurang Mampan', key:'low'};
  if(metric === 'broadband') return value >= 99.95 ? {label:'Mampan', key:'good'} : value >= 99.5 ? {label:'Sederhana Mampan', key:'mid'} : {label:'Kurang Mampan', key:'low'};
  if(metric === 'revenue') return value >= 100 ? {label:'Mampan', key:'good'} : value >= 90 ? {label:'Sederhana Mampan', key:'mid'} : {label:'Kurang Mampan', key:'low'};
  if(metric === 'community') return value >= 20 ? {label:'Mampan', key:'good'} : value >= 5 ? {label:'Sederhana Mampan', key:'mid'} : {label:'Kurang Mampan', key:'low'};
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


const PBT_SHORT_LABELS = {
  'MB Shah Alam':'MBSA',
  'MB Petaling Jaya':'MBPJ',
  'MB Subang Jaya':'MBSJ',
  'MBD Klang':'MBDK',
  'MP Ampang Jaya':'MPAJ',
  'MP Kajang':'MPKj',
  'MP Selayang':'MPS',
  'MP Sepang':'MPSepang',
  'MP Kuala Langat':'MPKL',
  'MP Kuala Selangor':'MPKS',
  'MP Hulu Selangor':'MPHS',
  'MD Sabak Bernam':'MDSB'
};

function renderPbtLogoSelector(){
  const holder=$('#pbtLogoStrip');
  if(!holder) return;

  const allCard = '<button class="pbt-logo-card '+(state.pbt==='all'?'active':'')+'" data-pbt="all" type="button" aria-label="Semua PBT">'+
    '<span class="pbt-logo-frame all-pbt-icon">◎</span>'+
    '<strong>SEMUA</strong>'+
  '</button>';

  const cards = PBT.map(name=>{
    const logo = logoForPbt(name);
    const short = PBT_SHORT_LABELS[name] || shortPbt(name);
    return '<button class="pbt-logo-card '+(state.pbt===name?'active':'')+'" data-pbt="'+name+'" type="button" aria-label="'+name+'">'+
      '<span class="pbt-logo-frame">'+(logo?'<img src="'+logo+'" alt="'+name+'">':'<span class="pbt-fallback">'+short.slice(0,2)+'</span>')+'</span>'+
      '<strong>'+short+'</strong>'+
    '</button>';
  }).join('');

  holder.innerHTML = allCard + cards;

  holder.querySelectorAll('.pbt-logo-card').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const selected=btn.dataset.pbt;
      state.pbt=selected;
      $('#pbtSelect').value=selected;
      renderAll();
      if(selected==='all' && state.map && state.pbtLayer){
        state.map.closePopup();
        state.map.fitBounds(state.pbtLayer.getBounds(),{padding:[20,20]});
      }
    });
  });
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

const PBT_LABEL_CONFIG = {
  'MD Sabak Bernam':   {offset:[0,-6],   cls:'label-rural label-north'},
  'MP Kuala Selangor': {offset:[-18,-10],cls:'label-rural label-west'},
  'MP Hulu Selangor':  {offset:[30,-14], cls:'label-rural label-east'},
  'MBD Klang':         {offset:[-64,28], cls:'label-urban label-left label-priority'},
  'MB Shah Alam':      {offset:[-48,-28],cls:'label-urban label-left label-priority'},
  'MB Petaling Jaya':  {offset:[58,-40], cls:'label-urban label-right label-priority'},
  'MB Subang Jaya':    {offset:[48,38],  cls:'label-urban label-right label-priority'},
  'MP Selayang':       {offset:[26,-48], cls:'label-urban label-right'},
  'MP Ampang Jaya':    {offset:[72,-10], cls:'label-urban label-right'},
  'MP Kajang':         {offset:[56,38],  cls:'label-urban label-right'},
  'MP Kuala Langat':   {offset:[-22,28], cls:'label-rural label-west'},
  'MP Sepang':         {offset:[28,26],  cls:'label-rural label-east'}
};

function pbtLabelConfig(pbt){
  return PBT_LABEL_CONFIG[pbt] || {offset:[0,0],cls:''};
}

function pbtLabelHtml(pbt){
  const logo=logoForPbt(pbt);
  const cfg=pbtLabelConfig(pbt);
  return '<div class="pbt-label-inner '+cfg.cls+'">'+
    (logo ? '<span class="pbt-label-logo"><img src="'+logo+'" alt=""></span>' : '')+
    '<span class="pbt-label-copy"><b>'+shortPbt(pbt)+'</b><small>PBT</small></span>'+
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

      const labelCfg=pbtLabelConfig(pbt);
      layer.bindTooltip(pbtLabelHtml(pbt),{
        permanent:true,
        direction:'center',
        className:'pbt-label '+labelCfg.cls,
        opacity:1,
        interactive:true,
        offset:L.point(labelCfg.offset[0],labelCfg.offset[1])
      });

      layer.bindPopup(()=>pbtPopupHtml(pbt),{
        maxWidth:280,
        className:'premium-pbt-popup'
      });

      layer.on({
        mouseover:(e)=>{
          e.target.setStyle({weight:4.5,color:'#172b51',fillOpacity:.84});
          if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) e.target.bringToFront();
          const el=layer.getTooltip()?.getElement();
          if(el) el.classList.add('is-active');
        },
        mouseout:(e)=>{
          e.target.setStyle(mapStyle(feature));
          const el=layer.getTooltip()?.getElement();
          if(el) el.classList.remove('is-active');
        },
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

  const refreshLabelDensity=()=>{
    const z=state.map.getZoom();
    const mapEl=document.getElementById('selangorMap');
    if(!mapEl) return;
    mapEl.classList.toggle('map-labels-compact', z<=9);
    mapEl.classList.toggle('map-labels-expanded', z>=10);
  };
  state.map.on('zoomend',refreshLabelDensity);
  refreshLabelDensity();

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
    const el=layer.getTooltip()?.getElement();
    if(el) el.classList.toggle('is-selected', state.pbt===pbt);
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
  const allRows = metricRows();
  const rows = state.pbt === 'all' ? allRows : allRows.filter(r=>r.name===state.pbt);
  const clipped = rows.map(r=> state.metric==='revenue' ? Math.min(r.value, 160) : r.value);

  const palette = [
    '#ef4444','#f97316','#f59e0b','#eab308',
    '#84cc16','#22c55e','#14b8a6','#06b6d4',
    '#3b82f6','#6366f1','#8b5cf6','#ec4899'
  ];

  const shadowPlugin = {
    id:'barShadow',
    beforeDatasetDraw(chart){
      const {ctx}=chart;
      ctx.save();
      ctx.shadowColor='rgba(15,23,42,.14)';
      ctx.shadowBlur=10;
      ctx.shadowOffsetY=4;
    },
    afterDatasetDraw(chart){ chart.ctx.restore(); }
  };

  const valueLabelPlugin = {
    id:'rankingValueLabels',
    afterDatasetsDraw(chart){
      const {ctx}=chart;
      ctx.save();
      ctx.font='800 11px Montserrat, Arial, sans-serif';
      ctx.fillStyle='#173163';
      ctx.textAlign='left';
      ctx.textBaseline='middle';
      const meta=chart.getDatasetMeta(0);
      meta.data.forEach((bar,index)=>{
        const label=formatNumber(rows[index].value)+METRICS[state.metric].unit;
        ctx.fillText(label,Math.min(bar.x+8,chart.chartArea.right+8),bar.y);
      });
      ctx.restore();
    }
  };

  if(state.rankingChart) state.rankingChart.destroy();

  state.rankingChart = new Chart($('#rankingChart'), {
    type:'bar',
    data:{
      labels:rows.map(r=>r.short),
      datasets:[{
        data:clipped,
        borderRadius:999,
        borderSkipped:false,
        borderColor:'#ffffff',
        borderWidth:2,
        backgroundColor:rows.map((_,i)=>palette[i%palette.length]),
        hoverBackgroundColor:rows.map((_,i)=>palette[i%palette.length]),
        barPercentage:.78,
        categoryPercentage:.88
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      indexAxis:'y',
      layout:{padding:{right:64}},
      scales:{
        x:{
          beginAtZero:true,
          grid:{color:'rgba(31,47,88,.07)'},
          ticks:{color:'#66738b'}
        },
        y:{
          grid:{display:false},
          ticks:{color:'#1f2f58',font:{size:11,weight:'700'}}
        }
      },
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#14284f',
          titleColor:'#fff',
          bodyColor:'#fff',
          padding:10,
          cornerRadius:10,
          displayColors:false,
          callbacks:{
            label:(ctx)=>METRICS[state.metric].label+': '+formatNumber(rows[ctx.dataIndex].value)+METRICS[state.metric].unit
          }
        }
      }
    },
    plugins:[shadowPlugin,valueLabelPlugin]
  });
}

function renderStatus(){
  const rows=state.pbt==='all' ? metricRows() : metricRows().filter(r=>r.name===state.pbt);
  const counts=rows.reduce((acc,row)=>{acc[row.status.key]+=1;return acc;},{good:0,mid:0,low:0});
  const total=counts.good+counts.mid+counts.low;

  $('#countGood').textContent=counts.good;
  $('#countMid').textContent=counts.mid;
  $('#countLow').textContent=counts.low;

  if(state.statusChart) state.statusChart.destroy();

  const labels=['Mampan','Sederhana Mampan','Kurang Mampan'];
  const values=[counts.good,counts.mid,counts.low];

  const canvas=$('#statusChart');
  const ctx=canvas.getContext('2d');

  const makeGradient=(top,bottom)=>{
    const g=ctx.createLinearGradient(0,0,0,360);
    g.addColorStop(0,top);
    g.addColorStop(1,bottom);
    return g;
  };

  const colors=[
    makeGradient('#9edb86','#68ac55'),
    makeGradient('#ffd06b','#e69b2c'),
    makeGradient('#f27480','#cf3a51')
  ];

  const depthColors=['#548d43','#bb791b','#a72b3d'];

  const premiumStatusPlugin={
    id:'premiumStatusRing',

    beforeDatasetsDraw(chart){
      // 3D depth layer removed for a cleaner status badge.
    },

    afterDatasetsDraw(chart){
      const {ctx,chartArea}=chart;
      if(!chartArea) return;

      const cx=(chartArea.left+chartArea.right)/2;
      const cy=(chartArea.top+chartArea.bottom)/2-5;

      ctx.save();

      // centre premium badge
      const rg=ctx.createRadialGradient(cx-14,cy-18,5,cx,cy,72);
      rg.addColorStop(0,'#9fda88');
      rg.addColorStop(.72,'#78bb65');
      rg.addColorStop(1,'#5fa34e');

      ctx.beginPath();
      ctx.arc(cx,cy,66,0,Math.PI*2);
      ctx.fillStyle=rg;
      ctx.shadowColor='rgba(20,36,67,.14)';
      ctx.shadowBlur=20;
      ctx.shadowOffsetY=6;
      ctx.fill();

      ctx.shadowColor='transparent';
      ctx.lineWidth=1.5;
      ctx.strokeStyle='rgba(255,255,255,.72)';
      ctx.stroke();

      const dominant=Math.max(...values);
      const pct=total ? Math.round((dominant/total)*100) : 0;

      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillStyle='#ffffff';
      ctx.font='900 32px Montserrat,Arial,sans-serif';
      ctx.fillText(pct+'%',cx,cy-9);

      ctx.fillStyle='rgba(255,255,255,.92)';
      ctx.font='800 10px Montserrat,Arial,sans-serif';
      ctx.fillText(total+' PBT DINILAI',cx,cy+20);

      ctx.restore();
    }
  };

  state.statusChart=new Chart(canvas,{
    type:'doughnut',
    data:{
      labels,
      datasets:[{
        data:values,
        backgroundColor:colors,
        borderColor:'#ffffff',
        borderWidth:5,
        borderRadius:5,
        spacing:3,
        hoverOffset:8
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:'58%',
      radius:'90%',
      rotation:-90,
      animation:{duration:700,easing:'easeOutQuart'},
      layout:{padding:{top:10,right:10,bottom:8,left:10}},
      plugins:{
        legend:{
          position:'bottom',
          labels:{
            usePointStyle:true,
            pointStyle:'rectRounded',
            boxWidth:12,
            boxHeight:12,
            padding:18,
            color:'#40506d',
            font:{size:11,weight:'700'}
          }
        },
        tooltip:{
          backgroundColor:'#14284f',
          titleColor:'#ffffff',
          bodyColor:'#ffffff',
          padding:11,
          cornerRadius:10,
          displayColors:true,
          callbacks:{
            label:(ctx)=>{
              const pct=total ? Math.round((ctx.raw/total)*100) : 0;
              return ctx.label+': '+ctx.raw+' PBT ('+pct+'%)';
            }
          }
        }
      }
    },
    plugins:[premiumStatusPlugin]
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
  renderPbtLogoSelector();
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
