/** Shown instantly while the location page loads, so a click feels immediate. */
export default function Loading() {
  return (
    <>
      <header className="top" aria-hidden><div className="skel" style={{ width: 160, height: 36 }} /><div className="skel" style={{ flex: 1, maxWidth: 560, height: 44 }} /></header>
      <main className="page" aria-busy="true" aria-label="Loading">
        <div className="hero-row">
          <div className="skel" style={{ flex: '999 1 520px', height: 300, borderRadius: 28 }} />
          <div className="skel" style={{ flex: '1 1 320px', height: 300, borderRadius: 28 }} />
        </div>
        <div className="skel" style={{ width: 280, height: 32, marginTop: 40 }} />
        <div className="cafes" style={{ marginTop: 18 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 240, borderRadius: 22 }} />)}
        </div>
      </main>
    </>
  );
}
