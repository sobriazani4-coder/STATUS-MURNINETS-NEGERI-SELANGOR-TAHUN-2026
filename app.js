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

const SELANGOR_STATE_CREST='data:image/webp;base64,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';

const STATUS_COLORS = { good:'#7db56b', mid:'#e8a437', low:'#db3b49' };
const DIMENSION_START_PAGES = {1:2,2:4,3:11,4:31,5:37,6:44};
const PDF_PATH = 'source/slides_murninets_dashboard_SUO.pdf';
const PBT_GEOJSON_PATH = 'pbt-selangor.geojson';

function formatNumber(value, digits = 2){
  const num = Number(value);
  return num.toLocaleString('ms-MY', {maximumFractionDigits: digits, minimumFractionDigits: 0});
}

function getStatus(metric, value, pbtName=''){
  const good={label:'Mampan',key:'good'};
  const mid={label:'Sederhana Mampan',key:'mid'};
  const low={label:'Kurang Mampan',key:'low'};

  if(metric==='happiness') return value>=80 ? good : value>=50 ? mid : low;
  if(metric==='riverWater') return value<=10 ? good : value<=49 ? mid : low;
  if(metric==='hospitalBeds') return value>=2.06 ? good : value>=1.04 ? mid : low;

  // KT2-P4 — ikut warna/status tepat pada lampiran 2026
  if(metric==='primarySchoolRatio'){
    const statusMap={
      'MB Shah Alam':'good',
      'MB Petaling Jaya':'low',
      'MB Subang Jaya':'mid',
      'MBD Klang':'good',
      'MP Ampang Jaya':'low',
      'MP Kajang':'good',
      'MP Selayang':'low',
      'MP Sepang':'good',
      'MP Kuala Langat':'good',
      'MP Kuala Selangor':'good',
      'MP Hulu Selangor':'good',
      'MD Sabak Bernam':'good'
    };
    return statusMap[pbtName]==='good' ? good : statusMap[pbtName]==='mid' ? mid : low;
  }

  // KT2-P5 — ikut warna/status tepat pada lampiran 2026
  if(metric==='secondarySchoolRatio'){
    const statusMap={
      'MB Shah Alam':'low',
      'MB Petaling Jaya':'low',
      'MB Subang Jaya':'low',
      'MBD Klang':'low',
      'MP Ampang Jaya':'low',
      'MP Kajang':'mid',
      'MP Selayang':'low',
      'MP Sepang':'good',
      'MP Kuala Langat':'low',
      'MP Kuala Selangor':'mid',
      'MP Hulu Selangor':'good',
      'MD Sabak Bernam':'good'
    };
    return statusMap[pbtName]==='good' ? good : statusMap[pbtName]==='mid' ? mid : low;
  }

  if(metric==='preschoolRatio') return value<=200 ? good : value<=499 ? mid : low;
  if(metric==='domesticWater') return value<=180 ? good : value<=200 ? mid : low;

  return {label:'Data',key:'mid'};
}

function metricRows(metricKey = state.metric){
  const metric = METRICS[metricKey];
  return PBT.map((name, i)=>({
    name,
    short: name.replace('MB ','').replace('MP ','').replace('MD ','').replace('MBD ',''),
    value: metric.values[i],
    status: getStatus(metricKey, metric.values[i], name)
  })).sort((a,b)=>b.value-a.value);
}

function valueForPbt(name, metricKey = state.metric){
  const idx = PBT.indexOf(name);
  return idx >= 0 ? METRICS[metricKey].values[idx] : null;
}

function schoolCountForPbt(name, metricKey = state.metric){
  const metric = METRICS[metricKey];
  if(!metric || !metric.schoolCounts) return null;
  const idx = PBT.indexOf(name);
  return idx >= 0 ? metric.schoolCounts[idx] : null;
}

function riverStationForPbt(name, metricKey = state.metric){
  const metric=METRICS[metricKey];
  if(!metric || !metric.stationTotal || !metric.stationPolluted) return null;
  const idx=PBT.indexOf(name);
  if(idx<0) return null;
  return {total:metric.stationTotal[idx], polluted:metric.stationPolluted[idx]};
}

function hospitalBedCountForPbt(name, metricKey = state.metric){
  const metric=METRICS[metricKey];
  if(!metric || !metric.hospitalBedCount) return null;
  const idx=PBT.indexOf(name);
  return idx>=0 ? metric.hospitalBedCount[idx] : null;
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
  const status=value==null ? {key:'mid'} : getStatus(state.metric,value,pbt);
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
  'MBD Klang':         {offset:[-34,18], cls:'label-urban label-left label-priority'},
  'MB Shah Alam':      {offset:[-48,-28],cls:'label-urban label-left label-priority'},
  'MB Petaling Jaya':  {offset:[28,-52], cls:'label-urban label-right label-priority'},
  'MB Subang Jaya':    {offset:[18,42],  cls:'label-urban label-right label-priority'},
  'MP Selayang':       {offset:[26,-48], cls:'label-urban label-right'},
  'MP Ampang Jaya':    {offset:[88,4], cls:'label-urban label-right'},
  'MP Kajang':         {offset:[48,48],  cls:'label-urban label-right'},
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
  const status=value==null ? null : getStatus(state.metric,value,pbt);
  const schoolCount=schoolCountForPbt(pbt);
  const station=riverStationForPbt(pbt);
  const hospitalBedCount=hospitalBedCountForPbt(pbt);
  return '<div class="pbt-popup">'+
    '<div class="pbt-popup-head">'+
      (logo ? '<img class="pbt-popup-logo" src="'+logo+'" alt="Logo '+pbt+'">' : '')+
      '<div><strong>'+pbt+'</strong><small>Negeri Selangor</small></div>'+
    '</div>'+
    (schoolCount!=null ? '<div class="pbt-popup-metric school-count-popup"><b>'+METRICS[state.metric].schoolLabel+':</b> <span class="school-count-number">'+formatNumber(schoolCount,0)+'</span></div>' : '')+
    (station ? '<div class="pbt-popup-metric"><b>Stesen tercemar:</b> '+station.polluted+' &nbsp;•&nbsp; <b>Jumlah stesen:</b> '+station.total+'</div>' : '')+
    (hospitalBedCount!=null ? '<div class="pbt-popup-metric hospital-bed-popup"><b>Bil. Katil Hospital (Kerajaan &amp; Swasta):</b> '+formatNumber(hospitalBedCount,0)+'</div>' : '')+
    '<span class="value">'+(value==null ? 'Tiada data' : formatNumber(value)+METRICS[state.metric].unit)+'</span>'+
    '<div class="pbt-popup-metric">'+(schoolCount!=null ? 'Hasil Nisbah' : METRICS[state.metric].label)+'</div>'+
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
        const row=rows[index];
        const station=riverStationForPbt(row.name);
        const label=station
          ? station.polluted+'/'+station.total+' stesen • '+formatNumber(row.value)+METRICS[state.metric].unit
          : formatNumber(row.value)+METRICS[state.metric].unit;
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
            label:(ctx)=>{
              const row=rows[ctx.dataIndex];
              const schoolCount=schoolCountForPbt(row.name);
              const station=riverStationForPbt(row.name);
              if(station){
                return [
                  'Bil. Stesen Pengawasan Kualiti Air Sungai Tercemar: '+station.polluted,
                  'Bil. Stesen Pengawasan Kualiti Air Sungai: '+station.total,
                  'Hasil: '+formatNumber(row.value)+METRICS[state.metric].unit
                ];
              }
              if(schoolCount!=null){
                return [
                  METRICS[state.metric].schoolLabel+': '+formatNumber(schoolCount,0),
                  'Hasil: '+formatNumber(row.value)+METRICS[state.metric].unit
                ];
              }
              return METRICS[state.metric].label+': '+formatNumber(row.value)+METRICS[state.metric].unit;
            }
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
    options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom',labels:{boxWidth:16,boxHeight:16,padding:16,color:'#203762',font:{size:14,weight:'700'}}},tooltip:{callbacks:{label:(ctx)=>ctx.label+': '+ctx.raw+' indikator'}}}}
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
  const isOverallHappiness=state.pbt==='all' && state.metric==='happiness';
  const isStateMetric=state.metric==='hospitalBeds' || state.metric==='domesticWater';

  if(isStateMetric){
    const isWater=state.metric==='domesticWater';
    const value=isWater ? 240.05 : current.value;
    const status=isWater ? {label:'Kurang Mampan',key:'low'} : getStatus(state.metric,value,'');
    const label=isWater
      ? 'Isipadu Penggunaan Air Domestik Harian Per Kapita 2026'
      : METRICS[state.metric].label;
    const displayValue=isWater
      ? '240.05 L/hari/orang'
      : formatNumber(value)+METRICS[state.metric].unit;

    $('#profileBox').innerHTML=
      '<div class="profile-hero profile-with-logo">'+
        '<div class="profile-logo-box"><img src="'+SELANGOR_STATE_CREST+'" alt="Jata Negeri Selangor"></div>'+
        '<div><h3>Negeri Selangor</h3><p>Data satu Negeri Selangor bagi indikator '+METRICS[state.metric].short.toLowerCase()+'.</p></div>'+
      '</div>'+
      '<div class="profile-metric">'+
        '<div class="metric-card"><small>'+label+'</small><strong>'+displayValue+'</strong><span>Rujukan halaman '+METRICS[state.metric].page+'</span></div>'+
        '<div class="metric-card"><small>Status Prestasi</small><strong style="color:'+STATUS_COLORS[status.key]+'">'+status.label+'</strong><span>Klasifikasi paparan dashboard</span></div>'+
      '</div>';
    return;
  }

  const title=isOverallHappiness
    ? 'Majlis Bandaraya Petaling Jaya'
    : (state.pbt==='all' ? 'Sorotan PBT Tertinggi Semasa' : current.name);

  const desc=isOverallHappiness
    ? 'Indeks Kebahagiaan 2026 : '+formatNumber(current.value)+METRICS[state.metric].unit
    : (state.pbt==='all'
      ? 'Paparan keseluruhan sedang aktif. PBT teratas bagi indikator '+METRICS[state.metric].short.toLowerCase()+' ialah '+current.name+'.'
      : 'PBT ini sedang dipilih pada peta dan carta. Nilai dipaparkan berdasarkan indikator '+METRICS[state.metric].short.toLowerCase()+'.');

  const stat=current.status;
  const logo=logoForPbt(current.name);
  const schoolCount=schoolCountForPbt(current.name);

  let extraPbtCards='';
  if(isOverallHappiness){
    const extras=[
      {name:'MP Kuala Langat',display:'Majlis Perbandaran Kuala Langat'},
      {name:'MP Selayang',display:'Majlis Perbandaran Selayang'}
    ];
    extraPbtCards=extras.map(item=>{
      const row=rows.find(r=>r.name===item.name);
      const extraLogo=logoForPbt(item.name);
      if(!row) return '';
      return '<div class="profile-hero profile-with-logo">'+
        (extraLogo?'<div class="profile-logo-box"><img src="'+extraLogo+'" alt="Logo '+item.display+'"></div>':'')+
        '<div><h3>'+item.display+'</h3>'+
        '<p>Indeks Kebahagiaan 2026 : <b>'+formatNumber(row.value)+METRICS[state.metric].unit+'</b></p></div>'+
      '</div>'+
      '<div class="profile-metric">'+
        '<div class="metric-card"><small>Indeks Kebahagiaan 2026</small><strong>'+formatNumber(row.value)+METRICS[state.metric].unit+'</strong><span>Rujukan halaman '+METRICS[state.metric].page+'</span></div>'+
        '<div class="metric-card"><small>Status Prestasi</small><strong style="color:'+STATUS_COLORS[row.status.key]+'">'+row.status.label+'</strong><span>Klasifikasi paparan dashboard</span></div>'+
      '</div>';
    }).join('');
  }

  $('#profileBox').innerHTML=
    '<div class="profile-hero profile-with-logo">'+
      (logo?'<div class="profile-logo-box"><img src="'+logo+'" alt="Logo '+current.name+'"></div>':'')+
      '<div><h3>'+title+'</h3><p>'+desc+'</p></div>'+
    '</div>'+
    '<div class="profile-metric">'+
      '<div class="metric-card"><small>'+METRICS[state.metric].label+'</small>'+
        (schoolCount!=null ? '<span><b>'+METRICS[state.metric].schoolLabel+':</b> '+formatNumber(schoolCount,0)+'</span>' : '')+
        '<strong>'+formatNumber(current.value)+METRICS[state.metric].unit+'</strong>'+
        '<span>'+(schoolCount!=null ? 'Hasil nisbah • ' : '')+'Rujukan halaman '+METRICS[state.metric].page+'</span></div>'+
      '<div class="metric-card"><small>Status Prestasi</small><strong style="color:'+STATUS_COLORS[stat.key]+'">'+stat.label+'</strong><span>Klasifikasi paparan dashboard</span></div>'+
    '</div>'+
    extraPbtCards;
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
