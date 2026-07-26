import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
const allowed=new Set(["image/jpeg","image/png","image/webp","image/gif"]);
export async function POST(request:Request){
  const user=await getChatGPTUser();
  if(!user) return Response.json({error:"관리자 로그인이 필요합니다."},{status:401});
  const data=await request.formData(); const file=data.get("file");
  if(!(file instanceof File)||!allowed.has(file.type)) return Response.json({error:"JPG, PNG, WEBP, GIF 이미지만 업로드할 수 있습니다."},{status:400});
  if(file.size>12*1024*1024) return Response.json({error:"이미지는 12MB 이하여야 합니다."},{status:400});
  if(!env.MEDIA) return Response.json({error:"이미지 저장소를 사용할 수 없습니다."},{status:503});
  const ext=file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g,"")||"jpg";
  const key=`${Date.now()}-${crypto.randomUUID()}.${ext}`;
  await env.MEDIA.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type},customMetadata:{uploadedBy:user.email}});
  return Response.json({key,url:`/api/media/${encodeURIComponent(key)}`},{status:201});
}
