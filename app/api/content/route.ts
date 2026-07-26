import { getChatGPTUser } from "../../chatgpt-auth";
import { listContent, saveContent, type ContentItem, type ContentType } from "../../../lib/content";
export const dynamic = "force-dynamic";
async function denied(){ return await getChatGPTUser() ? null : Response.json({error:"관리자 로그인이 필요합니다."},{status:401}); }
export async function GET(request:Request){
  const admin=new URL(request.url).searchParams.get("admin")==="1";
  if(admin){ const response=await denied(); if(response) return response; }
  return Response.json({items:await listContent(admin)});
}
export async function POST(request:Request){
  const response=await denied(); if(response) return response;
  const body=(await request.json()) as Partial<ContentItem>;
  const types:ContentType[]=["artist","release","news"];
  if(!body.title?.trim()||!body.type||!types.includes(body.type)) return Response.json({error:"유형과 제목은 필수입니다."},{status:400});
  const id=await saveContent(body.id??null,{type:body.type,title:body.title.trim(),subtitle:body.subtitle?.trim()??"",description:body.description?.trim()??"",imageKey:body.imageKey??null,link:body.link?.trim()??"",sortOrder:Number(body.sortOrder)||0,published:body.published!==false});
  return Response.json({id},{status:body.id?200:201});
}
