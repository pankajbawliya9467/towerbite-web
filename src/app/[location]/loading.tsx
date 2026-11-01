/** Shown instantly while the location page loads, so a click feels immediate. */
export default function Loading() {
  return (
    <>
      <header className="top" aria-hidden><div className="skel" style={{ width: 160, height: 36 }} /><div className="skel" style={{ flex: 1, maxWidth: 760, height: 40 }} /></header>
      <main className="page" aria-busy="true" aria-label="Loading">
        <div className="hero-row">
          <div className="skel" style={{ flex: '999 1 640px', height: 150, borderRadius: 20 }} />
          <div className="skel hide-sm" style={{ flex: '1 1 420px', height: 150, borderRadius: 20 }} />
        </div>
        <div className="extras">
          <div className="skel" style={{ height: 120, borderRadius: 18 }} />
          <div className="skel" style={{ height: 120, borderRadius: 18 }} />
        </div>
        <div className="skel" style={{ width: 260, height: 28, marginTop: 28 }} />
        <div className="cafes" style={{ marginTop: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skel" style={{ height: 220, borderRadius: 18 }} />)}
        </div>
      </main>
    </>
  );
}
