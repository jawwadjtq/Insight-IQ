import {
  Languages,
  Check,
} from "lucide-react";

import {
  useLanguage,
  type Language,
} from "../../context/LanguageContext";

/* =========================================================
   LANGUAGE SETTINGS
========================================================= */

export default function LanguageSettings() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  /* =======================================================
     LANGUAGE OPTIONS
  ======================================================= */

  const languages: {
    value: Language;
    name: string;
    nativeName: string;
    description: string;
  }[] = [
    {
      value: "English",
      name: "English",
      nativeName: "English",
      description: t("englishDescription"),
    },
    {
      value: "Urdu",
      name: "Urdu",
      nativeName: "اردو",
      description: t("urduDescription"),
    },
    {
      value: "Spanish",
      name: "Spanish",
      nativeName: "Español",
      description: t("spanishDescription"),
    },
    {
      value: "French",
      name: "French",
      nativeName: "Français",
      description: t("frenchDescription"),
    },
  ];

  /* =======================================================
     CHANGE LANGUAGE
  ======================================================= */

  const handleLanguageChange = (
    newLanguage: Language
  ) => {
    setLanguage(newLanguage);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-8
        text-slate-900

        dark:border-slate-800
        dark:bg-slate-900
        dark:text-white
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl

            bg-blue-100
            text-blue-600

            dark:bg-blue-600/20
            dark:text-blue-400
          "
        >
          <Languages size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {t("language")}
          </h2>

          <p
            className="
              mt-1
              text-slate-500
              dark:text-slate-400
            "
          >
            {t("languageDescription")}
          </p>
        </div>
      </div>

      {/* =====================================================
          CURRENT LANGUAGE
      ===================================================== */}

      <div
        className="
          mb-8
          rounded-2xl
          border
          border-blue-500/20
          bg-blue-500/5
          p-5
        "
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="
                text-sm
                font-medium
                text-slate-500
                dark:text-slate-400
              "
            >
              {t("currentLanguage")}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold">
                {language}
              </h3>

              <span
                className="
                  rounded-full
                  bg-emerald-500/10
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-emerald-600

                  dark:text-emerald-400
                "
              >
                {t("active")}
              </span>
            </div>
          </div>

          <div
            className="
              rounded-xl
              bg-white
              px-4
              py-3
              text-sm
              font-medium
              text-slate-600
              shadow-sm

              dark:bg-slate-800
              dark:text-slate-300
            "
          >
            {t("workspaceLanguage")}
          </div>
        </div>
      </div>

      {/* =====================================================
          LANGUAGE OPTIONS
      ===================================================== */}

      <div>
        <h3
          className="
            mb-4
            text-lg
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          {t("selectLanguage")}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {languages.map((item) => {
            const selected =
              language === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  handleLanguageChange(
                    item.value
                  )
                }
                aria-pressed={selected}
                className={`
                  group
                  relative
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition-all
                  duration-200

                  ${
                    selected
                      ? `
                        border-blue-500
                        bg-blue-50
                        shadow-md
                        ring-2
                        ring-blue-500/20

                        dark:bg-blue-600/10
                      `
                      : `
                        border-slate-200
                        bg-slate-50

                        hover:-translate-y-0.5
                        hover:border-blue-400
                        hover:shadow-md

                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:hover:border-slate-500
                      `
                  }
                `}
              >
                {/* =================================================
                    CHECK
                ================================================= */}

                {selected && (
                  <div
                    className="
                      absolute
                      right-4
                      top-4
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-600
                      text-white
                    "
                  >
                    <Check size={16} />
                  </div>
                )}

                {/* =================================================
                    LANGUAGE ICON
                ================================================= */}

                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    text-xl
                    font-bold
                    transition-colors

                    ${
                      selected
                        ? `
                          bg-blue-600
                          text-white
                        `
                        : `
                          bg-slate-200
                          text-slate-700

                          dark:bg-slate-700
                          dark:text-slate-200
                        `
                    }
                  `}
                >
                  {item.nativeName.charAt(0)}
                </div>

                {/* =================================================
                    LANGUAGE NAME
                ================================================= */}

                <div className="mt-4 pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className="
                        text-lg
                        font-semibold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {item.name}
                    </h4>

                    <span
                      className="
                        text-sm
                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      {item.nativeName}
                    </span>
                  </div>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          AUTO SAVE INFORMATION
      ===================================================== */}

      <div
        className="
          mt-8
          rounded-xl
          border
          border-blue-500/20
          bg-blue-500/5
          px-4
          py-3
        "
      >
        <p
          className="
            text-sm
            text-slate-600
            dark:text-slate-300
          "
        >
          <span className="font-semibold text-blue-500">
            {t("saved")}
          </span>{" "}
          {t("languageSaved")}
        </p>
      </div>
    </div>
  );
}