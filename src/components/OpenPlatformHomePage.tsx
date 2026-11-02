import { useState } from 'react';
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckSquare2,
  ChevronRight,
  CircleUserRound,
  Code2,
  FileImage,
  FileText,
  LayoutTemplate,
  MonitorSmartphone,
  Palette,
  Presentation,
  Scissors,
  Sparkles,
  TerminalSquare,
  WandSparkles,
} from 'lucide-react';

type OpenPlatformHomePageProps = {
  onBackToDirectory: () => void;
};

type Service = {
  title: string;
  description: string;
  icon: typeof Code2;
  tone: 'green' | 'orange' | 'blue' | 'indigo';
};

type QuickTool = {
  label: string;
  icon: typeof FileText;
};

const services: Service[] = [
  {
    title: 'WEB端模板编辑器',
    description: '模板编辑器是一款创新的平面设计工具，提供海量原创模板，通过简单拖拉操作，平均5分钟即可输出一张高质量海报',
    icon: Code2,
    tone: 'green',
  },
  {
    title: '移动端模板编辑器',
    description: '移动端模板编辑器支持全终端的对接，包括小程序、app、h5随时使用方便快捷',
    icon: MonitorSmartphone,
    tone: 'green',
  },
  {
    title: '图片编辑器',
    description: '图片编辑器支持图片消除，水印添加，剪裁旋转，滤镜处理等功能，为你的图片在线化妆',
    icon: FileImage,
    tone: 'orange',
  },
  {
    title: '抠图编辑器',
    description: '在线抠图编辑器，强大的抠图给你更多可能',
    icon: Scissors,
    tone: 'blue',
  },
  {
    title: '模板中心',
    description: '像搭积木一样配置模板中心，多级场景一键配置，支持行业筛选让模板中心更加聚焦',
    icon: LayoutTemplate,
    tone: 'indigo',
  },
];

const quickTools: QuickTool[] = [
  { label: '更新公告', icon: FileText },
  { label: 'SDK下载', icon: TerminalSquare },
  { label: '验签工具', icon: CheckSquare2 },
  { label: '演示demo', icon: Presentation },
  { label: '营销日历', icon: CalendarDays },
  { label: '轻应用介绍', icon: BookOpen },
];

const navItems = ['首页', '模板编辑器', '模板中心', 'AI画匠', '智能设计'];
const OPEN_PLATFORM_LOGO_URL = 'https://open.chuangkit.com/saasimg/logo.05b647fb.svg';

export function OpenPlatformHomePage({ onBackToDirectory }: OpenPlatformHomePageProps) {
  const [activeNav, setActiveNav] = useState('首页');
  const [notice, setNotice] = useState('');

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const handleNav = (item: string) => {
    setActiveNav(item);
    if (item !== '首页') showNotice(`${item}正在为你准备中`);
  };

  return (
    <div className="open-platform-page" data-testid="open-platform-home">
      <header className="open-platform-header">
        <button className="open-platform-brand" type="button" onClick={() => handleNav('首页')} aria-label="返回开放平台首页">
          <img className="open-platform-brand-logo" src={OPEN_PLATFORM_LOGO_URL} alt="创客贴开放平台" />
        </button>

        <nav className="open-platform-nav" aria-label="开放平台主导航">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={activeNav === item ? 'is-active' : ''}
              onClick={() => handleNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="open-platform-account">
          <button className="open-platform-docs-button" type="button" onClick={() => showNotice('文档中心已打开')}>
            文档中心
          </button>
          <span className="open-platform-account-divider" aria-hidden="true" />
          <button className="open-platform-user" type="button" onClick={() => showNotice('当前企业：测试企业济南')}>
            <span className="open-platform-user-avatar"><Palette size={18} strokeWidth={2.5} /></span>
            <span>测试企业济南</span>
          </button>
        </div>
      </header>

      <main className="open-platform-main">
        <h1>欢迎使用</h1>

        <div className="open-platform-layout">
          <div className="open-platform-primary-column">
            <section className="open-platform-hero" aria-label="创客贴开放平台介绍">
              <div className="open-platform-hero-copy">
                <div className="open-platform-hero-title">创客贴开放平台</div>
                <div className="open-platform-hero-subtitle">OPEN PLATFORM</div>
                <span className="open-platform-hero-pill">开启您的定制化服务</span>
              </div>
              <div className="open-platform-hero-art" aria-hidden="true">
                <span className="hero-orbit hero-orbit-one" />
                <span className="hero-orbit hero-orbit-two" />
                <span className="hero-block hero-block-back" />
                <span className="hero-block hero-block-front" />
                <span className="hero-block hero-block-side" />
                <span className="hero-ribbon hero-ribbon-one" />
                <span className="hero-ribbon hero-ribbon-two" />
                <span className="hero-dot hero-dot-one" />
                <span className="hero-dot hero-dot-two" />
                <Sparkles className="hero-spark" size={20} />
              </div>
            </section>

            <section className="open-platform-section open-platform-services">
              <SectionTitle>已开通的服务</SectionTitle>
              <div className="open-platform-service-grid">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.title}
                      type="button"
                      className="open-platform-service-card"
                      onClick={() => showNotice(`已选择：${service.title}`)}
                    >
                      <span className={`open-platform-service-icon open-platform-service-icon--${service.tone}`}>
                        <Icon size={24} strokeWidth={2.1} />
                      </span>
                      <strong>{service.title}</strong>
                      <p>{service.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="open-platform-side-column">
            <section className="open-platform-section open-platform-company-card">
              <SectionTitle>企业信息</SectionTitle>
              <div className="open-platform-company-identity">
                <span className="open-platform-company-badge"><Palette size={27} strokeWidth={2.5} /></span>
                <strong>testhmy</strong>
                <span className="open-platform-verified"><BadgeCheck size={13} /> 企业认证</span>
              </div>
              <dl className="open-platform-company-details">
                <div><dt>所属企业：</dt><dd>测试企业济南</dd></div>
                <div><dt>行业类别：</dt><dd>电商平台</dd></div>
                <div><dt>产品领域：</dt><dd>营销</dd></div>
              </dl>
            </section>

            <section className="open-platform-section open-platform-tools-card">
              <SectionTitle>常用工具</SectionTitle>
              <div className="open-platform-tools-grid">
                {quickTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button key={tool.label} type="button" className="open-platform-tool" onClick={() => showNotice(`已打开：${tool.label}`)}>
                      <Icon size={22} strokeWidth={2.1} />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>

        <button type="button" className="open-platform-back-link" onClick={onBackToDirectory}>
          <ChevronRight size={14} /> 返回项目目录
        </button>
      </main>

      {notice ? <div className="open-platform-toast" role="status">{notice}</div> : null}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="open-platform-section-title">
      <span aria-hidden="true" />
      {children}
    </h2>
  );
}
