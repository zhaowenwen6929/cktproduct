import { useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, CircleHelp, Download } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { MEMBER_TYPE_REQUIREMENT, MEMBER_TYPE_REQUIREMENT_NAME, MEMBER_TYPE_REQUIREMENT_SECTIONS, POINTS_REQUIREMENT, MemberTypeDropdown, RequirementHint, formatPointsDisplay, getMemberPointsConfigForDuration, getPackagePointsDisplay, isHistoricalMemberType, isLifetimeDuration } from './MembershipPackagePage';

type MembershipOpenPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
  onNavigateToRequirement?: (path: string) => void;
};

type MembershipCategory = '个人会员' | '企业会员' | '专业版';
type MembershipPanel = '开通会员' | '购买席位' | '配置域名' | '历史记录';

const inputClassName = 'h-[42px] rounded-[3px] border border-[#d9dfe7] bg-white px-3 text-[13px] text-[#303b4d] outline-none transition placeholder:text-[#c6cbd3] focus:border-[#278fee] focus:shadow-[0_0_0_2px_rgba(39,143,238,.08)]';
const selectClassName = `${inputClassName} appearance-none pr-10`;
const OPEN_POINTS_REQUIREMENT_NAME = '开通会员新增积分量';
const HISTORY_POINTS_REQUIREMENT_NAME = '历史记录显示开通套餐的积分量';

function RequirementEntryDot({ label }: { label: string }) {
  return <span className="ml-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5a5f] align-middle shadow-[0_0_6px_rgba(255,90,95,.75)]" aria-label={label} />;
}

function FormRow({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3">
      <span className="text-right text-[13px] text-[#3f4651]">
        {required ? <b className="mr-1 font-normal text-[#ff4d4f]">*</b> : null}
        {label}：
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

type MembershipHistoryRecord = {
  userId: string;
  recordType: string;
  memberType: string;
  memberCount: number;
  points?: number;
  pointsUnit?: '每人' | '团队';
  pointsCycle?: '按月' | '一次性';
  addedSeats: string;
  duration: string;
  companyName: string;
  createdAt: string;
  creator: string;
  auditUser: string;
  paidAt: string;
  paymentMethod: string;
  paymentStatus: string;
  openingCompany: string;
  reason: string;
};

const membershipHistoryRecords: MembershipHistoryRecord[] = [
  { userId: '91580236', recordType: '会员', memberType: '高级版(团队)', memberCount: 28, points: 600, pointsUnit: '每人', pointsCycle: '按月', addedSeats: '—', duration: '365天', companyName: '北京星河数字科技有限公司', createdAt: '2026-10-24 10:26:18', creator: '田伟刚', auditUser: '李晓峰', paidAt: '2026-10-24 10:31:02', paymentMethod: '企业转账', paymentStatus: '已支付', openingCompany: '星河科技', reason: '202610240012' },
  { userId: '91579642', recordType: '会员', memberType: '旗舰版', memberCount: 86, points: 2400, pointsUnit: '团队', pointsCycle: '按月', addedSeats: '—', duration: '730天', companyName: '深圳云启信息技术有限公司', createdAt: '2026-10-24 09:48:35', creator: '田伟刚', auditUser: '李晓峰', paidAt: '2026-10-24 09:56:47', paymentMethod: '支付宝', paymentStatus: '已支付', openingCompany: '云启信息', reason: '202610240011' },
  { userId: '91578319', recordType: '会员', memberType: '高级版(团队)', memberCount: 12, points: 1500, pointsUnit: '每人', pointsCycle: '一次性', addedSeats: '—', duration: '180天', companyName: '杭州墨池文化传媒有限公司', createdAt: '2026-10-24 09:12:06', creator: '田伟刚', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '墨池传媒', reason: '202610240010' },
  { userId: '91577408', recordType: '会员', memberType: '旗舰版', memberCount: 120, points: 8000, pointsUnit: '团队', pointsCycle: '一次性', addedSeats: '—', duration: '1095天', companyName: '广州远见企业服务有限公司', createdAt: '2026-10-24 08:37:52', creator: '田伟刚', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '远见服务', reason: '202610240009' },
  { userId: '78695524', recordType: '会员', memberType: '旗舰版', memberCount: 150, addedSeats: '—', duration: '1044天', companyName: '华安证券股份有限公司', createdAt: '2026-10-23 14:54:26', creator: '田伟刚', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '华安证券', reason: '202610210006' },
  { userId: '22477207', recordType: '会员', memberType: '旗舰版', memberCount: 161, addedSeats: '—', duration: '255天', companyName: '上海闵途信息技术有限公司', createdAt: '2026-10-23 14:27:43', creator: '田伟刚', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '途虎养车', reason: '202610210005' },
  { userId: '7029878', recordType: '会员', memberType: '旗舰版', memberCount: 52, addedSeats: '—', duration: '1071天', companyName: '银联商务股份有限公司', createdAt: '2026-10-23 14:08:21', creator: '田伟刚', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '银联商务', reason: '202610210008' },
];

type ProfessionalHistoryRecord = {
  userId: string;
  memberType: string;
  memberCount: number;
  points?: number;
  pointsUnit?: '每人' | '团队';
  pointsCycle?: '按月' | '一次性';
  duration: string;
  companyName: string;
  createdAt: string;
  creator: string;
  auditUser: string;
  paidAt: string;
  paymentMethod: string;
  paymentStatus: string;
  openingCompany: string;
  reason: string;
};

const professionalHistoryRecords: ProfessionalHistoryRecord[] = [
  { userId: '90871234', memberType: '会员', memberCount: 6, points: 800, pointsUnit: '每人', pointsCycle: '按月', duration: '365天', companyName: '上海启程品牌管理有限公司', createdAt: '2026-10-24 10:18:36', creator: '蒲旭', auditUser: '蒲旭', paidAt: '2026-10-24 10:21:05', paymentMethod: '对公转账', paymentStatus: '已支付', openingCompany: '启程品牌', reason: '202610240015' },
  { userId: '90870418', memberType: '会员', memberCount: 20, points: 3200, pointsUnit: '团队', pointsCycle: '按月', duration: '730天', companyName: '北京知行创意有限公司', createdAt: '2026-10-24 09:46:12', creator: '蒲旭', auditUser: '蒲旭', paidAt: '2026-10-24 09:51:40', paymentMethod: '对公转账', paymentStatus: '已支付', openingCompany: '知行创意', reason: '202610240014' },
  { userId: '90869852', memberType: '会员', memberCount: 2, points: 1200, pointsUnit: '每人', pointsCycle: '一次性', duration: '180天', companyName: '杭州拾光文化传媒有限公司', createdAt: '2026-10-24 09:07:54', creator: '蒲旭', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '拾光传媒', reason: '202610240013' },
  { userId: '90868106', memberType: '会员', memberCount: 50, points: 9600, pointsUnit: '团队', pointsCycle: '一次性', duration: '1095天', companyName: '广州矩阵数字科技有限公司', createdAt: '2026-10-23 17:38:20', creator: '蒲旭', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '矩阵科技', reason: '202610230012' },
  { userId: '39945564', memberType: '购买席位', memberCount: 1, duration: '0天', companyName: '欢朋酒店管理（广州）有限公司', createdAt: '2026-10-23 18:19:46', creator: '蒲旭', auditUser: '蒲旭', paidAt: '2026-10-23 18:19:46', paymentMethod: '对公转账', paymentStatus: '已支付', openingCompany: '—', reason: '202610220005' },
  { userId: '39945564', memberType: '购买席位', memberCount: 1, duration: '0天', companyName: '欢朋酒店管理（广州）有限公司', createdAt: '2026-10-21 18:52:48', creator: '蒲旭', auditUser: '蒲旭', paidAt: '2026-10-21 18:52:48', paymentMethod: '对公转账', paymentStatus: '已支付', openingCompany: '—', reason: '202610210003' },
  { userId: '1663949', memberType: '购买席位', memberCount: 1, duration: '0天', companyName: '国都证券股份有限公司', createdAt: '2026-10-14 18:48:42', creator: '蒲旭', auditUser: '蒲旭', paidAt: '2026-10-14 18:48:42', paymentMethod: '赠送', paymentStatus: '已完成', openingCompany: '—', reason: '202610130003' },
  { userId: '87864297', memberType: '购买席位', memberCount: 1, duration: '0天', companyName: '中信证券股份有限公司', createdAt: '2026-09-18 11:26:17', creator: '蒲旭', auditUser: '—', paidAt: '—', paymentMethod: '—', paymentStatus: '未支付', openingCompany: '—', reason: '202609180001' },
];

function HistoryRecordsPanel() {
  const [recordType, setRecordType] = useState('全部');
  const [paymentStatus, setPaymentStatus] = useState('全部');
  const filteredRecords = useMemo(() => membershipHistoryRecords.filter((record) => (recordType === '全部' || record.recordType === recordType) && (paymentStatus === '全部' || record.paymentStatus === paymentStatus)), [paymentStatus, recordType]);
  const pointsDisplay = (record: MembershipHistoryRecord) => record.points == null ? getPackagePointsDisplay(record.memberType, record.duration) : formatPointsDisplay(record.points, record.pointsUnit, isLifetimeDuration(record.duration.replace(/\D/g, '')) ? '一次性' : record.pointsCycle);

  return (
    <div className="px-8 pb-8 pt-6">
      <div className="mb-5 flex items-center justify-end gap-5 text-[12px] text-[#555]">
        <label className="flex items-center gap-2">记录类型：<select value={recordType} onChange={(event) => setRecordType(event.currentTarget.value)} className="h-8 rounded-[3px] border border-[#d9dfe7] bg-white px-3 text-[12px] text-[#4d5562] outline-none"><option>全部</option><option>会员</option><option>席位</option></select></label>
        <label className="flex items-center gap-2">支付状态：<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.currentTarget.value)} className="h-8 rounded-[3px] border border-[#d9dfe7] bg-white px-3 text-[12px] text-[#4d5562] outline-none"><option>全部</option><option>未支付</option><option>已支付</option></select></label>
      </div>
      <div className="overflow-x-auto pt-5">
        <table className="w-full min-w-[1660px] table-fixed border-collapse text-center text-[12px] text-[#333]">
          <colgroup><col className="w-[7%]" /><col className="w-[5%]" /><col className="w-[6%]" /><col className="w-[5%]" /><col className="w-[8%]" /><col className="w-[6%]" /><col className="w-[9%]" /><col className="w-[9%]" /><col className="w-[6%]" /><col className="w-[8%]" /><col className="w-[8%]" /><col className="w-[7%]" /><col className="w-[6%]" /><col className="w-[6%]" /><col className="w-[8%]" /><col className="w-[8%]" /><col className="w-[6%]" /></colgroup>
          <thead className="h-[112px] bg-[#fafafa] text-[#222]"><tr>{['用户ID', '记录\n类型', '会员\n类型', '成员\n人数', '积分量', '新增\n席位', '开通时\n长（天）', '公司\n名称', '订单创建\n时间', '订单创\n建者', '支付完成\n审核人', '支付完成\n时间', '支付\n方式', '支付\n状态', '开通公司\n名称', '开通原因', '操作'].map((label) => <th key={label} className={`relative whitespace-pre-line px-2 font-normal leading-5 ${label === '积分量' ? 'border-x border-t border-dashed border-[#ff665b] bg-[#fff7f5]' : ''}`}>{label === '积分量' ? <><div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"><RequirementHint text={POINTS_REQUIREMENT} requirementName={HISTORY_POINTS_REQUIREMENT_NAME} /></div><span>积分量</span></> : label}</th>)}</tr></thead>
          <tbody>{filteredRecords.map((record) => <tr key={record.userId} className="h-[105px] border-b border-[#ededed] hover:bg-[#fcfdff]"><td className="px-2">{record.userId}</td><td className="px-2">{record.recordType}</td><td className="px-2">{record.memberType}</td><td className="px-2">{record.memberCount}</td><td className="border-x border-dashed border-[#ff665b] bg-[#fff7f5] px-2 leading-5">{pointsDisplay(record)}</td><td className="px-2">{record.addedSeats}</td><td className="px-2 leading-5">{record.duration}</td><td className="px-2 leading-5">{record.companyName}</td><td className="px-2 leading-5">{record.createdAt}</td><td className="px-2 leading-5">{record.creator}</td><td className="px-2">{record.auditUser}</td><td className="px-2">{record.paidAt}</td><td className="px-2">{record.paymentMethod}</td><td className="px-2 leading-5">{record.paymentStatus}</td><td className="px-2 leading-5">{record.openingCompany}</td><td className="px-2 leading-5">{record.reason}</td><td className="px-2"><button type="button" className="h-8 rounded-[3px] bg-[#278fee] px-4 text-[12px] text-white">已支付</button></td></tr>)}</tbody>
        </table>
        {filteredRecords.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无历史记录</div> : null}
      </div>
    </div>
  );
}

function ProfessionalHistoryRecordsPanel() {
  const [paymentStatus, setPaymentStatus] = useState('全部');
  const [startDate, setStartDate] = useState('2019-11-22');
  const [endDate, setEndDate] = useState('2026-10-24');
  const filteredRecords = useMemo(() => professionalHistoryRecords.filter((record) => {
    const createdDate = record.createdAt.slice(0, 10);
    return (paymentStatus === '全部' || record.paymentStatus === paymentStatus) && createdDate >= startDate && createdDate <= endDate;
  }), [endDate, paymentStatus, startDate]);

  const pointsDisplay = (record: ProfessionalHistoryRecord) => record.points == null ? '按会员等级发' : formatPointsDisplay(record.points, record.pointsUnit, isLifetimeDuration(record.duration.replace(/\D/g, '')) ? '一次性' : record.pointsCycle);

  return (
    <div className="px-8 pb-8 pt-6">
      <div className="mb-5 flex items-center justify-end gap-4 text-[12px] text-[#555]">
        <label className="flex items-center gap-2">支付状态：<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.currentTarget.value)} className="h-8 rounded-[3px] border border-[#d9dfe7] bg-white px-3 text-[12px] text-[#4d5562] outline-none"><option>全部</option><option>未支付</option><option>已支付</option><option>已完成</option></select></label>
        <div className="flex h-8 items-center rounded-[3px] border border-[#d9dfe7] bg-white text-[#4d5562]">
          <input aria-label="开始日期" type="date" value={startDate} onChange={(event) => setStartDate(event.currentTarget.value)} className="h-full w-[104px] border-0 bg-transparent px-2 text-[12px] outline-none" />
          <span className="text-[#a6adb7]">→</span>
          <input aria-label="结束日期" type="date" value={endDate} onChange={(event) => setEndDate(event.currentTarget.value)} className="h-full w-[104px] border-0 bg-transparent px-2 text-[12px] outline-none" />
          <CalendarDays className="mr-2 h-4 w-4 text-[#a6adb7]" />
        </div>
        <button type="button" aria-label="导出历史记录" className="rounded-[3px] p-1 text-[#5e6875] hover:bg-[#f4f6f8]"><Download className="h-4 w-4" /></button>
      </div>
      <div className="overflow-x-auto pt-5">
        <table className="w-full min-w-[1600px] table-fixed border-collapse text-center text-[12px] text-[#333]">
          <colgroup><col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[6%]" /><col className="w-[9%]" /><col className="w-[8%]" /><col className="w-[12%]" /><col className="w-[7%]" /><col className="w-[8%]" /><col className="w-[10%]" /><col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[9%]" /><col className="w-[9%]" /><col className="w-[7%]" /></colgroup>
          <thead className="h-[112px] bg-[#fafafa] text-[#222]"><tr>{['用户ID', '会员\n类型', '成员\n人数', '积分量', '开通时长\n（天）', '公司名称', '订单\n创建者', '支付完成\n审核人', '支付完成时间', '支付\n方式', '支付\n状态', '开通公司\n名称', '开通原因', '操作'].map((label) => <th key={label} className={`relative whitespace-pre-line px-2 font-normal leading-5 ${label === '积分量' ? 'border-x border-t border-dashed border-[#ff665b] bg-[#fff7f5]' : ''}`}>{label === '积分量' ? <><div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"><RequirementHint text={POINTS_REQUIREMENT} requirementName={HISTORY_POINTS_REQUIREMENT_NAME} /></div><span>积分量</span></> : label}</th>)}</tr></thead>
          <tbody>{filteredRecords.map((record) => <tr key={`${record.userId}-${record.createdAt}`} className="h-[105px] border-b border-[#ededed] hover:bg-[#fcfdff]"><td className="px-2">{record.userId}</td><td className="px-2 leading-5">{record.memberType}</td><td className="px-2">{record.memberCount}</td><td className="border-x border-dashed border-[#ff665b] bg-[#fff7f5] px-2 leading-5">{pointsDisplay(record)}</td><td className="px-2 leading-5">{record.duration}</td><td className="px-2 leading-5">{record.companyName}</td><td className="px-2">{record.creator}</td><td className="px-2">{record.auditUser}</td><td className="px-2 leading-5">{record.paidAt}</td><td className="px-2 leading-5">{record.paymentMethod}</td><td className="px-2 leading-5">{record.paymentStatus}</td><td className="px-2 leading-5">{record.openingCompany}</td><td className="px-2 leading-5">{record.reason}</td><td className="px-2">{record.paymentStatus === '未支付' ? <button type="button" className="h-8 rounded-[3px] bg-[#278fee] px-4 text-[12px] text-white">已支付</button> : '—'}</td></tr>)}</tbody>
        </table>
        {filteredRecords.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无历史记录</div> : null}
      </div>
    </div>
  );
}

export function MembershipOpenPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig, onNavigateToRequirement }: MembershipOpenPageProps) {
  const [category, setCategory] = useState<MembershipCategory>('企业会员');
  const [panel, setPanel] = useState<MembershipPanel>('开通会员');
  const [membershipType, setMembershipType] = useState('');
  const [form, setForm] = useState({
    userId: '',
    duration: '',
    memberCount: '',
    points: '',
    pointsUnit: '每人',
    pointsCycle: '按月',
    paymentStatus: '未支付',
    paymentAmount: '',
    domain: '',
    companyName: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [pointsError, setPointsError] = useState('');

  const updateForm = (key: keyof typeof form, value: string) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };
  const isProfessional = category === '专业版';
  const historicalMembershipSelected = !isProfessional && isHistoricalMemberType(membershipType);
  const handleMembershipTypeChange = (value: string) => {
    const historical = isHistoricalMemberType(value);
    setMembershipType(value);
    setPointsError('');
    setForm((current) => {
      const pointsConfig = getMemberPointsConfigForDuration(value, current.duration);
      return {
        ...current,
        points: historical && pointsConfig?.points != null ? String(pointsConfig.points) : '',
        pointsUnit: pointsConfig?.pointsUnit ?? '每人',
        pointsCycle: pointsConfig?.pointsCycle ?? '按月',
      };
    });
  };
  const panelTabs: MembershipPanel[] = isProfessional ? ['开通会员', '购买席位', '配置域名', '历史记录'] : ['开通会员', '购买席位', '历史记录'];

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#30343b]">
      <AdminSidebar
        onBackToDirectory={onBackToDirectory}
        activeItem="开通会员"
        onNavigateToRequirement={onNavigateToRequirement}
        onNavigate={handleNavigate}
      />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-[25px] pt-[25px]">
          <div className="mb-4 flex items-center gap-2 text-[13px] text-[#8b9199]">
            <span>会员中心</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2d2d2d]">开通会员</span>
          </div>

          <section className="min-h-[calc(100vh-130px)] bg-white">
            <div className="border-b border-[#edf0f3] px-[25px] pt-[22px]">
              <h1 className="text-[22px] font-semibold tracking-[-.02em] text-[#252525]">开通会员</h1>
              <div className="mt-5 space-y-1 text-[14px] leading-6 text-[#ff5a5f]">
                <p>开通会员需先在企微提交审批，审批通过后可按照对应要求开通会员。</p>
                <p>当前在售所有会员均在「企业会员」目录下开通，根据需求选择会员类型<span className="relative mx-1 inline-block max-w-[calc(100%-24px)] rounded-[4px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-2 pb-1 pt-2 align-middle text-[17px] font-semibold"><span>基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220</span><span className="absolute -right-4 -top-3"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName={MEMBER_TYPE_REQUIREMENT_NAME} sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></span></span>进行开通。</p>
              </div>
              <div className="mt-7 flex items-end gap-8">
                {(['个人会员', '企业会员', '专业版'] as MembershipCategory[]).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => { setCategory(item); setPanel('开通会员'); }}
                    className={`relative pb-3 text-[15px] transition ${category === item ? 'font-medium text-[#278fee]' : 'text-[#333] hover:text-[#278fee]'}`}
                  >
                    {item}
                    {item === '企业会员' || item === '专业版' ? <RequirementEntryDot label={`${item}有待开发需求`} /> : null}
                    {category === item ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#278fee]" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mx-[25px] mt-8 border border-[#f0f1f3] bg-white">
              <div className="flex h-[58px] items-end gap-8 border-b border-[#edf0f3] px-8">
                {panelTabs.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setPanel(item)}
                    className={`relative pb-[17px] text-[15px] transition ${panel === item ? 'font-medium text-[#278fee]' : 'text-[#333] hover:text-[#278fee]'}`}
                  >
                    {item}
                    {item === '开通会员' && (category === '企业会员' || category === '专业版') ? <RequirementEntryDot label={`${category}开通会员有待开发需求`} /> : null}
                    {item === '历史记录' && (category === '企业会员' || category === '专业版') ? <RequirementEntryDot label={`${category}历史会员有待开发需求`} /> : null}
                    {panel === item ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#278fee]" /> : null}
                  </button>
                ))}
              </div>

              {panel === '开通会员' ? (
                <form
                  className="px-8 pb-12 pt-11"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!historicalMembershipSelected && !form.points.trim()) {
                      setPointsError('请输入积分量');
                      return;
                    }
                    setSubmitted(true);
                  }}
                >
                  <div className="max-w-[590px] space-y-7">
                    <FormRow label="用户ID" required>
                      <div className="flex">
                        <input value={form.userId} onChange={(event) => updateForm('userId', event.currentTarget.value)} placeholder="请输入用户ID" className={`${inputClassName} min-w-0 flex-1 rounded-r-none`} />
                        <button type="button" disabled className="h-[42px] shrink-0 rounded-r-[3px] bg-[#d9d9d9] px-5 text-[13px] text-white">确认ID信息</button>
                      </div>
                    </FormRow>

                    {!isProfessional ? <FormRow label="会员类型" required>
                      <div className="relative rounded-[8px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-3 py-3">
                        <div className="absolute -right-[54px] -top-2 z-10"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName={MEMBER_TYPE_REQUIREMENT_NAME} sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></div>
                        <MemberTypeDropdown value={membershipType} onChange={handleMembershipTypeChange} className="w-[240px]" />
                      </div>
                    </FormRow> : null}

                    <FormRow label="会员时长" required>
                      <input value={form.duration} onChange={(event) => { const duration = event.currentTarget.value; updateForm('duration', duration); if (isLifetimeDuration(duration)) updateForm('pointsCycle', '一次性'); }} placeholder="请输入开通会员时长的天数（天）" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="成员人数" required>
                      <input value={form.memberCount} onChange={(event) => updateForm('memberCount', event.currentTarget.value)} placeholder="请输入成员人数（人）" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="积分量" required={!historicalMembershipSelected}>
                      <div className="relative rounded-[8px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-3 pb-2 pt-3">
                        <div className="absolute -right-[54px] -top-2 z-10"><RequirementHint text={POINTS_REQUIREMENT} requirementName={OPEN_POINTS_REQUIREMENT_NAME} /></div>
                        <div className="flex w-[425px] max-w-full items-center gap-2">
                          <input type="number" min="0" step="1" required={!historicalMembershipSelected} disabled={historicalMembershipSelected} value={form.points} onChange={(event) => { setPointsError(''); updateForm('points', event.currentTarget.value.replace(/\D/g, '')); }} placeholder={historicalMembershipSelected ? undefined : '请输入积分量'} className={`${historicalMembershipSelected ? 'cursor-not-allowed bg-[#f5f5f5] text-[#bcbcbc]' : inputClassName} min-w-0 flex-1`} />
                          <div className="relative w-[96px] shrink-0">
                            <select aria-label="发放单位" disabled={historicalMembershipSelected} value={form.pointsUnit} onChange={(event) => updateForm('pointsUnit', event.currentTarget.value)} className={`${historicalMembershipSelected ? 'cursor-not-allowed bg-[#f5f5f5] text-[#bcbcbc]' : selectClassName} w-full`}>
                              <option value="每人">每人</option>
                              <option value="团队">团队</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7afb9]" />
                          </div>
                          <div className="relative w-[96px] shrink-0">
                            <select aria-label="发放周期" disabled={historicalMembershipSelected || isLifetimeDuration(form.duration)} value={form.pointsCycle} onChange={(event) => updateForm('pointsCycle', event.currentTarget.value)} className={`${historicalMembershipSelected || isLifetimeDuration(form.duration) ? 'cursor-not-allowed bg-[#f5f5f5] text-[#bcbcbc]' : selectClassName} w-full`}>
                              <option value="按月">按月</option>
                              <option value="一次性">一次性</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7afb9]" />
                          </div>
                        </div>
                        {pointsError ? <p className="mt-1 text-[12px] text-[#ff4d4f]">{pointsError}</p> : null}
                        <p className="mt-1 text-[12px] leading-5 text-[#8a94a3]">{historicalMembershipSelected ? '历史会员按会员等级回显积分量，不支持修改' : '对应用户/团队的积分量将按照开通时的「积分量」设置进行发放，每次开通将立即按生效套餐发放，上一笔对应的未使用积分量失效'}</p>
                      </div>
                    </FormRow>

                    <FormRow label="支付状态" required>
                      <div className="relative w-[185px]">
                        <select value={form.paymentStatus} onChange={(event) => updateForm('paymentStatus', event.currentTarget.value)} className={`${selectClassName} w-full`}>
                          <option>未支付</option>
                          <option>已支付</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7afb9]" />
                      </div>
                    </FormRow>

                    <FormRow label="支付金额" required>
                      <input value={form.paymentAmount} onChange={(event) => updateForm('paymentAmount', event.currentTarget.value)} placeholder="请输入支付金额（元）" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    {isProfessional ? <FormRow label="配置域名">
                      <div className="flex w-[475px] max-w-full">
                        <input value={form.domain} onChange={(event) => updateForm('domain', event.currentTarget.value)} placeholder="例如：@ckt.cn;@chuangkit.com" className={`${inputClassName} min-w-0 flex-1 rounded-r-none`} />
                        <button type="button" disabled className="h-[42px] shrink-0 rounded-r-[3px] bg-[#d9d9d9] px-5 text-[13px] text-white">确认域名信息</button>
                        <CircleHelp className="ml-2 mt-[12px] h-4 w-4 shrink-0 text-[#777]" />
                      </div>
                    </FormRow> : null}

                    <FormRow label="开通公司名称">
                      <input value={form.companyName} onChange={(event) => updateForm('companyName', event.currentTarget.value)} placeholder="请输入公司名称" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="开通原因" required>
                      <input value={form.reason} onChange={(event) => updateForm('reason', event.currentTarget.value)} placeholder="请输入企业微信中会员开通的审批号" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <div className="pl-[125px] pt-1">
                      <button type="submit" className="h-[42px] rounded-[3px] bg-[#278fee] px-7 text-[14px] text-white shadow-[0_3px_8px_rgba(39,143,238,.15)] transition hover:bg-[#167fdc]">开通</button>
                      {submitted ? <span className="ml-4 text-[12px] text-[#2b9a66]">已提交开通申请</span> : null}
                    </div>
                  </div>
                </form>
              ) : panel === '历史记录' && category === '企业会员' ? (
                <HistoryRecordsPanel />
              ) : panel === '历史记录' && category === '专业版' ? (
                <ProfessionalHistoryRecordsPanel />
              ) : (
                <div className="flex min-h-[530px] items-center justify-center text-[14px] text-[#9aa3af]">暂无{panel}记录</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
