/** Shown instantly while a cafe's menu loads. */
export default function Loading() {
  return (
    <>
      <header className="top" aria-hidden><div className="skel" style={{ width: 160, height: 36 }} /></header>
      <main className="page" aria-busy="true" aria-label="Loading">
        <div className="skel" style={{ height: 200, borderRadius: 28 }} />
        <div className="cafe-cols">
          <div className="cats">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 40 }} />)}</div>
          <div className="menu-col"><div className="menu-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 124, borderRadius: 20 }} />)}</div></div>
          <div className="skel" style={{ flex: '1 1 300px', height: 260, borderRadius: 24 }} />
        </div>
      </main>
    </>
  );
}
