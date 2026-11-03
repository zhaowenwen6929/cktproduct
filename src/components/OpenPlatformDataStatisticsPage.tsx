import { useState } from 'react';
import { BarChart3, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import {
  TeamCreditManagementContent,
  TeamCreditStatisticsContent,
  type CreditManagementLanding,
} from './AgentSkillsHomePage';
import {
  OpenPlatformTemplateEditorContent,
  type TemplateEditorSection,
} from './OpenPlatformTemplateEditorPage';

export type DataStatisticsSection = TemplateEditorSection | 'credit-statistics' | 'credit-management';

type OpenPlatformDataStatisticsPageProps = {
  section: DataStatisticsSection;
  onSectionChange: (section: DataStatisticsSection) => void;
  onNotify: (message: string) => void;
};

export function OpenPlatformDataStatisticsPage({ section, onSectionChange, onNotify }: OpenPlatformDataStatisticsPageProps) {
  const [basicExpanded, setBasicExpanded] = useState(true);
  const [usageExpanded, setUsageExpanded] = useState(true);
  const [managementLanding, setManagementLanding] = useState<CreditManagementLanding>('quota');
  const isBasicStatistics = section === 'basic' || section === 'detail' || section === 'paid';

  return (
    <div className="open-platform-template-workspace open-platform-data-statistics-workspace">
      <aside className="open-platform-template-sidebar open-platform-data-statistics-sidebar">
        <div className="open-platform-template-sidebar-menu">
          <div className="open-platform-template-sidebar-group">
            <button type="button" className={`open-platform-template-sidebar-heading ${isBasicStatistics ? 'is-selected' : ''}`} aria-expanded={basicExpanded} onClick={() => setBasicExpanded((current) => !current)}>
              <BarChart3 size={16} /><span>基础统计</span>{basicExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {basicExpanded ? <div className="open-platform-template-sidebar-subitems">
              <button type="button" className={`open-platform-template-sidebar-subitem ${section === 'basic' ? 'is-active' : ''}`} onClick={() => onSectionChange('basic')}>基本数据</button>
              <button type="button" className={`open-platform-template-sidebar-subitem ${section === 'detail' || section === 'paid' ? 'is-active' : ''}`} onClick={() => onSectionChange('detail')}>详细数据</button>
            </div> : null}
          </div>

          <div className="open-platform-template-sidebar-group open-platform-data-statistics-usage-group">
            <button type="button" className={`open-platform-template-sidebar-heading ${!isBasicStatistics ? 'is-selected' : ''}`} aria-expanded={usageExpanded} onClick={() => setUsageExpanded((current) => !current)}>
              <BarChart3 size={16} /><span>使用统计</span>{usageExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {usageExpanded ? <div className="open-platform-template-sidebar-subitems">
              <button type="button" className={`open-platform-template-sidebar-subitem ${section === 'credit-statistics' ? 'is-active' : ''}`} onClick={() => onSectionChange('credit-statistics')}>积分统计</button>
              <button type="button" className={`open-platform-template-sidebar-subitem ${section === 'credit-management' ? 'is-active' : ''}`} onClick={() => { setManagementLanding('quota'); onSectionChange('credit-management'); }}>积分管理</button>
            </div> : null}
          </div>
        </div>
        <button type="button" className="open-platform-template-sidebar-collapse" aria-label="收起数据统计侧边栏" onClick={() => onNotify('侧边栏已收起')}>‹</button>
      </aside>

      <div className="open-platform-data-statistics-main">
        {isBasicStatistics ? <OpenPlatformTemplateEditorContent section={section} onSectionChange={onSectionChange} onNotify={onNotify} title="基础统计" /> : (
          <div className="open-platform-ai-usage-main open-platform-data-statistics-usage-main">
            <div className="open-platform-ai-usage-breadcrumb">
              <span>数据统计</span><ChevronRight size={13} /><span>使用统计</span><ChevronRight size={13} /><strong>{section === 'credit-statistics' ? '积分统计' : '积分管理'}</strong>
            </div>
            {section === 'credit-statistics' ? <TeamCreditStatisticsContent
              onNotify={onNotify}
              onOpenRequirement={() => onNotify('积分统计需求说明已打开')}
              onOpenMembership={() => onNotify('会员升级入口即将打开')}
              onOpenPointsPurchase={() => onNotify('积分增购入口即将打开')}
              onOpenCreditManagementDetails={() => { setManagementLanding('consumption'); onSectionChange('credit-management'); }}
              remainingPointsLabel="剩余积分数"
            /> : <TeamCreditManagementContent
              landing={managementLanding}
              onNotify={onNotify}
              onOpenRequirement={() => onNotify('积分管理需求说明已打开')}
            />}
          </div>
        )}
      </div>
    </div>
  );
}
