export default function Sidebar() {
  return (
    <>
      {true && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity" />
      )}
      <aside
        className={`border-2 border-cyan-600 fixed inset-y-0 left-0 w-[280px] bg-background md:bg-transparent md:border-r-0 border-r border-border p-4 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${true ? "translate-x-0" : "-translate-x-full"}`}
      >
        Sidebar
        <div className="border-2 border-red-600 flex flex-col flex-1 ">
          {/* Logo */}
          <div className="border-2 border-yellow-600 flex items-center justify-between px-4 h-14 mb-6">
            <div className="border-2 border-cyan-600 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                E
              </div>
              <span className="text-base font-bold text-foreground">
                Dashboard
                <span className="font-normal text">Executive</span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
