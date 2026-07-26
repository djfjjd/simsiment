"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ko" style={{ background: "#11110f" }}>
      <body style={{ margin: 0, background: "#11110f" }}>
        <main className="boot-fallback">
          <div>
            <h1>SIMSIMENT</h1>
            <p>화면을 불러오지 못했습니다.</p>
            <button className="save" type="button" onClick={reset}>
              다시 불러오기
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
