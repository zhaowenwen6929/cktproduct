import { useState } from 'react';
import {
  Camera,
  ChevronRight,
  Crop,
  Eraser,
  FolderOpen,
  House,
  ImageIcon,
  LayoutGrid,
  MoreHorizontal,
  PanelsTopLeft,
  PenLine,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  WandSparkles,
  UserRound,
} from 'lucide-react';

type DesignAppHomePageProps = {
  onBackToDirectory: () => void;
  onOpenAiCreate: () => void;
};

type QuickTool = {
  label: string;
  icon: typeof Sparkles;
  badge?: 'new' | 'ai';
};

const quickTools: QuickTool[] = [
  { label: '智能设计', icon: WandSparkles, badge: 'new' },
  { label: '智能抠图', icon: Crop },
  { label: '拼图', icon: LayoutGrid },
  { label: 'AI消除', icon: Eraser },
  { label: '图片变清晰', icon: ImageIcon },
  { label: '智能改图', icon: PenLine },
  { label: '图片编辑', icon: Crop, badge: 'ai' },
  { label: 'AI商品图', icon: ShoppingBag },
  { label: 'AI图生图', icon: ImageIcon },
  { label: 'AI文案', icon: PenLine },
];

const quickKeywords = ['招聘', '喜报', '邀请函', '早安'];

const navItems = [
  { label: '首页', icon: House },
  { label: '模板', icon: PanelsTopLeft },
  { label: 'AI工具', icon: Sparkles },
  { label: '资源', icon: FolderOpen },
  { label: '我的', icon: UserRound },
];

function RecentDesign({ variant }: { variant: 'cream' | 'blue' | 'blank' | 'moon' }) {
  return (
    <div className={`design-app-recent-art design-app-recent-art--${variant}`}>
      {variant === 'cream' && (
        <>
          <span className="recent-art-line recent-art-line--top" />
          <span className="recent-art-block recent-art-block--left" />
          <span className="recent-art-block recent-art-block--right" />
          <span className="recent-art-line recent-art-line--bottom" />
        </>
      )}
      {variant === 'blue' && (
        <>
          <span className="recent-art-blue-copy">品牌<br />灵感</span>
          <span className="recent-art-blue-panel" />
        </>
      )}
      {variant === 'moon' && <span className="recent-art-moon" />}
    </div>
  );
}

function RecommendCard({ kind, title, description }: { kind: 'holiday' | 'festival' | 'course'; title: string; description: string }) {
  return (
    <button type="button" className={`design-app-recommend-card design-app-recommend-card--${kind}`}>
      <span className="design-app-card-menu"><MoreHorizontal size={18} strokeWidth={2.5} /></span>
      <span className="design-app-recommend-badge">新</span>
      <span className="design-app-recommend-title">{title}</span>
      <span className="design-app-recommend-description">{description}</span>
      <span className="design-app-recommend-ornament" />
    </button>
  );
}

function FestivalTemplateCard({
  variant,
  title,
  subtitle,
  onSelect,
}: {
  variant: 'gold' | 'red' | 'blue' | 'purple';
  title: string;
  subtitle: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`design-app-template-card design-app-template-card--${variant}`} onClick={onSelect}>
      <span className="design-app-template-card__menu"><MoreHorizontal size={17} strokeWidth={2.5} /></span>
      <span className="design-app-template-card__tag">中秋</span>
      <span className="design-app-template-card__title">{title}</span>
      <span className="design-app-template-card__subtitle">{subtitle}</span>
      <span className="design-app-template-card__moon" />
      <span className="design-app-template-card__cloud design-app-template-card__cloud--left" />
      <span className="design-app-template-card__cloud design-app-template-card__cloud--right" />
      <span className="design-app-template-card__bottom" />
    </button>
  );
}

type HomePosterVariant =
  | 'sky-moon'
  | 'festival-red'
  | 'festival-pink'
  | 'festival-orange'
  | 'national-pink'
  | 'national-mountain'
  | 'national-red'
  | 'autumn-lake'
  | 'autumn-road'
  | 'autumn-mountain'
  | 'award-gold'
  | 'award-person'
  | 'award-trophy'
  | 'award-red'
  | 'sign-green'
  | 'sign-orange'
  | 'recruit-blue'
  | 'recruit-yellow'
  | 'xiaohongshu-pink'
  | 'scene-blue';

function HomePosterCard({
  variant,
  title,
  subtitle,
  footer = '全部模板',
  onSelect,
}: {
  variant: HomePosterVariant;
  title: string;
  subtitle?: string;
  footer?: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`design-app-home-poster design-app-home-poster--${variant}`} onClick={onSelect}>
      <span className="design-app-home-poster__menu"><MoreHorizontal size={18} strokeWidth={2.5} /></span>
      <span className="design-app-home-poster__art">
        <span className="design-app-home-poster__kicker">YOUR LOGO · 2026</span>
        <strong>{title}</strong>
        {subtitle && <span className="design-app-home-poster__subtitle">{subtitle}</span>}
        <span className="design-app-home-poster__sun" />
        <span className="design-app-home-poster__landscape" />
        <span className="design-app-home-poster__spark" />
      </span>
      <span className="design-app-home-poster__footer">{footer}</span>
    </button>
  );
}

function HotCalendarCard({ title, date, tag, active = false }: { title: string; date: string; tag: string; active?: boolean }) {
  return (
    <button type="button" className={`design-app-calendar-card${active ? ' is-active' : ''}`}>
      <span><strong>{title}</strong><small>{date}</small></span>
      <em>{tag}</em>
    </button>
  );
}

function SceneCard({ variant, title }: { variant: 'recruit-blue' | 'recruit-yellow' | 'xiaohongshu-pink' | 'scene-blue'; title: string }) {
  return (
    <button type="button" className="design-app-scene-card">
      <strong>{title}</strong>
      <span className={`design-app-scene-card__art design-app-scene-card__art--${variant}`} />
    </button>
  );
}

export function DesignAppHomePage({ onBackToDirectory, onOpenAiCreate }: DesignAppHomePageProps) {
  const [searchValue, setSearchValue] = useState('');
  const [activeNav, setActiveNav] = useState('首页');
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    if (label !== '首页') notify(`${label}页面即将上线`);
  };

  return (
    <div className="design-app-page">
      <button type="button" className="design-app-directory-button" onClick={onBackToDirectory}>
        返回需求目录
      </button>

      <main className="design-app-shell">
        <div className="design-app-status-bar" aria-label="状态栏">
          <span>12:00</span>
          <span className="design-app-status-icons"><span className="status-signal" /><span className="status-wifi" /><span className="status-battery">90</span></span>
        </div>

        <section className="design-app-hero">
          <div className="design-app-search-row">
            <label className="design-app-search-box">
              <Search size={22} strokeWidth={2.5} />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && notify(searchValue ? `正在搜索“${searchValue}”` : '请输入搜索内容')}
                placeholder="输入关键词搜索想要的内容"
                aria-label="搜索设计内容"
              />
              <button type="button" aria-label="图片搜索" onClick={() => notify('图片搜索功能即将上线')}>
                <Camera size={22} strokeWidth={2.2} />
              </button>
            </label>
            <button type="button" className="design-app-vip" onClick={() => notify('VIP权益即将开放')} aria-label="VIP">
              <span>VIP</span>
            </button>
          </div>

          <div className="design-app-keywords" aria-label="热门搜索">
            {quickKeywords.map((keyword) => (
              <button key={keyword} type="button" onClick={() => setSearchValue(keyword)}>{keyword}</button>
            ))}
          </div>

          <div className="design-app-primary-grid">
            <button type="button" className="design-app-primary-card design-app-primary-card--create" onClick={() => notify('开始创建新设计')}>
              <strong>创建设计</strong>
              <span className="design-app-primary-icon"><Plus size={22} strokeWidth={2.5} /></span>
            </button>
            <button type="button" className="design-app-primary-card design-app-primary-card--edit" onClick={() => notify('请选择要编辑的图片')}>
              <strong>图片编辑</strong>
              <span className="design-app-primary-icon"><Crop size={20} strokeWidth={2.5} /></span>
            </button>
            <button type="button" className="design-app-primary-card design-app-primary-card--ai" onClick={onOpenAiCreate}>
              <strong>AI创作</strong>
              <span className="design-app-primary-icon"><PenLine size={20} strokeWidth={2.5} /></span>
              <span className="design-app-ai-preview"><span>创意描述</span><b>人生<br />重启计划</b><i>✦</i></span>
            </button>
          </div>
        </section>

        <section className="design-app-tools-section">
          <div className="design-app-tools-grid">
            {quickTools.map(({ label, icon: Icon, badge }) => (
              <button key={label} type="button" className="design-app-tool" onClick={() => notify(`${label}功能已选中`)}>
                <span className="design-app-tool-icon"><Icon size={28} strokeWidth={1.9} /></span>
                {badge === 'new' && <span className="design-app-tool-badge design-app-tool-badge--new">NEW</span>}
                {badge === 'ai' && <span className="design-app-tool-badge design-app-tool-badge--ai">AI玩法</span>}
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="design-app-pagination" aria-label="工具分页"><span className="is-active" /><span /><span /></div>
        </section>

        <section className="design-app-content-section">
          <div className="design-app-section-heading">
            <h2>最近设计</h2>
            <button type="button" onClick={() => notify('全部设计即将上线')} aria-label="查看全部最近设计"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-recent-list">
            {(['cream', 'blue', 'blank', 'moon'] as const).map((variant) => (
              <button type="button" className="design-app-recent-card" key={variant} onClick={() => notify('打开最近设计')}>
                <RecentDesign variant={variant} />
                <span className="design-app-card-menu"><MoreHorizontal size={18} strokeWidth={2.5} /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="design-app-content-section design-app-recommend-section">
          <div className="design-app-section-heading"><h2>为你推荐</h2></div>
          <div className="design-app-horizontal-list design-app-recommend-list">
            <RecommendCard kind="holiday" title="中秋国庆" description="放假通知" />
            <RecommendCard kind="festival" title="喜迎中秋" description="欢度国庆" />
            <RecommendCard kind="course" title="27考研" description="封闭集训营" />
            <RecommendCard kind="holiday" title="秋日活动" description="限时海报" />
          </div>
        </section>

        <div className="design-app-slogan">日满中秋</div>

        <section className="design-app-template-section" aria-label="中秋模板">
          <div className="design-app-horizontal-list design-app-template-list">
            <FestivalTemplateCard variant="gold" title="中秋国庆" subtitle="放假通知" onSelect={() => notify('打开中秋国庆模板')} />
            <FestivalTemplateCard variant="red" title="月满中秋" subtitle="欢度国庆" onSelect={() => notify('打开月满中秋模板')} />
            <FestivalTemplateCard variant="blue" title="中秋快乐" subtitle="团圆佳节" onSelect={() => notify('打开中秋快乐模板')} />
            <FestivalTemplateCard variant="purple" title="一轮明月" subtitle="千里相思" onSelect={() => notify('打开一轮明月模板')} />
          </div>
        </section>

        <section className="design-app-feed-section" aria-label="节日模板推荐">
          <div className="design-app-section-heading">
            <h2>月满中秋</h2>
            <button type="button" onClick={() => notify('更多中秋模板即将上线')} aria-label="查看全部月满中秋模板"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-poster-list">
            <HomePosterCard variant="sky-moon" title="月圆中秋" subtitle="Mid-Autumn" footer="全部模板" onSelect={() => notify('打开月满中秋模板')} />
            <HomePosterCard variant="festival-red" title="喜迎中秋" subtitle="欢度国庆" footer="放假通知" onSelect={() => notify('打开放假通知模板')} />
            <HomePosterCard variant="festival-pink" title="喜迎中秋" subtitle="节日祝福" footer="节日祝福" onSelect={() => notify('打开节日祝福模板')} />
            <HomePosterCard variant="festival-orange" title="月满山河" subtitle="共庆华诞" footer="活动海报" onSelect={() => notify('打开活动海报模板')} />
          </div>
        </section>

        <section className="design-app-feed-section" aria-label="国庆模板推荐">
          <div className="design-app-section-heading">
            <h2>国庆快乐</h2>
            <button type="button" onClick={() => notify('更多国庆模板即将上线')} aria-label="查看全部国庆模板"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-poster-list">
            <HomePosterCard variant="national-pink" title="盛世华诞" subtitle="礼赞中国" footer="全部模板" onSelect={() => notify('打开国庆模板')} />
            <HomePosterCard variant="festival-red" title="喜迎中秋" subtitle="欢度国庆" footer="放假通知" onSelect={() => notify('打开放假通知模板')} />
            <HomePosterCard variant="national-mountain" title="盛世华诞" subtitle="欢度国庆" footer="节日祝福" onSelect={() => notify('打开节日祝福模板')} />
            <HomePosterCard variant="national-red" title="国庆礼遇" subtitle="限时活动" footer="活动海报" onSelect={() => notify('打开国庆活动模板')} />
          </div>
        </section>

        <section className="design-app-feed-section" aria-label="热点日历">
          <div className="design-app-section-heading">
            <h2>热点日历</h2>
            <button type="button" onClick={() => notify('热点日历即将上线')} aria-label="查看热点日历"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-calendar-list">
            <HotCalendarCard title="秋分" date="09.23 星期三" tag="今日" active />
            <HotCalendarCard title="中秋节" date="09.25 星期五" tag="2天后" />
            <HotCalendarCard title="国庆节" date="10.01 星期四" tag="8天后" />
          </div>
          <div className="design-app-horizontal-list design-app-poster-list design-app-calendar-posters">
            <HomePosterCard variant="autumn-lake" title="秋分" subtitle="AUTUMNAL EQUINOX" footer="节气海报" onSelect={() => notify('打开秋分模板')} />
            <HomePosterCard variant="autumn-road" title="秋分" subtitle="AUTUMNAL EQUINOX" footer="节气海报" onSelect={() => notify('打开秋分模板')} />
            <HomePosterCard variant="autumn-mountain" title="秋分" subtitle="一叶落而知秋" footer="节气海报" onSelect={() => notify('打开秋分模板')} />
            <HomePosterCard variant="autumn-lake" title="秋日合集" subtitle="一叶落而知秋" footer="全部模板" onSelect={() => notify('打开秋日合集')} />
          </div>
        </section>

        <section className="design-app-feed-section" aria-label="喜报模板">
          <div className="design-app-section-heading design-app-section-heading--with-subtitle">
            <div><h2>喜报</h2><p>好成绩要让全世界都知道</p></div>
            <button type="button" onClick={() => notify('更多喜报模板即将上线')} aria-label="查看全部喜报模板"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-poster-list">
            <HomePosterCard variant="award-gold" title="喜报" subtitle="热烈祝贺 888" footer="全部模板" onSelect={() => notify('打开喜报模板')} />
            <HomePosterCard variant="award-person" title="实力登峰" subtitle="领潮争胜" footer="销冠喜报" onSelect={() => notify('打开销冠喜报')} />
            <HomePosterCard variant="award-trophy" title="喜报" subtitle="热烈祝贺 2000" footer="业绩喜报" onSelect={() => notify('打开业绩喜报')} />
            <HomePosterCard variant="award-red" title="喜报" subtitle="恭喜获奖" footer="获奖喜报" onSelect={() => notify('打开获奖喜报')} />
          </div>
        </section>

        <section className="design-app-feed-section" aria-label="每日一签">
          <div className="design-app-section-heading design-app-section-heading--with-subtitle">
            <div><h2>每日一签</h2><p>祝你每天都是上上签～</p></div>
            <button type="button" onClick={() => notify('更多每日一签模板即将上线')} aria-label="查看全部每日一签模板"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-poster-list">
            <HomePosterCard variant="sign-green" title="今日签语" subtitle="心之所向，素履以往" footer="每日一签" onSelect={() => notify('打开每日一签')} />
            <HomePosterCard variant="sign-orange" title="好运常在" subtitle="所愿皆成真" footer="每日一签" onSelect={() => notify('打开每日一签')} />
            <HomePosterCard variant="sign-green" title="慢慢来" subtitle="一切都会如愿" footer="每日一签" onSelect={() => notify('打开每日一签')} />
          </div>
        </section>

        <section className="design-app-feed-section design-app-scene-section" aria-label="热门场景">
          <div className="design-app-section-heading">
            <h2>热门场景</h2>
            <button type="button" onClick={() => notify('更多热门场景即将上线')} aria-label="查看全部热门场景"><ChevronRight size={24} /></button>
          </div>
          <div className="design-app-horizontal-list design-app-scene-list">
            <SceneCard variant="recruit-blue" title="手机海报" />
            <SceneCard variant="recruit-yellow" title="全屏海报" />
            <SceneCard variant="xiaohongshu-pink" title="小红书" />
            <SceneCard variant="scene-blue" title="公众号" />
          </div>
          <div className="design-app-filter-list" aria-label="热门模板分类">
            {['热门模板', '秋分', '中秋', '国庆', '秋日合集', '小红书', '喜报'].map((tag, index) => (
              <button key={tag} type="button" className={index === 0 ? 'is-active' : ''} onClick={() => notify(`已切换到${tag}`)}>{tag}</button>
            ))}
          </div>
          <div className="design-app-masonry-list">
            <HomePosterCard variant="festival-red" title="中秋国庆" subtitle="放假通知" footer="" onSelect={() => notify('打开模板')} />
            <HomePosterCard variant="festival-pink" title="喜迎中秋" subtitle="欢度国庆" footer="" onSelect={() => notify('打开模板')} />
            <HomePosterCard variant="scene-blue" title="27考研" subtitle="封闭集训营" footer="" onSelect={() => notify('打开模板')} />
            <HomePosterCard variant="sign-green" title="寻一处静谧" subtitle="与自己独处" footer="" onSelect={() => notify('打开模板')} />
            <HomePosterCard variant="award-red" title="全能提升班" subtitle="提思维·拿证书" footer="" onSelect={() => notify('打开模板')} />
            <HomePosterCard variant="national-red" title="月满山河" subtitle="共庆华诞" footer="" onSelect={() => notify('打开模板')} />
          </div>
        </section>

        <nav className="design-app-bottom-nav" aria-label="主导航">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button" className={activeNav === label ? 'is-active' : ''} onClick={() => handleNavClick(label)}>
              <span className="design-app-nav-icon"><Icon size={26} strokeWidth={activeNav === label ? 2.4 : 1.9} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </main>

      {toast && <div className="design-app-toast" role="status">{toast}</div>}
    </div>
  );
}
