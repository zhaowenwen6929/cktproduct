import { useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Camera,
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  Heart,
  Home,
  LayoutTemplate,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from 'lucide-react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';

type TemplateCategory = '全部' | '海报' | '社交媒体' | '新媒体' | '电商' | '办公' | '教育' | '印刷';

type TemplateCard = {
  title: string;
  category: Exclude<TemplateCategory, '全部'>;
  format: string;
  author: string;
  likes: string;
  tone: string;
  foreground: string;
  label: string;
  layout: 'center' | 'split' | 'photo' | 'type';
};

const navItems = [
  { label: '首页', icon: Home },
  { label: '模板', icon: LayoutTemplate },
  { label: 'AI工具', icon: Sparkles },
  { label: '创建', icon: Grid2x2 },
  { label: '我的', icon: UserRound },
  { label: '团队', icon: BriefcaseBusiness },
];

const categories: TemplateCategory[] = ['全部', '海报', '社交媒体', '新媒体', '电商', '办公', '教育', '印刷'];
const hotKeywords = ['招聘', '喜报', '邀请函', '小红书', '开学季', '商品主图'];
const subCategories = ['热门精选', '手机海报', '全屏海报', '每日一签', '邀请函', '长图海报', '名片', 'PPT'];

const templateCards: TemplateCard[] = [
  { title: '秋日上新活动海报', category: '海报', format: '手机海报', author: '创客贴精选', likes: '2.4k', tone: 'from-[#f6b58e] via-[#e97859] to-[#6d2933]', foreground: 'text-white', label: 'AUTUMN SALE', layout: 'center' },
  { title: '小红书生活方式封面', category: '社交媒体', format: '小红书封面', author: '灵感研究所', likes: '1.8k', tone: 'from-[#f8e6cc] via-[#efb694] to-[#d8787d]', foreground: 'text-[#6a3d3e]', label: '生活提案', layout: 'photo' },
  { title: '品牌春季新品发布', category: '新媒体', format: '公众号首图', author: '设计师小周', likes: '986', tone: 'from-[#c5e9e2] via-[#75c0be] to-[#397f9a]', foreground: 'text-white', label: 'NEW SEASON', layout: 'split' },
  { title: '轻食低脂餐商品主图', category: '电商', format: '电商主图', author: '电商设计馆', likes: '1.2k', tone: 'from-[#f8e8c3] via-[#e9b774] to-[#bb6d4c]', foreground: 'text-[#613e2f]', label: 'HEALTHY DAY', layout: 'photo' },
  { title: '简约风格个人名片', category: '印刷', format: '名片', author: '商务设计', likes: '723', tone: 'from-[#e9edf2] via-[#bdc9d6] to-[#6d7e93]', foreground: 'text-[#33465d]', label: 'STUDIO', layout: 'type' },
  { title: '开学季招生宣传', category: '教育', format: '招生海报', author: '校园视觉', likes: '1.1k', tone: 'from-[#f7dd6c] via-[#f1a747] to-[#e66b53]', foreground: 'text-white', label: 'BACK TO SCHOOL', layout: 'center' },
  { title: '夏日饮品促销海报', category: '海报', format: '促销海报', author: '商业美学', likes: '845', tone: 'from-[#c1f2e3] via-[#6bc7c4] to-[#2f91ac]', foreground: 'text-white', label: 'SUMMER DRINK', layout: 'split' },
  { title: '企业周报数据简报', category: '办公', format: 'PPT模板', author: '效率办公', likes: '512', tone: 'from-[#e3eaff] via-[#b5c5f2] to-[#737ad1]', foreground: 'text-[#303d73]', label: 'WEEKLY REPORT', layout: 'type' },
  { title: '复古唱片音乐节', category: '新媒体', format: '活动海报', author: '海报实验室', likes: '1.5k', tone: 'from-[#efc98d] via-[#b5684f] to-[#3e304e]', foreground: 'text-[#fff1c9]', label: 'MUSIC FEST', layout: 'center' },
  { title: '春日旅行攻略', category: '社交媒体', format: '长图海报', author: '旅拍日记', likes: '2.1k', tone: 'from-[#c8ecf1] via-[#78bdd0] to-[#48789b]', foreground: 'text-white', label: 'TRAVEL NOTES', layout: 'photo' },
  { title: '新品护肤礼盒', category: '电商', format: '商品详情页', author: '电商设计馆', likes: '937', tone: 'from-[#fae5dc] via-[#e8b2aa] to-[#a8799c]', foreground: 'text-[#6e4967]', label: 'BEAUTY EDIT', layout: 'split' },
  { title: '企业招聘人才招募', category: '办公', format: '招聘海报', author: '职场视觉', likes: '668', tone: 'from-[#d9f0ea] via-[#90c5a8] to-[#397b82]', foreground: 'text-white', label: 'JOIN US', layout: 'center' },
  { title: '周末市集邀请函', category: '印刷', format: '邀请函', author: '城市生活家', likes: '786', tone: 'from-[#f2dac5] via-[#cf9c7f] to-[#8b5e65]', foreground: 'text-white', label: 'WEEKEND MARKET', layout: 'type' },
  { title: '国潮节日促销', category: '海报', format: '节日海报', author: '东方美学', likes: '1.7k', tone: 'from-[#c71f37] via-[#e35843] to-[#f3ba63]', foreground: 'text-[#fff1bd]', label: '喜迎佳节', layout: 'center' },
  { title: '咖啡店会员日', category: '新媒体', format: '社群海报', author: '品牌灵感', likes: '602', tone: 'from-[#eee1ca] via-[#c49c78] to-[#654b4c]', foreground: 'text-white', label: 'COFFEE CLUB', layout: 'photo' },
  { title: '教师节感谢卡', category: '教育', format: '节日卡片', author: '校园视觉', likes: '479', tone: 'from-[#d9e8d0] via-[#a9c88c] to-[#6c8e74]', foreground: 'text-[#355b49]', label: 'THANK YOU', layout: 'type' },
];

function TemplateArtwork({ card }: { card: TemplateCard }) {
  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-[10px] bg-gradient-to-br ${card.tone} ${card.foreground}`}>
      <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full border-[14px] border-white/20" />
      <span className="absolute -bottom-10 -left-5 h-28 w-28 rounded-full bg-white/10 blur-sm" />
      {card.layout === 'photo' ? <span className="absolute bottom-0 left-0 right-0 top-[38%] bg-[linear-gradient(150deg,rgba(255,255,255,.55),rgba(255,255,255,0)_48%),linear-gradient(25deg,rgba(25,40,52,.3),transparent)]" /> : null}
      {card.layout === 'split' ? <span className="absolute bottom-0 right-0 top-0 w-[39%] bg-white/20" /> : null}
      {card.layout === 'type' ? <span className="absolute inset-x-4 top-[38%] h-px bg-current opacity-40" /> : null}
      <div className={`absolute inset-x-4 top-5 ${card.layout === 'center' ? 'text-center' : 'text-left'}`}>
        <div className="text-[8px] font-semibold tracking-[0.18em] opacity-80">{card.label}</div>
        <div className="mt-4 text-[20px] font-black leading-[1.04] tracking-tight">{card.title}</div>
        <div className="mt-3 max-w-[110px] text-[9px] leading-4 opacity-80">精选设计模板 · 编辑文字即可使用</div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-[8px] font-medium opacity-85"><span>CHUANGKIT</span><span>2026</span></div>
    </div>
  );
}

function SideNav({ onBackToDirectory, onBackToHome }: { onBackToDirectory: () => void; onBackToHome: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[56px] flex-col items-center border-r border-[#e8edf7] bg-[#f3f7ff] py-3">
      <button type="button" onClick={onBackToDirectory} className="mb-7 flex h-8 w-8 items-center justify-center rounded-lg text-[#75839e] hover:bg-white" title="返回目录"><ChevronLeft className="h-4 w-4" /></button>
      <div className="flex w-full flex-col items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === '模板';
          return <button key={item.label} type="button" onClick={() => item.label === '首页' ? onBackToHome() : undefined} className={`flex w-[44px] flex-col items-center gap-1 rounded-[10px] py-2 text-[10px] ${active ? 'bg-[#dceaff] text-[#2677ed]' : 'text-[#63708a] hover:bg-white/80'}`}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span></button>;
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-3 pb-2 text-[10px] text-[#64728b]"><button type="button" className="flex flex-col items-center gap-1"><UserRound className="h-[18px] w-[18px]" />成员</button><button type="button" className="flex flex-col items-center gap-1"><Settings2 className="h-[18px] w-[18px]" />管理</button></div>
    </aside>
  );
}

export function TemplateCenterPage({ onBackToDirectory, onBackToHome }: { onBackToDirectory: () => void; onBackToHome: () => void }) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('全部');
  const [activeSubCategory, setActiveSubCategory] = useState('热门精选');
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');

  const filteredCards = useMemo(() => templateCards.filter((card) => {
    const matchesCategory = activeCategory === '全部' || card.category === activeCategory;
    const normalizedQuery = query.trim();
    const matchesQuery = !normalizedQuery || `${card.title}${card.category}${card.format}${card.author}`.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  }), [activeCategory, query]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 1800);
  };

  const submitSearch = () => {
    setQuery(searchInput);
    showNotice(searchInput.trim() ? `已搜索“${searchInput.trim()}”` : '已展示全部模板');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fc] font-sans text-[#20263a]">
      <SideNav onBackToDirectory={onBackToDirectory} onBackToHome={onBackToHome} />
      <header className="fixed left-[56px] right-0 top-0 z-20 flex h-[56px] items-center justify-between border-b border-[#edf0f6] bg-white/95 px-6 backdrop-blur">
        <button type="button" onClick={onBackToHome} className="flex items-center"><img src={cktAiEcomLogo} alt="创客贴" className="h-[30px] w-auto" /></button>
        <div className="flex items-center gap-5 text-[#5e6679]"><button type="button" className="text-[12px]" onClick={() => showNotice('印刷店即将上线')}>印刷店</button><Grid2x2 className="h-[17px] w-[17px]" /><span className="relative"><Bell className="h-[18px] w-[18px]" /><i className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff4c48] text-[9px] not-italic text-white">4</i></span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9c6aa,#8ba6bb)] text-white"><UserRound className="h-4 w-4" /></span></div>
      </header>

      <main className="ml-[56px] min-h-screen pt-[56px]">
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_5%,#edf3ff_0%,#f7f8fc_56%,#f7f8fc_100%)] px-6 pb-5 pt-9">
          <div className="pointer-events-none absolute left-[16%] top-0 h-40 w-40 rounded-full bg-[#dce8ff]/70 blur-3xl" /><div className="pointer-events-none absolute right-[18%] top-2 h-44 w-44 rounded-full bg-[#eee5ff]/80 blur-3xl" />
          <div className="relative mx-auto max-w-[1180px] text-center"><p className="text-[11px] font-semibold tracking-[0.22em] text-[#8292b3]">TEMPLATE CENTER</p><h1 className="mt-2 text-[27px] font-semibold tracking-[0.03em] text-[#30384c]">发现适合你的设计模板</h1><p className="mt-2 text-[12px] text-[#8b95aa]">海量优质模板，编辑文字和图片即可快速完成设计</p>
            <div className="mx-auto mt-6 flex h-12 max-w-[720px] items-center gap-3 rounded-[16px] border-2 border-[#6e8eff] bg-white px-4 shadow-[0_12px_30px_rgba(98,119,201,.14)]"><Search className="h-5 w-5 text-[#8291b3]" /><input value={searchInput} onChange={(event) => setSearchInput(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="搜索模板，如：海报、名片、PPT、邀请函" className="min-w-0 flex-1 text-[13px] text-[#30384c] outline-none placeholder:text-[#a4adbf]" /><button type="button" onClick={submitSearch} className="rounded-[10px] bg-[#5e78f3] px-5 py-2 text-[12px] font-medium text-white hover:bg-[#5069df]">搜索</button><Camera className="h-[18px] w-[18px] text-[#8995aa]" /></div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#8b95aa]"><span>热门搜索</span>{hotKeywords.map((keyword) => <button key={keyword} type="button" onClick={() => { setSearchInput(keyword); setQuery(keyword); }} className="rounded-full bg-white/75 px-3 py-1 text-[#64718c] hover:bg-white hover:text-[#5069df]">{keyword}</button>)}</div>
          </div>
        </section>

        <section className="border-y border-[#edf0f5] bg-white px-6 py-3"><div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-1.5">{categories.map((category) => <button key={category} type="button" onClick={() => { setActiveCategory(category); setActiveSubCategory('热门精选'); }} className={`rounded-[9px] px-5 py-2 text-[12px] transition ${activeCategory === category ? 'bg-[#eaf0ff] font-semibold text-[#5473e9]' : 'text-[#737f95] hover:bg-[#f5f7fb] hover:text-[#42516e]'}`}>{category}</button>)}</div></section>

        <section className="mx-auto max-w-[1440px] px-6 pb-16 pt-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2">{subCategories.map((item) => <button key={item} type="button" onClick={() => { setActiveSubCategory(item); showNotice(`已切换到${item}`); }} className={`rounded-full px-3.5 py-1.5 text-[11px] ${activeSubCategory === item ? 'bg-[#30394e] text-white' : 'bg-white text-[#7b879c] hover:bg-[#eef2ff] hover:text-[#526bdd]'}`}>{item}</button>)}</div><div className="flex items-center gap-2"><button type="button" onClick={() => showNotice('筛选面板即将上线')} className="flex items-center gap-1.5 rounded-[8px] border border-[#e6eaf2] bg-white px-3 py-2 text-[11px] text-[#768298]"><SlidersHorizontal className="h-3.5 w-3.5" />筛选</button><button type="button" onClick={() => showNotice('已切换为综合排序')} className="flex items-center gap-1.5 rounded-[8px] border border-[#e6eaf2] bg-white px-3 py-2 text-[11px] text-[#768298]">综合排序<ChevronRight className="h-3.5 w-3.5 rotate-90" /></button></div></div>
          <div className="mb-6 flex items-center justify-between"><div><h2 className="text-[18px] font-semibold text-[#30384c]">{activeSubCategory}</h2><p className="mt-1 text-[11px] text-[#98a2b5]">精选可编辑模板，快速找到你的设计灵感</p></div><span className="text-[11px] text-[#9aa4b6]">共 {filteredCards.length} 个模板</span></div>
          {filteredCards.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{filteredCards.map((card) => <div key={card.title} className="group overflow-hidden rounded-[13px] border border-[#e9edf4] bg-white p-2 shadow-[0_2px_8px_rgba(71,86,121,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(71,86,121,.12)]"><button type="button" onClick={() => showNotice(`打开模板：${card.title}`)} className="block w-full text-left"><TemplateArtwork card={card} /><div className="px-1 pb-1 pt-3"><div className="truncate text-[12px] font-semibold text-[#3a4357]">{card.title}</div><div className="mt-1 flex items-center justify-between text-[10px] text-[#9aa4b5]"><span>{card.format}</span><span>{card.author}</span></div></div></button><div className="flex items-center justify-between border-t border-[#f0f2f6] px-1 pt-2 text-[10px] text-[#a0a8b6]"><span>♡ {card.likes}</span><button type="button" onClick={() => showNotice(`已收藏${card.title}`)} className="rounded-full p-1.5 hover:bg-[#f2f5ff] hover:text-[#5872e7]" aria-label={`收藏${card.title}`}><Heart className="h-3.5 w-3.5" /></button></div></div>)}</div> : <div className="rounded-[16px] bg-white py-24 text-center text-[13px] text-[#9aa4b6]">没有找到相关模板，试试搜索“海报”或“邀请函”</div>}
        </section>
      </main>
      {notice ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#29334a] px-5 py-2.5 text-[12px] text-white shadow-[0_12px_30px_rgba(31,42,65,.2)]">{notice}</div> : null}
    </div>
  );
}
