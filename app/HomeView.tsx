import { listContent, type ContentItem } from "../lib/content";

const base=(id:string,type:ContentItem["type"],title:string,subtitle:string,description:string,sortOrder:number):ContentItem=>({id,type,title,subtitle,description,imageKey:null,imageUrl:null,link:"",sortOrder,published:true,createdAt:0,updatedAt:0});
const fallback=[base("a1","artist","NOA","노아","장르의 경계를 흐리는 감각적인 보컬과 송라이팅.",1),base("a2","artist","LUNE","룬","차갑고 선명한 사운드로 새로운 장면을 만드는 아티스트.",2),base("a3","artist","DIVE","다이브","무대 위 에너지를 가장 솔직한 언어로 기록합니다.",3),base("r1","release","AFTERIMAGE","NOA · 1ST EP","잔상처럼 남는 다섯 개의 트랙.",1),base("r2","release","BLUE HOUR","LUNE · SINGLE","도시의 푸른 시간을 담은 새 싱글.",2),base("n1","news","SIMSIMENT, NEW CHAPTER","2026.07.26","새로운 목소리와 장면을 연결하는 simsiment의 시작.",1)];
function Placeholder({label}:{label:string}){return <div className="placeholder" aria-label={`${label} 이미지 준비 중`}><span>SIMSI</span><i/></div>}
async function getItems() {
  try {
    const items = await listContent();
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}

export default async function HomeClient(){
  const items = await getItems();
  const artists=items.filter(x=>x.type==="artist"),releases=items.filter(x=>x.type==="release"),news=items.filter(x=>x.type==="news");
  return <main>
    <header className="site-header"><a className="logo" href="#top">SIMSIM_ENT.</a>
      <input className="menu-toggle" id="menu-toggle" type="checkbox" aria-label="메뉴 열기" />
      <label className="menu-button" htmlFor="menu-toggle"><span className="menu-open">MENU</span><span className="menu-close">CLOSE</span></label>
      <nav className="nav">{[["ARTISTS","artists"],["RELEASES","releases"],["NEWS","news"],["ABOUT","about"]].map(([l,id])=><a key={id} href={`#${id}`}>{l}</a>)}<a href="mailto:hello@simsiment.com">CONTACT</a></nav>
    </header>
    <section className="hero" id="top"><p className="eyebrow">INDEPENDENT ENTERTAINMENT · SEOUL</p><h1 className="hero-acrostic" aria-label="AI Song DAW Flow"><span><b>A</b><i>I</i></span><span><b>S</b>ONG</span><span><b>D</b>AW</span><span><b>F</b>LOW</span></h1><div className="hero-bottom"><p>AI에서 시작해, 노래가 되고<br/>DAW를 지나 하나의 흐름이 됩니다.</p><span>SCROLL TO EXPLORE ↓</span></div></section>
    <section className="manifesto" id="about"><p>OUR PHILOSOPHY</p><h2>낯선 감각을 발견하고,<br/>가장 선명한 방식으로<br/><span>세상과 연결합니다.</span></h2></section>
    <section className="section artists" id="artists"><div className="section-heading"><p>01 / ARTISTS</p><h2>OUR<br/>VOICES</h2><span>{String(artists.length).padStart(2,"0")} ARTISTS</span></div><div className="artist-grid">{artists.map((x,i)=><article className="artist-card" key={x.id}><div className="media-frame">{x.imageUrl?<img src={x.imageUrl} alt={`${x.title} 프로필`}/>:<Placeholder label={x.title}/>}<span className="number">{String(i+1).padStart(2,"0")}</span></div><div><h3>{x.title}</h3><p>{x.subtitle}</p><small>{x.description}</small></div></article>)}</div></section>
    <section className="section releases" id="releases"><div className="section-heading inverse"><p>02 / RELEASES</p><h2>LATEST<br/><i>SOUNDS</i></h2><span>LISTEN NOW</span></div><div className="release-grid">{releases.map(x=><a className="release-card" href={x.link||"#releases"} key={x.id}><div className="album-art">{x.imageUrl?<img src={x.imageUrl} alt={`${x.title} 앨범 아트`}/>:<Placeholder label={x.title}/>}</div><h3>{x.title}</h3><p>{x.subtitle}</p><small>{x.description}</small></a>)}</div></section>
    <section className="section news" id="news"><div className="section-heading"><p>03 / NEWS</p><h2>WHAT&apos;S<br/>HAPPENING</h2></div><div className="news-list">{news.map(x=><a href={x.link||"#news"} key={x.id}><time>{x.subtitle}</time><h3>{x.title}</h3><p>{x.description}</p><span>↗</span></a>)}</div></section>
    <footer><p className="footer-mark">SIMSIMENT</p><div><p>MAKE THE NEXT SCENE.</p><a href="mailto:hello@simsiment.com">HELLO@SIMSIMENT.COM</a></div><div><p>SEOUL, SOUTH KOREA</p><a href="/admin">ADMIN</a></div><small>© 2026 SIMSIMENT. ALL RIGHTS RESERVED.</small></footer>
  </main>
}
