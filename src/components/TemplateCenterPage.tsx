import { useMemo, useState } from 'react';
import {
  Bell,
  Camera,
  ChevronDown,
  Grid2x2,
  Home,
  LayoutTemplate,
  Menu,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  SquarePlus,
  UserRound,
  UsersRound,
} from 'lucide-react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';

type TemplateCategory = '全部' | '海报' | '电商/直播' | 'PPT' | '印刷/办公' | '小红书';
type CardVariant = 'ad' | 'red' | 'placeholder' | 'sunset' | 'wall' | 'frost' | 'frostBlue' | 'fruit' | 'suite' | 'landscape';

type TemplateCard = {
  id: string;
  title: string;
  category: TemplateCategory;
  tags: string[];
  variant: CardVariant;
  aspect: number;
  badge?: 'NEW' | '套装';
};

const navItems = [
  { label: '首页', icon: Home },
  { label: '模板', icon: LayoutTemplate },
  { label: 'AI工具', icon: Sparkles },
  { label: '创建', icon: SquarePlus },
  { label: '我的', icon: UserRound },
  { label: '团队', icon: UsersRound },
];

const filterGroups = [
  { label: '分类：', items: ['全部', '海报', '抖音/小红书', '微信', '电商/直播', 'PPT', '印刷/办公', 'H5', '社交生活', '饭圈应援', '视频', '趣玩物料', '插画元素'], active: '全部' },
  { label: '场景：', items: ['推荐', '手机海报', '全屏海报', '小红书配图', '公众号首图', '长图海报', '每日一签', '邀请函', '小红书套装', 'PPT16:9', '商品主图', '简历', '直播间背景', '横版海报', '名片', '长页H5', '宣传单'], active: '推荐', more: true },
  { label: '行业：', items: ['全部', '通用', '教育培训', '餐饮美食', '金融理财', '地产家居', '精神文明', '科技互联网', '医疗保健', '休闲娱乐', '旅游出行', '文体娱乐', '美容美发', '电商', '零售行业', '生活服务', '商业服务', '文化建设'], active: '全部', more: true },
] as const;

const templateColumns: TemplateCard[][] = [
  [
    { id: 'ai-suite', title: 'AI商品套图批量制作', category: '电商/直播', tags: ['商品主图', '推荐'], variant: 'ad', aspect: 0.56 },
    { id: 'frost-mountain', title: '霜降', category: '海报', tags: ['每日一签', '推荐'], variant: 'landscape', aspect: 0.47 },
  ],
  [
    { id: 'long-march', title: '长征胜利90周年', category: '海报', tags: ['手机海报', '推荐'], variant: 'red', aspect: 0.465, badge: 'NEW' },
    { id: 'frost-branch', title: '霜降', category: '海报', tags: ['每日一签'], variant: 'frost', aspect: 0.47 },
  ],
  [
    { id: 'loading-card', title: '模板加载中', category: '海报', tags: ['推荐'], variant: 'placeholder', aspect: 0.465, badge: 'NEW' },
    { id: 'frost-blue', title: 'FROST DESCENT', category: '海报', tags: ['每日一签'], variant: 'frostBlue', aspect: 0.47 },
  ],
  [
    { id: 'long-march-sunrise', title: '信仰如炬', category: '海报', tags: ['全屏海报', '推荐'], variant: 'sunset', aspect: 0.465, badge: 'NEW' },
    { id: 'orange-bird', title: '霜降', category: '海报', tags: ['每日一签'], variant: 'fruit', aspect: 0.47 },
  ],
  [
    { id: 'great-wall', title: '长征胜利90周年', category: '海报', tags: ['全屏海报', '推荐'], variant: 'wall', aspect: 0.465, badge: 'NEW' },
    { id: 'frost-suite-1', title: '霜降套装', category: '海报', tags: ['小红书套装'], variant: 'suite', aspect: 2.3, badge: '套装' },
    { id: 'frost-suite-2', title: '霜降套装2', category: '海报', tags: ['小红书套装'], variant: 'suite', aspect: 2.3 },
  ],
  [
    { id: 'frost-orange', title: '霜降', category: '海报', tags: ['每日一签', '推荐'], variant: 'frost', aspect: 0.465, badge: '套装' },
    { id: 'frost-cream', title: 'FROST DESCENT', category: '海报', tags: ['每日一签'], variant: 'landscape', aspect: 0.47 },
  ],
];

function PosterBadge({ badge }: { badge?: TemplateCard['badge'] }) {
  if (!badge) return null;
  return <span className={`absolute left-0 top-0 z-10 rounded-br-[9px] px-2 py-1 text-[10px] font-semibold text-white ${badge === 'NEW' ? 'bg-[#ff4348]' : 'bg-[#227bf0]'}`}>{badge}</span>;
}

function PosterArt({ card }: { card: TemplateCard }) {
  if (card.variant === 'placeholder') return <div className="h-full w-full bg-[#f1f4fa]" />;

  if (card.variant === 'ad') {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#dff7f3]">
        <div className="absolute left-[19%] top-[8%] h-[31%] w-[62%] rounded-[14%] bg-[#f7ffff] shadow-[0_10px_20px_rgba(79,164,163,.12)]" />
        <div className="absolute left-[29%] top-[12%] h-[22%] w-[23%] rotate-[-12deg] rounded-[12%] bg-[linear-gradient(135deg,#d6eff1,#7fa9a3)]" />
        <div className="absolute left-[54%] top-[16%] h-[19%] w-[21%] rotate-[9deg] rounded-[13%] bg-[linear-gradient(135deg,#e4f8f5,#80ab9f)]" />
        <div className="absolute left-[12%] top-[35%] h-[16%] w-[28%] rotate-[11deg] rounded-[12%] bg-[linear-gradient(135deg,#e4f8f5,#8cafa5)]" />
        <div className="absolute right-[9%] top-[37%] h-[23%] w-[25%] rounded-[11%] bg-[#c3e9e0] shadow-[0_9px_18px_rgba(55,140,137,.14)]" />
        <div className="absolute left-[40%] top-[38%] h-[11%] w-[25%] rounded-full border-[8px] border-[#9ce3d5] border-l-transparent border-b-transparent rotate-[38deg]" />
        <div className="absolute inset-x-0 bottom-[17%] text-center text-[clamp(22px,2.3vw,38px)] font-black leading-[1.08] tracking-[-0.06em] text-[#1b2734]">AI商品套图<br />批量制作</div>
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 rounded-full bg-[#70cdb6] px-5 py-2 text-[clamp(9px,0.8vw,14px)] font-semibold text-white shadow-[0_6px_10px_rgba(63,163,139,.2)]">✦ 立即制作 ›</div>
      </div>
    );
  }

  if (card.variant === 'red' || card.variant === 'wall') {
    const isWall = card.variant === 'wall';
    return (
      <div className={`relative h-full w-full overflow-hidden ${isWall ? 'bg-[linear-gradient(145deg,#8f1b21_0%,#dc633c_42%,#f4c075_100%)]' : 'bg-[linear-gradient(145deg,#cb3c19_0%,#e86e39_58%,#ffc871_100%)]'}`}>
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:6px_6px]" />
        <div className="absolute left-[10%] top-[12%] text-[clamp(26px,2.8vw,46px)] font-black leading-[.9] tracking-[-0.13em] text-[#fff3d0] [font-family:STKaiti,KaiTi,serif]">长征<br />胜利</div>
        <div className="absolute right-[10%] top-[10%] rounded-full border border-white/60 px-1 text-[7px] text-white/80">YOUR LOGO</div>
        <div className="absolute left-[35%] top-[38%] h-[17%] w-[30%] rounded-full bg-[#fff0a9] shadow-[0_0_36px_rgba(255,230,149,.8)]" />
        <div className="absolute bottom-[-5%] left-[-10%] h-[39%] w-[78%] rotate-[-10deg] rounded-[50%_50%_0_0] bg-[#a82e2b] shadow-[55px_-20px_0_8px_rgba(207,74,43,.95)]" />
        <div className="absolute bottom-[18%] right-[5%] h-[22%] w-[52%] rotate-[13deg] rounded-[50%_50%_0_0] bg-[#ca4c37]" />
        {isWall ? <div className="absolute bottom-[25%] left-[25%] h-1.5 w-[58%] rotate-[-12deg] bg-[#f9d69b] shadow-[0_14px_0_2px_rgba(248,207,143,.8),0_28px_0_4px_rgba(248,207,143,.7)]" /> : null}
        <div className="absolute inset-x-0 bottom-[6%] text-center text-[clamp(9px,0.8vw,14px)] font-medium text-[#fff2cb]">1936—2026<br /><span className="text-[8px] tracking-[.08em]">纪念红军长征胜利90周年</span></div>
      </div>
    );
  }

  if (card.variant === 'sunset') {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#fff3df_0%,#f6c49b_49%,#bb543e_100%)]">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(164,87,45,.45)_1px,transparent_1px)] [background-size:7px_7px]" />
        <div className="absolute left-[7%] top-[9%] text-[clamp(24px,2.7vw,43px)] font-black leading-[.9] tracking-[-0.1em] text-[#9c322a] [font-family:STKaiti,KaiTi,serif]">信仰如炬</div>
        <div className="absolute left-[10%] top-[22%] text-[8px] tracking-[.12em] text-[#9c5540]">延续红色血脉 · 走进时代征程</div>
        <div className="absolute left-[39%] top-[40%] h-[17%] w-[30%] rounded-full bg-[#ffcc6f] shadow-[0_0_32px_rgba(255,195,96,.75)]" />
        <div className="absolute bottom-[-3%] left-[-8%] h-[49%] w-[72%] rotate-[11deg] rounded-[50%_50%_0_0] bg-[#c45439] shadow-[40px_-19px_0_4px_rgba(228,116,61,.9)]" />
        <div className="absolute bottom-[8%] right-[8%] h-[25%] w-[48%] rotate-[-19deg] rounded-[50%_50%_0_0] bg-[#d76543]" />
        <div className="absolute inset-x-0 bottom-[6%] text-center text-[8px] font-medium text-[#fff3d2]">1936—2026<br /><span className="tracking-[.08em]">纪念红军长征胜利90周年</span></div>
      </div>
    );
  }

  if (card.variant === 'frostBlue') {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#c4efff_0%,#6bb7db_58%,#356b95_100%)]">
        <div className="absolute inset-x-[10%] top-[9%] text-center text-[clamp(11px,1vw,18px)] font-light tracking-[.12em] text-white">FROST'S DESCENT</div>
        <div className="absolute inset-x-0 top-[18%] text-center text-[clamp(9px,.7vw,13px)] text-white/85">霜降 · 秋深露重</div>
        <div className="absolute left-[37%] top-[33%] text-[clamp(31px,3vw,49px)] font-black text-[#102b3c] [font-family:STKaiti,KaiTi,serif]">霜降</div>
        <div className="absolute bottom-[-10%] left-[-5%] h-[42%] w-[110%] rotate-[-4deg] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(229,249,255,.72))]" />
        <div className="absolute bottom-[8%] right-[7%] text-[7px] tracking-[.18em] text-white/80">三十四节气 · SOLAR TERM</div>
      </div>
    );
  }

  if (card.variant === 'fruit' || card.variant === 'frost') {
    return (
      <div className={`relative h-full w-full overflow-hidden ${card.variant === 'fruit' ? 'bg-[linear-gradient(155deg,#fffdf0,#f3dfb4)]' : 'bg-[linear-gradient(155deg,#fffef9,#e8e7e4)]'}`}>
        <div className="absolute -right-[5%] top-[12%] h-[10%] w-[70%] rotate-[28deg] rounded-full border-[3px] border-[#6b6556] border-b-transparent border-l-transparent" />
        <div className="absolute right-[20%] top-[23%] h-[14%] w-[14%] rounded-full bg-[#ea7b2a] shadow-[inset_-8px_-4px_0_rgba(158,72,31,.25)]" />
        <div className="absolute right-[37%] top-[31%] h-[11%] w-[12%] rounded-full bg-[#f19a3b] shadow-[inset_-6px_-3px_0_rgba(158,72,31,.2)]" />
        <div className="absolute right-[9%] top-[35%] h-[12%] w-[13%] rounded-full bg-[#dc6b25]" />
        <div className="absolute left-[11%] top-[8%] text-[clamp(25px,2.7vw,43px)] font-black leading-[.86] text-[#1f2528] [font-family:STKaiti,KaiTi,serif]">霜降</div>
        <div className="absolute bottom-[11%] left-[9%] text-[8px] leading-4 text-[#4e514e]">岁岁平安 · 柿柿如意<br />霜林染红，鸟鸣清秋</div>
        <div className="absolute bottom-[6%] right-[9%] h-[9%] w-[8%] rounded-[50%_50%_50%_10%] bg-[#d68a45] rotate-[-12deg]" />
      </div>
    );
  }

  if (card.variant === 'suite') {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#fffdf5,#e8ded3)]">
        <div className="absolute left-[7%] top-[25%] text-[clamp(10px,1vw,18px)] font-light tracking-[.08em] text-[#dfb490]">FROST DESCENT</div>
        <div className="absolute right-[8%] top-[20%] text-[clamp(9px,.8vw,14px)] italic text-[#2f2d2c]">Solar Term</div>
        <div className="absolute bottom-[18%] left-[45%] text-[clamp(16px,1.4vw,24px)] font-black text-[#272425] [font-family:STKaiti,KaiTi,serif]">霜降</div>
        <div className="absolute bottom-[-45%] right-[-3%] h-[120%] w-[42%] rounded-full border border-[#d1c2ad] opacity-60" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#f7f5ed,#d3d8d8_54%,#82939c)]">
      <div className="absolute left-[12%] top-[13%] text-[clamp(28px,2.8vw,44px)] font-black leading-[.86] text-[#1f2428] [font-family:STKaiti,KaiTi,serif]">霜降</div>
      <div className="absolute bottom-[9%] left-[12%] h-[22%] w-[75%] rotate-[-5deg] rounded-[55%_55%_0_0] bg-[linear-gradient(180deg,#d8ddda,#88979a)]" />
      <div className="absolute bottom-[22%] left-[38%] h-[13%] w-[35%] rotate-[-15deg] rounded-[50%] bg-[#bec8c6]" />
      <div className="absolute bottom-[8%] right-[10%] text-[7px] tracking-[.12em] text-[#51585c]">THE SOLAR TERM</div>
    </div>
  );
}

function SideNav({ onBackToDirectory, onBackToHome }: { onBackToDirectory: () => void; onBackToHome: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[68px] flex-col items-center border-r border-[#e6ebf5] bg-[#f3f7ff] pt-5">
      <button type="button" onClick={onBackToDirectory} className="mb-7 text-[#67758d]" title="返回目录"><Menu className="h-[18px] w-[18px]" /></button>
      <div className="flex w-full flex-col items-center gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === '模板';
          return <button key={item.label} type="button" onClick={() => item.label === '首页' ? onBackToHome() : undefined} className={`flex w-[48px] flex-col items-center gap-1 rounded-[10px] py-2 text-[12px] ${active ? 'bg-[#dceaff] font-medium text-[#1974eb]' : 'text-[#34435d] hover:bg-white/80'}`}><Icon className={`h-[20px] w-[20px] ${active ? 'fill-[#1974eb]/20' : ''}`} /><span>{item.label}</span></button>;
        })}
      </div>
      <div className="mt-auto flex w-full flex-col items-center gap-1.5 pb-3 text-[12px] text-[#34435d]"><button type="button" className="flex w-[48px] flex-col items-center gap-1 rounded-[10px] py-2"><UserRound className="h-5 w-5" />成员</button><button type="button" className="flex w-[48px] flex-col items-center gap-1 rounded-[10px] py-2"><Settings2 className="h-5 w-5" />管理</button></div>
    </aside>
  );
}

export function TemplateCenterPage({ onBackToDirectory, onBackToHome }: { onBackToDirectory: () => void; onBackToHome: () => void }) {
  const [templateMode, setTemplateMode] = useState<'设计模板' | 'AI模板'>('设计模板');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ 分类: '全部', 场景: '推荐', 行业: '全部' });
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('热门推荐');
  const [notice, setNotice] = useState('');

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 1800);
  };

  const visibleColumns = useMemo(() => templateColumns.map((column) => column.filter((card) => {
    const categoryFilter = selectedFilters['分类'];
    const sceneFilter = selectedFilters['场景'];
    const keyword = query.trim();
    const matchesCategory = categoryFilter === '全部' || card.category === categoryFilter || (categoryFilter === '抖音/小红书' && card.category === '小红书');
    const matchesScene = sceneFilter === '推荐' || card.tags.includes(sceneFilter);
    const matchesQuery = !keyword || `${card.title}${card.category}${card.tags.join('')}`.includes(keyword);
    return matchesCategory && matchesScene && matchesQuery;
  })), [query, selectedFilters]);
  const visibleCount = visibleColumns.reduce((count, column) => count + column.length, 0);

  const selectFilter = (label: string, item: string) => {
    setSelectedFilters((current) => ({ ...current, [label.replace('：', '')]: item }));
    showNotice(`已切换${item}`);
  };

  const submitSearch = () => {
    setQuery(searchInput);
    showNotice(searchInput.trim() ? `已搜索“${searchInput.trim()}”` : '已展示全部模板');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-[#242b3d]">
      <SideNav onBackToDirectory={onBackToDirectory} onBackToHome={onBackToHome} />
      <header className="fixed left-[68px] right-0 top-0 z-20 flex h-[68px] items-center border-b border-[#edf0f5] bg-white px-[31px]">
        <button type="button" onClick={onBackToHome} className="flex h-[31px] w-[110px] shrink-0 items-center"><img src={cktAiEcomLogo} alt="创客贴" className="h-[31px] w-auto" /></button>
        <div className="ml-[30px] flex h-[45px] min-w-0 max-w-[900px] flex-1 items-center rounded-[13px] border border-[#e2e6ed] bg-white px-3 text-[#a1aaba] focus-within:border-[#cfd6e3]"><Search className="h-[18px] w-[18px] shrink-0 text-[#aeb6c4]" /><input value={searchInput} onChange={(event) => setSearchInput(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="输入关键词搜索你想要的模板或素材" className="min-w-0 flex-1 bg-transparent px-2 text-[14px] text-[#343d51] outline-none placeholder:text-[#9ca7b8]" /><button type="button" onClick={() => showNotice('图片搜索即将上线')} className="p-1 text-[#a0aab9]" aria-label="图片搜索"><Camera className="h-[18px] w-[18px]" /></button></div>
        <div className="ml-auto flex items-center gap-6 pl-6 text-[#202b41]"><Grid2x2 className="h-[19px] w-[19px]" /><span className="relative"><Bell className="h-[19px] w-[19px]" /><i className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4c45] text-[10px] not-italic text-white">4</i></span><span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e2e4e7] bg-[linear-gradient(135deg,#f5dfcc,#8ba0b6)] text-white shadow-sm"><UserRound className="h-5 w-5" /></span></div>
      </header>

      <main className="ml-[68px] min-h-screen pt-[68px]">
        <section className="px-[32px] pt-[12px]">
          <div className="inline-flex rounded-[10px] border border-[#e1e5ed] bg-white p-1"><button type="button" onClick={() => setTemplateMode('设计模板')} className={`rounded-[7px] px-[15px] py-[7px] text-[14px] ${templateMode === '设计模板' ? 'bg-[#f0f3f8] font-semibold text-[#303849]' : 'text-[#303849]'}`}>设计模板</button><button type="button" onClick={() => { setTemplateMode('AI模板'); showNotice('AI模板频道即将上线'); }} className={`rounded-[7px] px-[15px] py-[7px] text-[14px] ${templateMode === 'AI模板' ? 'bg-[#f0f3f8] font-semibold text-[#303849]' : 'text-[#303849]'}`}>AI模板</button></div>
          <div className="mt-[11px] border-b border-[#e5e9f0] pb-[10px]">
            {filterGroups.map((group) => <div key={group.label} className="flex min-h-[43px] items-start gap-3 py-[4px] text-[14px]"><span className="w-[48px] shrink-0 pt-[7px] text-[#8a98b1]">{group.label}</span><div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-[8px] gap-y-[3px]">{group.items.map((item) => { const selected = selectedFilters[group.label.replace('：', '')] === item; return <button key={item} type="button" onClick={() => selectFilter(group.label, item)} className={`rounded-[7px] px-[11px] py-[6px] whitespace-nowrap ${selected ? 'bg-[#f0f3f8] font-semibold text-[#283346]' : 'text-[#2f3748] hover:bg-[#f7f8fb]'}`}>{item}</button>; })}{group.more ? <button type="button" onClick={() => showNotice(`${group.label}更多筛选即将展开`)} className="ml-auto flex shrink-0 items-center gap-1 rounded-[7px] px-3 py-[6px] text-[#2f3748]">更多<ChevronDown className="h-3 w-3" /></button> : null}</div></div>)}
          </div>
        </section>

        <section className="px-[32px]">
          <div className="flex min-h-[73px] items-center justify-between gap-5 border-b border-[#e9edf3]">
            <div className="flex items-center gap-[25px] text-[14px]"><button type="button" onClick={() => setSort('热门推荐')} className={`${sort === '热门推荐' ? 'font-semibold text-[#222b3c]' : 'text-[#69758b]'}`}>热门推荐</button><button type="button" onClick={() => setSort('最新上传')} className={`${sort === '最新上传' ? 'font-semibold text-[#222b3c]' : 'text-[#69758b]'}`}>最新上传</button><button type="button" onClick={() => setSort('最多使用')} className={`${sort === '最多使用' ? 'font-semibold text-[#222b3c]' : 'text-[#69758b]'}`}>最多使用</button></div>
            <div className="flex shrink-0 items-center gap-[28px] text-[14px] text-[#30394d]"><button type="button" onClick={() => showNotice('颜色筛选即将展开')} className="flex items-center gap-2"><span className="h-[19px] w-[19px] rounded-full bg-[conic-gradient(#ff6957,#ffc64d,#43cb77,#4b8eff,#b868f5,#ff6957)]" />颜色<ChevronDown className="h-3 w-3 text-[#8c98aa]" /></button>{['用途', '风格', '版式', '价格', '类型'].map((item) => <button type="button" key={item} onClick={() => showNotice(`${item}筛选即将展开`)} className="flex items-center gap-1">{item}<ChevronDown className="h-3 w-3 text-[#8c98aa]" /></button>)}<button type="button" onClick={() => showNotice('已切换套装筛选')} className="flex items-center gap-2 text-[#68758a]">只看套装<span className="relative h-[16px] w-[29px] rounded-full bg-[#e8edf5]"><span className="absolute left-[2px] top-[2px] h-3 w-3 rounded-full bg-white shadow-sm" /></span></button><button type="button" onClick={() => showNotice('更多筛选即将上线')} aria-label="更多筛选"><SlidersHorizontal className="h-[18px] w-[18px]" /></button></div>
          </div>
        </section>

        <section className="px-[32px] pb-10 pt-[17px]">
          {visibleCount ? <div className="grid grid-cols-2 gap-x-[17px] gap-y-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{visibleColumns.map((column, columnIndex) => <div key={`template-column-${columnIndex}`} className="flex min-w-0 flex-col gap-[17px]">{column.map((card) => <button key={card.id} type="button" onClick={() => showNotice(`打开模板：${card.title}`)} className="group relative block w-full overflow-hidden rounded-[9px] bg-white text-left shadow-[0_1px_4px_rgba(39,50,75,.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(65,76,106,.16)]"><PosterBadge badge={card.badge} /><div style={{ aspectRatio: card.aspect }}><PosterArt card={card} /></div></button>)}</div>)}</div> : <div className="flex min-h-[360px] items-center justify-center text-[14px] text-[#94a0b3]">没有找到相关模板，试试搜索“海报”或“邀请函”</div>}
        </section>
      </main>
      {notice ? <div className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#29334a] px-5 py-2.5 text-[12px] text-white shadow-[0_12px_30px_rgba(31,42,65,.2)]">{notice}</div> : null}
    </div>
  );
}
