'use client';

export function ConfirmDialog(props: { title: string; text: string; confirm: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="overlay" onClick={props.onCancel}>
      <div className="card dialog" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="h2">{props.title}</div>
        <p className="sub" style={{ marginTop: 8 }}>{props.text}</p>
        <div className="dialog-actions">
          <button className="btn sec" onClick={props.onCancel}>Cancel</button>
          <button className="btn" onClick={props.onConfirm}>{props.confirm}</button>
        </div>
      </div>
    </div>
  );
}
