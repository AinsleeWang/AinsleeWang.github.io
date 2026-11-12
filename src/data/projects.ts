// Public projects, newest list order for /projects/ (docs: the copy is locked
// in design-ref/editorial/pages-copy.md; do not extend it).
export interface Project {
  name: string;
  year: number;
  description: string;
  stack: string[];
  links: { live?: string; source: string };
}

export const PROJECTS: Project[] = [
  {
    name: 'wit.et',
    year: 2026,
    description: '你正在看的這個網站。紙面排版、中英混排的字體規則，幾乎不用 JavaScript。',
    stack: ['Astro', 'CSS', 'design tokens'],
    links: { source: 'https://github.com/AinsleeWang/AinsleeWang.github.io' },
  },
  {
    name: 'taipei-village-seismic-check',
    year: 2026,
    description:
      '輸入臺北市的地址，查看所在的里的危老風險分數，並在 2D／3D 地圖上疊合圖層；另有一份用手機填的單棟初篩表單。分數是一個里的平均狀況，不是單棟的耐震評估。兩人團隊作品。',
    stack: ['MapLibre GL', 'deck.gl', 'Python'],
    links: {
      live: 'https://ainsleewang.github.io/taipei-village-seismic-check/',
      source: 'https://github.com/AinsleeWang/taipei-village-seismic-check',
    },
  },
  {
    name: 'lolesports-rolster',
    year: 2026,
    description: 'Mark the players you like! 一個標記喜歡的英雄聯盟職業選手的單頁小工具。',
    stack: ['React', 'Vite', 'Tailwind', 'Zustand'],
    links: {
      live: 'https://ainsleewang.github.io/lolesports-rolster/',
      source: 'https://github.com/AinsleeWang/lolesports-rolster',
    },
  },
  {
    name: 'ETL_Sports_Data_Valorization',
    year: 2026,
    description:
      '一套 ETL 流程的架構紀錄：把健身社群 app 匯出的 Excel，轉成跨梯次的參與報表和個人趨勢圖。這個 repo 目前只有文件，程式碼尚未公開。',
    stack: ['Python', 'pandas', 'Chart.js'],
    links: { source: 'https://github.com/AinsleeWang/ETL_Sports_Data_Valorization' },
  },
  {
    name: 'Island-Disaster-Survival-App',
    year: 2025,
    description:
      '為沒有網路的災難情境設計的 Android app：用指南針和步數做離線避難導航，內建避難所資料、物資清單、摩斯電碼求救訊號與醫療卡。研究原型，還不是正式產品。',
    stack: ['Kotlin', 'Jetpack Compose', 'Room'],
    links: { source: 'https://github.com/AinsleeWang/Island-Disaster-Survival-App' },
  },
];
