"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="boot-fallback">
      <div>
        <h1>SIMSIMENT</h1>
        <p>화면을 불러오지 못했습니다.</p>
        <button className="save" type="button" onClick={reset}>
          다시 불러오기
        </button>
      </div>
    </main>
  );
}
