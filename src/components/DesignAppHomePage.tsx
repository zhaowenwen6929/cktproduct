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
