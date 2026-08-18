import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  Bell,
  Check,
  ChevronDown,
  Command,
  Globe2,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";

import type { Language } from "../../context/LanguageContext";

/* =========================================================
   TYPES
========================================================= */

type MenuType =
  | "notifications"
  | "language"
  | "account"
  | null;

interface SearchItem {
  labelKey: string;
  fallback: string;
  path: string;
  keywords: string[];
}

/* =========================================================
   SEARCH ITEMS
========================================================= */

const SEARCH_ITEMS: SearchItem[] = [
  {
    labelKey: "dashboard",
    fallback: "Dashboard",
    path: "/",
    keywords: [
      "dashboard",
      "home",
      "overview",
      "workspace",
    ],
  },
  {
    labelKey: "upload",
    fallback: "Upload Data",
    path: "/upload",
    keywords: [
      "upload",
      "data",
      "csv",
      "excel",
      "pdf",
      "file",
    ],
  },
  {
    labelKey: "analytics",
    fallback: "Analytics",
    path: "/analytics",
    keywords: [
      "analytics",
      "analysis",
      "charts",
      "data",
      "visualization",
    ],
  },
  {
    labelKey: "aiAnalyst",
    fallback: "AI Analyst",
    path: "/ai",
    keywords: [
      "ai",
      "analyst",
      "artificial intelligence",
      "insights",
      "assistant",
    ],
  },
  {
    labelKey: "reports",
    fallback: "Reports",
    path: "/reports",
    keywords: [
      "reports",
      "report",
      "executive",
      "pdf",
    ],
  },
  {
    labelKey: "settings",
    fallback: "Settings",
    path: "/settings",
    keywords: [
      "settings",
      "preferences",
      "configuration",
      "appearance",
      "language",
      "notifications",
      "ai settings",
    ],
  },
];

/* =========================================================
   LANGUAGES
========================================================= */

const LANGUAGES: {
  value: Language;
  labelKey: string;
  native: string;
  flag: string;
}[] = [
  {
    value: "English",
    labelKey: "english",
    native: "English",
    flag: "🇬🇧",
  },
  {
    value: "Urdu",
    labelKey: "urdu",
    native: "اردو",
    flag: "🇵🇰",
  },
  {
    value: "Spanish",
    labelKey: "spanish",
    native: "Español",
    flag: "🇪🇸",
  },
  {
    value: "French",
    labelKey: "french",
    native: "Français",
    flag: "🇫🇷",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function TopNavbar() {
  /* =======================================================
     ROUTER
  ======================================================= */

  const navigate = useNavigate();
  const location = useLocation();

  /* =======================================================
     LANGUAGE
  ======================================================= */

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  /* =======================================================
     STATE
  ======================================================= */

  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.documentElement.classList.contains(
      "dark"
    );
  });

  const [search, setSearch] = useState("");

  const [openMenu, setOpenMenu] =
    useState<MenuType>(null);

  const [searchFocused, setSearchFocused] =
    useState(false);

  /* =======================================================
     REFS
  ======================================================= */

  const searchRef =
    useRef<HTMLInputElement | null>(null);

  const menuRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     TRANSLATION FALLBACK
  ======================================================= */

  function translate(
    key: string,
    fallback: string
  ): string {
    const translated = t(key);

    if (
      !translated ||
      translated === key
    ) {
      return fallback;
    }

    return translated;
  }

  /* =======================================================
     SEARCH RESULTS
  ======================================================= */

  const normalizedSearch =
    search.trim().toLowerCase();

  const searchResults =
    normalizedSearch.length === 0
      ? []
      : SEARCH_ITEMS.filter((item) => {
          const translatedLabel =
            translate(
              item.labelKey,
              item.fallback
            ).toLowerCase();

          const searchableText = [
            translatedLabel,
            item.fallback.toLowerCase(),
            ...item.keywords,
          ].join(" ");

          return searchableText.includes(
            normalizedSearch
          );
        }).slice(0, 5);

  /* =======================================================
     THEME SYNC
  ======================================================= */

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateThemeState = () => {
      setDark(
        document.documentElement.classList.contains(
          "dark"
        )
      );
    };

    updateThemeState();

    const observer =
      new MutationObserver(
        updateThemeState
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =======================================================
     CLICK OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (!menuRef.current) {
        return;
      }

      if (
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenMenu(null);
      }
    }

    if (openMenu) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [openMenu]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    function handleEscape(
      event: globalThis.KeyboardEvent
    ) {
      if (event.key !== "Escape") {
        return;
      }

      setOpenMenu(null);

      const input = searchRef.current;

      if (
        input &&
        document.activeElement === input
      ) {
        input.blur();
        setSearchFocused(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     COMMAND / SEARCH SHORTCUT
  ======================================================= */

  useEffect(() => {
    function handleShortcut(
      event: globalThis.KeyboardEvent
    ) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (!isShortcut) {
        return;
      }

      event.preventDefault();

      const input = searchRef.current;

      if (input) {
        input.focus();
      }

      setOpenMenu(null);
      setSearchFocused(true);
    }

    document.addEventListener(
      "keydown",
      handleShortcut
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleShortcut
      );
    };
  }, []);

  /* =======================================================
     SEARCH NAVIGATION
  ======================================================= */

  function handleSearchNavigate(
    path: string
  ) {
    setSearch("");
    setSearchFocused(false);
    setOpenMenu(null);

    navigate(path);
  }

  /* =======================================================
     SEARCH KEYBOARD
  ======================================================= */

  function handleSearchKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      if (searchResults.length > 0) {
        handleSearchNavigate(
          searchResults[0].path
        );
      }

      return;
    }

    if (event.key === "Escape") {
      setSearch("");

      const input = searchRef.current;

      if (input) {
        input.blur();
      }

      setSearchFocused(false);
    }
  }

  /* =======================================================
     THEME
  ======================================================= */

  function toggleTheme() {
    const nextDark = !dark;

    document.documentElement.classList.toggle(
      "dark",
      nextDark
    );

    localStorage.setItem(
      "insightiq-theme",
      nextDark ? "dark" : "light"
    );

    setDark(nextDark);
  }

  /* =======================================================
     MENU TOGGLE
  ======================================================= */

  function toggleMenu(
    menu: Exclude<MenuType, null>
  ) {
    setOpenMenu((current) =>
      current === menu
        ? null
        : menu
    );
  }

  /* =======================================================
     LANGUAGE CHANGE
  ======================================================= */

  function handleLanguageChange(
    nextLanguage: Language
  ) {
    setLanguage(nextLanguage);
    setOpenMenu(null);
  }

  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  function isActive(
    path: string
  ) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(
      path
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header
      className="
        sticky
        top-0
        z-40
        hidden
        border-b
        border-slate-200/80
        bg-white/80
        backdrop-blur-xl

        dark:border-slate-800/80
        dark:bg-slate-950/80

        lg:block
      "
    >
      <div
        className="
          flex
          h-[76px]
          items-center
          justify-between
          px-6
          xl:px-8
        "
      >
        {/* =================================================
            SEARCH AREA
        ================================================= */}

        <div className="relative w-full max-w-xl">
          <Search
            size={18}
            strokeWidth={2}
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              z-10
              -translate-y-1/2
              text-slate-400
              dark:text-slate-500
            "
          />

          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onFocus={() =>
              setSearchFocused(true)
            }
            onKeyDown={
              handleSearchKeyDown
            }
            aria-label={translate(
              "search",
              "Search InsightIQ"
            )}
            placeholder={translate(
              "searchPlaceholder",
              "Search InsightIQ..."
            )}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-11
              pr-20
              text-sm
              text-slate-900
              outline-none
              transition-all
              duration-200

              placeholder:text-slate-400

              hover:border-slate-300

              focus:border-blue-500
              focus:bg-white
              focus:ring-4
              focus:ring-blue-500/10

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-white

              dark:hover:border-slate-700

              dark:focus:border-blue-500
              dark:focus:bg-slate-900
            "
          />

          {/* =================================================
              SEARCH SHORTCUT
          ================================================= */}

          {!search && (
            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                hidden
                -translate-y-1/2
                items-center
                gap-1
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2
                py-1
                text-[11px]
                font-medium
                text-slate-400
                shadow-sm
                sm:flex

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-500
              "
            >
              <Command size={11} />
              <span>K</span>
            </div>
          )}

          {/* =================================================
              CLEAR SEARCH
          ================================================= */}

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");

                const input =
                  searchRef.current;

                if (input) {
                  input.focus();
                }
              }}
              aria-label={translate(
                "clearSearch",
                "Clear search"
              )}
              className="
                absolute
                right-3
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700

                dark:hover:bg-slate-800
                dark:hover:text-slate-200
              "
            >
              <X size={15} />
            </button>
          )}

          {/* =================================================
              SEARCH RESULTS
          ================================================= */}

          {searchFocused &&
            normalizedSearch.length > 0 && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-[calc(100%+8px)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-2
                  shadow-xl
                  shadow-slate-900/10

                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:shadow-black/30
                "
              >
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <p
                      className="
                        px-3
                        pb-2
                        pt-1
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      {translate(
                        "searchResults",
                        "Results"
                      )}
                    </p>

                    {searchResults.map(
                      (item) => {
                        const label =
                          translate(
                            item.labelKey,
                            item.fallback
                          );

                        return (
                          <button
                            key={item.path}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();

                              handleSearchNavigate(
                                item.path
                              );
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-2.5
                              text-left
                              transition-colors

                              hover:bg-slate-50

                              dark:hover:bg-slate-800
                            "
                          >
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-50
                                text-blue-600

                                dark:bg-blue-500/10
                                dark:text-blue-400
                              "
                            >
                              <Search
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-medium
                                  text-slate-800

                                  dark:text-slate-200
                                "
                              >
                                {label}
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  truncate
                                  text-xs
                                  text-slate-400
                                  dark:text-slate-500
                                "
                              >
                                {item.path}
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div
                      className="
                        mx-auto
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-400

                        dark:bg-slate-800
                        dark:text-slate-500
                      "
                    >
                      <Search size={18} />
                    </div>

                    <p
                      className="
                        mt-3
                        text-sm
                        font-medium
                        text-slate-700

                        dark:text-slate-200
                      "
                    >
                      {translate(
                        "noSearchResults",
                        "No results found"
                      )}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400

                        dark:text-slate-500
                      "
                    >
                      {translate(
                        "tryDifferentSearch",
                        "Try a different search term."
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}

        <div
          ref={menuRef}
          className="
            relative
            ml-6
            flex
            items-center
            gap-2
          "
        >
          {/* =================================================
              THEME
          ================================================= */}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              dark
                ? translate(
                    "switchToLight",
                    "Switch to light mode"
                  )
                : translate(
                    "switchToDark",
                    "Switch to dark mode"
                  )
            }
            title={
              dark
                ? translate(
                    "light",
                    "Light"
                  )
                : translate(
                    "dark",
                    "Dark"
                  )
            }
            className="
              group
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              transition-all
              duration-200

              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-900

              focus:outline-none
              focus:ring-4
              focus:ring-blue-500/10

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-400

              dark:hover:border-slate-700
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            {dark ? (
              <Sun
                size={19}
                className="
                  transition-transform
                  duration-300
                  group-hover:rotate-12
                "
              />
            ) : (
              <Moon
                size={19}
                className="
                  transition-transform
                  duration-300
                  group-hover:-rotate-12
                "
              />
            )}
          </button>

          {/* =================================================
              LANGUAGE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              toggleMenu("language")
            }
            aria-expanded={
              openMenu === "language"
            }
            aria-haspopup="menu"
            aria-label={translate(
              "language",
              "Language"
            )}
            title={translate(
              "language",
              "Language"
            )}
            className={[
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              openMenu === "language"
                ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white",
            ].join(" ")}
          >
            <Globe2 size={19} />
          </button>

          {/* =================================================
              LANGUAGE MENU
          ================================================= */}

          {openMenu === "language" && (
            <div
              role="menu"
              className="
                absolute
                right-[108px]
                top-[calc(100%+10px)]
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-xl
                shadow-slate-900/10

                dark:border-slate-800
                dark:bg-slate-900
                dark:shadow-black/30
              "
            >
              <div className="px-3 pb-2 pt-1">
                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-900

                    dark:text-white
                  "
                >
                  {translate(
                    "selectLanguage",
                    "Select Language"
                  )}
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    text-slate-400

                    dark:text-slate-500
                  "
                >
                  {translate(
                    "workspaceLanguage",
                    "Workspace Language"
                  )}
                </p>
              </div>

              <div className="space-y-1">
                {LANGUAGES.map(
                  (item) => {
                    const selected =
                      language ===
                      item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={
                          selected
                        }
                        onClick={() =>
                          handleLanguageChange(
                            item.value
                          )
                        }
                        className={[
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          selected
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                        ].join(" ")}
                      >
                        <span
                          className="text-lg"
                          aria-hidden="true"
                        >
                          {item.flag}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {translate(
                              item.labelKey,
                              item.native
                            )}
                          </p>

                          <p
                            className="
                              text-[11px]
                              text-slate-400
                              dark:text-slate-500
                            "
                          >
                            {item.native}
                          </p>
                        </div>

                        {selected && (
                          <Check
                            size={16}
                            className="
                              shrink-0
                              text-blue-600
                              dark:text-blue-400
                            "
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              toggleMenu("notifications")
            }
            aria-expanded={
              openMenu === "notifications"
            }
            aria-haspopup="dialog"
            aria-label={translate(
              "notifications",
              "Notifications"
            )}
            title={translate(
              "notifications",
              "Notifications"
            )}
            className={[
              "relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              openMenu === "notifications"
                ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white",
            ].join(" ")}
          >
            <Bell size={19} />

            <span
              className="
                absolute
                right-2.5
                top-2.5
                h-2
                w-2
                rounded-full
                bg-blue-500
                ring-2
                ring-white

                dark:ring-slate-900
              "
            />
          </button>

          {/* =================================================
              NOTIFICATION PANEL
          ================================================= */}

          {openMenu === "notifications" && (
            <div
              role="dialog"
              aria-label={translate(
                "notifications",
                "Notifications"
              )}
              className="
                absolute
                right-[58px]
                top-[calc(100%+10px)]
                w-[340px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-xl
                shadow-slate-900/10

                dark:border-slate-800
                dark:bg-slate-900
                dark:shadow-black/30
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  px-4
                  py-3

                  dark:border-slate-800
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900

                      dark:text-white
                    "
                  >
                    {translate(
                      "notifications",
                      "Notifications"
                    )}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      text-slate-400

                      dark:text-slate-500
                    "
                  >
                    {translate(
                      "notificationCenter",
                      "Notification center"
                    )}
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    text-blue-600

                    dark:bg-blue-500/10
                    dark:text-blue-400
                  "
                >
                  1
                </span>
              </div>

              <div className="p-3">
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-blue-100
                    bg-blue-50/60
                    p-3

                    dark:border-blue-500/20
                    dark:bg-blue-500/5
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-100
                      text-blue-600

                      dark:bg-blue-500/10
                      dark:text-blue-400
                    "
                  >
                    <Bell size={17} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-800

                        dark:text-slate-200
                      "
                    >
                      {translate(
                        "welcomeNotification",
                        "Welcome to InsightIQ"
                      )}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-slate-500

                        dark:text-slate-400
                      "
                    >
                      {translate(
                        "welcomeNotificationDescription",
                        "Your workspace is ready. Upload data to start analyzing your business."
                      )}
                    </p>

                    <p
                      className="
                        mt-2
                        text-[10px]
                        font-medium
                        text-blue-600

                        dark:text-blue-400
                      "
                    >
                      {translate(
                        "justNow",
                        "Just now"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  border-t
                  border-slate-200
                  px-4
                  py-3

                  dark:border-slate-800
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    navigate("/settings");
                  }}
                  className="
                    w-full
                    text-left
                    text-xs
                    font-medium
                    text-slate-500
                    transition
                    hover:text-blue-600

                    dark:text-slate-400
                    dark:hover:text-blue-400
                  "
                >
                  {translate(
                    "notificationSettings",
                    "Notification settings"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            className="
              mx-2
              hidden
              h-8
              w-px
              bg-slate-200

              dark:bg-slate-800

              xl:block
            "
          />

          {/* =================================================
              USER PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              toggleMenu("account")
            }
            aria-expanded={
              openMenu === "account"
            }
            aria-haspopup="menu"
            aria-label={translate(
              "accountMenu",
              "Account menu"
            )}
            className={[
              "group flex items-center gap-3 rounded-xl border px-2 py-1.5 text-left transition-all duration-200",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              openMenu === "account"
                ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-900",
            ].join(" ")}
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-600
                to-indigo-600
                text-white
                shadow-sm
                shadow-blue-600/20
              "
            >
              <User size={18} />
            </div>

            <div className="hidden min-w-0 xl:block">
              <p
                className="
                  max-w-[110px]
                  truncate
                  text-sm
                  font-semibold
                  text-slate-900

                  dark:text-white
                "
              >
                {translate(
                  "admin",
                  "Admin"
                )}
              </p>

              <p
                className="
                  max-w-[110px]
                  truncate
                  text-xs
                  text-slate-500

                  dark:text-slate-400
                "
              >
                InsightIQ
              </p>
            </div>

            <ChevronDown
              size={16}
              className={[
                "hidden text-slate-400 transition-transform duration-200 xl:block",
                openMenu === "account"
                  ? "rotate-180"
                  : "",
              ].join(" ")}
            />
          </button>

          {/* =================================================
              ACCOUNT MENU
          ================================================= */}

          {openMenu === "account" && (
            <div
              role="menu"
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-xl
                shadow-slate-900/10

                dark:border-slate-800
                dark:bg-slate-900
                dark:shadow-black/30
              "
            >
              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-slate-50
                  p-3

                  dark:bg-slate-800/60
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-blue-600
                    to-indigo-600
                    text-white
                  "
                >
                  <User size={18} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-slate-900

                      dark:text-white
                    "
                  >
                    {translate(
                      "admin",
                      "Admin"
                    )}
                  </p>

                  <p
                    className="
                      truncate
                      text-xs
                      text-slate-500

                      dark:text-slate-400
                    "
                  >
                    InsightIQ
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  navigate("/");
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  isActive("/")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <LayoutDashboard size={17} />

                <span className="flex-1">
                  {translate(
                    "dashboard",
                    "Dashboard"
                  )}
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  navigate("/settings");
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  isActive("/settings")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <Settings size={17} />

                <span className="flex-1">
                  {translate(
                    "settings",
                    "Settings"
                  )}
                </span>
              </button>

              <div
                className="
                  my-2
                  h-px
                  bg-slate-200

                  dark:bg-slate-800
                "
              />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  text-slate-500
                  transition-colors

                  hover:bg-red-50
                  hover:text-red-600

                  dark:text-slate-400
                  dark:hover:bg-red-500/10
                  dark:hover:text-red-400
                "
              >
                <LogOut size={17} />

                <span>
                  {translate(
                    "signOut",
                    "Sign out"
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}