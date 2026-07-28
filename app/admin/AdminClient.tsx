"use client";
import { FormEvent,useEffect,useState } from "react";
import Link from "next/link";
import type { ChatGPTUser } from "../chatgpt-auth";
import type { ContentItem,ContentType } from "../../lib/content";
const blank={id:"",type:"artist" as ContentType,title:"",subtitle:"",description:"",imageKey:null as string|null,imageUrl:null as string|null,link:"",sortOrder:0,published:true};
export default function AdminClient({user,signOutPath}:{user:ChatGPTUser;signOutPath:string}){
 const [items,setItems]=useState<ContentItem[]>([]),[form,setForm]=useState(blank),[status,setStatus]=useState("콘텐츠를 불러오는 중..."),[busy,setBusy]=useState(false);
 const load=async()=>{const r=await fetch("/api/content?admin=1"),d=await r.json();if(!r.ok)throw new Error(d.error);setItems(d.items);setStatus(`총 ${d.items.length}개의 콘텐츠`)};
 useEffect(()=>{void fetch("/api/content?admin=1").then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setItems(d.items);setStatus(`총 ${d.items.length}개의 콘텐츠`)}).catch(e=>setStatus(e.message))},[]);
 const edit=(x:ContentItem)=>{setForm({id:x.id,type:x.type,title:x.title,subtitle:x.subtitle,description:x.description,imageKey:x.imageKey,imageUrl:x.imageUrl,link:x.link,sortOrder:x.sortOrder,published:x.published});window.scrollTo({top:0,behavior:"smooth"})};
 const upload=async(file?:File)=>{if(!file)return;setBusy(true);setStatus("미디어 업로드 중...");const data=new FormData();data.append("file",file);try{const r=await fetch("/api/upload",{method:"POST",body:data}),d=await r.json();if(!r.ok)throw new Error(d.error);setForm(x=>({...x,imageKey:d.key,imageUrl:d.url}));setStatus("사진 또는 영상이 업로드되었습니다.")}catch(e){setStatus(e instanceof Error?e.message:"업로드 실패")}finally{setBusy(false)}};
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setStatus("저장 중...");try{const r=await fetch("/api/content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)}),d=await r.json();if(!r.ok)throw new Error(d.error);setForm(blank);await load();setStatus("저장되었습니다.")}catch(e){setStatus(e instanceof Error?e.message:"저장 실패")}finally{setBusy(false)}};
 const remove=async(x:ContentItem)=>{if(!confirm(`"${x.title}"을(를) 삭제할까요?`))return;setBusy(true);try{const r=await fetch(`/api/content/${x.id}`,{method:"DELETE"});if(!r.ok)throw new Error((await r.json()).error);await load();setStatus("삭제되었습니다.")}catch(e){setStatus(e instanceof Error?e.message:"삭제 실패")}finally{setBusy(false)}};
 return <main className="admin-shell"><header className="admin-header"><Link href="/">SIMSIMENT®</Link><div><span>{user.displayName}</span><a href={signOutPath}>로그아웃</a></div></header><section className="admin-intro"><p>CONTENT CONTROL</p><h1>사이트 관리</h1><span>{status}</span></section><div className="admin-layout">
  <form className="editor" onSubmit={submit}><div className="editor-title"><h2>{form.id?"콘텐츠 수정":"새 콘텐츠"}</h2>{form.id&&<button type="button" onClick={()=>setForm(blank)}>신규 작성</button>}</div>
   <label>콘텐츠 유형<select value={form.type} onChange={e=>setForm({...form,type:e.target.value as ContentType})}><option value="artist">아티스트</option><option value="release">앨범 / 릴리스</option><option value="news">뉴스</option></select></label>
   <label>제목<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="영문명 또는 제목"/></label>
   <label>부제<input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} placeholder="한글명, 아티스트 · 앨범 유형, 날짜"/></label>
   <label>설명<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4}/></label>
   <label>연결 링크<input value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://..."/></label>
   <label>정렬 순서<input type="number" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/></label>
   <label className="upload-box">사진 / 영상 / 앨범 아트<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={e=>upload(e.target.files?.[0])}/><span>{form.imageUrl?"미디어 변경":"사진 12MB · 영상 100MB 이하"}</span>{form.imageUrl&&(/\.(mp4|webm|mov)$/i.test(form.imageKey??"")?<video src={form.imageUrl} controls muted playsInline/>:<img src={form.imageUrl} alt="업로드 미리보기"/>)}</label>
   <label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>사이트에 공개</label><button className="save" disabled={busy}>{busy?"처리 중...":"저장하기"}</button>
  </form><section className="content-manager"><div className="manager-head"><h2>등록 콘텐츠</h2><span>{items.length}</span></div>{items.map(x=><article className="admin-item" key={x.id}>{x.imageUrl?(/\.(mp4|webm|mov)$/i.test(x.imageKey??"")?<video src={x.imageUrl} muted playsInline/>:<img src={x.imageUrl} alt=""/>):<div className="thumb">{x.type[0].toUpperCase()}</div>}<div><small>{x.type} · {x.published?"공개":"비공개"}</small><h3>{x.title}</h3><p>{x.subtitle}</p></div><div className="item-actions"><button onClick={()=>edit(x)}>수정</button><button onClick={()=>remove(x)}>삭제</button></div></article>)}</section>
 </div></main>
}
