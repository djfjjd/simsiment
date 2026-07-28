"use client";
import { FormEvent,useEffect,useState } from "react";
import Link from "next/link";
import type { ChatGPTUser } from "../chatgpt-auth";
import type { ContentItem,ContentType } from "../../lib/content";
const blank={id:"",type:"artist" as ContentType,title:"",subtitle:"",description:"",imageKey:null as string|null,imageUrl:null as string|null,link:"",sortOrder:0,published:true};
const uploadLimit=700*1024;
async function optimizeImage(file:File){
 if(!file.type.startsWith("image/")||file.size<=uploadLimit)return file;
 const bitmap=await createImageBitmap(file),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 const context=canvas.getContext("2d");if(!context)throw new Error("이미지를 처리할 수 없습니다.");
 context.fillStyle="#ffffff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 for(const quality of [.86,.76,.66,.56]){
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",quality));
  if(blob&&blob.size<=uploadLimit)return new File([blob],file.name.replace(/\.[^.]+$/,"")+".jpg",{type:"image/jpeg"});
 }
 throw new Error("사진 용량을 충분히 줄이지 못했습니다. 더 작은 사진을 선택해 주세요.");
}
export default function AdminClient({user,signOutPath}:{user:ChatGPTUser;signOutPath:string}){
 const [items,setItems]=useState<ContentItem[]>([]),[form,setForm]=useState(blank),[status,setStatus]=useState("콘텐츠를 불러오는 중..."),[busy,setBusy]=useState(false),[mediaFile,setMediaFile]=useState<File|null>(null);
 const load=async()=>{const r=await fetch("/api/content?admin=1"),d=await r.json();if(!r.ok)throw new Error(d.error);setItems(d.items);setStatus(`총 ${d.items.length}개의 콘텐츠`)};
 useEffect(()=>{void fetch("/api/content?admin=1").then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setItems(d.items);setStatus(`총 ${d.items.length}개의 콘텐츠`)}).catch(e=>setStatus(e.message))},[]);
 const reset=()=>{setForm(blank);setMediaFile(null)};
 const edit=(x:ContentItem)=>{setMediaFile(null);setForm({id:x.id,type:x.type,title:x.title,subtitle:x.subtitle,description:x.description,imageKey:x.imageKey,imageUrl:x.imageUrl,link:x.link,sortOrder:x.sortOrder,published:x.published});window.scrollTo({top:0,behavior:"smooth"})};
 const selectMedia=async(file?:File)=>{if(!file)return;setBusy(true);setStatus("사진을 업로드에 맞게 준비 중...");try{if(file.type.startsWith("video/")&&file.size>uploadLimit)throw new Error("영상은 현재 700KB 이하 파일만 업로드할 수 있습니다.");const prepared=await optimizeImage(file);setMediaFile(prepared);setForm(x=>({...x,imageKey:null,imageUrl:URL.createObjectURL(prepared)}));setStatus(`"${file.name}" 준비됨 · 저장하기를 눌러 등록하세요.`)}catch(e){setMediaFile(null);setStatus(e instanceof Error?e.message:"파일 준비 실패")}finally{setBusy(false)}};
 const upload=async(file:File)=>{const data=new FormData();data.append("file",file);const r=await fetch("/api/upload",{method:"POST",body:data});const text=await r.text();let d:{key?:string;url?:string;error?:string}={};try{d=JSON.parse(text)}catch{}if(!r.ok)throw new Error(d.error||(r.status===413?"파일 전송 용량이 너무 큽니다. 더 작은 파일을 선택해 주세요.":`업로드 실패 (${r.status})`));if(!d.key||!d.url)throw new Error("업로드 결과가 올바르지 않습니다.");return {key:d.key,url:d.url}};
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setStatus(mediaFile?"미디어 업로드 및 저장 중...":"저장 중...");try{let payload={...form};if(mediaFile){const uploaded=await upload(mediaFile);payload={...payload,imageKey:uploaded.key,imageUrl:uploaded.url}}const r=await fetch("/api/content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),d=await r.json();if(!r.ok)throw new Error(d.error);reset();await load();setStatus("미디어와 콘텐츠가 함께 저장되었습니다.")}catch(e){setStatus(e instanceof Error?e.message:"저장 실패")}finally{setBusy(false)}};
 const remove=async(x:ContentItem)=>{if(!confirm(`"${x.title}"을(를) 삭제할까요?`))return;setBusy(true);try{const r=await fetch(`/api/content/${x.id}`,{method:"DELETE"});if(!r.ok)throw new Error((await r.json()).error);await load();setStatus("삭제되었습니다.")}catch(e){setStatus(e instanceof Error?e.message:"삭제 실패")}finally{setBusy(false)}};
 return <main className="admin-shell"><header className="admin-header"><Link href="/">SIMSIMENT®</Link><div><span>{user.displayName}</span><a href={signOutPath}>로그아웃</a></div></header><section className="admin-intro"><p>CONTENT CONTROL</p><h1>사이트 관리</h1><span>{status}</span></section><div className="admin-layout">
  <form className="editor" onSubmit={submit}><div className="editor-title"><h2>{form.id?"콘텐츠 수정":"새 콘텐츠"}</h2>{form.id&&<button type="button" onClick={reset}>신규 작성</button>}</div>
   <label>콘텐츠 유형<select value={form.type} onChange={e=>setForm({...form,type:e.target.value as ContentType})}><option value="artist">아티스트</option><option value="release">앨범 / 릴리스</option><option value="news">뉴스</option></select></label>
   <label>제목<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="영문명 또는 제목"/></label>
   <label>부제<input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} placeholder="한글명, 아티스트 · 앨범 유형, 날짜"/></label>
   <label>설명<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4}/></label>
   <label>연결 링크<input value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://..."/></label>
   <label>정렬 순서<input type="number" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/></label>
   <label className="upload-box">사진 / 영상 / 앨범 아트<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={e=>void selectMedia(e.target.files?.[0])}/><span>{mediaFile?`${mediaFile.name} · 저장 시 업로드`:form.imageUrl?"미디어 변경":"사진 자동 최적화 · 영상 700KB 이하"}</span>{form.imageUrl&&((mediaFile?.type.startsWith("video/")||/\.(mp4|webm|mov)$/i.test(form.imageKey??""))?<video src={form.imageUrl} controls muted playsInline/>:<img src={form.imageUrl} alt="업로드 미리보기"/>)}</label>
   <label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>사이트에 공개</label><button className="save" disabled={busy}>{busy?"처리 중...":"저장하기"}</button>
  </form><section className="content-manager"><div className="manager-head"><h2>등록 콘텐츠</h2><span>{items.length}</span></div>{items.map(x=><article className="admin-item" key={x.id}>{x.imageUrl?(/\.(mp4|webm|mov)$/i.test(x.imageKey??"")?<video src={x.imageUrl} muted playsInline/>:<img src={x.imageUrl} alt=""/>):<div className="thumb">{x.type[0].toUpperCase()}</div>}<div><small>{x.type} · {x.published?"공개":"비공개"}</small><h3>{x.title}</h3><p>{x.subtitle}</p></div><div className="item-actions"><button onClick={()=>edit(x)}>수정</button><button onClick={()=>remove(x)}>삭제</button></div></article>)}</section>
 </div></main>
}
