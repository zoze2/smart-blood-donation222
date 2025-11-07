async function getJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('شبكة: ' + res.status);
  return res.json();
}

function renderList(container, items, type){
  if(items.length === 0){
    container.innerHTML = '<p>لا توجد عناصر بعد.</p>';
    return;
  }
  container.innerHTML = items.map(it => {
    if(type === 'request'){
      return `<article class="item"><h4>${it.title} — ${it.blood_type}</h4><p>المدينة: ${it.city} — مطلوب: ${it.units} وحدة</p><p>هاتف: ${it.phone}</p></article>`;
    } else {
      return `<article class="item"><h4>${it.name} — ${it.blood_type}</h4><p>المدينة: ${it.city} — ${it.phone}</p></article>`;
    }
  }).join('');
}

async function loadData(){
  try{
    const [requests, donors] = await Promise.all([getJSON('/api/requests'), getJSON('/api/donors')]);
    renderList(document.getElementById('requests-list'), requests, 'request');
    renderList(document.getElementById('donors-list'), donors, 'donor');
  }catch(err){
    console.error(err);
    document.getElementById('requests-list').innerText = 'حدث خطأ في التحميل';
    document.getElementById('donors-list').innerText = 'حدث خطأ في التحميل';
  }
}

document.getElementById('donor-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  const res = await fetch('/api/donors', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if(res.ok){
    alert('تم التسجيل بنجاح');
    e.target.reset();
    loadData();
  } else {
    alert('فشل التسجيل');
  }
});

document.getElementById('create-request').addEventListener('click', async () => {
  const title = prompt('عنوان الطلب (مثلاً: احتياج عاجل في مستشفى X)');
  if(!title) return;
  const blood_type = prompt('أدخل فصيلة الدم (مثال: O+)') || 'O+';
  const city = prompt('المدينة') || 'غير محددة';
  const phone = prompt('رقم الهاتف') || '';
  const units = prompt('كم وحدة؟') || '1';

  const res = await fetch('/api/requests', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({title,blood_type,city,phone,units})
  });
  if(res.ok){ loadData(); alert('تم إنشاء الطلب'); } else { alert('فشل إنشاء الطلب'); }
});

loadData();
