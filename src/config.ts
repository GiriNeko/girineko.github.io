export type FormState = 'sheathed' | 'unsheathed';
export type ToggleState = 'on' | 'off';
export type ColorScheme = 'light' | 'dark';

export type ThemeMeta = {
  color: string;
  scheme: ColorScheme;
};

export type WallpaperSet = {
  desktop: string;
  mobile: string;
  alt: string;
  width: number;
  height: number;
};

export type DiaryFace = {
  kicker: string;
  hello: string;
  name: string;
  aside: string;
  struck: boolean;
  caption: string;
};

export type SocialLink = {
  href: string;
  label: string;
  external: boolean;
};

export const site = {
  title: '老周的小站',
  description: 'GiriNeko 的流光札记。先当人，再当剑主。',
  url: 'https://ineko.cc',
  favicon: 'https://static.ineko.cc/images/favicon.png',
  lang: 'zh-CN',
} as const;

export const socials = [
  { href: 'https://blog.ineko.cc', label: '我的博客 | The Blog', external: false },
] as const satisfies readonly SocialLink[];

export const storageKeys = {
  form: 'ineko-form',
  flash: 'ineko-flash',
  auto: 'ineko-auto',
} as const;

/** 首次访问、没有 localStorage 时的默认值。 */
export const defaults = {
  auto: 'on',
  flash: 'on',
} as const satisfies Record<'auto' | 'flash', ToggleState>;

export const theme = {
  sheathed: {
    color: '#F3E6D4',
    scheme: 'light',
  },
  unsheathed: {
    color: '#070B0E',
    scheme: 'dark',
  },
} as const satisfies Record<FormState, ThemeMeta>;

export const labels = {
  auto: '听凭剑引',
  flash: '飞光',
  sheath: '合鞘',
  unsheath: '出鞘',
} as const;

export const wallpapers = {
  query: '(orientation: portrait), (max-aspect-ratio: 4/5)',
  sheathed: {
    desktop: '/wallpapers/desktop.webp',
    mobile: '/wallpapers/mobile.webp',
    alt: '叶瞬光 · 合鞘',
    width: 1200,
    height: 675,
  },
  unsheathed: {
    desktop: '/wallpapers/desktop-dark.webp',
    mobile: '/wallpapers/mobile-dark.webp',
    alt: '叶瞬光 · 明心境',
    width: 1200,
    height: 675,
  },
} as const satisfies { query: string } & Record<FormState, WallpaperSet>;

export const diary = {
  date: '2026-01-20',
  dateLabel: '01 / 20',
  sheathed: {
    kicker: '云岿札记 · 合鞘',
    hello: 'Hi',
    name: "I'm GiriNeko",
    aside: '一条会说话的咸鱼',
    struck: true,
    caption: '把日常小事写下来。桂花糕还热着的时候，剑匣是合上的。',
  },
  unsheathed: {
    kicker: '青溟出鞘 · 明心境',
    hello: '青溟司命',
    name: '小光 · GiriNeko',
    aside: '先当人，再当剑主',
    struck: false,
    caption: '知道代价，还是接剑。记忆会淡，字还在。',
  },
} as const satisfies { date: string; dateLabel: string } & Record<FormState, DiaryFace>;

export const footer = {
  credit: 'Made with ❤ by GiriNeko',
  upyun: {
    href: 'https://console.upyun.com/register/?invite=Byj3-zRKw',
    src: 'https://static.ineko.cc/icons/upyun_logo2.png',
    alt: '又拍云',
  },
  icp: {
    href: 'https://beian.miit.gov.cn',
    label: '赣ICP备 2020013131号',
  },
  moe: {
    href: 'https://icp.gov.moe',
    keyword: 'https://icp.gov.moe/?keyword=24682580',
    label: '萌ICP备',
    number: '24682580号',
  },
} as const;
