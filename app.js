const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const dimChart = new Chart($('#dimensionChart'),{
 type:'doughnut',
 data:{labels:DIMENSIONS.map(d=>d.name),datasets:[{data:DIMENSIONS.map(d=>d.count),backgroundColor:DIMENSIONS.map(d=>d.color),borderColor:'#08273a',borderWidth:3}]},
 options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw} indikator`}}}}
});

function statusFor(metric,value){
 if(metric==='happiness') return value>=80?['Mampan','good']:value>=50?['Sederhana','mid']:['Rendah','low'];
 if(metric==='urbanisation') return value>=80?['Tinggi','good']:value>=60?['Sederhana','mid']:['Rendah','low'];
 if(metric==='broadband') return value>=99.9?['Sangat Tinggi','good']:value>=95?['Tinggi','mid']:['Perlu Perhatian','low'];
 if(metric==='revenue') return value>=100?['Capai / Melebihi','good']:value>=90?['Hampir Sasaran','mid']:['Bawah Sasaran','low'];
 if(metric==='community') return value>=20?['Peningkatan Tinggi','good']:value>=5?['Peningkatan','mid']:['Rendah','low'];
 return ['Data','mid'];
}
let pbtChart;
function renderMetric(key){
 const m=METRICS[key];
 const rows=PBT.map((pbt,i)=>({pbt,value:m.values[i],status:statusFor(key,m.values[i])})).sort((a,b)=>b.value-a.value);
 const maxVal=Math.max(...rows.map(r=>r.value));
 const displayMax=key==='revenue'&&maxVal>300?150:undefined; // outlier MP Hulu Selangor remains in table, chart clipped for readability
 if(pbtChart) pbtChart.destroy();
 pbtChart=new Chart($('#pbtChart'),{
   type:'bar',
   data:{labels:rows.map(r=>r.pbt.replace('MB ','MB ').replace('MP ','MP ')),datasets:[{label:m.label,data:rows.map(r=>Math.min(r.value,displayMax||r.value)),backgroundColor:rows.map(r=>r.status[1]==='good'?'rgba(22,197,108,.82)':r.status[1]==='mid'?'rgba(255,200,61,.84)':'rgba(255,77,94,.84)'),borderRadius:6}]},
   options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{beginAtZero:true,max:displayMax,grid:{color:'rgba(255,255,255,.06)'},ticks:{color:'#9db9c8'}},y:{grid:{display:false},ticks:{color:'#dff6ff',font:{size:10}}}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const real=rows[c.dataIndex].value;return `${m.label}: ${real.toLocaleString('ms-MY',{maximumFractionDigits:2})}${m.unit}`}}}}}
 });
 const tbody=$('#rankingTable tbody');tbody.innerHTML='';
 rows.forEach((r,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${i+1}</td><td>${r.pbt}</td><td class="value">${r.value.toLocaleString('ms-MY',{maximumFractionDigits:2})}${m.unit}</td><td><span class="status-pill status-${r.status[1]}">${r.status[0]}</span></td>`;tbody.appendChild(tr)});
 if(key==='revenue'){
   const note=document.createElement('tr'); note.innerHTML=`<td colspan="4" style="color:#9db9c8;font-size:10px">Nota: nilai MP Hulu Selangor dalam sumber ialah 988.12%. Carta dihadkan kepada 150% supaya PBT lain kekal terbaca; jadual memaparkan nilai penuh.</td>`;tbody.appendChild(note);
 }
}
$('#metricSelect').addEventListener('change',e=>renderMetric(e.target.value));renderMetric('happiness');

const dimContainer=$('#dimensionCards');
DIMENSIONS.forEach(d=>{const el=document.createElement('div');el.className='dimension-card';el.style.setProperty('--accent',d.color);el.innerHTML=`<div class="dimension-number">DIMENSI ${d.id}</div><h3>${d.name}</h3><span class="dimension-count">${d.count} indikator</span>`;el.addEventListener('click',()=>{$('#dimensionFilter').value=String(d.id);renderIndicators();document.querySelector('.explorer-panel').scrollIntoView({behavior:'smooth'})});dimContainer.appendChild(el)});

const filter=$('#dimensionFilter');DIMENSIONS.forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=`Dimensi ${d.id} — ${d.name}`;filter.appendChild(o)});
function renderIndicators(){
 const q=$('#searchInput').value.trim().toLowerCase(),dim=filter.value;
 const data=INDICATORS.filter(x=>(dim==='all'||String(x.dimension)===dim)&&(!q||`${x.code} ${x.title}`.toLowerCase().includes(q)));
 const box=$('#indicatorList');box.innerHTML='';
 data.forEach(x=>{const d=DIMENSIONS.find(y=>y.id===x.dimension),el=document.createElement('div');el.className='indicator-card';el.innerHTML=`<div class="indicator-top"><span class="indicator-code">${x.code}</span><span class="indicator-page">Hal. ${x.page}</span></div><h4>${x.title}</h4><div class="indicator-dim">Dimensi ${x.dimension}: ${d.name}</div>`;el.addEventListener('click',()=>openPdf(x));box.appendChild(el)});
 if(!data.length) box.innerHTML='<div class="muted">Tiada indikator sepadan dengan carian.</div>';
}
$('#searchInput').addEventListener('input',renderIndicators);filter.addEventListener('change',renderIndicators);renderIndicators();

function openPdf(x){$('#modalTitle').textContent=`${x.code} — ${x.title}`;$('#modalSubtitle').textContent=`Halaman ${x.page} • Dimensi ${x.dimension}`;$('#pdfFrame').src=`source/slides_murninets_dashboard_SUO.pdf#page=${x.page}&zoom=page-width`;$('#pdfModal').classList.add('open');$('#pdfModal').setAttribute('aria-hidden','false')}
function closePdf(){$('#pdfModal').classList.remove('open');$('#pdfModal').setAttribute('aria-hidden','true');$('#pdfFrame').src=''}
$('#closeModal').addEventListener('click',closePdf);$('#pdfModal').addEventListener('click',e=>{if(e.target.id==='pdfModal')closePdf()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closePdf()});
