import { type ReactNode, useState } from 'react';
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  Sparkles,
} from 'lucide-react';

type DesignAppAiCreatePageProps = {
  onBack: () => void;
};

function CompletedStep({ children }: { children: ReactNode }) {
  return (
    <div className="design-ai-step">
      <span className="design-ai-step__check"><Check size={12} strokeWidth={3} /></span>
      <span>{children}</span>
    </div>
  );
}

export function DesignAppAiCreatePage({ onBack }: DesignAppAiCreatePageProps) {
  const [inputValue, setInputValue] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [toast, setToast] = useState('');

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
    notify('已收到你的设计需求');
  };

  return (
    <div className="design-ai-page">
      <main className="design-ai-shell">
        <div className="design-ai-status-bar" aria-label="状态栏">
          <span>12:01</span>
          <span className="design-app-status-icons"><span className="status-signal" /><span className="status-wifi" /><span className="status-battery">90</span></span>
        </div>
        <header className="design-ai-header">
          <button type="button" className="design-ai-header__back" onClick={onBack} aria-label="返回创客贴设计首页">
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>
          <h1>中秋快乐</h1>
          <div className="design-ai-header__actions">
            <button type="button" className="design-ai-credit" onClick={() => notify('积分明细即将上线')}>
              <Sparkles size={16} fill="currentColor" />
              <span>183923</span>
            </button>
            <button type="button" onClick={() => notify('已新建一轮对话')} aria-label="新建对话">
              <MessageSquarePlus size={26} strokeWidth={2} />
            </button>
            <button type="button" onClick={() => notify('更多功能即将上线')} aria-label="更多功能">
              <Menu size={27} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        <section className="design-ai-conversation" aria-label="AI创作对话流">
          <div className="design-ai-intro-copy">
            <p>我想做一张中秋节主题的海报，请帮我完成设计。</p>
            <p>让我先了解一下海报设计的具体要求，这样才能帮你做出最合适的设计。</p>
            <p>好的，我来帮你做一张中秋海报。从你刚才说的“中秋快乐”，我理解这是中秋节主题的海报。</p>
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
            <p>海报主要给谁看？：<strong>客户/合作伙伴</strong></p>
            <p>需要生成几张？：<strong>1张</strong></p>
          </div>

          <button type="button" className="design-ai-copy" onClick={() => notify('已复制补充信息')} aria-label="复制补充信息">
            <Copy size={22} strokeWidth={1.8} />
          </button>

          <div className="design-ai-agent-message">
            <div className="design-ai-agent-label"><span>✦</span><strong>需求规划师</strong></div>
            <p>信息已确认，我来为你制作一张面向客户/合作伙伴的中秋朋友圈海报。</p>
          </div>

          {submittedPrompt && (
            <div className="design-ai-submitted-prompt">{submittedPrompt}</div>
          )}

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
              <strong>愿你<br />月满人团圆</strong>
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
          <div className="design-ai-bottom-space" />
        </section>

        <form className="design-ai-composer" onSubmit={(event) => { event.preventDefault(); handleGenerate(); }}>
          <button type="button" className="design-ai-composer__attach" onClick={() => notify('附件功能即将上线')} aria-label="添加附件">
            <Paperclip size={20} strokeWidth={2} />
          </button>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="#输入您的设计需求～"
            aria-label="输入设计需求"
          />
          <button type="submit" className="design-ai-composer__submit">
            <span>生成</span>
            <ArrowUp size={17} strokeWidth={2.4} />
          </button>
        </form>
      </main>
      {toast && <div className="design-ai-toast" role="status">{toast}</div>}
    </div>
  );
}
