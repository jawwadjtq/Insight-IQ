import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

/* =========================================================
   LANGUAGE TYPE
========================================================= */

export type Language =
  | "English"
  | "Urdu"
  | "Spanish"
  | "French";

/* =========================================================
   LANGUAGE CONTEXT TYPE
========================================================= */

interface LanguageContextType {
  language: Language;

  setLanguage: (
    language: Language
  ) => void;

  t: (key: string) => string;
}

/* =========================================================
   CONTEXT
========================================================= */

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations: Record<
  Language,
  Record<string, string>
> = {
  /* =======================================================
     ENGLISH
  ======================================================= */

  English: {
    /* =====================================================
       NAVIGATION
    ===================================================== */

    dashboard: "Dashboard",
    upload: "Upload Data",
    analytics: "Analytics",
    aiAnalyst: "AI Analyst",
    reports: "Reports",
    settings: "Settings",

    /* =====================================================
       GENERAL
    ===================================================== */

    overview: "Overview",
    workspace: "Workspace",
    notifications: "Notifications",
    appearance: "Appearance",
    language: "Language",
    chartSettings: "Chart Settings",
    aiSettings: "AI Settings",
    viewSettings: "View Settings",
    planBilling: "Plan & Billing",

    welcome: "Welcome to InsightIQ",
    uploadData: "Upload your data",
    analyzeData: "Analyze your data",
    generateReport: "Generate Report",

    saveSettings: "Save Settings",
    resetDefaults: "Reset Defaults",

    /* =====================================================
       THEME
    ===================================================== */

    theme: "Theme",

    light: "Light",
    dark: "Dark",
    system: "System",

    lightDescription:
      "Use a bright interface with a light background.",

    darkDescription:
      "Use a dark interface that is easier on the eyes.",

    systemDescription:
      "Automatically match your device appearance.",

    /* =====================================================
       FONT SIZE
    ===================================================== */

    fontSize: "Font Size",

    small: "Small",
    medium: "Medium",
    large: "Large",

    /* =====================================================
       LANGUAGE
    ===================================================== */

    english: "English",
    urdu: "Urdu",
    spanish: "Spanish",
    french: "French",

    currentLanguage: "Current Language",
    selectLanguage: "Select Language",
    active: "Active",
    workspaceLanguage: "Workspace Language",

    languageSaved:
      "Your language preference is saved automatically.",

    saved: "Saved",

    languageDescription:
      "Choose the language used throughout your InsightIQ workspace.",

    englishDescription:
      "Use English throughout InsightIQ.",

    urduDescription:
      "Use Urdu throughout InsightIQ.",

    spanishDescription:
      "Use Spanish throughout InsightIQ.",

    frenchDescription:
      "Use French throughout InsightIQ.",

    /* =====================================================
       PLAN
    ===================================================== */

    free: "Free",
    pro: "Pro",
    enterprise: "Enterprise",

    /* =====================================================
       STATUS
    ===================================================== */

    online: "Online",
    offline: "Offline",

    loading: "Loading...",
    noData: "No data available",

    /* =====================================================
       PRIVACY
    ===================================================== */

    privacySecurity: "Privacy & Security",
    aboutInsightIQ: "About InsightIQ",

    /* =====================================================
       CHART SETTINGS
    ===================================================== */

    chartSettingsDescription:
      "Customize how charts and visualizations appear throughout InsightIQ.",

    defaultChartType:
      "Default Chart Type",

    barChart: "Bar Chart",

    barChartDescription:
      "Compare values across different categories.",

    lineChart: "Line Chart",

    lineChartDescription:
      "Track trends and changes over time.",

    areaChart: "Area Chart",

    areaChartDescription:
      "Visualize trends with filled areas.",

    displayOptions:
      "Display Options",

    showGrid:
      "Show Grid",

    showGridDescription:
      "Display grid lines to make charts easier to read.",

    showLegend:
      "Show Legend",

    showLegendDescription:
      "Display chart legends and data series information.",

    showTooltip:
      "Show Tooltips",

    showTooltipDescription:
      "Display detailed information when hovering over chart elements.",

    chartAnimations:
      "Chart Animations",

    chartAnimationsDescription:
      "Enable smooth animations when charts load or update.",

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    emailReports:
      "Email Reports",

    analysisCompleted:
      "Analysis Completed",

    aiInsights:
      "AI Insights",

    securityAlerts:
      "Security Alerts",

    allNotifications:
      "All Notifications",

    notificationDescription:
      "Control which InsightIQ notifications you receive.",

    /* =====================================================
       AI
    ===================================================== */

    aiEnabled:
      "AI Enabled",

    aiModel:
      "AI Model",

    aiResponseStyle:
      "AI Response Style",

    aiAutoInsights:
      "Automatic Insights",

    aiRecommendations:
      "AI Recommendations",

    aiAnomalyDetection:
      "Anomaly Detection",

    concise:
      "Concise",

    balanced:
      "Balanced",

    detailed:
      "Detailed",

    /* =====================================================
       VIEW
    ===================================================== */

    compactMode:
      "Compact Mode",

    showAnimations:
      "Show Animations",

    /* =====================================================
       PLAN & BILLING
    ===================================================== */

    currentPlan:
      "Current Plan",

    upgradePlan:
      "Upgrade Plan",

    billing:
      "Billing",

    usage:
      "Usage",

    /* =====================================================
       COMMON ACTIONS
    ===================================================== */

    cancel:
      "Cancel",

    confirm:
      "Confirm",

    apply:
      "Apply",

    close:
      "Close",

    delete:
      "Delete",

    edit:
      "Edit",

    enable:
      "Enable",

    disable:
      "Disable",

    yes:
      "Yes",

    no:
      "No",
  },

  /* =======================================================
     URDU
  ======================================================= */

  Urdu: {
    /* =====================================================
       NAVIGATION
    ===================================================== */

    dashboard: "ڈیش بورڈ",
    upload: "ڈیٹا اپ لوڈ",
    analytics: "تجزیات",
    aiAnalyst: "اے آئی تجزیہ کار",
    reports: "رپورٹس",
    settings: "ترتیبات",

    /* =====================================================
       GENERAL
    ===================================================== */

    overview: "جائزہ",
    workspace: "ورک اسپیس",
    notifications: "اطلاعات",
    appearance: "ظاہری شکل",
    language: "زبان",
    chartSettings: "چارٹ کی ترتیبات",
    aiSettings: "اے آئی کی ترتیبات",
    viewSettings: "ویو کی ترتیبات",
    planBilling: "پلان اور بلنگ",

    welcome: "InsightIQ میں خوش آمدید",
    uploadData: "اپنا ڈیٹا اپ لوڈ کریں",
    analyzeData: "اپنے ڈیٹا کا تجزیہ کریں",
    generateReport: "رپورٹ بنائیں",

    saveSettings: "ترتیبات محفوظ کریں",
    resetDefaults: "ڈیفالٹ بحال کریں",

    /* =====================================================
       THEME
    ===================================================== */

    theme: "تھیم",

    light: "روشن",
    dark: "ڈارک",
    system: "سسٹم",

    lightDescription:
      "روشن پس منظر کے ساتھ ہلکا انٹرفیس استعمال کریں۔",

    darkDescription:
      "آنکھوں کے لیے آسان ڈارک انٹرفیس استعمال کریں۔",

    systemDescription:
      "اپنے ڈیوائس کی ظاہری شکل کے مطابق خودکار طور پر تبدیل کریں۔",

    /* =====================================================
       FONT SIZE
    ===================================================== */

    fontSize: "فونٹ کا سائز",

    small: "چھوٹا",
    medium: "درمیانہ",
    large: "بڑا",

    /* =====================================================
       LANGUAGE
    ===================================================== */

    english: "انگریزی",
    urdu: "اردو",
    spanish: "ہسپانوی",
    french: "فرانسیسی",

    currentLanguage: "موجودہ زبان",
    selectLanguage: "زبان منتخب کریں",
    active: "فعال",
    workspaceLanguage: "ورک اسپیس کی زبان",

    languageSaved:
      "آپ کی زبان کی ترجیح خودکار طور پر محفوظ ہو جاتی ہے۔",

    saved: "محفوظ",

    languageDescription:
      "اپنی InsightIQ ورک اسپیس کے لیے زبان منتخب کریں۔",

    englishDescription:
      "InsightIQ میں انگریزی استعمال کریں۔",

    urduDescription:
      "InsightIQ میں اردو استعمال کریں۔",

    spanishDescription:
      "InsightIQ میں ہسپانوی استعمال کریں۔",

    frenchDescription:
      "InsightIQ میں فرانسیسی استعمال کریں۔",

    /* =====================================================
       PLAN
    ===================================================== */

    free: "مفت",
    pro: "پرو",
    enterprise: "انٹرپرائز",

    /* =====================================================
       STATUS
    ===================================================== */

    online: "آن لائن",
    offline: "آف لائن",

    loading: "لوڈ ہو رہا ہے...",
    noData: "کوئی ڈیٹا دستیاب نہیں",

    /* =====================================================
       PRIVACY
    ===================================================== */

    privacySecurity:
      "رازداری اور سیکیورٹی",

    aboutInsightIQ:
      "InsightIQ کے بارے میں",

    /* =====================================================
       CHART SETTINGS
    ===================================================== */

    chartSettingsDescription:
      "InsightIQ میں چارٹس اور ویژولائزیشن کی ظاہری شکل کو حسب ضرورت بنائیں۔",

    defaultChartType:
      "ڈیفالٹ چارٹ کی قسم",

    barChart:
      "بار چارٹ",

    barChartDescription:
      "مختلف کیٹیگریز کے درمیان ویلیوز کا موازنہ کریں۔",

    lineChart:
      "لائن چارٹ",

    lineChartDescription:
      "وقت کے ساتھ رجحانات اور تبدیلیوں کو دیکھیں۔",

    areaChart:
      "ایریا چارٹ",

    areaChartDescription:
      "بھرے ہوئے علاقوں کے ذریعے رجحانات کو دیکھیں۔",

    displayOptions:
      "ڈسپلے کے اختیارات",

    showGrid:
      "گرڈ دکھائیں",

    showGridDescription:
      "چارٹس کو آسانی سے پڑھنے کے لیے گرڈ لائنز دکھائیں۔",

    showLegend:
      "لیجنڈ دکھائیں",

    showLegendDescription:
      "چارٹ لیجنڈ اور ڈیٹا سیریز کی معلومات دکھائیں۔",

    showTooltip:
      "ٹول ٹپس دکھائیں",

    showTooltipDescription:
      "چارٹ کے عناصر پر ماؤس رکھنے پر تفصیلی معلومات دکھائیں۔",

    chartAnimations:
      "چارٹ اینیمیشنز",

    chartAnimationsDescription:
      "چارٹس لوڈ یا اپ ڈیٹ ہونے پر ہموار اینیمیشنز فعال کریں۔",

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    emailReports:
      "ای میل رپورٹس",

    analysisCompleted:
      "تجزیہ مکمل",

    aiInsights:
      "اے آئی انسائٹس",

    securityAlerts:
      "سیکیورٹی الرٹس",

    allNotifications:
      "تمام اطلاعات",

    notificationDescription:
      "منتخب کریں کہ InsightIQ سے کون سی اطلاعات موصول ہوں۔",

    /* =====================================================
       AI
    ===================================================== */

    aiEnabled:
      "اے آئی فعال",

    aiModel:
      "اے آئی ماڈل",

    aiResponseStyle:
      "اے آئی جواب کا انداز",

    aiAutoInsights:
      "خودکار انسائٹس",

    aiRecommendations:
      "اے آئی سفارشات",

    aiAnomalyDetection:
      "غیر معمولی ڈیٹا کی نشاندہی",

    concise:
      "مختصر",

    balanced:
      "متوازن",

    detailed:
      "تفصیلی",

    /* =====================================================
       VIEW
    ===================================================== */

    compactMode:
      "کمپیکٹ موڈ",

    showAnimations:
      "اینیمیشنز دکھائیں",

    /* =====================================================
       PLAN & BILLING
    ===================================================== */

    currentPlan:
      "موجودہ پلان",

    upgradePlan:
      "پلان اپ گریڈ کریں",

    billing:
      "بلنگ",

    usage:
      "استعمال",

    /* =====================================================
       COMMON ACTIONS
    ===================================================== */

    cancel:
      "منسوخ کریں",

    confirm:
      "تصدیق کریں",

    apply:
      "لاگو کریں",

    close:
      "بند کریں",

    delete:
      "حذف کریں",

    edit:
      "ترمیم کریں",

    enable:
      "فعال کریں",

    disable:
      "غیر فعال کریں",

    yes:
      "ہاں",

    no:
      "نہیں",
  },

  /* =======================================================
     SPANISH
  ======================================================= */

  Spanish: {
    /* =====================================================
       NAVIGATION
    ===================================================== */

    dashboard: "Panel",
    upload: "Subir datos",
    analytics: "Analítica",
    aiAnalyst: "Analista de IA",
    reports: "Informes",
    settings: "Configuración",

    /* =====================================================
       GENERAL
    ===================================================== */

    overview: "Descripción general",
    workspace: "Espacio de trabajo",
    notifications: "Notificaciones",
    appearance: "Apariencia",
    language: "Idioma",
    chartSettings: "Configuración de gráficos",
    aiSettings: "Configuración de IA",
    viewSettings: "Configuración de vista",
    planBilling: "Plan y facturación",

    welcome: "Bienvenido a InsightIQ",
    uploadData: "Sube tus datos",
    analyzeData: "Analiza tus datos",
    generateReport: "Generar informe",

    saveSettings: "Guardar configuración",
    resetDefaults:
      "Restablecer valores predeterminados",

    /* =====================================================
       THEME
    ===================================================== */

    theme: "Tema",

    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",

    lightDescription:
      "Usa una interfaz clara con un fondo luminoso.",

    darkDescription:
      "Usa una interfaz oscura más cómoda para la vista.",

    systemDescription:
      "Adapta automáticamente la apariencia a tu dispositivo.",

    /* =====================================================
       FONT SIZE
    ===================================================== */

    fontSize:
      "Tamaño de fuente",

    small:
      "Pequeño",

    medium:
      "Mediano",

    large:
      "Grande",

    /* =====================================================
       LANGUAGE
    ===================================================== */

    english: "Inglés",
    urdu: "Urdu",
    spanish: "Español",
    french: "Francés",

    currentLanguage:
      "Idioma actual",

    selectLanguage:
      "Seleccionar idioma",

    active:
      "Activo",

    workspaceLanguage:
      "Idioma del espacio de trabajo",

    languageSaved:
      "Tu preferencia de idioma se guarda automáticamente.",

    saved:
      "Guardado",

    languageDescription:
      "Elige el idioma utilizado en todo tu espacio de trabajo de InsightIQ.",

    englishDescription:
      "Usa inglés en todo InsightIQ.",

    urduDescription:
      "Usa urdu en todo InsightIQ.",

    spanishDescription:
      "Usa español en todo InsightIQ.",

    frenchDescription:
      "Usa francés en todo InsightIQ.",

    /* =====================================================
       PLAN
    ===================================================== */

    free: "Gratis",
    pro: "Pro",
    enterprise: "Empresa",

    /* =====================================================
       STATUS
    ===================================================== */

    online: "En línea",
    offline: "Sin conexión",

    loading:
      "Cargando...",

    noData:
      "No hay datos disponibles",

    /* =====================================================
       PRIVACY
    ===================================================== */

    privacySecurity:
      "Privacidad y seguridad",

    aboutInsightIQ:
      "Acerca de InsightIQ",

    /* =====================================================
       CHART SETTINGS
    ===================================================== */

    chartSettingsDescription:
      "Personaliza cómo aparecen los gráficos y las visualizaciones en InsightIQ.",

    defaultChartType:
      "Tipo de gráfico predeterminado",

    barChart:
      "Gráfico de barras",

    barChartDescription:
      "Compara valores entre diferentes categorías.",

    lineChart:
      "Gráfico de líneas",

    lineChartDescription:
      "Sigue tendencias y cambios a lo largo del tiempo.",

    areaChart:
      "Gráfico de áreas",

    areaChartDescription:
      "Visualiza tendencias mediante áreas rellenas.",

    displayOptions:
      "Opciones de visualización",

    showGrid:
      "Mostrar cuadrícula",

    showGridDescription:
      "Muestra líneas de cuadrícula para facilitar la lectura de los gráficos.",

    showLegend:
      "Mostrar leyenda",

    showLegendDescription:
      "Muestra las leyendas y la información de las series de datos.",

    showTooltip:
      "Mostrar información emergente",

    showTooltipDescription:
      "Muestra información detallada al pasar el cursor sobre los elementos del gráfico.",

    chartAnimations:
      "Animaciones de gráficos",

    chartAnimationsDescription:
      "Activa animaciones suaves cuando los gráficos se cargan o actualizan.",

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    emailReports:
      "Informes por correo electrónico",

    analysisCompleted:
      "Análisis completado",

    aiInsights:
      "Insights de IA",

    securityAlerts:
      "Alertas de seguridad",

    allNotifications:
      "Todas las notificaciones",

    notificationDescription:
      "Controla qué notificaciones de InsightIQ recibes.",

    /* =====================================================
       AI
    ===================================================== */

    aiEnabled:
      "IA activada",

    aiModel:
      "Modelo de IA",

    aiResponseStyle:
      "Estilo de respuesta de IA",

    aiAutoInsights:
      "Insights automáticos",

    aiRecommendations:
      "Recomendaciones de IA",

    aiAnomalyDetection:
      "Detección de anomalías",

    concise:
      "Conciso",

    balanced:
      "Equilibrado",

    detailed:
      "Detallado",

    /* =====================================================
       VIEW
    ===================================================== */

    compactMode:
      "Modo compacto",

    showAnimations:
      "Mostrar animaciones",

    /* =====================================================
       PLAN & BILLING
    ===================================================== */

    currentPlan:
      "Plan actual",

    upgradePlan:
      "Actualizar plan",

    billing:
      "Facturación",

    usage:
      "Uso",

    /* =====================================================
       COMMON ACTIONS
    ===================================================== */

    cancel:
      "Cancelar",

    confirm:
      "Confirmar",

    apply:
      "Aplicar",

    close:
      "Cerrar",

    delete:
      "Eliminar",

    edit:
      "Editar",

    enable:
      "Activar",

    disable:
      "Desactivar",

    yes:
      "Sí",

    no:
      "No",
  },

  /* =======================================================
     FRENCH
  ======================================================= */

  French: {
    /* =====================================================
       NAVIGATION
    ===================================================== */

    dashboard: "Tableau de bord",
    upload: "Importer des données",
    analytics: "Analytique",
    aiAnalyst: "Analyste IA",
    reports: "Rapports",
    settings: "Paramètres",

    /* =====================================================
       GENERAL
    ===================================================== */

    overview: "Vue d'ensemble",
    workspace: "Espace de travail",
    notifications: "Notifications",
    appearance: "Apparence",
    language: "Langue",
    chartSettings: "Paramètres des graphiques",
    aiSettings: "Paramètres de l'IA",
    viewSettings: "Paramètres d'affichage",
    planBilling: "Forfait et facturation",

    welcome: "Bienvenue sur InsightIQ",
    uploadData: "Importez vos données",
    analyzeData: "Analysez vos données",
    generateReport: "Générer un rapport",

    saveSettings:
      "Enregistrer les paramètres",

    resetDefaults:
      "Réinitialiser les valeurs par défaut",

    /* =====================================================
       THEME
    ===================================================== */

    theme: "Thème",

    light: "Clair",
    dark: "Sombre",
    system: "Système",

    lightDescription:
      "Utilisez une interface claire avec un arrière-plan lumineux.",

    darkDescription:
      "Utilisez une interface sombre plus confortable pour les yeux.",

    systemDescription:
      "Adaptez automatiquement l'apparence à votre appareil.",

    /* =====================================================
       FONT SIZE
    ===================================================== */

    fontSize:
      "Taille de police",

    small:
      "Petite",

    medium:
      "Moyenne",

    large:
      "Grande",

    /* =====================================================
       LANGUAGE
    ===================================================== */

    english: "Anglais",
    urdu: "Ourdou",
    spanish: "Espagnol",
    french: "Français",

    currentLanguage:
      "Langue actuelle",

    selectLanguage:
      "Sélectionner la langue",

    active:
      "Actif",

    workspaceLanguage:
      "Langue de l'espace de travail",

    languageSaved:
      "Votre préférence linguistique est enregistrée automatiquement.",

    saved:
      "Enregistré",

    languageDescription:
      "Choisissez la langue utilisée dans votre espace de travail InsightIQ.",

    englishDescription:
      "Utiliser l'anglais dans tout InsightIQ.",

    urduDescription:
      "Utiliser l'ourdou dans tout InsightIQ.",

    spanishDescription:
      "Utiliser l'espagnol dans tout InsightIQ.",

    frenchDescription:
      "Utiliser le français dans tout InsightIQ.",

    /* =====================================================
       PLAN
    ===================================================== */

    free:
      "Gratuit",

    pro:
      "Pro",

    enterprise:
      "Entreprise",

    /* =====================================================
       STATUS
    ===================================================== */

    online:
      "En ligne",

    offline:
      "Hors ligne",

    loading:
      "Chargement...",

    noData:
      "Aucune donnée disponible",

    /* =====================================================
       PRIVACY
    ===================================================== */

    privacySecurity:
      "Confidentialité et sécurité",

    aboutInsightIQ:
      "À propos d'InsightIQ",

    /* =====================================================
       CHART SETTINGS
    ===================================================== */

    chartSettingsDescription:
      "Personnalisez l'apparence des graphiques et des visualisations dans InsightIQ.",

    defaultChartType:
      "Type de graphique par défaut",

    barChart:
      "Graphique à barres",

    barChartDescription:
      "Comparez les valeurs entre différentes catégories.",

    lineChart:
      "Graphique linéaire",

    lineChartDescription:
      "Suivez les tendances et les changements au fil du temps.",

    areaChart:
      "Graphique en aires",

    areaChartDescription:
      "Visualisez les tendances avec des zones remplies.",

    displayOptions:
      "Options d'affichage",

    showGrid:
      "Afficher la grille",

    showGridDescription:
      "Affichez les lignes de grille pour faciliter la lecture des graphiques.",

    showLegend:
      "Afficher la légende",

    showLegendDescription:
      "Affichez les légendes et les informations sur les séries de données.",

    showTooltip:
      "Afficher les info-bulles",

    showTooltipDescription:
      "Affichez des informations détaillées lorsque vous survolez les éléments du graphique.",

    chartAnimations:
      "Animations des graphiques",

    chartAnimationsDescription:
      "Activez des animations fluides lorsque les graphiques se chargent ou se mettent à jour.",

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    emailReports:
      "Rapports par e-mail",

    analysisCompleted:
      "Analyse terminée",

    aiInsights:
      "Insights IA",

    securityAlerts:
      "Alertes de sécurité",

    allNotifications:
      "Toutes les notifications",

    notificationDescription:
      "Contrôlez les notifications InsightIQ que vous recevez.",

    /* =====================================================
       AI
    ===================================================== */

    aiEnabled:
      "IA activée",

    aiModel:
      "Modèle d'IA",

    aiResponseStyle:
      "Style de réponse de l'IA",

    aiAutoInsights:
      "Insights automatiques",

    aiRecommendations:
      "Recommandations IA",

    aiAnomalyDetection:
      "Détection des anomalies",

    concise:
      "Concis",

    balanced:
      "Équilibré",

    detailed:
      "Détaillé",

    /* =====================================================
       VIEW
    ===================================================== */

    compactMode:
      "Mode compact",

    showAnimations:
      "Afficher les animations",

    /* =====================================================
       PLAN & BILLING
    ===================================================== */

    currentPlan:
      "Forfait actuel",

    upgradePlan:
      "Mettre à niveau le forfait",

    billing:
      "Facturation",

    usage:
      "Utilisation",

    /* =====================================================
       COMMON ACTIONS
    ===================================================== */

    cancel:
      "Annuler",

    confirm:
      "Confirmer",

    apply:
      "Appliquer",

    close:
      "Fermer",

    delete:
      "Supprimer",

    edit:
      "Modifier",

    enable:
      "Activer",

    disable:
      "Désactiver",

    yes:
      "Oui",

    no:
      "Non",
  },
};

/* =========================================================
   PROVIDER
========================================================= */

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  /* =======================================================
     LOAD SAVED LANGUAGE
  ======================================================= */

  const [language, setLanguageState] =
    useState<Language>(() => {
      const saved =
        localStorage.getItem(
          "insightiq-language"
        ) as Language | null;

      if (
        saved === "English" ||
        saved === "Urdu" ||
        saved === "Spanish" ||
        saved === "French"
      ) {
        return saved;
      }

      return "English";
    });

  /* =======================================================
     APPLY LANGUAGE
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "insightiq-language",
      language
    );

    const root =
      document.documentElement;

    /*
     * Urdu uses RTL.
     * English, Spanish and French use LTR.
     */

    if (language === "Urdu") {
      root.lang = "ur";
      root.dir = "rtl";
    } else if (language === "Spanish") {
      root.lang = "es";
      root.dir = "ltr";
    } else if (language === "French") {
      root.lang = "fr";
      root.dir = "ltr";
    } else {
      root.lang = "en";
      root.dir = "ltr";
    }
  }, [language]);

  /* =======================================================
     CHANGE LANGUAGE
  ======================================================= */

  const setLanguage = (
    newLanguage: Language
  ) => {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "insightiq-language",
      newLanguage
    );
  };

  /* =======================================================
     TRANSLATION FUNCTION
  ======================================================= */

  const t = (
    key: string
  ): string => {
    return (
      translations[language]?.[key] ??
      translations.English[key] ??
      key
    );
  };

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}