import { Link, NavLink } from "react-router-dom";
import { MenuIcon, PeopleIcon } from "./icons.jsx";

/** ヘッダーのナビ項目。デスクトップのナビとモバイルのメニューで共有する。 */
const NAV_ITEMS = [
  { to: "/", label: "ホーム", end: true },
  { to: "/how-to", label: "使い方" },
  { to: "/faq", label: "よくある質問" },
];

export default function SiteHeader({ onLogoClick }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4 lg:max-w-6xl lg:px-8">
          <div className="flex items-center gap-2 lg:gap-3">
            <Link
              to="/"
              onClick={onLogoClick}
              className="flex items-center gap-2 lg:gap-3"
            >
              <PeopleIcon className="h-6 w-6 text-accent lg:h-7 lg:w-7" />
              <span className="text-lg font-bold lg:text-xl">
                みんなで決めるお店
              </span>
            </Link>
            <nav className="ml-4 hidden items-center gap-5 text-sm text-base-content/70 lg:flex">
              {NAV_ITEMS.filter((item) => item.to !== "/").map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `transition hover:text-base-content ${
                      isActive ? "font-semibold text-base-content" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* モバイル：ドロップダウンメニュー */}
          <div className="dropdown dropdown-end lg:hidden">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="メニュー"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <ul className="menu dropdown-content z-40 mt-2 w-52 gap-1 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lg">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-xl font-medium ${isActive ? "active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      {/* fixedヘッダーの高さ分だけ本文を押し下げるスペーサー */}
      <div className="h-16" aria-hidden />
    </>
  );
}
