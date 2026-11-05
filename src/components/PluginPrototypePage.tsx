import React, { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Clock3,
  Cloud,
  Coins,
  Crown,
  FileImage,
  Folder,
  Grid2x2,
  Home,
  ImagePlus,
  LayoutTemplate,
  MoreHorizontal,
  MessageCircle,
  Package,
  PlaySquare,
  Puzzle,
  Search,
  Settings2,
  Sparkles,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import { skillDirectorySections, SkillsDirectoryPage } from './SkillsDirectoryPage';

type PluginSectionKey = 'create' | 'template' | 'tools' | 'team' | 'mine';
type MainNavKey = 'home' | 'skills' | 'tools' | 'templates' | 'recent' | 'projects' | 'assets';

interface PluginPrototypePageProps {
  onBack: () => void;
  onOpenCanvas: () => void;
}

type IconType = React.ComponentType<{ className?: string }>;

const mainNavItems: Array<{ key: MainNavKey; label: string; icon: IconType }> = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'skills', label: '技能', icon: WandSparkles },
  { key: 'tools', label: '工具', icon: Grid2x2 },
  { key: 'templates', label: '模板', icon: LayoutTemplate },
  { key: 'recent', label: '最近打开', icon: Clock3 },
  { key: 'projects', label: '项目', icon: Folder },
  { key: 'assets', label: '资产库', icon: BriefcaseBusiness },
];

const quickActions: Array<{ label: string; icon: IconType; tone: string; action?: 'canvas' }> = [
  { label: '商品套图', icon: Package, tone: 'blue' },
  { label: '爆款视频', icon: PlaySquare, tone: 'coral' },
  { label: '图片编辑', icon: FileImage, tone: 'ink' },
  { label: '创建设计', icon: CirclePlus, tone: 'violet', action: 'canvas' },
  { label: '智能抠图', icon: Sparkles, tone: 'mint' },
  { label: '变清晰', icon: Zap, tone: 'yellow' },
  { label: 'AI消除', icon: WandSparkles, tone: 'pink' },
  { label: 'A+/详情页', icon: BookOpen, tone: 'indigo' },
  { label: '带货图文', icon: ImagePlus, tone: 'orange' },
  { label: '全部工具', icon: Grid2x2, tone: 'slate' },
];

const mainTabs = ['推荐', '电商设计', '服饰穿戴', '视频创作', '品牌设计', '海报设计', '自媒体营销', '办公设计', '图像处理'];

const mainCards = [
  { title: '海内社媒带货图文', desc: '一键生成高转化营销素材', className: 'plugin-art-social', large: true },
  { title: '爆款图复制', desc: '一张商品图，成套复刻爆款风格', className: 'plugin-art-flint', badge: '热门' },
  { title: '剧情广告', desc: '网感玩梗短视频，脚本+出片', className: 'plugin-art-cafe' },
  { title: '口播带货', desc: 'UGC风格真人口播带货视频', className: 'plugin-art-icecream' },
  { title: '商品SKU变体', desc: '多色/多款SKU批量生成', className: 'plugin-art-bottles' },
  { title: '种草穿搭', desc: '生活化服饰上身图，种草穿搭风格', className: 'plugin-art-fashion' },
  { title: '海报分层', desc: '拆分海报文字、主体、背景为可编辑图层', className: 'plugin-art-bloom' },
  { title: '商品替换', desc: '上传场景图和新品商品图，自然替换', className: 'plugin-art-skincare' },
  { title: '促销主图', desc: '商品叠加促销信息，出大促主图', className: 'plugin-art-promo', badge: '最新' },
  { title: '海报美化', desc: '旧海报快速美化升级', className: 'plugin-art-cheers' },
  { title: '图片翻译', desc: '图片上的文字多语言翻译替换', className: 'plugin-art-translate' },
  { title: '宠物风扇换装展示', desc: '一键生成趣味产品展示', className: 'plugin-art-pet' },
  { title: '《neon》舞蹈产品版', desc: '为产品打造吸睛视觉', className: 'plugin-art-neon' },
  { title: '特斯拉Roadster送货', desc: '创意场景快速生成', className: 'plugin-art-roadster' },
];

const pluginRail: Array<{ key: PluginSectionKey; label: string; icon: IconType }> = [
  { key: 'create', label: '创作', icon: Cloud },
  { key: 'template', label: '模板', icon: LayoutTemplate },
  { key: 'tools', label: '工具', icon: WandSparkles },
  { key: 'team', label: '团队', icon: BriefcaseBusiness },
  { key: 'mine', label: '我的', icon: Settings2 },
];

const pluginShortcuts = [
  { title: '创建设计', icon: CirclePlus, tone: 'blue' },
  { title: '图片编辑', icon: FileImage, tone: 'coral' },
  { title: '营销海报', icon: LayoutTemplate, tone: 'slate' },
  { title: '小红书配图', icon: FileImage, tone: 'slate' },
  { title: '公众号', icon: MessageCircle, tone: 'slate' },
  { title: 'AI抠图', icon: Sparkles, tone: 'slate' },
  { title: '图片批处理', icon: Grid2x2, tone: 'slate' },
  { title: '印刷制作', icon: BookOpen, tone: 'slate' },
  { title: '更多', icon: MoreHorizontal, tone: 'slate' },
];

const templateCards = [
  { title: '春日上新', className: 'template-spring' },
  { title: '冬日物语', className: 'template-winter' },
  { title: '双十一狂欢', className: 'template-sale' },
  { title: '商品套图', className: 'template-product' },
  { title: '生活方式', className: 'template-life' },
  { title: '品牌海报', className: 'template-brand' },
];

const toolCards = [
  { title: 'A+/详情页', desc: '智能商品详情长图', className: 'tool-a-plus' },
  { title: '电商套图', desc: '电商商品营销套图', className: 'tool-commerce' },
  { title: '一键白底图', desc: '批量生成白底图', className: 'tool-white-bg' },
  { title: '一键细节图', desc: '细节放大突出质感', className: 'tool-detail' },
  { title: '一键场景图', desc: '场景合成提升氛围', className: 'tool-scene' },
  { title: '一键卖点图', desc: '卖点提炼视觉表达', className: 'tool-selling' },
  { title: '买家秀', desc: '清晰种草草图', className: 'tool-buyer' },
  { title: '三视图', desc: '多角度展示细节', className: 'tool-three-view' },
  { title: '图片翻译', desc: '一键翻译目标语言', className: 'tool-translate' },
  { title: '产品精修', desc: '智能精修，质感升级', className: 'tool-retouch' },
];

const campaignCards = [
  { title: '双11狂购', desc: '精美物料，爆单必备～', className: 'campaign-red' },
  { title: '双11直播间物料', desc: '助力双11直播大卖！', className: 'campaign-pink' },
  { title: '冬日特辑', desc: '轻松拿捏冬日限定氛围', className: 'campaign-blue' },
];

function MainLogo() {
  return (
    <div className="plugin-main-logo" aria-label="创客贴">
      <span className="plugin-main-logo__tile plugin-main-logo__tile--pink" />
      <span className="plugin-main-logo__tile plugin-main-logo__tile--blue" />
      <span className="plugin-main-logo__tile plugin-main-logo__tile--lime" />
      <span className="plugin-main-logo__tile plugin-main-logo__tile--yellow" />
    </div>
  );
}

function ArtCard({ className, title, desc, badge, large = false }: { className: string; title: string; desc: string; badge?: string; large?: boolean }) {
  return (
    <button type="button" className={`plugin-main-card ${large ? 'plugin-main-card--large' : ''}`}>
      <div className={`plugin-art ${className}`}>
        {badge ? <span className="plugin-art__badge">{badge}</span> : null}
        <span className="plugin-art__shine" />
        <span className="plugin-art__copy">{title}</span>
      </div>
      <div className="plugin-main-card__copy">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
    </button>
  );
}

function PluginLoginBar({ loggedIn, onLogin }: { loggedIn: boolean; onLogin: () => void }) {
  if (loggedIn) return null;
  return (
    <div className="plugin-login-bar">
      <div className="plugin-login-bar__user">◌</div>
      <span>一键注册登录，免费获得海量设计营销方案</span>
      <button type="button" onClick={onLogin}>立即登录</button>
    </div>
  );
}

function PluginSectionTitle({ title, subtitle, action = '更多' }: { title: string; subtitle?: string; action?: string }) {
  return (
    <div className="plugin-section-title">
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <button type="button">{action}<ChevronRight className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function PluginCreateContent({ onOpenCanvas, loggedIn, onLogin }: { onOpenCanvas: () => void; loggedIn: boolean; onLogin: () => void }) {
  return (
    <>
      <PluginLoginBar loggedIn={loggedIn} onLogin={onLogin} />
      <div className="plugin-create-heading">
        <h2>今天你想做些什么？</h2>
        <div className="plugin-create-heading__tabs">
          <button type="button" className="is-active">设计模板</button>
          <button type="button">AI创作</button>
        </div>
      </div>

      <div className="plugin-search-box">
        <Search className="h-4 w-4" />
        <input aria-label="搜索模板或素材" placeholder="输入关键词搜索你想要的模板或素材" />
        <button type="button" className="plugin-search-box__camera">▧</button>
        <button type="button" className="plugin-search-box__submit">搜索</button>
      </div>

      <div className="plugin-keywords">
        {['🛒双11', '🚩喜报', '🟡日签', '无限画布', 'AI电商', '定制设计', '🗓2027台历模板'].map((item) => (
          <button type="button" key={item}>{item}</button>
        ))}
      </div>

      <div className="plugin-shortcuts">
        {pluginShortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.title} className={`plugin-shortcut plugin-shortcut--${item.tone}`} onClick={item.title === '创建设计' ? onOpenCanvas : undefined}>
              <span>{item.title}</span>
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <PluginSectionTitle title="热点内容速递" subtitle="精选当下热门设计灵感" />
      <div className="plugin-campaigns">
        {campaignCards.map((card) => (
          <button type="button" className="plugin-campaign" key={card.title}>
            <div className={`plugin-campaign__art ${card.className}`}><b>{card.title}</b><span>SALE</span></div>
            <strong>{card.title}</strong>
            <span>{card.desc}</span>
          </button>
        ))}
      </div>

      <PluginSectionTitle title="立冬时节" subtitle="迎一抹初冬，岁暮万事皆晴明" />
      <div className="plugin-template-row">
        {templateCards.slice(0, 3).map((card) => <button type="button" key={card.title} className={`plugin-template-mini ${card.className}`}><span>{card.title}</span></button>)}
      </div>

      <PluginSectionTitle title="双11狂欢GO" subtitle="海量营销物料，助力大促爆单" />
      <div className="plugin-template-row plugin-template-row--compact">
        {templateCards.slice(2, 5).map((card) => <button type="button" key={card.title} className={`plugin-template-mini ${card.className}`}><span>{card.title}</span></button>)}
      </div>
    </>
  );
}

function PluginTemplateContent({ loggedIn, onLogin }: { loggedIn: boolean; onLogin: () => void }) {
  return (
    <>
      <PluginLoginBar loggedIn={loggedIn} onLogin={onLogin} />
      <div className="plugin-page-heading"><h2>模板中心</h2><p>海量模板，一键套用你的创意</p></div>
      <div className="plugin-search-box"><Search className="h-4 w-4" /><input aria-label="搜索模板" placeholder="搜索海报、邀请函、电商主图" /><button type="button" className="plugin-search-box__submit">搜索</button></div>
      <div className="plugin-filter-tabs">{['全部', '海报', '抖音/小红书', '微信', '电商/直播', 'PPT', '印刷/办公'].map((item, index) => <button type="button" className={index === 0 ? 'is-active' : ''} key={item}>{item}</button>)}</div>
      <div className="plugin-filter-pills">{['推荐', '手机海报', '全屏海报', '小红书配图', '公众号首图', '长图海报'].map((item, index) => <button type="button" className={index === 0 ? 'is-active' : ''} key={item}>{item}</button>)}</div>
      <div className="plugin-waterfall">{templateCards.map((card) => <button type="button" key={card.title} className={`plugin-waterfall-card ${card.className}`}><span>{card.title}</span></button>)}</div>
    </>
  );
}

function PluginToolsContent({ loggedIn, onLogin }: { loggedIn: boolean; onLogin: () => void }) {
  return (
    <>
      <PluginLoginBar loggedIn={loggedIn} onLogin={onLogin} />
      <div className="plugin-page-heading"><h2>AI 商品图</h2><p>快速生成适配电商场景的商品视觉</p></div>
      <div className="plugin-tool-grid">
        {toolCards.map((card) => <button type="button" className="plugin-tool-card" key={card.title}><div><strong>{card.title}</strong><span>{card.desc}</span></div><div className={`plugin-tool-card__art ${card.className}`} /></button>)}
      </div>
      <PluginSectionTitle title="AI文本可视化" subtitle="把文字快速变成有吸引力的视觉内容" />
      <div className="plugin-tool-grid plugin-tool-grid--small">
        {['AI PPT', 'AI 科研绘图', 'AI数据图表', 'AI小红书封面'].map((title, index) => <button type="button" className="plugin-tool-card" key={title}><div><strong>{title}</strong><span>{['一键生成专业PPT', 'SCI级科研示意图', '数据信息一键可视化', '爆款封面一键出图'][index]}</span></div><div className={`plugin-tool-card__art tool-text-${index + 1}`} /></button>)}
      </div>
    </>
  );
}

function PluginEmptyContent({ type, loggedIn, onLogin }: { type: 'team' | 'mine'; loggedIn: boolean; onLogin: () => void }) {
  return (
    <div className="plugin-empty-state">
      <PluginLoginBar loggedIn={loggedIn} onLogin={onLogin} />
      <div className="plugin-empty-state__icon"><Puzzle className="h-7 w-7" /></div>
      <h2>{type === 'team' ? '和团队一起创作' : '登录后管理你的设计'}</h2>
      <p>{type === 'team' ? '邀请成员协作，素材和设计随时同步' : '登录后即可查看最近作品、收藏和资产'}</p>
      {!loggedIn ? <button type="button" onClick={onLogin}>立即登录</button> : <span className="plugin-empty-state__success">已登录，开始创作吧</span>}
    </div>
  );
}

export function PluginPrototypePage({ onBack, onOpenCanvas }: PluginPrototypePageProps) {
  const [activePluginSection, setActivePluginSection] = useState<PluginSectionKey>('create');
  const [activeMainNav, setActiveMainNav] = useState<MainNavKey>('home');
  const [isPluginOpen, setIsPluginOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('推荐');
  const [showSkillsBadge, setShowSkillsBadge] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.localStorage.getItem('ckt-skills-entry-seen') !== '1';
    } catch {
      return true;
    }
  });
  const [skillToast, setSkillToast] = useState('');

  const visibleMainCards = useMemo(() => activeMainTab === '推荐' ? mainCards : [...mainCards.slice(3), ...mainCards.slice(0, 3)], [activeMainTab]);

  return (
    <div className="plugin-prototype-shell">
      <aside className="plugin-main-sidebar">
        <button type="button" className="plugin-sidebar-brand" onClick={onBack} aria-label="返回原型首页"><MainLogo /></button>
        <button type="button" className="plugin-create-button" onClick={onOpenCanvas}><CirclePlus className="h-5 w-5" /><span>创建</span></button>
        <nav className="plugin-main-nav">
          {mainNavItems.map((item) => { const Icon = item.icon; const active = item.key === activeMainNav; return <button type="button" key={item.key} className={`relative plugin-main-nav__item ${active ? 'is-active' : ''}`} onClick={() => { setActiveMainNav(item.key); if (item.key === 'skills') { setShowSkillsBadge(false); try { window.localStorage.setItem('ckt-skills-entry-seen', '1'); } catch { /* Keep this session usable when storage is unavailable. */ } } }}><Icon className="h-[19px] w-[19px]" /><span>{item.label}</span>{item.key === 'skills' && showSkillsBadge ? <i className="plugin-main-nav__badge" aria-label="有新技能" /> : null}</button>; })}
        </nav>
        <div className="plugin-sidebar-footer"><button type="button" className="plugin-main-nav__item"><MoreHorizontal className="h-5 w-5" /><span>更多</span></button></div>
      </aside>

      <main className={`plugin-main-content ${activeMainNav === 'skills' ? 'plugin-main-content--skills' : ''}`}>
        <header className="plugin-main-header">
          <div className="plugin-main-header__crumb"><span className="plugin-header-dot" />创客贴设计</div>
          <div className="plugin-main-header__actions"><button type="button" className="plugin-credit-chip"><Coins className="h-4 w-4" />充值</button><button type="button" className="plugin-member-chip"><Crown className="h-4 w-4" />会员低至0.4/天</button><button type="button" className="plugin-icon-button"><Bell className="h-[18px] w-[18px]" /><i>52</i></button><button type="button" className="plugin-avatar">乐</button></div>
        </header>

        {activeMainNav === 'skills' ? <SkillsDirectoryPage sections={skillDirectorySections} onSelectSkill={(skillId) => { setSkillToast(`已选择技能：${skillId}`); window.setTimeout(() => setSkillToast(''), 1600); }} /> : <>
        <section className="plugin-hero">
          <h1>让商业设计 好看又见效</h1>
          <div className="plugin-hero-input"><div className="plugin-hero-input__placeholder">请输入你的设计需求，支持 <em>/</em> 使用技能，<b>@</b> 引用上传素材</div><div className="plugin-hero-input__footer"><div><button type="button"><CirclePlus className="h-4 w-4" />添加</button><button type="button"><BriefcaseBusiness className="h-4 w-4" />资产库</button><button type="button"><Sparkles className="h-4 w-4" />技能</button><button type="button"><WandSparkles className="h-4 w-4" />Agent <ChevronDown className="h-3 w-3" /></button></div><button type="button" className="plugin-hero-send"><ChevronRight className="h-5 w-5" /></button></div></div>
        </section>

        <section className="plugin-quick-actions">{quickActions.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} onClick={item.action === 'canvas' ? onOpenCanvas : undefined} className="plugin-quick-action"><Icon className={`plugin-quick-action__icon plugin-quick-action__icon--${item.tone}`} /><span>{item.label}</span></button>; })}</section>

        <section className="plugin-main-gallery"><div className="plugin-gallery-toolbar"><div className="plugin-gallery-tabs">{mainTabs.map((tab) => <button type="button" key={tab} className={activeMainTab === tab ? 'is-active' : ''} onClick={() => setActiveMainTab(tab)}>{tab}</button>)}</div><label className="plugin-gallery-search"><Search className="h-4 w-4" /><input placeholder="搜索" /></label></div><div className="plugin-main-grid">{visibleMainCards.map((card) => <ArtCard key={card.title} {...card} />)}</div></section>
        </>}
        {skillToast ? <div className="plugin-skill-toast" role="status">{skillToast}</div> : null}
        <button type="button" className="plugin-help-button" aria-label="帮助">?</button>
      </main>

      {isPluginOpen ? <aside className="plugin-side-panel"><div className="plugin-side-panel__content"><header className="plugin-side-header"><div className="plugin-side-header__brand"><span className="plugin-side-header__mark">✦</span><strong>创客贴设计</strong></div><div className="plugin-side-header__actions"><button type="button" aria-label="静音">⌁</button><button type="button" onClick={() => setIsPluginOpen(false)} aria-label="关闭插件"><X className="h-4 w-4" /></button></div></header>{activePluginSection === 'create' && <PluginCreateContent onOpenCanvas={onOpenCanvas} loggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />}{activePluginSection === 'template' && <PluginTemplateContent loggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />}{activePluginSection === 'tools' && <PluginToolsContent loggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />}{(activePluginSection === 'team' || activePluginSection === 'mine') && <PluginEmptyContent type={activePluginSection} loggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />}</div><nav className="plugin-side-rail">{pluginRail.map((item) => { const Icon = item.icon; return <button type="button" key={item.key} className={`plugin-side-rail__item ${activePluginSection === item.key ? 'is-active' : ''}`} onClick={() => setActivePluginSection(item.key)}><span><Icon className="h-5 w-5" /></span><em>{item.label}</em></button>; })}</nav></aside> : <button type="button" className="plugin-reopen-button" onClick={() => setIsPluginOpen(true)}><Puzzle className="h-4 w-4" />打开插件</button>}
    </div>
  );
}
