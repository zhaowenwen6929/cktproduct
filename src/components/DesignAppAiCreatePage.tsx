import { type ReactNode, useState } from 'react';
import {
  ArrowUp,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  House,
  Images,
  Mic,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  PanelsTopLeft,
  Paperclip,
  Plus,
  FolderOpen,
  SlidersHorizontal,
  Sparkles,
  X,
  UserRound,
} from 'lucide-react';

type DesignAppAiCreatePageProps = {
  onBack: () => void;
  onOpenResources: () => void;
  initialWorkTitle?: string;
  initialNewConversation?: boolean;
  initialOpenHistory?: boolean;
  credits?: number;
  additionalWorkTitles?: string[];
};

type AiHistoryGroup = { date: string; items: string[] };

type AiWorkItem = {
  title: string;
  date: string;
  variant: string;
  topic: string;
  audience: string;
  historyGroups: AiHistoryGroup[];
};

const workItems: AiWorkItem[] = [
  {
    title: '中秋国庆放假通知', date: '09月22日', variant: 'cream', topic: '中秋国庆放假通知海报', audience: '客户/合作伙伴',
    historyGroups: [
      { date: '09月22日', items: ['中秋快乐', '中秋国庆放假通知'] },
      { date: '09月20日', items: ['制作宣传海报'] },
      { date: '09月17日', items: ['中秋节海报', '做海报'] },
    ],
  },
  {
    title: '品牌灵感海报', date: '09月20日', variant: 'blue', topic: '品牌灵感主题海报', audience: '品牌客户',
    historyGroups: [
      { date: '09月20日', items: ['品牌灵感海报'] },
      { date: '09月17日', items: ['参考模版生成设计', '生成同款设计'] },
    ],
  },
  {
    title: '秋日活动主视觉', date: '09月17日', variant: 'blank', topic: '秋日活动主视觉', audience: '活动参与者',
    historyGroups: [
      { date: '09月17日', items: ['秋日活动主视觉'] },
      { date: '09月08日', items: ['秋日活动海报', '做海报'] },
    ],
  },
  {
    title: '月满人团圆', date: '09月08日', variant: 'moon', topic: '中秋团圆祝福海报', audience: '亲友与客户',
    historyGroups: [
      { date: '09月08日', items: ['月满人团圆'] },
      { date: '03月12日', items: ['中秋节海报'] },
    ],
  },
  {
    title: '产品宣传海报', date: '03月12日', variant: 'poster', topic: '产品宣传海报', audience: '潜在客户',
    historyGroups: [
      { date: '03月12日', items: ['产品宣传海报'] },
      { date: '03月11日', items: ['生成同款设计'] },
      { date: '03月10日', items: ['麦角硫因精华水介绍'] },
    ],
  },
  {
    title: '春日上新活动', date: '03月08日', variant: 'poster', topic: '春日上新活动海报', audience: '店铺顾客',
    historyGroups: [
      { date: '03月08日', items: ['春日上新活动'] },
      { date: '03月07日', items: ['春季新品宣传', '制作上新海报'] },
    ],
  },
  {
    title: '店铺开业邀请函', date: '03月05日', variant: 'cream', topic: '店铺开业邀请函', audience: '到店客户',
    historyGroups: [
      { date: '03月05日', items: ['店铺开业邀请函'] },
      { date: '03月03日', items: ['开业活动文案'] },
      { date: '03月01日', items: ['参考门店风格制作'] },
    ],
  },
  {
    title: '招聘宣传海报', date: '02月28日', variant: 'blue', topic: '招聘宣传海报', audience: '求职者',
    historyGroups: [
      { date: '02月28日', items: ['招聘宣传海报'] },
      { date: '02月26日', items: ['诚聘英才海报', '招聘信息排版'] },
    ],
  },
  {
    title: '每日早安分享', date: '02月22日', variant: 'moon', topic: '每日早安分享图', audience: '社交媒体粉丝',
    historyGroups: [
      { date: '02月22日', items: ['每日早安分享'] },
      { date: '02月20日', items: ['温暖治愈风早安图'] },
    ],
  },
  {
    title: '品牌发布会主视觉', date: '02月18日', variant: 'blue', topic: '品牌发布会主视觉', audience: '参会嘉宾',
    historyGroups: [
      { date: '02月18日', items: ['品牌发布会主视觉'] },
      { date: '02月16日', items: ['科技感发布会设计', '品牌主视觉方案'] },
    ],
  },
  {
    title: '教师节祝福海报', date: '02月12日', variant: 'cream', topic: '教师节祝福海报', audience: '老师与家长',
    historyGroups: [
      { date: '02月12日', items: ['教师节祝福海报'] },
      { date: '02月10日', items: ['感恩教师节文案'] },
    ],
  },
  {
    title: '年终总结汇报', date: '01月30日', variant: 'blank', topic: '年终总结汇报', audience: '公司团队',
    historyGroups: [
      { date: '01月30日', items: ['年终总结汇报'] },
      { date: '01月28日', items: ['年度数据可视化', '汇报封面设计'] },
    ],
  },
];

function CompletedStep({ children }: { children: ReactNode }) {
  return (
    <div className="design-ai-step">
      <span className="design-ai-step__check"><Check size={12} strokeWidth={3} /></span>
      <span>{children}</span>
    </div>
  );
}

function WorkThumbnail({ variant }: { variant: string }) {
  return (
    <span className={`design-ai-work-thumb design-ai-work-thumb--${variant}`} aria-hidden="true">
      <span className="design-ai-work-thumb__copy">{variant === 'blue' ? '品牌\n灵感' : variant === 'moon' ? '月满\n人团圆' : ''}</span>
      <span className="design-ai-work-thumb__moon" />
    </span>
  );
}

function ExistingConversationFlow({ activeWork, submittedPrompt, notify }: { activeWork: AiWorkItem; submittedPrompt: string; notify: (message: string) => void }) {
  return (
    <>
      <div className="design-ai-intro-copy">
        <p>我想做一张{activeWork.topic}，请帮我完成设计。</p>
        <p>让我先了解一下设计的具体要求，这样才能帮你做出最合适的设计。</p>
        <p>好的，我来帮你做一张{activeWork.topic}，从你刚才的描述中，我理解这是一个适合传播的主题设计。</p>
        <p>为了让海报更符合你的需求，我需要了解几个关键信息：</p>
      </div>

      <button type="button" className="design-ai-info-status" onClick={() => notify('信息已收集完成')}>
        <span className="design-ai-info-status__icon"><Check size={17} strokeWidth={3} /></span>
        <strong>信息收集完成</strong>
        <ChevronDown size={23} strokeWidth={2.4} />
      </button>

      <div className="design-ai-time">09.22 19:41</div>

      <div className="design-ai-user-card">
        <p>我的补充信息如下：</p>
        <p>海报主要用在哪里？：<strong>微信朋友圈</strong></p>
        <p>海报上需要写什么文案？（如品牌名、祝福语、活动信息等）：<strong>你定</strong></p>
        <p>海报主要给谁看？：<strong>{activeWork.audience}</strong></p>
        <p>需要生成几张？：<strong>1张</strong></p>
      </div>

      <button type="button" className="design-ai-copy" onClick={() => notify('已复制补充信息')} aria-label="复制补充信息">
        <Copy size={22} strokeWidth={1.8} />
      </button>

      <div className="design-ai-agent-message">
        <div className="design-ai-agent-label"><span>✦</span><strong>需求规划师</strong></div>
        <p>信息已确认，我来为你制作一张面向{activeWork.audience}的{activeWork.topic}。</p>
      </div>

      {submittedPrompt && <div className="design-ai-submitted-prompt">{submittedPrompt}</div>}

      <div className="design-ai-complete-label"><span>@品牌创意专家</span><em>已完成</em></div>

      <section className="design-ai-agent-card">
        <div className="design-ai-agent-card__header">
          <span className="design-ai-agent-avatar">品</span>
          <strong>品牌创意专家</strong>
        </div>
        <div className="design-ai-agent-card__steps">
          <CompletedStep>思考完成</CompletedStep>
          <CompletedStep>生成完成</CompletedStep>
          <span className="design-ai-model">智能图像 2.0</span>
        </div>
        <div className="design-ai-poster-preview">
          <span className="design-ai-poster-badge">AI 生成</span>
          <span className="design-ai-poster-kicker">花好月圆 · 中秋快乐</span>
          <strong>{activeWork.title === '品牌灵感海报' ? <>品牌<br />灵感</> : activeWork.title === '产品宣传海报' ? <>产品<br />宣传</> : <>愿你<br />月满人团圆</>}</strong>
          <span className="design-ai-poster-moon" />
          <span className="design-ai-poster-cloud design-ai-poster-cloud--left" />
          <span className="design-ai-poster-cloud design-ai-poster-cloud--right" />
          <span className="design-ai-poster-footer">创客贴设计 · 为每一份创意而来</span>
        </div>
        <div className="design-ai-agent-card__footer">
          <button type="button" onClick={() => notify('正在打开生成结果')}>查看大图</button>
          <button type="button" onClick={() => notify('已加入无限画布')}>加入画布</button>
          <MoreHorizontal size={18} />
        </div>
      </section>
    </>
  );
}

export function DesignAppAiCreatePage({ onBack, onOpenResources, initialWorkTitle, initialNewConversation = false, initialOpenHistory = false, credits = 204843, additionalWorkTitles = [] }: DesignAppAiCreatePageProps) {
  const availableWorkItems = [
    ...additionalWorkTitles.map((title): AiWorkItem => ({
      title,
      date: '刚刚',
      variant: 'blank',
      topic: '无限画布设计',
      audience: '项目团队',
      historyGroups: [{ date: '刚刚', items: [title] }],
    })),
    ...workItems,
  ];
  const initialWork = availableWorkItems.find((work) => work.title === initialWorkTitle) ?? workItems[0];
  const [inputValue, setInputValue] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [toast, setToast] = useState('');
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState(initialNewConversation);
  const [isWorksOpen, setIsWorksOpen] = useState(initialOpenHistory);
  const [activeWorkTitle, setActiveWorkTitle] = useState(initialWork.title);
  const [conversationTitle, setConversationTitle] = useState(initialNewConversation ? '' : initialWorkTitle ?? '中秋快乐');

  const activeWork = availableWorkItems.find((work) => work.title === activeWorkTitle) ?? workItems[0];

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const handleGenerate = () => {
    const prompt = inputValue.trim();
    if (!prompt) {
      notify('请输入你的设计需求');
      return;
    }
    setSubmittedPrompt(prompt);
    setInputValue('');
    setIsComposerExpanded(false);
    notify('已收到你的设计需求');
  };

  const handleCreateConversation = () => {
    setIsNewConversation(true);
    setSubmittedPrompt('');
    setInputValue('');
    setIsComposerExpanded(false);
    setIsWorksOpen(false);
  };

  const handleHistorySelect = (title: string) => {
    setConversationTitle(title);
    setIsNewConversation(false);
    setIsWorksOpen(false);
  };

  const handleWorkSelect = (work: AiWorkItem) => {
    setActiveWorkTitle(work.title);
    setConversationTitle(work.title);
    setSubmittedPrompt('');
    setIsNewConversation(false);
    notify(`已切换到作品：${work.title}`);
  };

  return (
    <div className="design-ai-page">
      <main className="design-ai-shell">
        <div className="design-ai-status-bar" aria-label="状态栏">
            <span>12:00</span>
          <span className="design-app-status-icons"><span className="status-signal" /><span className="status-wifi" /><span className="status-battery">90</span></span>
        </div>
        <header className={`design-ai-header${isNewConversation ? ' design-ai-header--minimal' : ''}`}>
          {!isNewConversation && <button type="button" className="design-ai-header__back" onClick={onBack} aria-label="返回创客贴设计首页">
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>}
          {!isNewConversation && <h1>{conversationTitle}</h1>}
          <div className="design-ai-header__actions">
            <button type="button" className="design-ai-credit" onClick={() => notify('积分明细即将上线')}>
              <Sparkles size={16} fill="currentColor" />
              <span>{credits.toLocaleString()}</span>
            </button>
            <button type="button" className="design-ai-results-button" onClick={onOpenResources} aria-label="生成结果" title="生成结果">
                <Images size={18} strokeWidth={2.1} />
            </button>
            <div className="design-ai-more-wrap">
              <button type="button" onClick={() => setIsWorksOpen(true)} aria-label="打开历史">
                <Menu size={27} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </header>

        <section className={`design-ai-conversation${isNewConversation ? '' : ' design-ai-conversation--existing'}`} aria-label="AI创作对话流">
          {isNewConversation ? submittedPrompt ? (
            <div className="design-ai-result-state">
              <div className="design-ai-welcome-title">
                <span className="design-ai-welcome-mark"><Sparkles size={27} strokeWidth={2.2} /></span>
                <h1>今天有什么好想法</h1>
              </div>
              <div className="design-ai-submitted-prompt">{submittedPrompt}</div>
              <p>好的，我来帮你完成这份设计需求。</p>
              <button type="button" className="design-ai-result-card" onClick={() => notify('正在生成设计结果')}>
                <span className="design-ai-result-card__shine">✦</span>
                <strong>{activeWork.topic}</strong>
                <span>点击继续生成设计</span>
              </button>
            </div>
          ) : (
            <div className="design-ai-welcome">
              <div className="design-ai-welcome-title">
                <span className="design-ai-welcome-mark"><Sparkles size={27} strokeWidth={2.2} /></span>
                <h1>今天有什么好想法</h1>
              </div>
              <div className="design-ai-suggestion-list">
                <button type="button" className="design-ai-suggestion-card" onClick={() => { setInputValue('生成电商产品海报'); setIsComposerExpanded(true); }}>
                  <span>生成电商产品海报</span>
                  <span className="design-ai-suggestion-preview design-ai-suggestion-preview--product"><b>春日<br />新品</b></span>
                </button>
                <button type="button" className="design-ai-suggestion-card" onClick={() => { setInputValue('生成高级形象照'); setIsComposerExpanded(true); }}>
                  <span>生成高级形象照</span>
                  <span className="design-ai-suggestion-preview design-ai-suggestion-preview--portrait"><i /></span>
                </button>
                <button type="button" className="design-ai-suggestion-card" onClick={() => { setInputValue('生成专属证件照'); setIsComposerExpanded(true); }}>
                  <span>生成专属证件照</span>
                  <span className="design-ai-suggestion-preview design-ai-suggestion-preview--id"><i /></span>
                </button>
              </div>
              <button type="button" className="design-ai-refresh" onClick={() => notify('已换一组创作灵感')}><span>↻</span> 换一换</button>
            </div>
          ) : <ExistingConversationFlow activeWork={activeWork} submittedPrompt={submittedPrompt} notify={notify} />}
          <div className="design-ai-bottom-space" />
        </section>

        {!isComposerExpanded ? (
          <form className="design-ai-composer" onSubmit={(event) => { event.preventDefault(); handleGenerate(); }}>
            <button type="button" className="design-ai-composer__attach" onClick={() => setIsComposerExpanded(true)} aria-label="添加附件">
              {isNewConversation ? <Plus size={22} strokeWidth={2.1} /> : <Paperclip size={20} strokeWidth={2} />}
            </button>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onFocus={() => setIsComposerExpanded(true)}
              placeholder={isNewConversation ? '描述你的灵感，支持 @ 输入内容' : '#输入您的设计需求～'}
              aria-label="输入设计需求"
            />
            {isNewConversation ? (
              <button type="button" className="design-ai-composer__mic" onClick={() => notify('语音输入即将上线')} aria-label="语音输入">
                <Mic size={23} strokeWidth={2.2} />
              </button>
            ) : (
              <button type="submit" className="design-ai-composer__submit">
                <span>生成</span>
                <ArrowUp size={17} strokeWidth={2.4} />
              </button>
            )}
          </form>
        ) : (
          <>
            <button type="button" className="design-ai-input-backdrop" onClick={() => setIsComposerExpanded(false)} aria-label="关闭输入面板" />
            <form className="design-ai-input-sheet" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); handleGenerate(); }}>
              <button type="button" className="design-ai-input-sheet__attachment" onClick={() => notify('附件功能即将上线')} aria-label="添加图片">
                <span>+</span>
              </button>
              <textarea
                autoFocus
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="描述你的灵感，支持 @ 输入内容"
                aria-label="详细描述设计需求"
              />
              <div className="design-ai-input-sheet__toolbar">
                <div className="design-ai-input-sheet__modes">
                  <button type="button" onClick={() => notify('当前为 Agent 模式')}>
                    <Box size={21} strokeWidth={2} />
                    <span>Agent模式</span>
                  </button>
                  <button type="button" onClick={() => notify('生成参数设置即将上线')} aria-label="生成参数">
                    <SlidersHorizontal size={21} strokeWidth={2} />
                  </button>
                </div>
                <button type="submit" className="design-ai-input-sheet__generate">生成</button>
              </div>
            </form>
          </>
        )}
        {!isComposerExpanded && <p className="design-ai-composer-note">内容由 AI 生成</p>}
        <nav className="design-app-bottom-nav design-ai-app-nav" aria-label="创客贴主导航">
          <button type="button" onClick={onBack}><span className="design-app-nav-icon"><House size={25} strokeWidth={1.9} /></span><span>首页</span></button>
          <button type="button" onClick={() => { onBack(); notify('模板页面即将打开'); }}><span className="design-app-nav-icon"><PanelsTopLeft size={25} strokeWidth={1.9} /></span><span>模板</span></button>
          <button type="button" className="is-active" aria-current="page"><span className="design-app-nav-icon"><Sparkles size={25} strokeWidth={2.3} /></span><span>AI创作</span></button>
          <button type="button" onClick={() => { onBack(); notify('资源页面即将打开'); }}><span className="design-app-nav-icon"><FolderOpen size={25} strokeWidth={1.9} /></span><span>资源</span></button>
          <button type="button" onClick={() => { onBack(); notify('我的页面即将打开'); }}><span className="design-app-nav-icon"><UserRound size={25} strokeWidth={1.9} /></span><span>我的</span></button>
        </nav>
      </main>
      {isWorksOpen && (
        <>
          <button type="button" className="design-ai-history-backdrop" onClick={() => setIsWorksOpen(false)} aria-label="关闭侧边列表" />
          <aside className="design-ai-history-panel" aria-label="历史与无限画布设计列表">
            <div className="design-ai-history-header">
              <div className="design-ai-history-header__title"><div><h2>历史</h2><p>全部无限画布设计</p></div></div>
              <div>
                <button type="button" onClick={handleCreateConversation} aria-label="新建对话"><MessageSquarePlus size={25} strokeWidth={2} /></button>
                <button type="button" onClick={() => setIsWorksOpen(false)} aria-label="关闭侧边列表"><X size={25} strokeWidth={2} /></button>
              </div>
            </div>
            <div className="design-ai-works-list">
              {availableWorkItems.map((work) => {
                const isCurrentWork = work.title === activeWork.title;
                return (
                  <div key={work.title} className={`design-ai-work-entry${isCurrentWork ? ' is-expanded' : ''}`}>
                    <button type="button" className={`design-ai-work-item${isCurrentWork ? ' is-current' : ''}`} onClick={() => handleWorkSelect(work)}>
                      <WorkThumbnail variant={work.variant} />
                      <span className="design-ai-work-item__meta">
                        <strong>{work.title}</strong>
                        <small>{work.date}</small>
                      </span>
                      <MoreHorizontal size={20} strokeWidth={2.5} />
                    </button>
                    {isCurrentWork && (
                      <div className="design-ai-work-conversations">
                        {work.historyGroups.map((group) => (
                          <section key={group.date}>
                            <h3>{group.date}</h3>
                            {group.items.map((item, index) => (
                              <button key={`${group.date}-${item}-${index}`} type="button" className={item === conversationTitle && !isNewConversation ? 'is-current' : ''} onClick={() => handleHistorySelect(item)}>
                                <span>{item}</span>
                                <MoreHorizontal size={17} strokeWidth={2.4} />
                              </button>
                            ))}
                          </section>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </>
      )}
      {toast && <div className="design-ai-toast" role="status">{toast}</div>}
    </div>
  );
}
