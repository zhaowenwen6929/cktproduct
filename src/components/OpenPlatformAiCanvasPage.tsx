import { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  CreditCard,
  FileImage,
  Image as ImageIcon,
  Info,
  LayoutTemplate,
  Palette,
  Settings2,
  Sparkles,
  Upload,
  WandSparkles,
} from 'lucide-react';
import {
  TeamCreditManagementContent,
  TeamCreditStatisticsContent,
  type CreditManagementLanding,
} from './AgentSkillsHomePage';

export type OpenPlatformAiSection = 'web' | 'statistics' | 'management';

type OpenPlatformAiCanvasPageProps = {
  section: OpenPlatformAiSection;
  managementLanding: CreditManagementLanding;
  onSectionChange: (section: OpenPlatformAiSection) => void;
  onManagementLandingChange: (landing: CreditManagementLanding) => void;
  onNotify: (message: string) => void;
};

const aiTools = [
  { label: '文生图', icon: WandSparkles, tone: 'text' },
  { label: '图生图', icon: ImageIcon, tone: 'image' },
  { label: 'AI素材', icon: Sparkles, tone: 'asset' },
  { label: 'AI绘本', icon: LayoutTemplate, tone: 'book' },
  { label: 'AI人物', icon: Palette, tone: 'person' },
  { label: '商品图', icon: FileImage, tone: 'product' },
  { label: '变清晰', icon: ImageIcon, tone: 'enhance' },
];

const styleOptions = [
  { label: '漫画', tone: 'anime' },
  { label: '现实照片', tone: 'photo' },
  { label: '微缩场景', tone: 'miniature' },
  { label: '科技风', tone: 'technology' },
  { label: '未来机械', tone: 'future' },
  { label: '蒸汽朋克', tone: 'steampunk' },
  { label: '水墨', tone: 'ink' },
  { label: '水彩风', tone: 'watercolor' },
  { label: '极简漫画', tone: 'minimal' },
];

export function OpenPlatformAiCanvasPage({
  section,
  managementLanding,
  onSectionChange,
  onManagementLandingChange,
  onNotify,
}: OpenPlatformAiCanvasPageProps) {
  return (
    <div className="open-platform-ai-workspace">
      <AiCanvasSidebar section={section} onSectionChange={onSectionChange} />
      {section === 'web' ? <AiThemeEditor onNotify={onNotify} /> : (
        <div className="open-platform-ai-usage-main">
          <div className="open-platform-ai-usage-breadcrumb">
            <span>AI画匠</span><ChevronRight size={13} /><span>使用统计</span><ChevronRight size={13} /><strong>{section === 'statistics' ? '积分统计' : '积分管理'}</strong>
          </div>
          {section === 'statistics' ? (
            <TeamCreditStatisticsContent
              onNotify={onNotify}
              onOpenRequirement={() => onNotify('积分统计需求说明已打开')}
              onOpenMembership={() => onNotify('会员升级入口即将打开')}
              onOpenPointsPurchase={() => onNotify('积分增购入口即将打开')}
              onOpenCreditManagementDetails={() => {
                onManagementLandingChange('consumption');
                onSectionChange('management');
              }}
              remainingPointsLabel="剩余积分数"
            />
          ) : (
            <TeamCreditManagementContent
              landing={managementLanding}
              onNotify={onNotify}
              onOpenRequirement={() => onNotify('积分管理需求说明已打开')}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AiCanvasSidebar({ section, onSectionChange }: { section: OpenPlatformAiSection; onSectionChange: (section: OpenPlatformAiSection) => void }) {
  return (
    <aside className="open-platform-ai-sidebar">
      <div className="open-platform-ai-sidebar-card">
        <button type="button" className="open-platform-ai-sidebar-heading">
          <Settings2 size={16} />
          <span>主题设置</span>
          <ChevronUp size={14} />
        </button>
        <button type="button" className={`open-platform-ai-sidebar-item ${section === 'web' ? 'is-active' : ''}`} onClick={() => onSectionChange('web')}>Web端</button>
        <button type="button" className="open-platform-ai-sidebar-group" aria-expanded="true">
          <BarChart3 size={16} />
          <span>使用统计</span>
          <ChevronDown size={14} />
        </button>
        <div className="open-platform-ai-sidebar-subitems">
          <button type="button" className={`open-platform-ai-sidebar-subitem ${section === 'statistics' ? 'is-active' : ''}`} onClick={() => onSectionChange('statistics')}>
            <span className="open-platform-ai-sidebar-subdot" />积分统计
          </button>
          <button type="button" className={`open-platform-ai-sidebar-subitem ${section === 'management' ? 'is-active' : ''}`} onClick={() => onSectionChange('management')}>
            <span className="open-platform-ai-sidebar-subdot" />积分管理
          </button>
        </div>
      </div>
      <button className="open-platform-ai-sidebar-collapse" type="button" aria-label="收起侧边栏"><ChevronRight size={15} /></button>
    </aside>
  );
}

function AiThemeEditor({ onNotify }: { onNotify: (message: string) => void }) {
  const [headerControl, setHeaderControl] = useState('开启');
  const [brandMark, setBrandMark] = useState('自定义品牌标志');
  const [copyright, setCopyright] = useState('自定义');
  const [agreement, setAgreement] = useState('默认配置');

  return (
    <div className="open-platform-ai-editor-shell">
      <section className="open-platform-ai-editor-main">
        <h1>主题设置-Web端</h1>
        <div className="open-platform-ai-preview-card">
          <div className="open-platform-ai-preview-toolbar">
            <div className="open-platform-ai-preview-logo" aria-hidden="true" />
            <button type="button" onClick={() => onNotify('版权声明已打开')}><CircleHelp size={14} />版权声明</button>
            <button type="button" className="open-platform-ai-download-button" onClick={() => onNotify('下载功能即将打开')}>下载</button>
          </div>
          <div className="open-platform-ai-preview-body">
            <div className="open-platform-ai-tools-rail">
              {aiTools.map((tool, index) => {
                const Icon = tool.icon;
                return <button type="button" key={tool.label} className={`open-platform-ai-tool ${index === 0 ? 'is-active' : ''}`} onClick={() => onNotify(`已选择：${tool.label}`)}><Icon size={20} /><span>{tool.label}</span></button>;
              })}
            </div>
            <div className="open-platform-ai-input-panel">
              <h2>文生图 <Info size={14} /></h2>
              <label className="open-platform-ai-text-field"><strong>*文本描述</strong><textarea placeholder="输入文本内容，引导图片生成方向，支持中英文" maxLength={1000} /><span>0/1000</span></label>
              <div className="open-platform-ai-examples"><span>示范：</span><button type="button">标题的文字</button><button type="button">标题的文字</button><button type="button">标题的文字</button><button type="button" aria-label="刷新示范">↻</button></div>
              <div className="open-platform-ai-style-card">
                <div className="open-platform-ai-field-heading"><strong>*风格</strong><Info size={14} /><ChevronDown size={14} /></div>
                <div className="open-platform-ai-style-tabs"><button type="button" className="is-active">风格</button><button type="button">艺术家</button><button type="button">相机镜头</button></div>
                <div className="open-platform-ai-style-grid">
                  {styleOptions.map((style) => <button type="button" key={style.label} className={`open-platform-ai-style-option open-platform-ai-style-option--${style.tone}`} onClick={() => onNotify(`已选择风格：${style.label}`)}><span>{style.label}</span></button>)}
                </div>
              </div>
              <button type="button" className="open-platform-ai-create-button" onClick={() => onNotify('请先在右侧配置并应用主题设置')}>立即创作</button>
              <p className="open-platform-ai-agreement-note">使用创客贴AI创作服务表示您已同意《AI创作服务协议》</p>
            </div>
            <div className="open-platform-ai-result-panel">
              <div className="open-platform-ai-empty-state">
                <div className="open-platform-ai-empty-illustration"><Upload size={40} /><span /><i /><b /></div>
                <strong>生成的图片将会显示在这里</strong>
                <span>左侧输入描述，创建你的作品吧</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="open-platform-ai-settings-panel">
        <h2>主题色 <Info size={13} /></h2>
        <div className="open-platform-ai-color-row"><label>主色<input type="color" defaultValue="#c722b6" /></label><label>辅色<input type="color" defaultValue="#b8df17" /></label></div>
        <AiSetting label="Header控制" value={headerControl} onChange={setHeaderControl} options={['开启', '关闭']} />
        <div className="open-platform-ai-setting-label"><span>品牌标志 <Info size={13} /></span><button type="button" onClick={() => onNotify('品牌标志上传入口已打开')}>上传</button></div>
        <AiSelect value={brandMark} onChange={setBrandMark} options={['自定义品牌标志', '创客贴品牌标志', '不显示']} />
        <div className="open-platform-ai-setting-label"><span>版权声明</span><button type="button" onClick={() => onNotify('版权声明编辑入口已打开')}>编辑</button></div>
        <AiSelect value={copyright} onChange={setCopyright} options={['自定义', '默认版权声明', '不显示']} />
        <AiSetting label="AI创作服务协议" value={agreement} onChange={setAgreement} options={['默认配置', '自定义协议', '不显示']} />
        <button type="button" className="open-platform-ai-apply-button" onClick={() => onNotify('主题设置已应用')}>应用设置</button>
      </aside>
    </div>
  );
}

function AiSetting({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <><div className="open-platform-ai-setting-label"><span>{label} <Info size={13} /></span></div><AiSelect value={value} onChange={onChange} options={options} /></>;
}

function AiSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="open-platform-ai-select"><select value={value} onChange={(event) => onChange(event.currentTarget.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>;
}
