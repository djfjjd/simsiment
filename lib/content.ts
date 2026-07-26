import { env } from "cloudflare:workers";

export type ContentType = "artist" | "release" | "news";
export type ContentItem = {
  id: string; type: ContentType; title: string; subtitle: string; description: string;
  imageKey: string | null; imageUrl: string | null; link: string; sortOrder: number;
  published: boolean; createdAt: number; updatedAt: number;
};

const schemaSql = `CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
  image_key TEXT, link TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
)`;
const indexSql = "CREATE INDEX IF NOT EXISTS content_items_type_sort_idx ON content_items(type, sort_order, created_at)";
const seeds = [
  ["artist-1","artist","NOA","노아","장르의 경계를 흐리는 감각적인 보컬과 송라이팅.",10],
  ["artist-2","artist","LUNE","룬","차갑고 선명한 사운드로 새로운 장면을 만드는 아티스트.",20],
  ["artist-3","artist","DIVE","다이브","무대 위 에너지를 가장 솔직한 언어로 기록합니다.",30],
  ["release-1","release","AFTERIMAGE","NOA · 1ST EP","잔상처럼 남는 다섯 개의 트랙.",10],
  ["release-2","release","BLUE HOUR","LUNE · SINGLE","도시의 푸른 시간을 담은 새 싱글.",20],
  ["news-1","news","SIMSIMENT, NEW CHAPTER","2026.07.26","새로운 목소리와 장면을 연결하는 simsiment의 시작.",10],
] as const;

function db() { if (!env.DB) throw new Error("D1 binding DB is unavailable"); return env.DB; }

export async function ensureContentStore() {
  const database = db();
  await database.batch([database.prepare(schemaSql), database.prepare(indexSql)]);
  const count = await database.prepare("SELECT COUNT(*) AS count FROM content_items").first<{count:number}>();
  if ((count?.count ?? 0) > 0) return;
  const now = Date.now();
  await database.batch(seeds.map((x) => database.prepare(
    "INSERT INTO content_items (id,type,title,subtitle,description,sort_order,published,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)"
  ).bind(x[0],x[1],x[2],x[3],x[4],x[5],now,now)));
}

function mapItem(row: Record<string, unknown>): ContentItem {
  const imageKey = (row.image_key as string | null) ?? null;
  return { id:String(row.id), type:row.type as ContentType, title:String(row.title),
    subtitle:String(row.subtitle ?? ""), description:String(row.description ?? ""), imageKey,
    imageUrl:imageKey ? `/api/media/${encodeURIComponent(imageKey)}` : null,
    link:String(row.link ?? ""), sortOrder:Number(row.sort_order ?? 0),
    published:Boolean(row.published), createdAt:Number(row.created_at), updatedAt:Number(row.updated_at) };
}

export async function listContent(includeDrafts=false) {
  await ensureContentStore();
  const result = await db().prepare(`SELECT * FROM content_items ${includeDrafts ? "" : "WHERE published = 1"} ORDER BY type, sort_order ASC, created_at DESC`).all<Record<string,unknown>>();
  return result.results.map(mapItem);
}

export async function saveContent(id: string|null, input: Omit<ContentItem,"id"|"imageUrl"|"createdAt"|"updatedAt">) {
  await ensureContentStore(); const now=Date.now(); const nextId=id||crypto.randomUUID();
  await db().prepare(`INSERT INTO content_items
    (id,type,title,subtitle,description,image_key,link,sort_order,published,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,subtitle=excluded.subtitle,
    description=excluded.description,image_key=excluded.image_key,link=excluded.link,
    sort_order=excluded.sort_order,published=excluded.published,updated_at=excluded.updated_at`)
    .bind(nextId,input.type,input.title,input.subtitle,input.description,input.imageKey,input.link,input.sortOrder,input.published?1:0,now,now).run();
  return nextId;
}

export async function removeContent(id:string) {
  await ensureContentStore();
  const existing=await db().prepare("SELECT image_key FROM content_items WHERE id=?").bind(id).first<{image_key:string|null}>();
  await db().prepare("DELETE FROM content_items WHERE id=?").bind(id).run();
  if(existing?.image_key && env.MEDIA) await env.MEDIA.delete(existing.image_key);
}
