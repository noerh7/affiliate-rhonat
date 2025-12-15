export default function Navbar() {
  return (
    <nav className="nav-blur w-full px-6 py-4 flex items-center justify-between rounded-2xl shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold">
          A
        </div>
        <div>
          <div className="text-base font-semibold">Affiliation Hub</div>
          <p className="text-sm text-gray-500">Pilotez vos performances au quotidien</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <span className="badge-soft">Beta</span>
        <button type="button" className="btn-ghost text-sm">Centre d'aide</button>
      </div>
    </nav>
  );
}

