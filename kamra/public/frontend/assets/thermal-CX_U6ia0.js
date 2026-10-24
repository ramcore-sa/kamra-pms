import{m as o,al as e,c}from"./index-DuUogHXa.js";const p=`
  @page { size: 80mm auto; margin: 0 }
  * { margin: 0; padding: 0; box-sizing: border-box }
  html, body { background: #fff; color: #000 }
  body { width: 72mm; margin: 0 auto; padding: 3mm 1mm 18mm;
         font: 13px/1.35 "Courier New", ui-monospace, monospace; color: #000 }
  .c { text-align: center }
  .b { font-weight: 700 }
  .xl { font-size: 20px; letter-spacing: 0.02em }
  .lg { font-size: 15px }
  .sm { font-size: 11px }
  .rule { border-top: 2px dashed #000; margin: 6px 0 }
  .row { display: flex; justify-content: space-between; gap: 8px }
  table { width: 100%; border-collapse: collapse; font-size: 14px }
  td { padding: 3px 0; vertical-align: top }
  .num { text-align: right; white-space: nowrap; font-weight: 700; width: 28px }
  .ins { font-size: 12px; font-weight: 700; padding-left: 28px }
  .cut { text-align: center; font-size: 10px; margin-top: 10px; letter-spacing: 0.2em }
`,s=t=>String(t??"").replace(/[&<>"]/g,d=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[d]),l=t=>Number(t??0).toLocaleString(o(),{minimumFractionDigits:2,maximumFractionDigits:2});function $(t,d){document.querySelectorAll("iframe[data-kamra-print]").forEach(n=>n.remove());const i=document.createElement("iframe");i.setAttribute("data-kamra-print","1"),i.setAttribute("title",t),i.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0",document.body.appendChild(i);const a=i.contentWindow;if(!a)return i.remove(),!1;a.document.open(),a.document.write(`<!doctype html><html dir="${document.documentElement.dir||"ltr"}"><head><title>${s(t)}</title><style>${p}</style></head><body>${d}</body></html>`),a.document.close();const r=()=>{try{i.remove()}catch{}};return a.onafterprint=r,setTimeout(()=>{try{a.focus(),a.print()}catch{r()}},200),setTimeout(r,12e4),!0}function g(t){const d=new Date().toLocaleString(o(),{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),i=t.items.map(a=>`<tr><td class="num b" style="width:24px">${Math.round(a.qty)}×</td><td class="b">${s(a.item_name)}</td></tr>`+(a.instructions?`<tr><td></td><td class="ins">» ${s(a.instructions)}</td></tr>`:"")).join("");return`
    <div class="c b lg">${s(t.outlet)}</div>
    <div class="c xl b">KOT #${t.kot_no??"—"}${t.reprint?s(e(" (REPRINT)")):""}</div>
    ${t.nc?`<div class="c b lg">${s(e("*** NC - NO CHARGE ***"))}</div>`+(t.nc_by?`<div class="c sm">${s(e("auth: {name}",{name:t.nc_by}))}</div>`:""):""}
    <div class="rule"></div>
    <div class="row"><span class="b lg">${s(t.label)}</span><span class="sm">${s(t.order_type?e(t.order_type):"")}</span></div>
    <div class="row sm"><span>${s(t.order)}</span><span>${d}</span></div>
    ${t.customer?`<div class="sm">${s(e("For: {name}",{name:t.customer}))}</div>`:""}
    ${t.address?`<div class="sm">→ ${s(t.address)}</div>`:""}
    <div class="rule"></div>
    <table>${i}</table>
    <div class="rule"></div>
    <div class="c sm">${s(t.items.length===1?e("1 item"):e("{n} items",{n:t.items.length}))}</div>
    <div class="cut">${s(e("- cut -"))}</div>`}function y(t){const d=new Date().toLocaleString(o(),{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),i=t.items.map(a=>`<tr><td class="num b" style="width:26px">${Math.round(a.qty)}×</td><td class="b">${s(a.item_name)}<div class="sm" style="font-weight:400">${s(e(a.service_type))}</div></td></tr>`).join("");return`
    <div class="c b lg">${s(t.property_name||e("Laundry"))}</div>
    <div class="c xl b">${s(e("LAUNDRY DOCKET"))}</div>
    <div class="rule"></div>
    <div class="row"><span class="b lg">${s(t.room_no)}</span><span class="sm">${s(e(t.order_type||"Guest"))}</span></div>
    <div class="row sm"><span>${s(t.order)}</span><span>${d}</span></div>
    ${t.guest_name?`<div class="sm">${s(t.guest_name)}</div>`:""}
    ${t.express?`<div class="c b">${s(e("EXPRESS - SAME DAY"))}</div>`:""}
    ${t.ready_by?`<div class="sm">${s(e("Ready by: {time}",{time:t.ready_by}))}</div>`:""}
    <div class="rule"></div>
    <table>${i}</table>
    <div class="rule"></div>
    <div class="row b lg"><span>${s(e("Total"))}</span><span class="num">${c()}${l(t.total)}</span></div>
    <div class="c sm">${s(e("Counted with the guest. Billed to the room."))}</div>`}function h(t){const d=new Date().toLocaleString(o(),{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),i=t.table_no?e("Table {n}",{n:t.table_no}):t.room_no?e("Room {n}",{n:t.room_no}):e(t.order_type||"Counter"),a=t.items.map(n=>`<tr><td>${s(n.item_name)}</td><td class="num" style="width:28px">${Math.round(n.qty)}</td><td class="num" style="width:52px">${l(n.rate)}</td><td class="num" style="width:62px">${l(n.amount)}</td></tr>`).join(""),r=(n,m,u="")=>`<div class="row ${u}"><span>${s(e(n))}</span><span class="num">${c()}${l(m)}</span></div>`;return`
    <div class="c b lg">${s(t.property_name)}</div>
    <div class="c">${s(t.outlet_name)}</div>
    ${t.statutory?`<div class="c b sm">${s(t.statutory.title)}</div><div class="c b sm" dir="rtl">${s(t.statutory.title_ar)}</div>`:""}
    <div class="rule"></div>
    <div class="row"><span class="b">${s(i)}</span><span>${d}</span></div>
    <div class="row sm"><span>${s(e("Bill: {n}",{n:t.order}))}</span><span>KOT #${t.kot_no??"—"}</span></div>
    ${t.customer_name||t.customer_phone?`<div class="sm">${s([t.customer_name,t.customer_phone].filter(Boolean).join(" · "))}</div>`:""}
    ${t.delivery_address?`<div class="sm">→ ${s(t.delivery_address)}</div>`:""}
    <div class="rule"></div>
    <table>
      <tr class="sm"><td>${s(e("Item"))}</td><td class="num">${s(e("Qty"))}</td><td class="num">${s(e("Rate"))}</td><td class="num">${s(e("Amt"))}</td></tr>
      ${a}
    </table>
    <div class="rule"></div>
    ${r("Subtotal",t.subtotal)}
    ${t.discount_amount?r("Discount",-t.discount_amount):""}
    ${(t.tax_parts??[{label:"CGST",rate:t.gst_rate/2,amount:t.cgst},{label:"SGST",rate:t.gst_rate/2,amount:t.sgst}]).map(n=>r(e("{tax} @ {rate}%",{tax:n.label,rate:n.rate}),n.amount,"sm")).join("")}
    <div class="rule"></div>
    ${r("TOTAL",t.grand_total,"b lg")}
    ${t.nc?`<div class="c b" style="margin-top:4px">${s(e("COMPLIMENTARY - NO CHARGE"))}</div><div class="c sm">${s(e("auth: {name}",{name:t.nc_authorized_by||"—"}))}${t.nc_note?` · ${s(t.nc_note)}`:""}</div>`:""}
    ${t.paid?`<div class="c b" style="margin-top:4px">${s(e("PAID · {mode}",{mode:e(t.payment_mode||"")}))}</div>`:""}
    <div class="rule"></div>
    ${t.statutory?`<div class="c"><img src="${t.statutory.qr_image}" alt="QR" style="width:120px;height:120px"/></div><div class="c sm">ICV ${t.statutory.icv}</div>`:""}
    <div class="c sm">${s(e("Thank you. See you again."))}</div>
    <div class="cut">${s(e("- cut -"))}</div>`}export{h as b,g as k,y as l,$ as p};
