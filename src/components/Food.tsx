/** Food visual: the photo when set, otherwise the emoji on the cafe's soft colour. */
export function Food(props: { emoji: string; imageUrl?: string | null; color: string; size: number; fontSize: number; radius?: number }) {
  return (
    <div className="food" style={{ width: props.size, height: props.size, background: props.color, fontSize: props.fontSize, borderRadius: props.radius }}>
      {props.imageUrl ? <img src={props.imageUrl} alt="" /> : props.emoji}
    </div>
  );
}

export function Veg({ veg }: { veg: boolean }) {
  return <span className={veg ? 'veg' : 'veg nv'} title={veg ? 'Veg' : 'Non-veg'} />;
}
