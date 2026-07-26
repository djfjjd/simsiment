import { getChatGPTUser } from "../../../chatgpt-auth";
import { removeContent } from "../../../../lib/content";
export async function DELETE(_request:Request,context:{params:Promise<{id:string}>}){
  if(!await getChatGPTUser()) return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const {id}=await context.params; await removeContent(id); return Response.json({ok:true});
}
