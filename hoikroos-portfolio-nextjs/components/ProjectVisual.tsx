export default function ProjectVisual({ type = "karaoke", compact = false }: { type?: string; compact?: boolean }) {
  return (
    <div className={`project-visual ${type} ${compact ? "compact" : ""}`}>
      <div className="visual-top"><span></span><span></span><span></span><b>HK Dashboard</b></div>
      <div className="visual-body">
        <aside><i></i><i></i><i></i><i></i></aside>
        <main>
          <div className="mini-stats"><span></span><span></span><span></span></div>
          <div className="visual-chart"><div></div><div></div><div></div><div></div><div></div></div>
          <div className="visual-row"><span></span><span></span><span></span></div>
        </main>
      </div>
    </div>
  );
}
