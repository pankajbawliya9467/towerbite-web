/** Shown at once while this page loads, so a click never feels ignored. */
export default function Loading() {
  return (
    <>
      <header className="top" aria-hidden><div className="skel" style={{ width: 160, height: 36 }} /></header>
      <main className="page" aria-busy="true" aria-label="Loading">
        <div className="skel" style={{ width: 240, height: 32 }} />
        <div className="skel" style={{ width: 380, maxWidth: '100%', height: 16, marginTop: 12 }} />
        <div className="lunch-grid" style={{ marginTop: 22 }}>
          {[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 150 }} />)}
        </div>
      </main>
    </>
  );
}
