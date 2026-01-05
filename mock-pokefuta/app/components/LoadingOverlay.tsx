export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 text-gray-900 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div aria-hidden="true" className="pokeball-swing">
          <div className="pokeball-shell">
            <span className="pokeball-top" />
            <span className="pokeball-bottom" />
            <span className="pokeball-line" />
            <span className="pokeball-button" />
          </div>
        </div>
        <p className="text-sm font-medium">Now Loading…</p>
      </div>
    </div>
  );
}
