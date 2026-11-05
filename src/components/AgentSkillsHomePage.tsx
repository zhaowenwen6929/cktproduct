import React, { useEffect, useMemo, useRef, useState } from 'react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';
import {
  Bell,
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CheckSquare,
  Clock3,
  CloudUpload,
  Copy,
  CreditCard,
  Download,
  Folder,
  FolderPlus,
  FileImage,
  FileText,
  Grid2x2,
  Home,
  Image as ImageIcon,
  KeyRound,
  LayoutTemplate,
  Lock,
  Menu,
  MessageCircle,
  Plus,
  Play,
  Puzzle,
  RefreshCw,
  Ticket,
  Search,
  Settings2,
  Shirt,
  Sparkles,
  Zap,
  Upload,
  UserRound,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';
import { GenerationAttachment } from '../types';
import { MembershipCenterModal, MembershipPointsPurchaseModal, type MembershipCurrentMember } from './MembershipCenterModal';
import { RequirementHint, type RequirementSection } from './MembershipPackagePage';
import { RequirementDocumentDrawer, type RequirementSpec } from './RequirementDocumentPage';
import { skillDirectorySections, SkillsCategoryShowcase, SkillsDirectoryPage } from './SkillsDirectoryPage';

const MEMBERSHIP_CENTER_ENTRY_REQUIREMENT_NAME = '首页会员中心入口改版';
const MEMBERSHIP_CENTER_ENTRY_REQUIREMENT_SECTIONS: RequirementSection[] = [
  { title: '入口位置', items: ['创客贴首页 > 顶部导航 > 会员中心。'] },
  { title: '入口文案', items: ['右上角原“开通会员”改为“会员中心”，点击后统一打开 /price/vip?openVipPop=1&fmodule=topbar_vip&fpage=topbar。'] },
  { title: '打开协议', items: ['会员页地址为 /price/vip，弹框打开标识为 openVipPop=1；传入 morePoints=1 时定位到更多积分套餐；当前原型点击后直接打开同一套 MembershipCenterModal，线上入口需按统一地址和来源参数透传。'] },
  { title: '需求标识', items: ['改动区域沿用 2026年10月会员改版标识 V2610，标识不遮挡入口按钮。'] },
];
const MEMBERSHIP_CENTER_ENTRY_REQUIREMENT = MEMBERSHIP_CENTER_ENTRY_REQUIREMENT_SECTIONS.flatMap((section) => section.items).join(' ');

function readMembershipEntryIntent() {
  if (typeof window === 'undefined') return { openVipPop: false, morePoints: false };
  const params = new URLSearchParams(window.location.search);
  const openVipPop = ['1', 'true'].includes(params.get('openVipPop') ?? '');
  const morePoints = ['1', 'true'].includes(params.get('morePoints') ?? '') || ['1', 'true'].includes(params.get('needMorePoints') ?? '');
  return { openVipPop, morePoints };
}

type SkillField =
  | { id: string; label: string; type: 'upload'; required?: boolean; max?: number; description?: string }
  | { id: string; label: string; type: 'ratio'; required?: boolean; options: string[] }
  | { id: string; label: string; type: 'select'; required?: boolean; options: string[] }
  | { id: string; label: string; type: 'textarea'; required?: boolean; placeholder: string; rows?: number }
  | { id: string; label: string; type: 'input'; required?: boolean; placeholder: string };

interface SkillDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: SkillField[];
}

interface UploadedFile {
  name: string;
  url: string;
}

type FieldValue = string | UploadedFile[];

const agentCategoryOptions = [
  { label: '海报设计', value: '海报设计' },
  { label: '电商设计', value: '电商设计' },
  { label: '视频创作', value: '视频处理' },
  { label: '自媒体营销', value: '新媒体运营' },
  { label: '办公设计', value: '企业办公' },
  { label: '品牌IP形象', value: '品牌营销' },
];

const skillPickerCategories = ['最近使用', ...agentCategoryOptions.map((item) => item.label), '全部技能'];

const resolveSkillCategory = (category: string) => agentCategoryOptions.find((item) => item.value === category || item.label === category)?.value ?? category;
const getSkillCategoryLabel = (category: string) => agentCategoryOptions.find((item) => item.value === category || item.label === category)?.label ?? category;

const skills: SkillDefinition[] = [
  {
    id: 'product-set', title: '商品套图', description: '上传产品图，生成全套电商主图', category: '电商设计',
    fields: [
      { id: 'images', label: '商品图片', type: 'upload', required: true, max: 10 },
      { id: 'ratio', label: '图片比例', type: 'ratio', options: ['1:1', '3:4', '16:9', '9:16'] },
      { id: 'platform', label: '适配平台', type: 'select', required: true, options: ['亚马逊', 'Shopify', '淘宝/天猫', '京东', 'TikTok Shop'] },
      { id: 'language', label: '图片文字语言', type: 'select', options: ['英语', '中文', '日语', '韩语', '西班牙语'] },
      { id: 'market', label: '目标市场', type: 'select', options: ['美国', '中国', '日本', '欧洲', '东南亚'] },
      { id: 'highlights', label: '商品卖点&要求', type: 'textarea', placeholder: '如：产品名称、核心卖点、适用人群、风格色调等', rows: 3 },
    ],
  },
  {
    id: 'viral-remake', title: '爆款图复刻', description: '一张商品图，成套复刻爆款风格', category: '电商设计',
    fields: [
      { id: 'images', label: '参考图片', type: 'upload', required: true, max: 10 },
      { id: 'platform', label: '适配平台', type: 'select', options: ['亚马逊', 'Shopify', '淘宝/天猫', '京东'] },
      { id: 'requirements', label: '复刻要求', type: 'textarea', placeholder: '描述希望保留的风格、布局、卖点和需要替换的内容', rows: 4 },
    ],
  },
  {
    id: 'a-plus', title: 'A+详情页', description: '生成高转化的商品详情页模块', category: '电商设计',
    fields: [
      { id: 'images', label: '商品图片', type: 'upload', required: true, max: 10 },
      { id: 'platform', label: '适配平台', type: 'select', options: ['亚马逊 A+', 'Shopify', '淘宝/天猫', '京东'] },
      { id: 'language', label: '详情页语言', type: 'select', options: ['英语', '中文', '日语', '西班牙语'] },
      { id: 'highlights', label: '商品卖点&要求', type: 'textarea', placeholder: '写下产品名称、核心卖点、适用人群和品牌调性', rows: 4 },
    ],
  },
  {
    id: 'product-copy', title: '商品文案', description: 'Listing文案撰写，多平台适配', category: '电商设计',
    fields: [
      { id: 'product', label: '商品名称', type: 'input', required: true, placeholder: '例如：便携式无线蓝牙耳机' },
      { id: 'platform', label: '适配平台', type: 'select', options: ['亚马逊', 'Shopify', '淘宝/天猫', '京东'] },
      { id: 'language', label: '文案语言', type: 'select', options: ['英语', '中文', '日语', '西班牙语'] },
      { id: 'keywords', label: '商品卖点&关键词', type: 'textarea', placeholder: '填写核心功能、材质、适用人群或搜索关键词', rows: 4 },
    ],
  },
  {
    id: 'keyword-analysis', title: '关键词分析', description: '分析关键词流量、竞争度与相关词', category: '电商设计',
    fields: [
      { id: 'keywords', label: '商品关键词', type: 'textarea', required: true, placeholder: '输入商品关键词，可用逗号分隔', rows: 3 },
      { id: 'platform', label: '分析平台', type: 'select', options: ['Amazon', 'Shopify', 'TikTok Shop', '淘宝/天猫'] },
      { id: 'market', label: '目标市场', type: 'select', options: ['美国', '中国', '日本', '欧洲', '东南亚'] },
      { id: 'extra', label: '补充要求', type: 'textarea', placeholder: '例如：关注长尾词、竞品词或节日趋势', rows: 3 },
    ],
  },
  {
    id: 'white-background', title: '白底精修', description: '去除背景并优化商品质感与细节', category: '电商设计',
    fields: [
      { id: 'images', label: '商品图片', type: 'upload', required: true, max: 10 },
      { id: 'ratio', label: '图片比例', type: 'ratio', options: ['1:1', '3:4', '4:3'] },
      { id: 'requirements', label: '精修要求', type: 'textarea', placeholder: '例如：纯白背景、保留商品原有颜色、增强材质细节', rows: 4 },
    ],
  },
  {
    id: 'competitor-analysis', title: '竞品分析', description: 'Amazon ASIN 诊断与竞品分析', category: '电商设计',
    fields: [
      { id: 'images', label: '竞品图片', type: 'upload', max: 10 },
      { id: 'links', label: '竞品链接/名称', type: 'textarea', placeholder: '粘贴商品链接或填写竞品名称', rows: 3 },
      { id: 'market', label: '目标市场', type: 'select', options: ['美国', '中国', '日本', '欧洲', '东南亚'] },
      { id: 'focus', label: '分析重点', type: 'textarea', placeholder: '例如：价格定位、主图表达、用户评价和差异化卖点', rows: 3 },
    ],
  },
  {
    id: 'sku-variants', title: '商品SKU变体', description: '生成统一风格的多色/多款商品图', category: '电商设计',
    fields: [
      { id: 'images', label: '商品图片', type: 'upload', required: true, max: 10 },
      { id: 'variants', label: '变体信息', type: 'textarea', required: true, placeholder: '例如：奶油白、雾霾蓝、樱花粉', rows: 3 },
      { id: 'ratio', label: '图片比例', type: 'ratio', options: ['1:1', '3:4', '4:3'] },
      { id: 'requirements', label: '其他要求', type: 'textarea', placeholder: '例如：保持商品角度和光线一致', rows: 2 },
    ],
  },
  {
    id: 'promo-image', title: '促销主图', description: '突出促销信息，快速制作电商主图', category: '电商设计',
    fields: [
      { id: 'images', label: '商品图片', type: 'upload', required: true, max: 10 },
      { id: 'campaign', label: '促销主题', type: 'input', required: true, placeholder: '例如：限时 8 折、新品首发' },
      { id: 'platform', label: '适配平台', type: 'select', options: ['亚马逊', 'Shopify', '淘宝/天猫', '京东'] },
      { id: 'requirements', label: '画面要求', type: 'textarea', placeholder: '补充品牌色、活动时间或风格方向', rows: 3 },
    ],
  },
  {
    id: 'poster', title: '海报设计', description: '围绕活动主题生成完整海报方案', category: '海报设计',
    fields: [
      { id: 'topic', label: '海报主题', type: 'input', required: true, placeholder: '例如：春季新品发布会' },
      { id: 'ratio', label: '海报比例', type: 'ratio', options: ['3:4', '9:16', '1:1', '16:9'] },
      { id: 'style', label: '风格与要求', type: 'textarea', placeholder: '填写文案、活动信息、视觉风格和配色偏好', rows: 4 },
    ],
  },
  {
    id: 'marketing-poster', title: '营销海报', description: '促销/活动/节日/发布会主题海报', category: '海报设计',
    fields: [
      { id: 'topic', label: '海报主题', type: 'input', required: true, placeholder: '例如：春季新品发布会、限时促销' },
      { id: 'ratio', label: '海报比例', type: 'ratio', options: ['3:4', '9:16', '1:1', '16:9'] },
      { id: 'requirements', label: '活动文案&要求', type: 'textarea', placeholder: '填写时间、地点、优惠内容、视觉风格等', rows: 4 },
    ],
  },
  {
    id: 'poster-beautify', title: '海报美化', description: '旧海报快速美化升级', category: '海报设计',
    fields: [
      { id: 'images', label: '上传海报', type: 'upload', required: true, max: 10 },
      { id: 'requirements', label: '优化要求', type: 'textarea', placeholder: '说明希望优化的布局、字体、配色或文案层级', rows: 4 },
    ],
  },
  {
    id: 'daily-notice', title: '通知与日常物料', description: '通知/邀请函/招聘/证书/日签等', category: '企业办公',
    fields: [
      { id: 'material', label: '物料类型', type: 'select', options: ['通知公告', '邀请函', '招聘海报', '证书', '日签'] },
      { id: 'topic', label: '主题与文案', type: 'textarea', required: true, placeholder: '填写标题、时间、地点和需要展示的文字', rows: 4 },
      { id: 'style', label: '风格要求', type: 'textarea', placeholder: '补充品牌色、受众和设计风格', rows: 3 },
    ],
  },
  {
    id: 'social-cover', title: '小红书封面', description: '制作醒目、有信息层次的笔记封面', category: '新媒体运营',
    fields: [
      { id: 'topic', label: '笔记主题', type: 'input', required: true, placeholder: '例如：一周高效收纳好物分享' },
      { id: 'images', label: '参考图片', type: 'upload', max: 5 },
      { id: 'style', label: '封面要求', type: 'textarea', placeholder: '填写标题、关键词、账号风格或配色偏好', rows: 4 },
    ],
  },
  {
    id: 'video-agent', title: '视频创作', description: '从创意到脚本，规划一条完整短视频', category: '视频处理',
    fields: [
      { id: 'topic', label: '视频主题', type: 'input', required: true, placeholder: '描述视频主体或推广产品' },
      { id: 'duration', label: '视频时长', type: 'select', options: ['15 秒', '30 秒', '60 秒'] },
      { id: 'platform', label: '发布平台', type: 'select', options: ['抖音', '小红书', '视频号', 'TikTok', 'Instagram'] },
      { id: 'requirements', label: '脚本要求', type: 'textarea', placeholder: '填写风格、受众、镜头或旁白要求', rows: 4 },
    ],
  },
  {
    id: 'apparel-styling', title: '服饰穿搭图', description: '为服装商品生成自然的模特穿搭展示', category: '服饰穿戴',
    fields: [
      { id: 'images', label: '服饰图片', type: 'upload', required: true, max: 10 },
      { id: 'scene', label: '穿搭场景', type: 'select', options: ['街拍通勤', '简约影棚', '户外自然', '生活方式'] },
      { id: 'ratio', label: '图片比例', type: 'ratio', options: ['3:4', '9:16', '1:1'] },
      { id: 'requirements', label: '模特与风格要求', type: 'textarea', placeholder: '例如：模特形象、姿势、搭配单品和画面氛围', rows: 4 },
    ],
  },
  {
    id: 'brand-visual', title: '品牌视觉方案', description: '定义品牌标识、配色和整体视觉方向', category: '品牌营销',
    fields: [
      { id: 'brand', label: '品牌名称', type: 'input', required: true, placeholder: '请输入品牌名称' },
      { id: 'industry', label: '品牌行业', type: 'input', placeholder: '例如：美妆、餐饮、生活方式' },
      { id: 'requirements', label: '品牌定位与要求', type: 'textarea', placeholder: '填写品牌理念、受众、关键词和偏好的风格', rows: 4 },
    ],
  },
  {
    id: 'image-edit', title: '图片扩图', description: '智能扩展画布，补全自然的画面内容', category: '图片处理',
    fields: [
      { id: 'images', label: '原始图片', type: 'upload', required: true, max: 10 },
      { id: 'ratio', label: '扩展比例', type: 'ratio', options: ['1:1', '3:4', '16:9', '9:16'] },
      { id: 'requirements', label: '画面要求', type: 'textarea', placeholder: '说明希望扩展的方向、背景和需要保留的主体', rows: 4 },
    ],
  },
];

const recentSkillIds = ['product-set', 'product-copy', 'keyword-analysis', 'white-background', 'competitor-analysis'];

const homepageFeatureCards = [
  { title: '热点日历', desc: '一览全年热点', art: 'calendar' },
  { title: '电商套图', desc: '一键生成爆款套图', art: 'commerce-set' },
  { title: '智能抠图', desc: '一键抠图', art: 'cutout' },
  { title: 'AI PPT生成', desc: '文字秒变专业PPT', art: 'ppt' },
  { title: '招生特辑', desc: '爆款招生物料，助力转化', art: 'recruitment' },
  { title: '高级感A+图', desc: '全方位展示细节，还原产品真实属性', art: 'detail' },
];

const agentQuickCards = [
  { title: '海报设计', desc: '一键生成创意海报', art: 'poster', category: '海报设计', directoryCategory: '海报设计' },
  { title: '电商设计', desc: '全套素材快捷生成', art: 'commerce-set', category: '电商设计', directoryCategory: '电商设计' },
  { title: '视频创作', desc: '一键输出创意大片', art: 'video', category: '视频处理', directoryCategory: '视频创作' },
  { title: '自媒体营销', desc: '速出多平台内容', art: 'recruitment', category: '新媒体运营', directoryCategory: '自媒体营销' },
  { title: '办公设计', desc: '图文创作随心而会', art: 'ppt', category: '企业办公', directoryCategory: '办公设计' },
  { title: '品牌设计', desc: '让创意秒变现实', art: 'cutout', category: '品牌营销', directoryCategory: '品牌设计' },
];

const agentFeaturedCards = [
  { title: '商品海报', desc: '突出商品核心卖点', art: 'commerce-set', skillId: 'promo-image' },
  { title: '营销海报', desc: '助力营销增长', art: 'poster', skillId: 'marketing-poster' },
  { title: '通知与日常物料', desc: '一键输出行政物料', art: 'ppt', skillId: 'daily-notice' },
  { title: 'A+详情页', desc: '全方位展示细节', art: 'detail', skillId: 'a-plus' },
  { title: '商品套图', desc: '一键出全套商品图', art: 'commerce-set', skillId: 'product-set' },
  { title: '知识卡片', desc: '图文表达随时生成', art: 'recruitment', skillId: 'daily-notice' },
];

type SameStyleGalleryCard = {
  id: string;
  category: string;
  title: string;
  description: string;
  kicker: string;
  tone: string;
  size: 'tall' | 'wide' | 'square';
};

const agentSameStyleGallery: SameStyleGalleryCard[] = [
  { id: 'poster-spring', category: '海报设计', title: '春季新品发布', description: '新品上市活动主视觉', kicker: 'SPRING LAUNCH', tone: 'from-amber-200 via-orange-400 to-rose-500', size: 'tall' },
  { id: 'poster-market', category: '海报设计', title: '周末市集招募', description: '线下活动宣传海报', kicker: 'WEEKEND MARKET', tone: 'from-lime-200 via-emerald-300 to-teal-500', size: 'square' },
  { id: 'poster-sale', category: '海报设计', title: '节日限时促销', description: '零售活动营销物料', kicker: 'LIMITED OFFER', tone: 'from-red-500 via-rose-500 to-orange-400', size: 'wide' },
  { id: 'poster-brand', category: '海报设计', title: '品牌活动主视觉', description: '发布会与展览宣传', kicker: 'BRAND EVENT', tone: 'from-indigo-600 via-violet-500 to-fuchsia-400', size: 'tall' },
  { id: 'poster-public', category: '海报设计', title: '公益活动宣传', description: '温暖有影响力的传播设计', kicker: 'MAKE A DIFFERENCE', tone: 'from-sky-300 via-blue-500 to-indigo-600', size: 'square' },
  { id: 'commerce-earbuds', category: '电商设计', title: '蓝牙耳机主图', description: '突出卖点的商品视觉', kicker: 'SMART AUDIO', tone: 'from-slate-800 via-slate-600 to-cyan-400', size: 'square' },
  { id: 'commerce-skincare', category: '电商设计', title: '春日护肤套图', description: '统一风格的商品套图', kicker: 'SPRING SKIN', tone: 'from-pink-200 via-rose-100 to-amber-200', size: 'tall' },
  { id: 'commerce-coffee', category: '电商设计', title: '咖啡器具详情页', description: '完整展示产品细节与场景', kicker: 'BREW BETTER', tone: 'from-stone-700 via-amber-700 to-orange-300', size: 'wide' },
  { id: 'commerce-gift', category: '电商设计', title: '轻食礼盒促销', description: '节日礼赠商品营销图', kicker: 'GIFT BOX', tone: 'from-emerald-300 via-teal-400 to-cyan-500', size: 'tall' },
  { id: 'commerce-fashion', category: '电商设计', title: '服饰上新主图', description: '多款商品快速生成', kicker: 'NEW ARRIVAL', tone: 'from-violet-300 via-purple-500 to-fuchsia-500', size: 'square' },
  { id: 'video-unbox', category: '视频创作', title: '15秒新品开箱', description: '短视频脚本与分镜规划', kicker: 'UNBOXING', tone: 'from-sky-500 via-blue-500 to-indigo-700', size: 'tall' },
  { id: 'video-store', category: '视频创作', title: '门店探店脚本', description: '从选题到成片的一站式创作', kicker: 'CITY WALK', tone: 'from-orange-300 via-rose-400 to-pink-500', size: 'wide' },
  { id: 'video-fashion', category: '视频创作', title: '服装上身展示', description: '适合短视频平台的商品展示', kicker: 'TRY ON', tone: 'from-stone-300 via-slate-500 to-slate-800', size: 'square' },
  { id: 'video-festival', category: '视频创作', title: '节日活动预告', description: '快速生成活动预热内容', kicker: 'COMING SOON', tone: 'from-fuchsia-500 via-violet-500 to-indigo-600', size: 'tall' },
  { id: 'video-story', category: '视频创作', title: '产品故事短片', description: '用叙事方式讲清产品价值', kicker: 'OUR STORY', tone: 'from-amber-200 via-orange-400 to-red-500', size: 'wide' },
  { id: 'social-redbook', category: '自媒体营销', title: '小红书种草封面', description: '提高点击率的图文封面', kicker: 'LIFESTYLE NOTE', tone: 'from-pink-300 via-rose-400 to-red-500', size: 'tall' },
  { id: 'social-challenge', category: '自媒体营销', title: '7天打卡笔记', description: '连续内容更新模板', kicker: '7 DAY CHALLENGE', tone: 'from-emerald-200 via-teal-300 to-cyan-500', size: 'square' },
  { id: 'social-title', category: '自媒体营销', title: '爆款标题合集', description: '多平台标题灵感整理', kicker: 'CONTENT IDEAS', tone: 'from-violet-400 via-fuchsia-400 to-pink-300', size: 'wide' },
  { id: 'social-live', category: '自媒体营销', title: '直播预告图', description: '直播间活动预热物料', kicker: 'LIVE TONIGHT', tone: 'from-blue-600 via-indigo-600 to-purple-500', size: 'tall' },
  { id: 'social-review', category: '自媒体营销', title: '商品测评图文', description: '清晰表达体验与结论', kicker: 'REAL REVIEW', tone: 'from-amber-200 via-yellow-300 to-lime-300', size: 'square' },
  { id: 'office-weekly', category: '办公设计', title: '周会通知', description: '清晰传达时间与议程', kicker: 'WEEKLY MEETING', tone: 'from-blue-100 via-sky-300 to-indigo-500', size: 'wide' },
  { id: 'office-training', category: '办公设计', title: '培训邀请函', description: '企业培训与活动邀请', kicker: 'JOIN US', tone: 'from-orange-200 via-amber-300 to-rose-400', size: 'tall' },
  { id: 'office-hiring', category: '办公设计', title: '招聘海报', description: '招募优秀伙伴加入团队', kicker: 'WE ARE HIRING', tone: 'from-lime-200 via-green-300 to-emerald-500', size: 'square' },
  { id: 'office-review', category: '办公设计', title: '项目复盘长图', description: '项目成果与数据总结', kicker: 'PROJECT REVIEW', tone: 'from-slate-300 via-blue-400 to-cyan-500', size: 'tall' },
  { id: 'office-culture', category: '办公设计', title: '企业文化日签', description: '每日一句品牌价值观', kicker: 'GOOD MORNING', tone: 'from-rose-200 via-pink-300 to-orange-300', size: 'wide' },
  { id: 'brand-system', category: '品牌设计', title: '品牌视觉方案', description: 'Logo、配色与应用规范', kicker: 'BRAND SYSTEM', tone: 'from-slate-800 via-indigo-700 to-violet-500', size: 'tall' },
  { id: 'brand-package', category: '品牌设计', title: '包装设计提案', description: '从概念到效果图的完整方案', kicker: 'PACKAGING', tone: 'from-amber-100 via-orange-300 to-red-400', size: 'square' },
  { id: 'brand-mascot', category: '品牌设计', title: '品牌IP形象', description: '打造可持续使用的品牌角色', kicker: 'MEET THE MASCOT', tone: 'from-sky-200 via-blue-300 to-violet-400', size: 'wide' },
  { id: 'brand-logo', category: '品牌设计', title: 'Logo设计提案', description: '多方向探索品牌标识', kicker: 'LOGO STUDY', tone: 'from-emerald-200 via-lime-300 to-yellow-400', size: 'tall' },
  { id: 'brand-guideline', category: '品牌设计', title: '品牌手册封面', description: '统一对外传播的视觉气质', kicker: 'BRAND GUIDE', tone: 'from-pink-300 via-fuchsia-400 to-purple-500', size: 'square' },
];

const aiSkillRows = [
  ['product-set', 'viral-remake', 'sku-variants', 'competitor-analysis', 'product-copy', 'daily-notice'],
  ['a-plus', 'white-background', 'promo-image', 'keyword-analysis', 'marketing-poster', 'poster-beautify'],
];

const templateCards = [
  { title: '周末山野轻旅行', tone: 'from-sky-300 via-blue-500 to-blue-800', kicker: 'Explore · Morning' },
  { title: '春日出游攻略', tone: 'from-lime-300 via-emerald-400 to-cyan-500', kicker: '春天计划' },
  { title: '春季新品上新', tone: 'from-amber-200 via-orange-400 to-red-500', kicker: '限时上新' },
  { title: '清新生活提案', tone: 'from-blue-400 via-cyan-200 to-yellow-100', kicker: '生活方式' },
  { title: '品牌灵感手册', tone: 'from-rose-300 via-fuchsia-300 to-violet-500', kicker: '设计灵感' },
  { title: '春日茶饮特辑', tone: 'from-amber-100 via-orange-200 to-rose-300', kicker: '新品推荐' },
  { title: '旅行必备好物', tone: 'from-teal-200 via-sky-300 to-blue-500', kicker: '出行清单' },
  { title: '轻松办公提案', tone: 'from-lime-100 via-green-200 to-teal-300', kicker: '效率工具' },
];

type TemplateGalleryKind = 'editorial' | 'calendar' | 'award' | 'recruitment' | 'recent' | 'redbook' | 'marketing' | 'amazon' | 'detail' | 'drama';

interface TemplateGalleryItem {
  title: string;
  description: string;
  kicker: string;
  tone: string;
  foreground: string;
  accent: string;
}

interface TemplateGallerySeed {
  title: string;
  description: string;
  tone: string;
  kicker?: string;
  foreground?: string;
  accent?: string;
}

const makeGalleryItems = (seeds: TemplateGallerySeed[], defaultForeground = 'text-white'): TemplateGalleryItem[] => seeds.map((item, index) => ({
  ...item,
  kicker: item.kicker ?? `DESIGN · ${String(index + 1).padStart(2, '0')}`,
  foreground: item.foreground ?? defaultForeground,
  accent: item.accent ?? 'bg-[#ffd66b]',
}));

interface TemplateGallerySectionData {
  title: string;
  description: string;
  kind: TemplateGalleryKind;
  items: TemplateGalleryItem[];
}

const templateGallerySections: TemplateGallerySectionData[] = [
  {
    title: '编辑精选', description: '创意模板精选，快速开启设计', kind: 'editorial',
    items: [
      { title: '中秋节', description: '3种中秋设计', kicker: 'MID-AUTUMN', tone: 'from-emerald-100 via-amber-50 to-rose-100', foreground: 'text-[#34544d]', accent: 'bg-[#f3d36f]' },
      { title: '国庆快乐', description: '盛世华诞 喜迎国庆', kicker: 'NATIONAL DAY', tone: 'from-rose-300 via-red-500 to-orange-500', foreground: 'text-white', accent: 'bg-[#ffbd64]' },
      { title: '秋日特辑', description: '秋日限时上新', kicker: 'HELLO AUTUMN', tone: 'from-amber-100 via-orange-200 to-yellow-500', foreground: 'text-[#74421c]', accent: 'bg-[#d77d31]' },
      { title: '小红书', description: '爆款图文掌握流量', kicker: 'LIFESTYLE', tone: 'from-sky-100 via-cyan-100 to-blue-300', foreground: 'text-[#2c6481]', accent: 'bg-[#58b8ca]' },
      { title: '早安日签', description: '每日一张开启新一天', kicker: 'GOOD MORNING', tone: 'from-blue-300 via-cyan-200 to-lime-200', foreground: 'text-[#1f5c81]', accent: 'bg-[#f5d568]' },
      { title: '邀请函', description: '海量邀请函 活动必备', kicker: 'INVITATION', tone: 'from-blue-100 via-indigo-200 to-violet-300', foreground: 'text-[#394c85]', accent: 'bg-[#f6db9d]' },
      { title: '假期美工', description: '超丰富模板素材大数据', kicker: 'HOLIDAY IDEAS', tone: 'from-rose-100 via-pink-200 to-sky-200', foreground: 'text-[#703d6b]', accent: 'bg-[#81b9ec]' },
    ],
  },
  {
    title: '新年台历（可在线打印）', description: '精选台历模板，记录崭新一年的每一天', kind: 'calendar',
    items: [
      { title: '2027', description: '马年插画台历', kicker: 'HAPPY NEW YEAR', tone: 'from-red-400 via-orange-300 to-amber-200', foreground: 'text-white', accent: 'bg-[#ffe27a]' },
      { title: '马年大吉', description: '新年主题台历', kicker: '2027 · 新年快乐', tone: 'from-emerald-300 via-sky-300 to-cyan-100', foreground: 'text-[#23697d]', accent: 'bg-white' },
      { title: '金马迎春', description: '喜庆国风台历', kicker: '新春纳福', tone: 'from-rose-700 via-red-600 to-amber-400', foreground: 'text-[#fff2c4]', accent: 'bg-[#f7d65e]' },
      { title: '春日序曲', description: '清新插画年历', kicker: 'HELLO 2027', tone: 'from-sky-300 via-blue-400 to-cyan-200', foreground: 'text-white', accent: 'bg-[#fff4c8]' },
      { title: '新年心愿', description: '可打印桌面台历', kicker: '新的一年', tone: 'from-red-600 via-rose-500 to-orange-300', foreground: 'text-white', accent: 'bg-[#ffd980]' },
      { title: '萌趣日历', description: '治愈系插画台历', kicker: 'HAPPY 2027', tone: 'from-amber-100 via-yellow-200 to-orange-200', foreground: 'text-[#9a5428]', accent: 'bg-[#e99353]' },
      { title: '山水年历', description: '东方美学台历', kicker: '岁序更新', tone: 'from-blue-800 via-indigo-600 to-sky-400', foreground: 'text-white', accent: 'bg-[#f4d88e]' },
      { title: '简约台历', description: '全年日历打印模板', kicker: '2027 CALENDAR', tone: 'from-stone-100 via-amber-50 to-orange-100', foreground: 'text-[#685244]', accent: 'bg-[#bf815c]' },
    ],
  },
  {
    title: '喜报', description: '精美喜报合集，好设计彰显实力', kind: 'award',
    items: [
      { title: '全部模板', description: '精选喜报模板', kicker: '喜报', tone: 'from-red-700 via-red-600 to-orange-400', foreground: 'text-[#fff2c6]', accent: 'bg-[#ffc54f]' },
      { title: '销冠喜报', description: '业绩捷报 · 冠军榜', kicker: '荣耀时刻', tone: 'from-red-600 via-rose-600 to-orange-500', foreground: 'text-white', accent: 'bg-[#ffdb70]' },
      { title: '业绩喜报', description: '业绩突破 · 再创佳绩', kicker: 'GOOD NEWS', tone: 'from-amber-300 via-orange-500 to-red-600', foreground: 'text-white', accent: 'bg-[#fff0a6]' },
      { title: '光荣榜', description: '榜样力量 · 荣誉表彰', kicker: 'HONOR ROLL', tone: 'from-rose-700 via-red-700 to-amber-500', foreground: 'text-[#fff2c6]', accent: 'bg-[#ffe174]' },
      { title: '获奖喜报', description: '竞赛获奖荣誉展示', kicker: '热烈祝贺', tone: 'from-red-700 via-orange-600 to-amber-400', foreground: 'text-white', accent: 'bg-[#fff1ab]' },
      { title: '优秀员工表彰', description: '员工荣誉榜单', kicker: '表彰先进', tone: 'from-slate-100 via-stone-50 to-amber-200', foreground: 'text-[#4f5a64]', accent: 'bg-[#c79138]' },
      { title: '团队喜报', description: '团队荣誉与成绩展示', kicker: 'TEAM HONOR', tone: 'from-red-600 via-rose-500 to-orange-300', foreground: 'text-white', accent: 'bg-[#ffe58c]' },
      { title: '考试喜报', description: '升学考试成绩喜报', kicker: '金榜题名', tone: 'from-rose-800 via-red-700 to-red-500', foreground: 'text-[#fff1c8]', accent: 'bg-[#f7d86e]' },
    ],
  },
  {
    title: '招聘', description: 'HR必备！招聘物料合集', kind: 'recruitment',
    items: [
      { title: '寻找好物主理人', description: '创意岗位招聘海报', kicker: 'JOIN OUR TEAM', tone: 'from-yellow-100 via-lime-100 to-emerald-100', foreground: 'text-[#325949]', accent: 'bg-[#72b987]' },
      { title: '此刻招募', description: '招募你的下一位伙伴', kicker: 'WE ARE HIRING', tone: 'from-blue-600 via-sky-500 to-indigo-700', foreground: 'text-white', accent: 'bg-[#ffe16a]' },
      { title: '速来pick', description: '高薪岗位等你来', kicker: 'CAREER OFFER', tone: 'from-sky-300 via-blue-500 to-cyan-600', foreground: 'text-white', accent: 'bg-[#fff06b]' },
      { title: '招聘计划', description: '企业人才招募计划', kicker: '招贤纳士', tone: 'from-emerald-100 via-lime-100 to-rose-100', foreground: 'text-[#397558]', accent: 'bg-[#f5a4bf]' },
      { title: '找工作啦', description: '热门岗位火热招聘', kicker: 'JOIN US', tone: 'from-cyan-500 via-blue-500 to-teal-600', foreground: 'text-white', accent: 'bg-[#f8da4f]' },
      { title: '招募合伙人', description: '一起开启全新事业', kicker: 'WE NEED YOU', tone: 'from-amber-200 via-orange-300 to-yellow-400', foreground: 'text-[#51321e]', accent: 'bg-[#1e1d1b]' },
      { title: '有个工作想给你', description: '轻松活泼招聘模板', kicker: 'HIRING NOW', tone: 'from-lime-100 via-green-100 to-teal-100', foreground: 'text-[#365a47]', accent: 'bg-[#80bda1]' },
    ],
  },
];

const agentGallerySections: TemplateGallerySectionData[] = [
  {
    title: '最近设计', description: '继续编辑最近创作的设计', kind: 'recent',
    items: makeGalleryItems([
      { title: '春日上新', description: '春季新品推广图', tone: 'from-sky-100 via-blue-200 to-cyan-100', foreground: 'text-[#315f91]', kicker: 'SPRING · NEW' },
      { title: '月亮与我', description: '治愈系日签海报', tone: 'from-amber-50 via-yellow-100 to-orange-100', foreground: 'text-[#806239]', kicker: 'GOOD NIGHT' },
      { title: '周末计划', description: '周末生活方式拼贴', tone: 'from-orange-100 via-rose-100 to-fuchsia-100', foreground: 'text-[#9e4d69]', kicker: 'WEEKEND' },
      { title: '留白练习', description: '极简文字排版设计', tone: 'from-stone-100 via-white to-slate-100', foreground: 'text-[#384052]', kicker: 'TYPE STUDY' },
      { title: '知识分享', description: '课程知识卡片', tone: 'from-sky-100 via-blue-100 to-indigo-100', foreground: 'text-[#294c88]', kicker: 'LEARN MORE' },
      { title: '春日折页', description: '活动宣传长图', tone: 'from-rose-100 via-orange-100 to-amber-100', foreground: 'text-[#90502a]', kicker: 'SPRING DAY' },
      { title: '中秋月圆', description: '节日主题海报', tone: 'from-indigo-800 via-blue-800 to-amber-500', foreground: 'text-[#fff4cd]', kicker: 'MID-AUTUMN' },
      { title: '品牌灵感', description: '品牌视觉方案', tone: 'from-fuchsia-100 via-violet-100 to-sky-100', foreground: 'text-[#543f88]', kicker: 'BRAND STORY' },
      { title: '商品上新', description: '电商商品主图', tone: 'from-emerald-100 via-lime-100 to-yellow-100', foreground: 'text-[#35604a]', kicker: 'JUST ARRIVED' },
    ]),
  },
  {
    title: '小红书封面', description: '热门笔记封面模板，快速吸引关注', kind: 'redbook',
    items: makeGalleryItems([
      { title: '猫咪行为科普', description: '猫咪行为科普小红书封面', tone: 'from-pink-200 via-rose-100 to-amber-50', foreground: 'text-[#714754]', kicker: 'CAT · CUTIE' },
      { title: '职场干货', description: '职场经验分享封面', tone: 'from-emerald-100 via-teal-100 to-cyan-100', foreground: 'text-[#225e62]', kicker: 'WORK TIPS' },
      { title: '排版设计学', description: '排版设计入门笔记', tone: 'from-amber-200 via-yellow-100 to-orange-100', foreground: 'text-[#6f4a20]', kicker: 'DESIGN CLASS' },
      { title: '互联网运营', description: '运营知识干货分享', tone: 'from-blue-500 via-cyan-400 to-sky-300', kicker: '运营干货' },
      { title: '自媒体标题', description: '自媒体标题灵感合集', tone: 'from-violet-500 via-fuchsia-400 to-pink-300', kicker: 'CONTENT IDEAS' },
      { title: '科学育儿', description: '育儿知识分享封面', tone: 'from-yellow-200 via-lime-100 to-emerald-100', foreground: 'text-[#465b35]', kicker: 'PARENTING' },
      { title: '亲子沟通', description: '亲子关系成长笔记', tone: 'from-sky-300 via-blue-400 to-indigo-500', kicker: '成长日记' },
      { title: '护肤避坑指南', description: '护肤成分知识分享', tone: 'from-rose-100 via-pink-200 to-violet-200', foreground: 'text-[#764966]', kicker: 'SKINCARE' },
      { title: '克服三分钟热度', description: '自律习惯养成计划', tone: 'from-lime-300 via-green-300 to-teal-400', foreground: 'text-[#254e46]', kicker: '坚持打卡' },
    ]),
  },
  {
    title: '营销海报', description: '促销活动、新品发布等营销场景一站制作', kind: 'marketing',
    items: makeGalleryItems([
      { title: '英语萌趣启蒙', description: '少儿英语培训招生海报', tone: 'from-orange-100 via-amber-100 to-rose-200', foreground: 'text-[#704332]', kicker: 'JOIN OUR CLASS' },
      { title: '少儿托管招生', description: '托管班招生宣传海报', tone: 'from-pink-200 via-rose-100 to-yellow-100', foreground: 'text-[#744455]', kicker: '招生啦' },
      { title: '招募小伙伴', description: '课程与团队招募宣传', tone: 'from-sky-200 via-blue-200 to-amber-100', foreground: 'text-[#315d83]', kicker: 'DISCOVER MORE' },
      { title: '618限时促销', description: '年中大促商品海报', tone: 'from-red-600 via-rose-600 to-orange-500', kicker: '618 PROMOTION' },
      { title: '618狂欢盛典', description: '电商年中大促主视觉', tone: 'from-rose-700 via-red-700 to-pink-500', kicker: 'BIG SALE' },
      { title: '超级会员日', description: '会员专享折扣活动', tone: 'from-yellow-200 via-amber-100 to-orange-200', foreground: 'text-[#473927]', kicker: 'MEMBER DAY' },
      { title: '全场限时特惠', description: '限时优惠活动宣传', tone: 'from-emerald-800 via-green-700 to-lime-500', kicker: 'LIMITED OFFER' },
      { title: '买买买攻略', description: '购物节优惠攻略海报', tone: 'from-amber-100 via-yellow-200 to-orange-100', foreground: 'text-[#755126]', kicker: 'SHOPPING GUIDE' },
      { title: '新品发布会', description: '品牌新品发布活动', tone: 'from-indigo-700 via-violet-600 to-fuchsia-500', kicker: 'NEW ARRIVAL' },
    ]),
  },
  {
    title: '亚马逊套图', description: '高转化电商主图与商品信息图', kind: 'amazon',
    items: makeGalleryItems([
      { title: '细节拆解图', description: '材质与结构细节展示', tone: 'from-stone-100 via-white to-amber-50', foreground: 'text-[#333b45]', kicker: 'PREMIUM PET MAT' },
      { title: '核心卖点对比', description: 'Before / After 对比展示', tone: 'from-sky-100 via-white to-blue-100', foreground: 'text-[#31546d]', kicker: 'YOUR GO-TO SOLUTION' },
      { title: '健康喂养对比图', description: '产品使用效果对比', tone: 'from-blue-100 via-white to-slate-100', foreground: 'text-[#243c54]', kicker: 'INCORRECT / CORRECT' },
      { title: '多场景适用图', description: '展示多种使用场景', tone: 'from-cyan-100 via-white to-sky-100', foreground: 'text-[#205370]', kicker: 'MULTIPLE SCENARIOS' },
      { title: '尺寸指南图', description: '展示产品尺寸与规格', tone: 'from-slate-100 via-white to-blue-50', foreground: 'text-[#39495b]', kicker: 'SIZE GUIDELINE' },
      { title: '产品细节展示', description: '突出产品关键细节', tone: 'from-blue-50 via-white to-cyan-100', foreground: 'text-[#28546d]', kicker: 'PRODUCT FEATURES' },
      { title: '功能优势说明', description: '图文呈现商品核心功能', tone: 'from-cyan-100 via-sky-50 to-indigo-100', foreground: 'text-[#2e526c]', kicker: 'KEY BENEFITS' },
      { title: '舒适设计亮点', description: '材质工艺与舒适体验', tone: 'from-sky-100 via-white to-blue-50', foreground: 'text-[#2b5471]', kicker: 'COMFORT DESIGN' },
      { title: '商品信息图', description: '适配亚马逊详情展示', tone: 'from-slate-100 via-white to-sky-100', foreground: 'text-[#314c62]', kicker: 'PRODUCT INFOGRAPHIC' },
    ], 'text-[#33485f]'),
  },
  {
    title: '商品详情页', description: '多屏详情页模板，完整展示商品卖点', kind: 'detail',
    items: makeGalleryItems([
      { title: '沐浴露详情页', description: '香氛沐浴露商品详情', tone: 'from-amber-50 via-orange-50 to-rose-100', foreground: 'text-[#513b31]', kicker: 'BOTANICAL BODY WASH' },
      { title: '燕窝礼盒详情页', description: '滋补礼盒产品介绍', tone: 'from-red-900 via-rose-800 to-amber-500', kicker: '臻选好礼' },
      { title: '防晒衣详情页', description: '轻薄防晒服产品展示', tone: 'from-sky-100 via-white to-blue-200', foreground: 'text-[#365c78]', kicker: 'SUN PROTECTION' },
      { title: '面膜详情页', description: '护肤产品功效介绍', tone: 'from-violet-100 via-white to-fuchsia-100', foreground: 'text-[#604c80]', kicker: 'PURE INGREDIENTS' },
      { title: '宠物粮详情页', description: '宠物食品营养信息', tone: 'from-lime-100 via-white to-amber-100', foreground: 'text-[#475d37]', kicker: 'NATURAL RECIPE' },
      { title: '防晒伞详情页', description: '遮阳伞产品功能展示', tone: 'from-emerald-100 via-white to-sky-100', foreground: 'text-[#35665a]', kicker: 'UV PROTECTION' },
      { title: '手持风扇详情页', description: '夏日清凉小家电展示', tone: 'from-blue-100 via-white to-cyan-100', foreground: 'text-[#355c76]', kicker: 'COOLING POWER' },
      { title: '蓝牙耳机详情页', description: '数码产品卖点介绍', tone: 'from-sky-100 via-blue-100 to-indigo-200', foreground: 'text-[#304f6e]', kicker: 'WIRELESS SOUND' },
      { title: '音响详情页', description: '音响产品氛围展示', tone: 'from-stone-900 via-slate-800 to-amber-700', kicker: 'PREMIUM SOUND' },
    ]),
  },
  {
    title: '🎉短剧带货', description: '短剧视频灵感与带货内容模板', kind: 'drama',
    items: makeGalleryItems([
      { title: '离开豪门后', description: '爽剧反转 · 第01集', tone: 'from-slate-800 via-stone-600 to-rose-300', kicker: 'SHORT DRAMA' },
      { title: '气垫试色', description: '美妆种草 · 上妆实测', tone: 'from-amber-100 via-rose-100 to-stone-200', foreground: 'text-[#543e3b]', kicker: 'BEAUTY REVIEW' },
      { title: '溜溜梅', description: '古风剧情 · 好物推荐', tone: 'from-emerald-800 via-teal-700 to-stone-800', kicker: '古风好物' },
      { title: '面霜好物', description: '护肤测评 · 使用分享', tone: 'from-rose-100 via-white to-sky-100', foreground: 'text-[#54415b]', kicker: 'SKINCARE STORY' },
      { title: '黑蝴蝶', description: '古装剧情 · 片段推荐', tone: 'from-slate-950 via-indigo-950 to-amber-700', kicker: '剧情片段' },
      { title: '精华液', description: '护肤带货 · 成分解析', tone: 'from-amber-900 via-orange-700 to-yellow-300', kicker: 'GLOWING SKIN' },
      { title: '防晒霜', description: '夏日剧情 · 防晒推荐', tone: 'from-sky-900 via-blue-700 to-cyan-300', kicker: 'SUN CARE' },
      { title: '女主逆袭', description: '短剧高光 · 爆款片段', tone: 'from-rose-950 via-red-900 to-yellow-700', kicker: '反转时刻' },
      { title: '今日爆款', description: '热门短剧 · 好物清单', tone: 'from-stone-800 via-amber-700 to-rose-400', kicker: 'TRENDING NOW' },
    ]),
  },
];

function getDefaultValue(field: SkillField): FieldValue {
  if (field.type === 'upload') return [];
  if (field.type === 'ratio') return field.options[0];
  if (field.type === 'select') return field.options[0];
  return '';
}

function makePrompt(skill: SkillDefinition, values: Record<string, FieldValue>) {
  const lines = [`请使用「${skill.title}」Agent完成以下需求：`];
  skill.fields.forEach((field) => {
    const value = values[field.id];
    if (field.type === 'upload') {
      const files = Array.isArray(value) ? value : [];
      if (files.length) lines.push(`${field.label}：${files.map((file) => file.name).join('、')}`);
      return;
    }
    const text = typeof value === 'string' ? value.trim() : '';
    if (text) lines.push(`${field.label}：${text}`);
  });
  lines.push(`请根据以上信息完成「${skill.description}」，输出适合直接使用的结果。`);
  return lines.join('\n');
}

const modeOptions = [
  { key: 'templates', label: '设计模板' },
  { key: 'agent', label: 'AI创作' },
] as const;

type HomeMode = (typeof modeOptions)[number]['key'];

const navItems = [
  { label: '首页', icon: Home, active: true },
  { label: '模板', icon: LayoutTemplate },
  { label: '技能', icon: Puzzle },
  { label: 'AI工具', icon: Sparkles },
  { label: '创建', icon: Plus },
  { label: '我的', icon: UserRound },
  { label: '团队', icon: BriefcaseBusiness },
  { label: '品牌', icon: Shirt },
];

type WorkspaceAssetKind = 'blank' | 'blueprint' | 'paper' | 'photo' | 'poster' | 'yellow' | 'note' | 'phone' | 'butterfly' | 'red' | 'package' | 'sweater' | 'calendar' | 'landscape' | 'warm' | 'fruit' | 'portrait';
type WorkspaceAssetCategory = '创意画布' | '设计' | '素材' | '模型' | 'AI生成';

type WorkspaceAsset = {
  title: string;
  category: WorkspaceAssetCategory;
  kind: WorkspaceAssetKind;
  badge?: string;
  isNew?: boolean;
};

const workspaceFolders = ['111', '测试文件夹'];
const workspaceTypeFilters = ['全部', '创意画布', '设计', '素材', '模型', 'AI生成'];

const workspaceAssets: WorkspaceAsset[] = [
  { title: '未命名', category: '创意画布', kind: 'blank', badge: '画布', isNew: true },
  { title: '28586093', category: 'AI生成', kind: 'blueprint', badge: 'AI创作', isNew: true },
  { title: '28585974', category: '创意画布', kind: 'paper', badge: '画布', isNew: true },
  { title: '黄昏小船与自由', category: '创意画布', kind: 'photo', badge: '画布' },
  { title: '未命名', category: '创意画布', kind: 'poster', badge: '画布' },
  { title: '趣味大字报职场主题小红书...', category: '设计', kind: 'yellow', badge: '设计' },
  { title: '立冬', category: '设计', kind: 'landscape', badge: '设计' },
  { title: '27710990.mp4', category: 'AI生成', kind: 'phone', badge: 'AI生成' },
  { title: '27624752', category: '素材', kind: 'butterfly', badge: 'AI电商' },
  { title: '24482126', category: 'AI生成', kind: 'red', badge: 'AI创作' },
  { title: '26912489', category: 'AI生成', kind: 'note', badge: 'AI创作' },
  { title: '26977181', category: '素材', kind: 'package', badge: 'AI电商' },
  { title: '26912488', category: 'AI生成', kind: 'note', badge: 'AI创作' },
  { title: '扁平插画风世界读书日主题...', category: '设计', kind: 'paper', badge: '设计' },
  { title: '26768436.mp4', category: 'AI生成', kind: 'phone', badge: 'AI生成' },
  { title: '26693436.mp4', category: 'AI生成', kind: 'phone', badge: 'AI生成' },
  { title: '26688909', category: 'AI生成', kind: 'portrait', badge: 'AI电商' },
  { title: 'female模特-1', category: 'AI生成', kind: 'photo', badge: 'AI生成' },
  { title: '25039808', category: 'AI生成', kind: 'package', badge: 'AI创作' },
  { title: '24639438', category: 'AI生成', kind: 'package', badge: 'AI创作' },
  { title: '24507078', category: 'AI生成', kind: 'sweater', badge: 'AI创作' },
  { title: '办公场景桌牌文案', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '夏日海边情感海报', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '烤红薯促销海报介绍', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '生成小猫咪图片', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '关于eeed的讨论', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '空间满需删作品', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '表述不明的话语', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '生成小猫咪图片', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '大雪节气海报解析', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '关于数字444', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '未命名', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '产品置于樱桃上', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '关于eeed的讨论', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: 'VOGUE杂志封面设计', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '23201138', category: 'AI生成', kind: 'poster', badge: 'AI创作' },
  { title: '23207534', category: 'AI生成', kind: 'poster', badge: 'AI创作' },
  { title: '未命名', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '未命名', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '油画风早安日签', category: '设计', kind: 'landscape', badge: '设计' },
  { title: '这幅图展现了一幅绝美', category: '创意画布', kind: 'paper', badge: '画布' },
  { title: '关于eeee的讨论', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '紧急情况', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '点点滴滴', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '烤红薯促销海报介绍', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '夏日海边情感海报', category: '创意画布', kind: 'blank', badge: '画布' },
  { title: '变身软糯米白毛绒质感', category: '创意画布', kind: 'warm', badge: '画布' },
  { title: '手绘风格降醇节气主题海报', category: '设计', kind: 'fruit', badge: '设计' },
  { title: '清明', category: '设计', kind: 'landscape', badge: '设计' },
  { title: '神话人物主题设计', category: '设计', kind: 'poster', badge: '设计' },
];

function WorkspaceAssetArtwork({ asset }: { asset: WorkspaceAsset }) {
  return (
    <div className={`workspace-asset-art workspace-asset-art--${asset.kind}`} aria-hidden="true">
      {asset.kind === 'blueprint' && <><span className="workspace-art-kicker">PRODUCT DESIGN</span><strong>产品经理招聘</strong><small>AI · SOLUTION · 2026</small></>}
      {asset.kind === 'yellow' && <><strong>职场<br />激燃</strong><small>打工人的高效指南</small><i>冲</i></>}
      {asset.kind === 'landscape' && <><span className="workspace-landscape-moon" /><strong>今日<br />新闻</strong><small>立冬</small></>}
      {asset.kind === 'phone' && <><span className="workspace-phone-screen"><i>09:41</i><b>▦</b><em>⌨</em></span><small>AI VIDEO</small></>}
      {asset.kind === 'butterfly' && <><span className="workspace-butterfly" /><small>AI MODEL</small></>}
      {asset.kind === 'red' && <><strong>放假通知</strong><b>4.29-5.3日</b><small>共 5 天假期</small></>}
      {asset.kind === 'note' && <><span className="workspace-note-lines" /><strong>停止无效内耗</strong><small>90% 进步来自持续行动</small></>}
      {asset.kind === 'package' && <><span className="workspace-package" /><strong>制药级品质</strong><small>天然成分 · 高效守护</small></>}
      {asset.kind === 'sweater' && <span className="workspace-sweater" />}
      {asset.kind === 'poster' && <><strong>桃桃酪酪</strong><small>FRUIT TEA · PEACH CHEESE</small><span className="workspace-cup" /></>}
      {asset.kind === 'paper' && <span className="workspace-paper-wave" />}
      {asset.kind === 'photo' && <><span className="workspace-photo-sky" /><span className="workspace-photo-subject" /></>}
      {asset.kind === 'portrait' && <><span className="workspace-portrait-head" /><span className="workspace-portrait-body" /><strong>智能识别</strong><small>高效准确</small></>}
      {asset.kind === 'warm' && <><span className="workspace-warm-window" /><strong>暖冬好物</strong></>}
      {asset.kind === 'fruit' && <><strong>小满</strong><span className="workspace-fruit-sun" /><small>轻盈生活提案</small></>}
      {asset.kind === 'blank' && <><span className="workspace-blank-shape workspace-blank-shape--one" /><span className="workspace-blank-shape workspace-blank-shape--two" /></>}
    </div>
  );
}

type WorkspaceInspirationAsset = {
  id: string;
  type: 'image' | 'video';
  source: '淘宝' | '京东' | '小红书';
  title: string;
  note: string;
  tone: 'warm' | 'blue' | 'pink';
};

const workspaceInspirationDemoAssets: WorkspaceInspirationAsset[] = [
  { id: 'workspace-inspiration-1', type: 'image', source: '淘宝', title: '奶油风家居陈列', note: '商品主图 · 2小时前', tone: 'warm' },
  { id: 'workspace-inspiration-2', type: 'video', source: '京东', title: '秋冬上新短视频', note: '商品视频 · 昨天', tone: 'blue' },
  { id: 'workspace-inspiration-3', type: 'image', source: '小红书', title: '留白感封面排版', note: '灵感配图 · 3天前', tone: 'pink' },
];

function WorkspaceInspirationArtwork({ asset }: { asset: WorkspaceInspirationAsset }) {
  return (
    <div className={`workspace-inspiration-art workspace-inspiration-art--${asset.tone}`} aria-hidden="true">
      <span className="workspace-inspiration-art__shine" />
      <span className="workspace-inspiration-art__object workspace-inspiration-art__object--back" />
      <span className="workspace-inspiration-art__object workspace-inspiration-art__object--front" />
      {asset.type === 'video' && <span className="workspace-inspiration-art__play"><Play size={15} fill="currentColor" /></span>}
      <span className="workspace-inspiration-art__source">{asset.source}</span>
    </div>
  );
}

function InspirationCollectionPanel({ notify }: { notify: (message: string) => void }) {
  const [isPluginInstalled, setIsPluginInstalled] = useState(false);
  const [assets, setAssets] = useState<WorkspaceInspirationAsset[]>([]);

  const installPlugin = () => {
    setIsPluginInstalled(true);
    notify('采集插件安装成功，去淘宝、京东试试吧');
  };

  const showDemoAssets = () => {
    setAssets(workspaceInspirationDemoAssets);
    setIsPluginInstalled(true);
    notify('已展示 3 条采集示例');
  };

  return (
    <div className="workspace-inspiration-page">
      {assets.length === 0 ? (
        <section className="workspace-inspiration-empty">
          <img className="workspace-inspiration-empty__image" src="/inspiration/inspiration-collector-empty-state.png" alt="浏览器采集图片和视频到创客贴灵感库" />
          <div className="workspace-inspiration-empty__content">
            <span className="workspace-inspiration-eyebrow"><Puzzle size={15} />浏览器采集插件</span>
            <h2>开始采集你的第一条灵感</h2>
            <p>{isPluginInstalled ? '插件已就绪，去淘宝、京东逛逛，把喜欢的图片和视频保存下来吧' : '安装插件后，在淘宝、京东看到喜欢的图片或视频，点击一下就能保存到这里。'}</p>
            <div className="workspace-inspiration-points"><span>支持图片与视频</span><span>淘宝、京东等站点可用</span><span>回来即可继续创作</span></div>
            <div className="workspace-inspiration-empty__actions">
              <button type="button" className="workspace-inspiration-empty__primary" onClick={isPluginInstalled ? showDemoAssets : installPlugin}>{isPluginInstalled ? '开始采集灵感' : '安装采集插件'}<ChevronRight size={16} /></button>
              <button type="button" className="workspace-inspiration-empty__secondary" onClick={showDemoAssets}>先看看采集后的效果</button>
            </div>
            <small>支持 Chrome、Edge 等主流浏览器</small>
          </div>
        </section>
      ) : (
        <section className="workspace-inspiration-library">
          <div className="workspace-inspiration-library__toolbar">
            <div><h2>我的灵感</h2><span>{assets.length} 条内容</span></div>
            <div className="workspace-inspiration-library__actions"><button type="button" onClick={() => notify('筛选功能即将上线')}>全部<ChevronDown size={14} /></button><button type="button" onClick={() => notify('排序功能即将上线')}>最近采集<ChevronDown size={14} /></button></div>
          </div>
          <div className="workspace-inspiration-grid">
            {assets.map((asset) => (
              <button type="button" className="workspace-inspiration-card" key={asset.id} onClick={() => notify(`打开${asset.title}`)}>
                <WorkspaceInspirationArtwork asset={asset} />
                <span className="workspace-inspiration-card__title">{asset.title}</span>
                <span className="workspace-inspiration-card__note">{asset.note}</span>
              </button>
            ))}
            <button type="button" className="workspace-inspiration-add" onClick={isPluginInstalled ? showDemoAssets : installPlugin}><Plus size={28} /><strong>继续采集</strong><span>去淘宝、京东发现更多灵感</span></button>
          </div>
        </section>
      )}
    </div>
  );
}

function MyWorkspacePage({ inspirationUnread, onMarkInspirationRead }: { inspirationUnread: boolean; onMarkInspirationRead: () => void }) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('我的空间');
  const [activeType, setActiveType] = useState('全部');
  const [searchValue, setSearchValue] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const visibleAssets = workspaceAssets.filter((asset) => {
    const matchesType = activeType === '全部' || asset.category === activeType;
    const matchesSearch = !searchValue.trim() || asset.title.toLowerCase().includes(searchValue.trim().toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <section className="workspace-page" aria-label="我的空间">
      <div className="workspace-top-tabs">
        <div className="workspace-tab-list">
          {['我的空间', '我的收藏', '灵感采集', '与我协作', '包装设计', '回收站'].map((tab) => (
            <button key={tab} type="button" className={`relative ${activeWorkspaceTab === tab ? 'is-active' : ''}`} onClick={() => { setActiveWorkspaceTab(tab); if (tab === '灵感采集') { onMarkInspirationRead(); } else if (tab !== '我的空间') { notify(`${tab}功能即将上线`); } }}>{tab}{tab === '灵感采集' && inspirationUnread && <i className="workspace-inspiration-tab-badge" aria-label="有新的灵感采集入口" />}</button>
          ))}
        </div>
        <div className="workspace-actions">
          <label className="workspace-search"><Search size={18} /><input value={searchValue} onChange={(event) => setSearchValue(event.currentTarget.value)} placeholder="搜索我的空间" aria-label="搜索我的空间" /><kbd>⌕</kbd></label>
          <button type="button" className="workspace-manage-button" onClick={() => notify('空间管理即将上线')}><Settings2 size={16} />空间管理</button>
          <div className="workspace-create-wrap">
            <button type="button" className="workspace-create-button" onClick={() => setShowUploadMenu((value) => !value)}><Plus size={18} />新建/上传<ChevronDown size={14} /></button>
            {showUploadMenu && <div className="workspace-create-menu"><button type="button" onClick={() => { setShowUploadMenu(false); notify('已创建空白画布'); }}><Plus size={15} />新建设计</button><button type="button" onClick={() => { setShowUploadMenu(false); notify('上传入口已打开'); }}><CloudUpload size={15} />上传文件</button></div>}
          </div>
          <div className="workspace-storage" aria-label="空间使用率"><strong>10.3%</strong><span /></div>
        </div>
      </div>

      {activeWorkspaceTab === '灵感采集' ? <InspirationCollectionPanel notify={notify} /> : <>
      <div className="workspace-folder-heading"><span>文件夹 (2)</span><ChevronDown size={15} /></div>
      <div className="workspace-folders">
        <button type="button" className="workspace-folder-card workspace-folder-card--new" onClick={() => notify('已打开新建文件夹')}><FolderPlus size={25} /><span>新建文件夹</span></button>
        {workspaceFolders.map((folder) => <button key={folder} type="button" className="workspace-folder-card" onClick={() => notify(`打开文件夹：${folder}`)}><Folder size={44} fill="#ffc72c" stroke="#f5a623" /><span>{folder}</span></button>)}
      </div>

      <div className="workspace-filter-bar">
        <div className="workspace-type-tabs">{workspaceTypeFilters.map((filter) => <button key={filter} type="button" className={activeType === filter ? 'is-active' : ''} onClick={() => setActiveType(filter)}>{filter}{filter === 'AI生成' && <ChevronDown size={13} />}</button>)}</div>
        <div className="workspace-sort-actions">
          {['场景', '格式', '标签', '修改时间'].map((filter) => <button key={filter} type="button" onClick={() => notify(`${filter}筛选即将上线`)}>{filter}<ChevronDown size={12} /></button>)}
          <button type="button" className="workspace-icon-button" onClick={() => notify('已切换网格视图')} aria-label="网格视图"><Grid2x2 size={18} /></button>
          <button type="button" className="workspace-icon-button" onClick={() => notify('已打开批量筛选')} aria-label="批量筛选"><CheckSquare size={18} /></button>
        </div>
      </div>

      <div className="workspace-assets-grid">
        {visibleAssets.map((asset, index) => (
          <button type="button" className="workspace-asset-card" key={`${asset.title}-${asset.kind}-${index}`} onClick={() => notify(`打开：${asset.title}`)}>
            <div className="workspace-asset-thumb"><WorkspaceAssetArtwork asset={asset} />{asset.isNew && <span className="workspace-new-label">NEW</span>}{asset.badge && <span className="workspace-asset-badge"><Sparkles size={11} />{asset.badge}</span>}</div>
            <span className="workspace-asset-title">{asset.isNew && <i>NEW</i>}{asset.title}</span>
          </button>
        ))}
        {visibleAssets.length === 0 && <div className="workspace-empty"><CircleCheck size={22} /><span>没有找到匹配的设计</span></div>}
      </div>
      </>}
      {toast && <div className="workspace-toast" role="status">{toast}</div>}
    </section>
  );
}

type TeamResourceKind = 'team-orange' | 'team-blue' | 'team-purple' | 'team-black' | 'team-red' | 'team-doc' | 'team-lock' | 'team-pink' | 'team-web' | 'team-yellow' | 'team-dark';

type TeamResource = {
  title: string;
  kind: TeamResourceKind;
  badge: string;
  shared?: boolean;
};

const teamFolders = [
  '创客贴设计部门...',
  '兴业银行模板海报',
  '渠道发展部',
  '品牌对外资料',
  '人力行政中心',
  '中台支持中心',
  '创意服务中心',
  '产研中心',
  '个人与SMB运营部',
  '企业营销部',
];

const teamResources: TeamResource[] = [
  { title: '棕色秋季班招生手机海报', kind: 'team-orange', badge: '模板' },
  { title: '朋友圈素材_20260909_证券...', kind: 'team-blue', badge: '模板' },
  { title: '9月第2批-中长图图文素材...', kind: 'team-purple', badge: '模板' },
  { title: '国泰_第一套_三张', kind: 'team-black', badge: '模板' },
  { title: '看盘炒股利器shangchuan(2...', kind: 'team-red', badge: '模板' },
  { title: '看盘炒股利器shangchuan(2...', kind: 'team-orange', badge: '模板' },
  { title: '看盘炒股利器shangchuan.psd', kind: 'team-red', badge: '模板' },
  { title: '银行金融讲解学人物理财动...', kind: 'team-doc', badge: '模板' },
  { title: '国泰动效版.psd', kind: 'team-doc', badge: '模板' },
  { title: 'chuangkit_360shoply', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_zolkjhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_lianxiangkhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_tengxunjkhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_huaweishopkhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_huanujrjkhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_ddookhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_baidusemkhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit', kind: 'team-lock', badge: 'EXE', shared: true },
  { title: 'chuangkit_360ruanjankhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_360rjgjkhd', kind: 'team-lock', badge: 'EXE' },
  { title: 'chuangkit_360semkhd', kind: 'team-lock', badge: 'EXE' },
  { title: '斗鱼_陪玩福利社--新(9)', kind: 'team-pink', badge: 'JPG' },
  { title: 'web', kind: 'team-purple', badge: 'JPG' },
  { title: 'h5', kind: 'team-purple', badge: 'JPG' },
  { title: 'web', kind: 'team-dark', badge: 'JPG' },
  { title: 'kv(2)', kind: 'team-purple', badge: 'JPG' },
  { title: 'h5', kind: 'team-purple', badge: 'JPG' },
  { title: 'Web-斗鱼-PUBG进阶挑战-周...', kind: 'team-yellow', badge: 'PNG' },
  { title: 'Web-斗鱼-PUBG进阶挑战-观...', kind: 'team-yellow', badge: 'PNG' },
  { title: 'H5-斗鱼-PUBG进阶挑战-周...', kind: 'team-yellow', badge: 'PNG' },
  { title: '斗鱼宣传页', kind: 'team-yellow', badge: 'PNG' },
  { title: '品牌活动KV', kind: 'team-orange', badge: 'JPG' },
  { title: '新客福利活动页', kind: 'team-blue', badge: 'PNG' },
  { title: '社媒传播物料', kind: 'team-red', badge: 'PNG' },
  { title: '创客贴周年活动', kind: 'team-dark', badge: 'PSD' },
];

function TeamResourceArtwork({ resource }: { resource: TeamResource }) {
  if (resource.kind === 'team-lock') {
    return <div className="team-resource-art team-resource-art--lock"><span><Lock size={38} strokeWidth={1.5} /></span></div>;
  }

  return (
    <div className={`team-resource-art team-resource-art--${resource.kind}`} aria-hidden="true">
      {resource.kind === 'team-orange' && <><span className="team-art-burst">✦</span><strong>秋季招生</strong><b>福利开学季</b><small>1699元起</small></>}
      {resource.kind === 'team-blue' && <><strong>给新客</strong><b>福利季</b><small>限时活动 · 立即领取</small></>}
      {resource.kind === 'team-purple' && <><strong>新客福利</strong><b>快来领取</b><small>福利活动素材</small></>}
      {resource.kind === 'team-black' && <><small>国泰海通证券</small><strong>情绪告诉你</strong><b>新客福利有5重礼</b></>}
      {resource.kind === 'team-red' && <><strong>盘面看不懂</strong><b>先换工具</b><small>炒股工具全解析</small></>}
      {resource.kind === 'team-doc' && <><span className="team-doc-lines" /><small>金融行业解决方案</small><b>专业服务说明</b></>}
      {resource.kind === 'team-pink' && <><strong>陪玩<br />福利社</strong><small>斗鱼 · 全新活动</small></>}
      {resource.kind === 'team-web' && <><span className="team-web-window" /><b>品牌活动页</b></>}
      {resource.kind === 'team-yellow' && <><strong>PUBG</strong><b>进阶挑战</b><small>精彩活动正式开启</small></>}
      {resource.kind === 'team-dark' && <><strong>声控福利社</strong><small>全新活动专题</small><span className="team-dark-orb" /></>}
    </div>
  );
}

const teamManagementNavGroups = [
  {
    label: '',
    items: [
      { label: '账户概览', icon: UserRound },
      { label: '使用统计', icon: ImageIcon },
      { label: '积分统计', icon: BarChart3 },
      { label: '积分管理', icon: CreditCard },
    ],
  },
  {
    label: '品牌管理',
    items: [
      { label: '品牌设置', icon: Shirt },
      { label: '品牌管制', icon: Settings2 },
    ],
  },
  {
    label: '团队管理',
    items: [
      { label: '成员管理', icon: UserRound },
      { label: '团队空间管理', icon: BriefcaseBusiness },
      { label: '模块管理', icon: Folder },
      { label: '设计推送管理', icon: ImageIcon },
    ],
  },
  {
    label: '团队设置',
    items: [
      { label: '团队信息', icon: BriefcaseBusiness },
      { label: '个性化设置', icon: Sparkles },
      { label: '更多设置', icon: Settings2 },
    ],
  },
];

function TeamManagementBrandMark({ className = '' }: { className?: string }) {
  return (
    <div className={`team-management-brand-mark ${className}`} aria-label="创客贴品牌标识">
      <span className="team-management-brand-mark__icon"><img src={cktAiEcomLogo} alt="" /></span>
      <span className="team-management-brand-mark__word"><img src={cktAiEcomLogo} alt="创客贴" /></span>
    </div>
  );
}

function TeamManagementMemberAvatars() {
  const members = ['创', '泽', '林', '白', '陈', '静'];
  return (
    <div className="team-management-avatars" aria-label="团队成员头像">
      {members.map((member, index) => <span key={`${member}-${index}`} className={`team-management-avatar team-management-avatar--${index}`}>{member}</span>)}
      <span className="team-management-avatar team-management-avatar--more">+181</span>
    </div>
  );
}

function UserAccountAvatar({ large = false }: { large?: boolean }) {
  return <span className={`user-account-avatar ${large ? 'is-large' : ''}`}><span className="user-account-avatar__photo">🐱</span><i>会员</i></span>;
}

interface UserProfileDropdownProps {
  onClose: () => void;
  onNavigateToManagement: () => void;
  onNotify: (message: string) => void;
}

function UserProfileDropdown({ onClose, onNavigateToManagement, onNotify }: UserProfileDropdownProps) {
  const action = (message: string, navigate = false) => {
    onClose();
    if (navigate) {
      onNavigateToManagement();
      return;
    }
    onNotify(message);
  };

  const menuItems = [
    { label: '团队管理', icon: Settings2, message: '团队管理即将打开', navigate: true },
    { label: '订单/发票', icon: CreditCard, message: '订单/发票即将打开' },
    { label: '我的授权记录', icon: FileImage, message: '授权记录即将打开' },
    { label: '消息中心', icon: MessageCircle, message: '消息中心即将打开', badge: '4' },
    { label: '我的优惠券', icon: Ticket, message: '优惠券即将打开' },
  ];

  return (
    <div className="user-profile-dropdown" role="dialog" aria-label="用户菜单" onClick={(event) => event.stopPropagation()}>
      <div className="user-profile-summary">
        <UserAccountAvatar large />
        <div className="user-profile-identity">
          <div className="user-profile-name">zww <span>管理员</span></div>
          <div className="user-profile-id">用户ID：18777988 <button type="button" aria-label="复制用户ID" onClick={() => action('用户ID已复制')}><Copy /></button></div>
        </div>
        <button type="button" className="user-profile-access-key" onClick={() => action('Access Key即将打开')}><KeyRound />Access Key</button>
      </div>

      <section className="user-profile-plan">
        <div className="user-profile-plan-copy">
          <div className="user-profile-plan-title"><span>V</span><strong>旗舰版</strong></div>
          <div className="user-profile-plan-expire">有效期至 2026年12月31日</div>
          <span className="user-profile-plan-status">会员权益生效中</span>
        </div>
        <button type="button" onClick={() => action('续费入口即将打开')}>立即续费</button>
      </section>

      <div className="user-profile-metrics">
        <div className="user-profile-metric-card">
          <div className="user-profile-metric-heading"><strong>储存空间</strong><button type="button" onClick={() => action('扩展储存空间即将打开')}>扩容 <span>›</span></button></div>
          <div className="user-profile-storage-progress"><span /></div>
          <div className="user-profile-storage-value">4.46TB <i>/</i> <em>12TB</em></div>
        </div>
        <div className="user-profile-metric-card user-profile-points-card">
          <div className="user-profile-metric-heading"><strong>AI积分 <CircleHelp /></strong><button type="button" onClick={() => action('购买积分即将打开')}>加购 <span>›</span></button></div>
          <div className="user-profile-points-value">369320</div>
        </div>
      </div>

      <div className="user-profile-team-switch-anchor">
        <button type="button" className="user-profile-team-card" onClick={() => action('切换团队即将打开')}>
          <TeamManagementBrandMark className="user-profile-team-logo" />
          <span><strong>北京艺源酷</strong><small>旗舰版 · 187人</small></span>
          <span className="user-profile-switch"><RefreshCw />切换团队</span>
        </button>
        <div className="user-profile-team-switch-panel" role="listbox" aria-label="切换团队">
          <button type="button" className="user-profile-team-option is-current" onClick={() => action('已切换到团队版')}><span className="team-switch-avatar team-switch-avatar--team">团</span><span><strong>团队版</strong><small>免费版 · 4人</small></span></button>
          <button type="button" className="user-profile-team-option" onClick={() => action('已切换到Hello的团队')}><span className="team-switch-avatar team-switch-avatar--hello">H</span><span><strong>Hello的团队</strong><small>免费版 · 2人</small></span></button>
          <button type="button" className="user-profile-team-option" onClick={() => action('已切换到1234567890')}><span className="team-switch-avatar team-switch-avatar--personal">◫</span><span><strong>1234567890</strong><small>标准版（个人） · 10人</small></span></button>
          <button type="button" className="user-profile-team-option" onClick={() => action('已切换到测试团队')}><span className="team-switch-avatar team-switch-avatar--test">测</span><span><strong>测试团队</strong><small>免费版 · 2人</small></span></button>
        </div>
      </div>

      <div className="user-profile-menu-list">
        {menuItems.map(({ label, icon: Icon, message, navigate, badge }) => <button type="button" key={label} onClick={() => action(message, navigate)}><Icon /><span>{label}</span>{badge ? <i>{badge}</i> : null}</button>)}
      </div>

      <button type="button" className="user-profile-logout" onClick={() => action('退出登录即将打开')}>退出登录</button>
    </div>
  );
}

const TEAM_CREDIT_STATISTICS_REQUIREMENT: RequirementSpec = {
  title: '团队积分统计',
  requirementKey: 'TEAM-CREDIT-STATISTICS',
  status: '待开发',
  eyebrow: 'TEAM CREDIT STATISTICS',
  summary: '在团队管理的积分统计入口中还原积分概览、今日使用、消耗趋势和消耗榜单四部分统计。',
  background: '积分统计与使用统计的权限和会员版本限制保持一致，实时展示当前团队的积分余额和最近使用情况，并以 T+1 数据呈现消耗趋势与榜单。',
  goal: '按原型还原四个统计模块及其文字、数据口径、筛选、悬浮分析和榜单规则；需求说明只作为页面右上角的产品说明入口，不进入功能导出数据。',
  sections: [
    {
      title: '页面入口与权限',
      description: '页面从团队管理侧边栏进入，沿用团队管理的顶部导航和左侧菜单。',
      items: [
        { label: '入口', content: '进入首页底部“管理”后，点击与“账户概览”“使用统计”同级的“积分统计”，页面标题显示“积分概览”。“使用统计”当前仅保留入口，暂未放置内容。', highlightTerms: ['积分统计', '使用统计', '积分概览'] },
        { label: '适用角色', content: '团队管理员可查看当前团队统计数据；普通成员无权访问团队级统计页，需展示无权限状态并保留返回账户概览入口。' },
        { label: '数据范围', content: '默认统计当前团队“北京艺源酷”的积分，不跨团队合并数据；团队切换后应重新加载所选团队的数据。' },
      ],
    },
    {
      title: '核心指标卡片',
      description: '积分概览使用实时数据，截止到当前最近数据；剩余积分、本月已消耗和今日已消耗均按当前团队展示。',
      items: [
        { label: '剩余积分', content: '数值为当前团队账户剩余的积分数。当前团队等级小于 302 时显示“升级会员领更多积分”按钮，点击打开会员版本选择弹框；团队等级达到 302 及以上时只显示“增购”入口。', highlightTerms: ['302', '升级会员领更多积分', '增购'] },
        { label: '增购', content: '增购入口一直显示；当不显示升级会员按钮时，增购显示为大按钮。点击打开积分购买弹框。', highlightTerms: ['一直显示', '大按钮', '积分购买弹框'] },
        { label: '本月已消耗积分', content: '数值为当前团队本月已消耗积分总和，包括功能消耗和到期自动失效。较上月展示变化率，支持 hover 查看详情；计算公式为（本月消耗值－上月消耗值）/上月消耗值，保留 2 位小数，正数绿色、负数红色、0 按常规黑色，上月为 0 时显示“－”。', highlightTerms: ['实时数据', 'hover', '正数绿色', '负数红色', '上月为 0'] },
        { label: '今日已消耗积分', content: '数值为当前团队今日已消耗积分总和，包括功能消耗和到期自动失效。较昨日展示变化率，支持 hover 查看详情；计算公式为（今日消耗值－昨日消耗值）/昨日消耗值，保留 2 位小数，正数绿色、负数红色、0 按常规黑色，昨日为 0 时显示“－”。', highlightTerms: ['实时数据', 'hover', '正数绿色', '负数红色', '昨日为 0'] },
      ],
    },
    {
      title: '今日使用',
      description: '实时获取最近 24 小时的使用数据，展示最新消耗和成员消耗。',
      items: [
        { label: '最新消耗', content: '实时获取最近 24 小时内的所有消耗明细并展示，最多显示 5000 条。成员消耗卡片默认隐藏，点击对应的成员名字后，以不遮挡列表内容的右侧浮层展示该成员当前团队最近 24 小时的消耗统计。', highlightTerms: ['24 小时', '5000', '默认隐藏', '成员名字', '右侧浮层'] },
        { label: '成员消耗', content: '展示成员名称、成员标签、最近 24 小时、消耗总积分和消耗总次数；原型示例为张美丽、成员、200 积分、50 次。点击“我知道了”或关闭按钮收起当前成员消耗浮层。', highlightTerms: ['成员名称', '成员标签', '最近 24 小时', '消耗总积分', '消耗总次数', '成员消耗浮层'] },
        { label: '查看全部', content: '点击“查看全部”跳转至“积分管理 > 积分明细 > 消耗明细”。', highlightTerms: ['查看全部', '积分管理 > 积分明细 > 消耗明细'] },
      ],
    },
    {
      title: '消耗趋势',
      description: '消耗趋势使用 T+1 数据，默认统计周期为过去 7 天。',
      items: [
        { label: '时间范围及统计粒度', content: '预置周期支持过去 7 天、过去 30 天、上周、上月，默认过去 7 天；日期选择器展示所选日期范围，点击可展开日历，最晚可选至昨日、最早可选至积分上线时间，最长选择周期 90 天；统计粒度支持天、周、月，默认按天。', highlightTerms: ['过去 7 天', '过去 30 天', '上周', '上月', '90 天', '天、周、月'] },
        { label: '消耗积分趋势', content: '按时间范围和粒度展示周期内总消耗积分、功能消耗积分数、到期失效积分数趋势图。hover 对应点显示日期、总消耗积分、功能消耗、到期失效、消耗最多的成员及其占比、消耗最多的功能及其占比。', highlightTerms: ['总消耗积分', '功能消耗积分数', '到期失效积分数', 'hover'] },
        { label: '消耗成员趋势', content: '按时间范围和粒度展示周期内消耗成员趋势图。hover 显示总消耗成员数、共消耗积分、消耗最多的成员及其占比、消耗最多的功能及其占比。', highlightTerms: ['总消耗成员数', '共消耗积分', 'hover'] },
        { label: '消耗功能趋势', content: '按时间范围和粒度展示周期内消耗功能趋势图。hover 显示总消耗功能数、共消耗积分、消耗最多的功能及其占比、消耗最多的成员及其占比。', highlightTerms: ['总消耗功能数', '共消耗积分', 'hover'] },
        { label: '导出', content: '趋势图右侧提供“导出”，仅导出当前趋势条件下的功能数据。', highlightTerms: ['导出', '仅导出当前趋势条件下的功能数据'] },
      ],
    },
    {
      title: '消耗榜单',
      description: '消耗榜单使用 T+1 数据，时间范围与消耗趋势上方选择的时间范围保持一致。',
      items: [
        { label: '成员消耗榜单', content: '按照时间范围及统计粒度内的消耗量从高到低展示 Top 10 成员；展示成员名称、消耗占比和消耗积分数。消耗占比为周期内成员消耗积分数 / 所有成员的消耗积分数。', highlightTerms: ['Top 10', '成员名称', '消耗占比', '消耗积分数'] },
        { label: '功能消耗榜单', content: '按照时间范围及统计粒度内的消耗量从高到低展示 Top 10 功能；展示功能名称、消耗占比和消耗积分数。消耗占比为周期内功能消耗积分数 / 所有功能的消耗积分数。', highlightTerms: ['Top 10', '功能名称', '消耗占比', '消耗积分数'] },
      ],
    },
    {
      title: '需求说明与导出',
      description: '产品说明入口和功能导出入口相互独立。',
      items: [
        { label: '页面入口', content: '积分统计与使用统计保持同一级别；使用统计暂未放置页面内容。积分统计包括积分概览、今日使用、消耗趋势和消耗榜单四部分统计。' },
        { label: '需求说明', content: '页面右上角悬浮“需求说明”按钮打开完整需求文档；该入口属于功能外的产品说明。', highlightTerms: ['需求说明', '功能外的产品说明'] },
        { label: '导出', content: '需求说明不加入导出数据；趋势模块“导出”只处理当前趋势功能数据。', highlightTerms: ['不加入导出数据', '导出'] },
      ],
    },
    {
      title: '页面状态与异常',
      description: '所有状态都必须保留页面结构并给出下一步操作。',
      items: [
        { label: '加载中', content: '首次进入或变更筛选条件时显示骨架屏或加载提示，避免展示上一条件的数据造成误解。' },
        { label: '空数据', content: '当前筛选范围没有积分记录时，最新消耗和趋势区显示“暂无积分消耗数据”，并保留时间范围和趋势维度操作。' },
        { label: '加载失败', content: '接口失败时显示“积分统计加载失败，请重试”，提供重试按钮，失败期间不覆盖最近一次已成功的数据。' },
        { label: '权限异常', content: '无团队统计权限时显示权限说明，不展示其他团队或未经授权的积分数据。' },
      ],
    },
    {
      title: '数据与接口依赖',
      description: '页面当前使用原型数据，正式联调时由接口提供真实值。',
      items: [
        { label: '统计接口', content: '待后端确认团队积分概览、最新消耗、成员消耗和趋势的接口拆分方式、请求参数、时区和缓存策略。' },
        { label: '精度口径', content: '积分均按整数展示；趋势聚合、余额计算和最新消耗必须使用同一团队、同一时区和同一积分账本口径。' },
        { label: '示例数据', content: '当前页面中的团队名称、余额、消耗记录和趋势数据仅用于原型验证，不能作为真实财务或积分结算依据。' },
      ],
    },
  ],
  acceptance: [
    '从管理 > 积分统计进入后，页面标题为“积分概览”，且积分统计与使用统计在团队管理侧边栏保持同级。',
    '页面包含积分概览、今日使用、消耗趋势和消耗榜单四部分，积分概览和今日使用为实时数据，消耗趋势和消耗榜单为 T+1 数据。',
    '积分概览按规则展示剩余积分、升级会员/增购、本月已消耗和今日已消耗，并支持变化率 hover 详情。',
    '今日使用最多显示最近24小时5000条消耗明细，成员消耗卡片默认隐藏；点击对应成员名字后以不遮挡列表的右侧浮层展示总积分和总次数，关闭后恢复隐藏，查看全部跳转到消耗明细。',
    '趋势区域支持过去7天、过去30天、上周、上月、最长90天日期范围，以及天/周/月统计粒度。',
    '趋势区域支持消耗积分、消耗成员、消耗功能三个维度，并按原型展示 hover 分析信息和三类趋势数据。',
    '消耗榜单分别展示成员和功能 Top10，包含名称、消耗占比和消耗积分。',
    '点击导出只导出趋势功能数据，不包含页面右上角需求说明内容。',
    '页面右上角需求说明按钮可打开完整需求文档，并支持复制结构化 AI 提示词。',
  ],
};

const TEAM_CREDIT_MANAGEMENT_REQUIREMENT: RequirementSpec = {
  title: '积分分配与管理',
  requirementKey: 'TEAM-CREDIT-MANAGEMENT',
  status: '待开发',
  eyebrow: 'TEAM CREDIT MANAGEMENT',
  summary: '在团队管理中提供积分配额管理和积分明细查询，支持共享池/配额模式、成员限额、临时加量、暂停与恢复消耗、重置和团队通用配额策略。',
  background: '积分管理面向团队创建者和管理员，统一管理团队积分的分配方式、成员月度消耗上限及充值/奖励、消耗明细；所有团队版会员可见，具体操作按角色权限控制。',
  goal: '按照原型还原积分分配与管理页面、配额管理和积分明细两个 Tab，并将编辑限额、成员临时加量、团队通用配额策略、暂停/恢复/重置确认和明细筛选等入口全部串联为可操作交互。',
  sections: [
    {
      title: '页面入口与权限',
      description: '积分管理与积分统计、使用统计保持同级，页面右上角提供独立需求说明入口。',
      items: [
        { label: '页面入口', content: '进入首页底部“管理”后，点击与“账户概览”“使用统计”“积分统计”同级的“积分管理”，页面标题显示“积分分配与管理”。', highlightTerms: ['积分管理', '积分分配与管理'] },
        { label: '团队权限', content: '团队创建者和管理员可见并可操作积分管理；普通团队成员不可见该页面。', highlightTerms: ['团队创建者', '管理员'] },
        { label: '会员限制', content: '所有团队版会员可见；非团队会员时显示“升级团队版会员，立即使用”入口和对应功能说明。', highlightTerms: ['所有团队版会员', '升级团队版会员，立即使用'] },
      ],
    },
    {
      title: '配额管理 Tab',
      description: '默认进入配额管理，展示分配模式和成员配额。',
      items: [
        { label: '分配模式', content: '提供“共享池模式”和“配额模式”两个单选项，默认选中共享池模式。共享池模式下，所有团队成员均消耗共享团队积分池；配额模式下，每个成员按照自己的月度最大消耗额度消耗。', highlightTerms: ['共享池模式', '配额模式', '默认选中共享池模式'] },
        { label: '模式切换', content: '两种方式在团队会员有效期内可以随意切换；团队会员过期后自动切换为共享池模式。切换分配模式时保留之前的配额设置。', highlightTerms: ['随意切换', '自动切换为共享池模式', '保留之前的配额设置'] },
        { label: '团队通用配额策略', content: '成员配额区域右侧提供“团队通用配额策略”入口，点击打开策略配置弹框。', highlightTerms: ['团队通用配额策略', '策略配置弹框'] },
      ],
    },
    {
      title: '成员配额',
      description: '按成员展示角色、当月消耗、当前限额、状态和操作。',
      items: [
        { label: '筛选与搜索', content: '支持按“全部角色”、创建者、管理员、设计师、成员筛选；支持输入成员名称/邮箱搜索。', highlightTerms: ['全部角色', '成员名称/邮箱搜索'] },
        { label: '列表字段', content: '展示名称、角色、本月消耗、当前限额、状态、操作；本月消耗使用进度条展示消耗值与当前限额的比例，hover 进度条显示百分比。', highlightTerms: ['名称', '角色', '本月消耗', '当前限额', '状态', '操作', 'hover'] },
        { label: '状态规则', content: '本月消耗比例小于 80% 时显示“正常”；大于 80% 且小于 100% 时显示“警告”；达到或超过 100% 时显示“已耗尽”；暂停成员后显示“已暂停”。无限限额只显示灰色进度条，不显示比例。', highlightTerms: ['正常', '警告', '已耗尽', '已暂停', '无限限额'] },
        { label: '操作入口', content: '每个成员支持“编辑”“暂停/恢复”“加量”“重置”。无限限额成员的“加量”置灰不可操作；暂停、恢复和重置均需二次确认。', highlightTerms: ['编辑', '暂停/恢复', '加量', '重置', '二次确认'] },
      ],
    },
    {
      title: '成员限额弹框',
      description: '编辑限额用于修改成员的分配模式和月度额度。',
      items: [
        { label: '编辑限额', content: '点击成员“编辑”打开“编辑限额”弹框，展示成员信息、成员角色和分配模式。', highlightTerms: ['编辑限额', '成员信息', '分配模式'] },
        { label: '跟随团队策略', content: '选择“跟随团队策略”时，成员使用团队通用配额策略中的角色配置；该成员将使用团队通用配额策略中的「成员」角色的配额策略。', highlightTerms: ['跟随团队策略', '团队通用配额策略'] },
        { label: '自定义独立额度', content: '选择“自定义独立额度”时，显示设置周期额度上限、积分/月、允许透支、透支比例和设为无上限选项；数值保存后仅作用于当前成员。', highlightTerms: ['自定义独立额度', '设置周期额度上限', '积分/月', '允许透支', '设为无上限'] },
        { label: '取消与保存', content: '点击“取消”或右上角关闭按钮不保存修改；点击“保存”校验配置后关闭弹框并更新成员列表。', highlightTerms: ['取消', '保存'] },
      ],
    },
    {
      title: '临时加量、暂停、恢复与重置',
      description: '所有会改变成员当前消耗状态的操作都必须给出明确确认和结果反馈。',
      items: [
        { label: '成员临时加量', content: '点击“加量”打开“成员临时加量”弹框，一次性增加积分上限，仅本月有效；可输入积分数或勾选“设为无上限”，保存后更新当前成员限额。', highlightTerms: ['成员临时加量', '一次性增加积分上限', '仅本月有效', '设为无上限'] },
        { label: '暂停成员消耗', content: '点击“暂停”弹出“暂停成员消耗”确认框，确认后该成员无法继续发起新的积分消耗任务，列表状态变为“已暂停”。', highlightTerms: ['暂停成员消耗', '无法继续发起新的积分消耗任务', '已暂停'] },
        { label: '恢复成员消耗', content: '已暂停成员点击“恢复”弹出“恢复成员消耗”确认框，确认后恢复成员积分消耗，列表状态回到正常规则。', highlightTerms: ['恢复成员消耗', '恢复成员积分消耗'] },
        { label: '重置成员消耗', content: '点击“重置”弹出“重置成员消耗”确认框，将当前周期已用额度重置为 0；保留真实消耗明细，仅重置当前周期展示值和可用额度。', highlightTerms: ['重置成员消耗', '重置为 0', '保留真实消耗明细'] },
        { label: '温馨提示', content: '当未启用角色配置或角色下未配置数值时，通用配额将不生效；保存前提示检查并核对后再保存。', highlightTerms: ['温馨提示', '不生效', '核对后再保存'] },
      ],
    },
    {
      title: '积分明细 Tab',
      description: '积分明细分为充值/奖励和消耗明细，按月查看团队积分账本。',
      items: [
        { label: '充值/奖励', content: '展示月度累计积分、月份和来源筛选；列表展示来源、时间、金额变化。充值或奖励金额使用正数，例如平台赠送 +1000。', highlightTerms: ['充值/奖励', '月度累计积分', '来源', '+1000'] },
        { label: '消耗明细', content: '展示月度消耗积分、月份、成员和功能筛选；列表展示时间、成员、功能、消耗积分。消耗金额使用负数，例如 -100。', highlightTerms: ['消耗明细', '月度消耗积分', '成员', '功能', '-100'] },
        { label: '筛选规则', content: '月份默认为 2026年1月，成员默认为所有成员，功能默认为所有功能；切换筛选条件后重新展示对应账本明细。', highlightTerms: ['2026年1月', '所有成员', '所有功能'] },
      ],
    },
    {
      title: '功能入口与可用积分',
      description: '功能入口根据分配模式显示团队或成员可用积分。',
      items: [
        { label: '共享池模式', content: '功能入口显示团队剩余积分，使用团队剩余积分。', highlightTerms: ['共享池模式', '团队剩余积分'] },
        { label: '配额模式', content: '功能入口显示当前成员实际可用剩余量；设置为无限时显示团队剩余积分，其他情况显示成员配额剩余量。文案统一显示为团队可用积分。', highlightTerms: ['配额模式', '实际可用剩余量', '无限', '团队可用积分'] },
      ],
    },
    {
      title: '需求说明与导出边界',
      description: '需求说明是功能外的产品文档，不与积分明细或其他功能数据混合。',
      items: [
        { label: '需求说明', content: '页面右上角悬浮“需求说明”按钮打开完整需求说明；文档同步记录页面入口、权限、成员配额、弹框、积分明细和功能入口规则。', highlightTerms: ['需求说明', '功能外的产品文档'] },
        { label: '导出边界', content: '积分管理页面当前按照原型展示明细筛选和列表，不将需求说明、重点说明或验证批注加入任何业务导出数据。', highlightTerms: ['不将需求说明', '业务导出数据'] },
      ],
    },
  ],
  acceptance: [
    '从管理 > 积分管理进入后，页面标题为“积分分配与管理”，并与账户概览、使用统计、积分统计保持同级。',
    '配额管理默认打开，显示共享池模式/配额模式、成员配额、筛选搜索、进度条、状态和操作列；积分明细 Tab 可切换充值/奖励与消耗明细。',
    '点击团队通用配额策略、编辑、加量、暂停/恢复、重置均打开对应弹框，取消、关闭、保存和二次确认行为可用。',
    '成员消耗比例按本月消耗/当前限额显示进度，正常、警告、已耗尽、已暂停状态颜色与原型一致，无限限额不显示百分比。',
    '积分明细按照月份、来源、成员和功能筛选，充值/奖励金额为正数，消耗明细金额为负数，列表字段与原型一致。',
    '需求说明入口为页面右上角悬浮按钮，文档覆盖所有模块和弹框规则，不进入积分明细或业务导出数据。',
  ],
};

type CreditTrendTab = '消耗积分' | '消耗成员' | '消耗功能';

const creditRecentConsumption = [
  { time: '5分钟前', member: '张三', detail: '使用 无限画布 生图', points: '5积分' },
  { time: '今天 14:10:56', member: '小强', detail: '使用 无限画布 生设计', points: '10积分' },
  { time: '今天 10:30:20', member: '李四', detail: '使用 无限画布 生视频', points: '100积分' },
  { time: '今天 10:30:20', member: '李四', detail: '使用 无限画布 生视频', points: '100积分' },
  { time: '昨天 20:18:10', member: '王五', detail: '使用 AI文案 生文本', points: '10积分' },
  { time: '昨天 20:18:10', member: '王五', detail: '使用 AI文案 生文本', points: '10积分' },
  { time: '昨天 20:18:10', member: '系统', detail: '到期自动失效', points: '1000积分' },
  { time: '昨天 05:18:54', member: '小熊熊', detail: '使用 AI文案 生文本', points: '10积分' },
];

const creditMemberStats: Record<string, { points: number; count: number }> = {
  张三: { points: 300, count: 30 },
  小强: { points: 10, count: 1 },
  李四: { points: 200, count: 2 },
  王五: { points: 20, count: 2 },
  系统: { points: 1000, count: 1 },
  小熊熊: { points: 10, count: 1 },
};

type CreditTrendMetricKey = 'total' | 'feature' | 'expiry' | 'memberCount' | 'memberPoints' | 'functionCount' | 'functionPoints';

const creditTrendBars = [
  { label: '1月28日', total: 2200, feature: 1120, expiry: 980, memberCount: 22, memberPoints: 1120, functionCount: 2, functionPoints: 1120 },
  { label: '1月29日', total: 3100, feature: 1640, expiry: 1420, memberCount: 31, memberPoints: 1640, functionCount: 3, functionPoints: 1640 },
  { label: '1月30日', total: 2750, feature: 1380, expiry: 1260, memberCount: 27, memberPoints: 1380, functionCount: 3, functionPoints: 1380 },
  { label: '1月31日', total: 3450, feature: 1780, expiry: 1600, memberCount: 35, memberPoints: 1780, functionCount: 4, functionPoints: 1780 },
  { label: '2月1日', total: 2800, feature: 1450, expiry: 1320, memberCount: 28, memberPoints: 1450, functionCount: 3, functionPoints: 1450 },
  { label: '2月2日', total: 3780, feature: 1900, expiry: 1800, memberCount: 39, memberPoints: 1900, functionCount: 5, functionPoints: 1900 },
  { label: '2月3日', total: 3040, feature: 1650, expiry: 1390, memberCount: 32, memberPoints: 1650, functionCount: 2, functionPoints: 1650 },
] satisfies Array<{ label: string } & Record<CreditTrendMetricKey, number>>;

const creditTrendPresentations: Record<CreditTrendTab, {
  axis: string[];
  max: number;
  barKey: CreditTrendMetricKey;
  lineKeys: [CreditTrendMetricKey, CreditTrendMetricKey];
  barClass: string;
  lineClasses: [string, string];
  legend: Array<{ label: string; className: string }>;
}> = {
  消耗积分: {
    axis: ['3800', '2850', '1900', '950', '0'], max: 3800, barKey: 'total', lineKeys: ['feature', 'expiry'], barClass: 'is-total', lineClasses: ['is-feature', 'is-expiry'],
    legend: [{ label: '总消耗', className: 'is-total' }, { label: '功能消耗', className: 'is-feature' }, { label: '到期失效', className: 'is-expiry' }],
  },
  消耗成员: {
    axis: ['40', '30', '20', '10', '0'], max: 40, barKey: 'memberCount', lineKeys: ['memberPoints', 'memberCount'], barClass: 'is-member', lineClasses: ['is-member', 'is-member-points'],
    legend: [{ label: '消耗成员', className: 'is-member' }, { label: '成员消耗积分', className: 'is-member-points' }],
  },
  消耗功能: {
    axis: ['5', '4', '3', '2', '0'], max: 5, barKey: 'functionCount', lineKeys: ['functionPoints', 'functionCount'], barClass: 'is-function', lineClasses: ['is-function', 'is-function-points'],
    legend: [{ label: '消耗功能', className: 'is-function' }, { label: '功能消耗积分', className: 'is-function-points' }],
  },
};

const creditMemberRanking = [
  { name: '张三', percent: '100%', points: 500 },
  { name: '李四', percent: '80%', points: 240 },
  { name: '王五', percent: '70%', points: 210 },
  { name: '小白', percent: '20%', points: 200 },
  { name: '小黑', percent: '80%', points: 160 },
  { name: '小米', percent: '50%', points: 150 },
  { name: '大米', percent: '50%', points: 150 },
  { name: '张朵朵', percent: '50%', points: 150 },
  { name: '李宝', percent: '50%', points: 150 },
  { name: '王小宝', percent: '33.33%', points: 10 },
];

const creditFeatureRanking = [
  { name: '无限画布', percent: '24%', points: 500 },
  { name: 'AI变清晰', percent: '14%', points: 300 },
  { name: 'AI绘本', percent: '14%', points: 300 },
  { name: '功能3', percent: '14%', points: 300 },
  { name: '功能4', percent: '14%', points: 300 },
  { name: '功能5', percent: '14%', points: 300 },
  { name: '功能5', percent: '14%', points: 300 },
  { name: '功能5', percent: '14%', points: 300 },
  { name: '功能5', percent: '14%', points: 300 },
  { name: '功能5', percent: '14%', points: 300 },
];

const creditTrendDetail = {
  '消耗积分': ['总消耗积分：3200，功能消耗xxx，到期失效yyy', '消耗最多的成员：张三，共消耗300积分，占当日比xx%', '消耗最多的功能：无限画布，共消耗1000积分，占当日比bb%'],
  '消耗成员': ['总消耗成员：32，共消耗积分1000', '消耗最多的成员：张三，共消耗300积分，占当日比xx%', '消耗最多的功能：无限画布，共消耗1000积分'],
  '消耗功能': ['总消耗功能：2，共消耗积分1000', '消耗最多的功能：无限画布，共消耗300积分，占当日比xx%', '消耗最多的成员：张三，共消耗1000积分'],
} satisfies Record<CreditTrendTab, string[]>;

export function TeamCreditStatisticsContent({ onNotify, onOpenRequirement, onOpenMembership, onOpenPointsPurchase, onOpenCreditManagementDetails, remainingPointsLabel = '剩余团队积分数' }: { onNotify: (message: string) => void; onOpenRequirement: () => void; onOpenMembership: (focusMorePoints: boolean) => void; onOpenPointsPurchase: () => void; onOpenCreditManagementDetails: () => void; remainingPointsLabel?: string }) {
  const [trendTab, setTrendTab] = useState<CreditTrendTab>('消耗积分');
  const [period, setPeriod] = useState('过去7天');
  const [granularity, setGranularity] = useState('按天');
  const [dateRange, setDateRange] = useState('2026-02-21~2026-02-27');
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(creditTrendBars.length - 1);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const trendPresentation = creditTrendPresentations[trendTab];
  const primaryPoints = creditTrendBars.map((item, index) => `${(index / (creditTrendBars.length - 1)) * 100},${100 - (item[trendPresentation.lineKeys[0]] / trendPresentation.max) * 78}`).join(' ');
  const secondaryPoints = creditTrendBars.map((item, index) => `${(index / (creditTrendBars.length - 1)) * 100},${100 - (item[trendPresentation.lineKeys[1]] / trendPresentation.max) * 78}`).join(' ');
  const selectedTrendDate = creditTrendBars[hoveredTrendIndex]?.label ?? '2月3日';
  const selectedMemberStats = selectedMember ? creditMemberStats[selectedMember] ?? { points: 0, count: 0 } : null;
  useEffect(() => {
    if (!selectedMember) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedMember]);
  const periodRanges: Record<string, string> = {
    '过去7天': '2026-02-21~2026-02-27',
    '过去30天': '2026-01-29~2026-02-27',
    '上周': '2026-02-14~2026-02-20',
    '上月': '2026-01-01~2026-01-31',
  };
  const selectPeriod = (nextPeriod: string) => {
    setPeriod(nextPeriod);
    setDateRange(periodRanges[nextPeriod] ?? nextPeriod);
  };
  const currentTeamLevel = 301;

  return (
    <div className="team-credit-statistics-page credit-overview-page">
      <button type="button" className="team-credit-requirement-float" onClick={onOpenRequirement}><FileText />需求说明</button>

      <div className="credit-overview-heading">
        <h1>积分概览</h1>
      </div>

      <div className="credit-overview-metrics">
        <section className="credit-overview-metric credit-overview-metric--remaining">
          <span>{remainingPointsLabel}</span>
          <strong>89373737</strong>
          <div className={`credit-overview-metric-actions ${currentTeamLevel >= 302 ? 'is-upgrade-hidden' : ''}`}>{currentTeamLevel < 302 ? <button type="button" onClick={() => onOpenMembership(false)}>升级会员领更多积分</button> : null}<button type="button" className={currentTeamLevel >= 302 ? 'is-large' : ''} onClick={onOpenPointsPurchase}>增购</button></div>
        </section>
        <section className="credit-overview-metric">
          <span>本月已消耗</span>
          <strong>7723</strong>
          <button type="button" className="credit-overview-change">较上月 <b>+12%</b><span>本月消耗 7723 较上月消耗 6868 增长 12.46%</span></button>
        </section>
        <section className="credit-overview-metric">
          <span>今日已消耗</span>
          <strong>773</strong>
          <button type="button" className="credit-overview-change">较昨日 <b>+12%</b><span>今日消耗 773 较昨日消耗 688 增长 12.35%</span></button>
        </section>
      </div>

      <div className="credit-overview-main-grid">
        <section className="credit-overview-recent">
          <div className="credit-overview-section-heading"><h2>最新消耗</h2><button type="button" onClick={onOpenCreditManagementDetails}>查看全部</button></div>
          <div className="credit-overview-recent-list">
            {creditRecentConsumption.map((record, index) => <div className="credit-overview-recent-row" key={`${record.time}-${record.member}-${index}`}><span>{record.time}</span><button type="button" className={`credit-overview-member-trigger ${selectedMember === record.member ? 'is-selected' : ''}`} onClick={() => setSelectedMember(record.member)}>{record.member}</button><p>{record.detail} <em>消耗 {record.points}</em></p></div>)}
          </div>
        </section>
      </div>

      {selectedMember && selectedMemberStats ? <div className="credit-overview-member-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMember(null); }}>
        <aside className="credit-overview-member-card" role="dialog" aria-modal="true" aria-label={`${selectedMember}成员消耗`} onMouseDown={(event) => event.stopPropagation()}>
          <div className="credit-overview-member-card-heading"><h2>成员消耗</h2><button type="button" onClick={() => setSelectedMember(null)} aria-label="关闭成员消耗">×</button></div>
          <div className="credit-overview-member-label"><strong>{selectedMember}</strong><span>成员</span></div><p>最近24小时</p><dl><div><dt>消耗总积分</dt><dd>{selectedMemberStats.points}</dd></div><div><dt>消耗总次数</dt><dd>{selectedMemberStats.count}</dd></div></dl><button type="button" className="credit-overview-member-link" onClick={() => onNotify(`已打开${selectedMember}的消耗明细`)}>查看消耗明细</button><button type="button" className="credit-overview-member-close" onClick={() => setSelectedMember(null)}>我知道了</button>
        </aside>
      </div> : null}

      <section className="credit-overview-trend-section">
        <div className="credit-overview-trend-heading"><h2>消耗趋势</h2><div className="credit-overview-periods">{['过去7天', '过去30天', '上周', '上月'].map((item) => <button type="button" key={item} className={period === item ? 'is-active' : ''} onClick={() => selectPeriod(item)}>{item}</button>)}<select aria-label="日期范围" value={dateRange} onChange={(event) => { setDateRange(event.currentTarget.value); setPeriod('自定义'); }}><option>2026-02-21~2026-02-27</option><option>2026-01-29~2026-02-27</option><option>2026-02-14~2026-02-20</option><option>2026-01-01~2026-01-31</option></select><select aria-label="统计粒度" value={granularity} onChange={(event) => setGranularity(event.currentTarget.value)}><option>按天</option><option>按周</option><option>按月</option></select></div></div>
        <div className="credit-overview-trend-toolbar"><div className="credit-overview-trend-tabs">{(['消耗积分', '消耗成员', '消耗功能'] as const).map((item) => <button type="button" key={item} className={trendTab === item ? 'is-active' : ''} onClick={() => setTrendTab(item)}>{item}</button>)}</div><button type="button" className="credit-overview-export" onClick={() => onNotify('当前趋势数据已准备导出')}>导出</button></div>
        <div className="credit-overview-chart" aria-label={`${trendTab}趋势图`}>
          <div className="credit-overview-chart-axis">{trendPresentation.axis.map((value) => <span key={value}>{value}</span>)}</div>
          <div className="credit-overview-chart-body">
            <div className="credit-overview-chart-grid"><i /><i /><i /><i /><i /></div>
            <div className="credit-overview-chart-bars">{creditTrendBars.map((item, index) => <div className="credit-overview-chart-column" key={item.label} onMouseEnter={() => setHoveredTrendIndex(index)}><div className={`credit-overview-chart-bar ${trendPresentation.barClass}`} style={{ height: `${item[trendPresentation.barKey] / trendPresentation.max * 100}%` }} title={`${item.label} ${item[trendPresentation.barKey]}`} /><span>{item.label}</span></div>)}</div>
            <svg className="credit-overview-chart-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline className={trendPresentation.lineClasses[0]} points={primaryPoints} /><polyline className={trendPresentation.lineClasses[1]} points={secondaryPoints} /></svg>
          </div>
        </div>
        <div className="credit-overview-chart-legend">{trendPresentation.legend.map((item) => <span key={item.label}><i className={item.className} />{item.label}</span>)}</div>
        <div className="credit-overview-trend-detail"><strong>2026年{selectedTrendDate.replace('月', '月').replace('日', '日')}消耗</strong>{creditTrendDetail[trendTab].map((line) => <p key={line}>{line}</p>)}</div>
      </section>

      <section className="credit-overview-ranking-section">
        <div className="credit-overview-ranking-heading"><h2>消耗榜单</h2><button type="button" onClick={() => onNotify('当前榜单数据已准备导出')}>导出</button></div>
        <div className="credit-overview-ranking-grid">
          <section className="credit-overview-ranking-card"><h3>成员榜单</h3><div className="credit-overview-ranking-list">{creditMemberRanking.map((item, index) => <div className="credit-overview-ranking-row" key={`${item.name}-${index}`}><b>{index + 1}</b><span>{item.name}</span><div className="credit-overview-ranking-track"><i style={{ width: `${Math.max(10, Number.parseFloat(item.percent))}%` }} /></div><em>{item.percent}</em><strong>{item.points}</strong></div>)}</div></section>
          <section className="credit-overview-ranking-card"><h3>功能榜单</h3><div className="credit-overview-ranking-list">{creditFeatureRanking.map((item, index) => <div className="credit-overview-ranking-row" key={`${item.name}-${index}`}><b>{index + 1}</b><span>{item.name}</span><div className="credit-overview-ranking-track"><i style={{ width: `${Math.max(10, Number.parseFloat(item.percent))}%` }} /></div><em>占比{item.percent}</em><strong>{item.points}</strong></div>)}</div></section>
        </div>
      </section>
    </div>
  );
}

export type CreditManagementLanding = 'quota' | 'reward' | 'consumption';
type CreditManagementTab = 'quota' | 'details';
type CreditDetailTab = 'reward' | 'consumption';
type CreditMemberStatus = 'normal' | 'warning' | 'exhausted' | 'paused';

type CreditQuotaMember = {
  id: string;
  name: string;
  role: string;
  consumed: number;
  limit: number | null;
  status: CreditMemberStatus;
  allocationMode: 'team' | 'custom';
  overdraft: boolean;
};

const CREDIT_MEMBER_STATUS_LABEL: Record<CreditMemberStatus, string> = {
  normal: '正常',
  warning: '警告',
  exhausted: '已耗尽',
  paused: '已暂停',
};

const initialCreditQuotaMembers: CreditQuotaMember[] = [
  { id: 'zhang-meili', name: '张美丽', role: '创建者', consumed: 2500, limit: 3000, status: 'normal', allocationMode: 'team', overdraft: false },
  { id: 'wang-xiaosi', name: '王小四', role: '管理员', consumed: 3000, limit: 3000, status: 'exhausted', allocationMode: 'team', overdraft: false },
  { id: 'li-xiaobao-designer', name: '李小宝', role: '设计师', consumed: 2500, limit: 2800, status: 'warning', allocationMode: 'custom', overdraft: false },
  { id: 'li-xiaobao-member', name: '李小宝', role: '成员', consumed: 2500, limit: null, status: 'normal', allocationMode: 'team', overdraft: false },
];

const creditRewardDetails = [
  { source: '平台赠送', time: '2026-1-10 13:18:09', amount: '+1000' },
  { source: '平台赠送', time: '2026-1-11 13:18:09', amount: '+1000' },
  { source: '活动奖励', time: '2026-1-15 09:20:11', amount: '+500' },
  { source: '平台赠送', time: '2026-1-20 18:08:33', amount: '+5892' },
];

const creditConsumptionDetails = [
  { time: '2026年1月2日13:18:09', member: '赵文文', feature: 'AI创作', points: '-100' },
  { time: '2026年1月2日13:18:09', member: '赵文文', feature: '无限画布', points: '-100' },
  { time: '2026年1月2日13:18:09', member: '赵文文', feature: 'AI变清晰', points: '-100' },
  { time: '2026年1月2日13:18:09', member: '赵文文', feature: 'AI生图', points: '-100' },
];

function CreditManagementModalFrame({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="credit-management-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
    <section className={`credit-management-modal ${wide ? 'is-wide' : ''}`}>
      <header className="credit-management-modal-header"><h2>{title}</h2><button type="button" aria-label={`关闭${title}`} onClick={onClose}>×</button></header>
      {children}
    </section>
  </div>;
}

function CreditManagementMemberInfo({ member }: { member: CreditQuotaMember }) {
  return <div className="credit-management-member-info"><span>{member.name.slice(0, 1)}</span><div><strong>{member.name}</strong><small>{member.role}</small></div></div>;
}

function CreditManagementEditModal({ member, onClose, onSave }: { member: CreditQuotaMember; onClose: () => void; onSave: (data: { mode: 'team' | 'custom'; limit: number | null; overdraft: boolean }) => void }) {
  const [mode, setMode] = useState<'team' | 'custom'>(member.allocationMode);
  const [limit, setLimit] = useState(member.limit == null ? '' : String(member.limit));
  const [unlimited, setUnlimited] = useState(member.limit == null);
  const [overdraft, setOverdraft] = useState(member.overdraft);

  return <CreditManagementModalFrame title="编辑限额" onClose={onClose}>
    <div className="credit-management-modal-body">
      <h3>成员信息</h3>
      <CreditManagementMemberInfo member={member} />
      <h3 className="credit-management-form-heading">分配模式</h3>
      <div className="credit-management-radio-row"><label><input type="radio" checked={mode === 'team'} onChange={() => setMode('team')} />跟随团队策略</label><label><input type="radio" checked={mode === 'custom'} onChange={() => setMode('custom')} />自定义独立额度</label></div>
      {mode === 'team' ? <p className="credit-management-helper">该成员将使用团队通用配额策略中“成员”角色的配额策略</p> : <div className="credit-management-custom-form">
        <label>设置周期额度上限</label><div className="credit-management-input-with-unit"><input value={limit} disabled={unlimited} onChange={(event) => setLimit(event.currentTarget.value.replace(/\D/g, ''))} /><span>积分/月</span></div>
        <label className="credit-management-checkbox"><input type="checkbox" checked={unlimited} onChange={(event) => setUnlimited(event.currentTarget.checked)} />设为无上限</label>
        <label className="credit-management-checkbox"><input type="checkbox" checked={overdraft} onChange={(event) => setOverdraft(event.currentTarget.checked)} />允许透支</label>
        {overdraft ? <div className="credit-management-input-with-unit"><input defaultValue="10" /><span>%</span></div> : null}
      </div>}
    </div>
    <footer className="credit-management-modal-actions"><button type="button" className="is-secondary" onClick={onClose}>取消</button><button type="button" onClick={() => onSave({ mode, limit: unlimited ? null : Math.max(0, Number(limit) || 0), overdraft })}>保存</button></footer>
  </CreditManagementModalFrame>;
}

function CreditManagementTemporaryModal({ member, onClose, onSave }: { member: CreditQuotaMember; onClose: () => void; onSave: (amount: number | null) => void }) {
  const [amount, setAmount] = useState('');
  const [unlimited, setUnlimited] = useState(false);
  return <CreditManagementModalFrame title="成员临时加量" onClose={onClose}>
    <div className="credit-management-modal-body"><h3>成员信息</h3><CreditManagementMemberInfo member={member} /><h3 className="credit-management-form-heading">临时加量</h3><p className="credit-management-helper">一次性增加积分上限，仅本月有效</p><div className="credit-management-input-with-unit"><input value={amount} disabled={unlimited} onChange={(event) => setAmount(event.currentTarget.value.replace(/\D/g, ''))} /><span>积分</span></div><label className="credit-management-checkbox"><input type="checkbox" checked={unlimited} onChange={(event) => setUnlimited(event.currentTarget.checked)} />设为无上限</label></div>
    <footer className="credit-management-modal-actions"><button type="button" className="is-secondary" onClick={onClose}>取消</button><button type="button" onClick={() => onSave(unlimited ? null : Math.max(0, Number(amount) || 0))}>保存</button></footer>
  </CreditManagementModalFrame>;
}

function CreditManagementStrategyModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [enabledRoles, setEnabledRoles] = useState<Record<string, boolean>>({ 创建者: true, 管理员: true, 设计师: false, 成员: false });
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({ 创建者: true, 管理员: true, 设计师: false, 成员: false });
  const [showWarning, setShowWarning] = useState(false);
  const roleNames = ['创建者', '管理员', '设计师', '成员'];
  const toggleRole = (role: string) => setEnabledRoles((current) => ({ ...current, [role]: !current[role] }));
  return <CreditManagementModalFrame title="团队通用配额策略" onClose={onClose} wide>
    <div className="credit-management-strategy-tabs"><button type="button" className="is-active">成员分配策略</button></div>
    <div className="credit-management-strategy-body">
      {roleNames.map((role) => <div className="credit-management-role-config" key={role}>
        <div className="credit-management-role-heading"><label><input type="checkbox" checked={enabledRoles[role]} onChange={() => toggleRole(role)} />{role}</label><button type="button" onClick={() => setExpandedRoles((current) => ({ ...current, [role]: !current[role] }))}>{expandedRoles[role] ? '⌃' : '⌄'}</button></div>
        {expandedRoles[role] ? <div className="credit-management-role-form"><label>设置周期额度上限</label><div className="credit-management-input-with-unit"><input defaultValue={role === '创建者' ? '' : role === '管理员' ? '' : ''} disabled={!enabledRoles[role]} /><span>积分/月</span></div><label className="credit-management-checkbox"><input type="checkbox" disabled={!enabledRoles[role]} />允许透支 <span>允许该角色透支团队公共积分池，最多透支</span><input className="credit-management-percent-input" defaultValue="10" disabled={!enabledRoles[role]} />%</label><label className="credit-management-checkbox"><input type="checkbox" disabled={!enabledRoles[role]} />设为无上限</label></div> : null}
      </div>)}
      <p className="credit-management-helper">新成员加入后将默认使用对应角色的配置</p>
    </div>
    {showWarning ? <div className="credit-management-inline-warning"><h3>温馨提示</h3><p>未启用角色配置 或 角色下配置为空时，通用配额将不生效，请检查并核对后再保存</p><div><button type="button" className="is-secondary" onClick={onClose}>暂不设置</button><button type="button" onClick={() => setShowWarning(false)}>返回设置团队通用配额</button></div></div> : <footer className="credit-management-modal-actions"><button type="button" className="is-secondary" onClick={onClose}>取消</button><button type="button" onClick={() => { if (Object.values(enabledRoles).every((enabled) => !enabled)) setShowWarning(true); else onSave(); }}>保存</button></footer>}
  </CreditManagementModalFrame>;
}

function CreditManagementConfirmModal({ title, description, confirmLabel, onClose, onConfirm }: { title: string; description: React.ReactNode; confirmLabel: string; onClose: () => void; onConfirm: () => void }) {
  return <CreditManagementModalFrame title={title} onClose={onClose}><div className="credit-management-confirm-body"><p>{description}</p></div><footer className="credit-management-modal-actions"><button type="button" className="is-secondary" onClick={onClose}>取消</button><button type="button" onClick={onConfirm}>{confirmLabel}</button></footer></CreditManagementModalFrame>;
}

export function TeamCreditManagementContent({ landing, onNotify, onOpenRequirement }: { landing: CreditManagementLanding; onNotify: (message: string) => void; onOpenRequirement: () => void }) {
  const initialTab: CreditManagementTab = landing === 'quota' ? 'quota' : 'details';
  const initialDetailTab: CreditDetailTab = landing === 'consumption' ? 'consumption' : 'reward';
  const [activeTab, setActiveTab] = useState<CreditManagementTab>(initialTab);
  const [detailTab, setDetailTab] = useState<CreditDetailTab>(initialDetailTab);
  const [allocationMode, setAllocationMode] = useState<'shared' | 'quota'>('shared');
  const [roleFilter, setRoleFilter] = useState('全部角色');
  const [memberSearch, setMemberSearch] = useState('');
  const [month, setMonth] = useState('2026年1月');
  const [sourceFilter, setSourceFilter] = useState('选择来源');
  const [memberFilter, setMemberFilter] = useState('所有成员');
  const [featureFilter, setFeatureFilter] = useState('所有功能');
  const [members, setMembers] = useState(initialCreditQuotaMembers);
  const [modal, setModal] = useState<{ type: 'edit' | 'temporary' | 'strategy' | 'pause' | 'resume' | 'reset'; member?: CreditQuotaMember } | null>(null);

  const filteredMembers = members.filter((member) => (roleFilter === '全部角色' || member.role === roleFilter) && (!memberSearch.trim() || member.name.includes(memberSearch.trim())));
  const getStatus = (consumed: number, limit: number | null): CreditMemberStatus => {
    if (limit == null) return 'normal';
    const ratio = consumed / Math.max(limit, 1);
    if (ratio >= 1) return 'exhausted';
    if (ratio >= .8) return 'warning';
    return 'normal';
  };
  const updateMember = (id: string, update: Partial<CreditQuotaMember>) => setMembers((current) => current.map((member) => member.id === id ? { ...member, ...update } : member));
  const closeModal = () => setModal(null);
  const currentMember = modal?.member;

  const renderQuotaManagement = () => <>
    <section className="credit-management-allocation-panel"><h2>分配模式</h2><div className="credit-management-radio-row"><label><input type="radio" checked={allocationMode === 'shared'} onChange={() => setAllocationMode('shared')} />共享池模式</label><label><input type="radio" checked={allocationMode === 'quota'} onChange={() => setAllocationMode('quota')} />配额模式</label></div><p>当前团队已选择使用<strong>{allocationMode === 'shared' ? '共享池模式' : '配额模式'}</strong>，{allocationMode === 'shared' ? '所有团队成员均将消耗共享团队积分池' : '每个成员按照自己的月度最大消耗额度进行消耗'}</p></section>
    <section className="credit-management-members-panel"><div className="credit-management-section-heading"><h2>成员配额</h2><button type="button" onClick={() => setModal({ type: 'strategy' })}>团队通用配额策略</button></div><div className="credit-management-filters"><select value={roleFilter} onChange={(event) => setRoleFilter(event.currentTarget.value)} aria-label="角色筛选"><option>全部角色</option><option>创建者</option><option>管理员</option><option>设计师</option><option>成员</option></select><input value={memberSearch} onChange={(event) => setMemberSearch(event.currentTarget.value)} placeholder="输入成员名称/邮箱搜索" aria-label="成员名称或邮箱搜索" /></div><div className="credit-management-table" role="table" aria-label="成员配额列表"><div className="credit-management-table-row is-header" role="row"><span>名称</span><span>角色</span><span>本月消耗</span><span>当前限额</span><span>状态</span><span>操作</span></div>{filteredMembers.map((member) => { const percent = member.limit == null ? 0 : Math.min(100, Math.round(member.consumed / Math.max(member.limit, 1) * 100)); const canAdd = member.limit != null; return <div className="credit-management-table-row" role="row" key={member.id}><span className="credit-management-name-cell"><i>{member.name.slice(0, 1)}</i>{member.name}</span><span>{member.role}</span><span><div className={`credit-management-progress ${member.status}`}><i style={{ width: `${member.limit == null ? 100 : percent}%` }} /><b>{member.limit != null ? `${percent}%` : ''}</b></div><em>{member.consumed}</em></span><span>{member.limit == null ? '无限' : <><strong>{member.limit}</strong><button type="button" className="credit-management-pencil" aria-label={`编辑${member.name}限额`} onClick={() => setModal({ type: 'edit', member })}>✎</button></>}</span><span><b className={`credit-management-status is-${member.status}`}>{CREDIT_MEMBER_STATUS_LABEL[member.status]}</b></span><span className="credit-management-actions"><button type="button" onClick={() => setModal({ type: 'edit', member })}>编辑</button><button type="button" onClick={() => setModal({ type: member.status === 'paused' ? 'resume' : 'pause', member })}>{member.status === 'paused' ? '恢复' : '暂停'}</button><button type="button" disabled={!canAdd} onClick={() => setModal({ type: 'temporary', member })}>加量</button><button type="button" onClick={() => setModal({ type: 'reset', member })}>重置</button></span></div>; })}</div></section>
  </>;

  const renderDetails = () => detailTab === 'reward' ? <section className="credit-management-details-panel"><div className="credit-management-detail-tabs"><button type="button" className="is-active" onClick={() => setDetailTab('reward')}>充值/奖励</button><button type="button" onClick={() => setDetailTab('consumption')}>消耗明细</button></div><div className="credit-management-detail-summary"><strong>月度累计 8392积分</strong><div><select value={month} onChange={(event) => setMonth(event.currentTarget.value)} aria-label="明细月份"><option>2026年1月</option><option>2025年12月</option></select><select value={sourceFilter} onChange={(event) => setSourceFilter(event.currentTarget.value)} aria-label="积分来源"><option>选择来源</option><option>平台赠送</option><option>活动奖励</option></select></div></div><div className="credit-management-detail-table"><div className="is-header"><span>来源</span><span>时间</span><span>金额变化</span></div>{creditRewardDetails.map((row) => <div key={`${row.source}-${row.time}`}><span>{row.source}</span><span>{row.time}</span><strong className="is-positive">{row.amount}</strong></div>)}</div></section> : <section className="credit-management-details-panel"><div className="credit-management-detail-tabs"><button type="button" onClick={() => setDetailTab('reward')}>充值/奖励</button><button type="button" className="is-active" onClick={() => setDetailTab('consumption')}>消耗明细</button></div><div className="credit-management-detail-summary"><strong>月度消耗 8392积分</strong><div><select value={month} onChange={(event) => setMonth(event.currentTarget.value)} aria-label="消耗月份"><option>2026年1月</option><option>2025年12月</option></select><select value={memberFilter} onChange={(event) => setMemberFilter(event.currentTarget.value)} aria-label="成员筛选"><option>所有成员</option><option>赵文文</option><option>张美丽</option></select><select value={featureFilter} onChange={(event) => setFeatureFilter(event.currentTarget.value)} aria-label="功能筛选"><option>所有功能</option><option>AI创作</option><option>无限画布</option><option>AI变清晰</option><option>AI生图</option></select></div></div><div className="credit-management-detail-table is-consumption"><div className="is-header"><span>时间</span><span>成员</span><span>功能</span><span>消耗积分</span></div>{creditConsumptionDetails.filter((row) => (memberFilter === '所有成员' || row.member === memberFilter) && (featureFilter === '所有功能' || row.feature === featureFilter)).map((row) => <div key={`${row.time}-${row.feature}`}><span>{row.time}</span><span>{row.member}</span><span>{row.feature}</span><strong className="is-negative">{row.points}</strong></div>)}</div></section>;

  const handleEditSave = (data: { mode: 'team' | 'custom'; limit: number | null; overdraft: boolean }) => {
    if (!currentMember) return;
    updateMember(currentMember.id, { allocationMode: data.mode, limit: data.limit, overdraft: data.overdraft, status: getStatus(currentMember.consumed, data.limit) });
    onNotify(`已保存${currentMember.name}的限额`);
    closeModal();
  };
  const handleTemporarySave = (amount: number | null) => {
    if (!currentMember) return;
    const nextLimit = amount == null ? null : (currentMember.limit == null ? amount : currentMember.limit + amount);
    updateMember(currentMember.id, { limit: nextLimit, status: getStatus(currentMember.consumed, nextLimit) });
    onNotify(`已保存${currentMember.name}的临时加量`);
    closeModal();
  };
  const handleConfirm = () => {
    if (!currentMember || !modal) return;
    if (modal.type === 'pause') updateMember(currentMember.id, { status: 'paused' });
    if (modal.type === 'resume') updateMember(currentMember.id, { status: getStatus(currentMember.consumed, currentMember.limit) });
    if (modal.type === 'reset') updateMember(currentMember.id, { consumed: 0, status: 'normal' });
    onNotify(`${currentMember.name}${modal.type === 'pause' ? '已暂停消耗' : modal.type === 'resume' ? '已恢复消耗' : '已重置消耗'}`);
    closeModal();
  };

  return <div className="team-credit-management-page">
    <button type="button" className="team-credit-requirement-float" onClick={onOpenRequirement}><FileText />需求说明</button>
    <div className="credit-management-heading"><h1>积分分配与管理</h1></div>
    <div className="credit-management-tabs"><button type="button" className={activeTab === 'quota' ? 'is-active' : ''} onClick={() => setActiveTab('quota')}>配额管理</button><button type="button" className={activeTab === 'details' ? 'is-active' : ''} onClick={() => setActiveTab('details')}>积分明细</button></div>
    {activeTab === 'quota' ? renderQuotaManagement() : renderDetails()}
    {modal?.type === 'edit' && currentMember ? <CreditManagementEditModal member={currentMember} onClose={closeModal} onSave={handleEditSave} /> : null}
    {modal?.type === 'temporary' && currentMember ? <CreditManagementTemporaryModal member={currentMember} onClose={closeModal} onSave={handleTemporarySave} /> : null}
    {modal?.type === 'strategy' ? <CreditManagementStrategyModal onClose={closeModal} onSave={() => { onNotify('团队通用配额策略已保存'); closeModal(); }} /> : null}
    {modal?.type === 'pause' && currentMember ? <CreditManagementConfirmModal title="暂停成员消耗" description={<>即将暂停成员「{currentMember.name}」的积分消耗，暂停后其正在运行的积分消耗任务将中断，无法再发起新的积分消耗行为。</>} confirmLabel="确定暂停" onClose={closeModal} onConfirm={handleConfirm} /> : null}
    {modal?.type === 'resume' && currentMember ? <CreditManagementConfirmModal title="恢复成员消耗" description={<>即将恢复成员「{currentMember.name}」的积分消耗，恢复后其因暂停中断的积分消耗任务无法自动恢复，需成员手动恢复。</>} confirmLabel="确定恢复" onClose={closeModal} onConfirm={handleConfirm} /> : null}
    {modal?.type === 'reset' && currentMember ? <CreditManagementConfirmModal title="重置成员消耗" description={<>即将将成员「{currentMember.name}」的本月积分消耗量重置为 0，重置成功后仅本月计算可用积分时使用的已消耗量归零，真实消耗明细仍保留。</>} confirmLabel="确定重置" onClose={closeModal} onConfirm={handleConfirm} /> : null}
  </div>;
}

function TeamManagementPage({ onOpenMembership, onOpenPointsPurchase }: { onOpenMembership: (focusMorePoints: boolean) => void; onOpenPointsPurchase: () => void }) {
  const [activeSection, setActiveSection] = useState('账户概览');
  const [toast, setToast] = useState('');
  const [requirementOpen, setRequirementOpen] = useState<'statistics' | 'management' | null>(null);
  const [creditManagementLanding, setCreditManagementLanding] = useState<CreditManagementLanding>('quota');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1600);
  };

  return (
    <section className="team-management-page" aria-label="团队管理">
      <aside className="team-management-sidebar">
        {teamManagementNavGroups.map((group) => (
          <React.Fragment key={group.label || 'overview'}>
            {group.label ? <div className="team-management-group-label">{group.label}</div> : null}
            <div className="team-management-group-items">
              {group.items.map(({ label, icon: Icon }) => (
                <button type="button" key={label} className={`team-management-nav-item ${activeSection === label ? 'is-active' : ''}`} onClick={() => { setActiveSection(label); if (label === '积分管理') setCreditManagementLanding('quota'); if (label !== '账户概览' && label !== '积分统计' && label !== '积分管理') notify(`${label}即将上线`); }}>
                  <Icon className="team-management-nav-icon" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </React.Fragment>
        ))}
      </aside>

      <div className="team-management-content">
        {activeSection === '积分统计' ? <TeamCreditStatisticsContent onNotify={notify} onOpenRequirement={() => setRequirementOpen('statistics')} onOpenMembership={onOpenMembership} onOpenPointsPurchase={onOpenPointsPurchase} onOpenCreditManagementDetails={() => { setCreditManagementLanding('consumption'); setActiveSection('积分管理'); }} /> : activeSection === '积分管理' ? <TeamCreditManagementContent landing={creditManagementLanding} onNotify={notify} onOpenRequirement={() => setRequirementOpen('management')} /> : activeSection === '使用统计' ? <div className="team-management-placeholder"><BarChart3 /><h1>使用统计</h1><p>使用统计功能即将上线</p></div> : <div className="team-management-grid">
          <main className="team-management-main">
            <h1>账户概览</h1>

            <section className="team-management-section team-management-account-section">
              <h2>账户信息</h2>
              <div className="team-management-account-row">
                <TeamManagementBrandMark />
                <div className="team-management-account-details">
                  <div><span>团队名称：</span><strong>北京艺源酷</strong></div>
                  <div><span>团队ID：</span><strong>12733833</strong></div>
                  <div><span>版本：</span><strong>旗舰版</strong><em>（有效期至2026-12-31）</em></div>
                </div>
                <button type="button" className="team-management-renew-button" onClick={() => notify('续费入口即将打开')}>立即续费</button>
              </div>
            </section>

            <section className="team-management-section team-management-members-section">
              <h2>团队成员</h2>
              <div className="team-management-metric-row">
                <div className="team-management-progress-wrap"><div className="team-management-progress"><span style={{ width: '62.33%' }} /></div><span>187/300</span></div>
                <TeamManagementMemberAvatars />
                <button type="button" className="team-management-secondary-button" onClick={() => { setActiveSection('成员管理'); notify('成员管理即将打开'); }}>成员管理</button>
              </div>
            </section>

            <section className="team-management-section">
              <h2>储存空间</h2>
              <div className="team-management-metric-row">
                <div className="team-management-progress-wrap"><div className="team-management-progress team-management-progress--storage"><span style={{ width: '37.17%' }} /></div><span>4.46TB/12TB</span><button type="button" className="team-management-inline-link" onClick={() => notify('扩展储存空间即将打开')}>扩展&gt;</button></div>
                <button type="button" className="team-management-secondary-button" onClick={() => notify('储存空间明细即将打开')}>查看明细</button>
              </div>
            </section>

            <section className="team-management-section team-management-points-section">
              <h2>团队积分 <CircleHelp className="team-management-help-icon" /></h2>
              <div className="team-management-metric-row">
                <div className="team-management-points-value"><span>当前剩余：369320</span><button type="button" className="team-management-inline-link" onClick={onOpenPointsPurchase}>购买积分&gt;</button></div>
                <button type="button" className="team-management-secondary-button" onClick={() => { setCreditManagementLanding('consumption'); setActiveSection('积分管理'); }}>查看明细</button>
              </div>
            </section>
          </main>

          <aside className="team-management-quick-panel">
            <h2>快捷入口</h2>
            <button type="button" className="team-management-quick-card" onClick={() => notify('邀请成员即将打开')}><UserRound /><span><strong>邀请成员</strong><small>邀请成员加入团队/企业</small></span></button>
            <button type="button" className="team-management-quick-card" onClick={() => notify('品牌设置即将打开')}><Settings2 /><span><strong>品牌设置</strong><small>设置品牌色、品牌字体、品牌logo，保证品牌<br className="team-management-quick-break" />一致性</small></span></button>
            <button type="button" className="team-management-quick-card" onClick={() => notify('快捷开票即将打开')}><FileImage /><span><strong>快捷开票</strong><small>开票入口进度查询</small></span></button>
            <button type="button" className="team-management-quick-card" onClick={() => notify('常见问题即将打开')}><CircleHelp /><span><strong>常见问题</strong><small>获取常见问题和使用指南</small></span></button>
          </aside>
        </div>}
      </div>
      {toast ? <div className="workspace-toast" role="status">{toast}</div> : null}
      {requirementOpen ? <RequirementDocumentDrawer spec={requirementOpen === 'management' ? TEAM_CREDIT_MANAGEMENT_REQUIREMENT : TEAM_CREDIT_STATISTICS_REQUIREMENT} onClose={() => setRequirementOpen(null)} /> : null}
    </section>
  );
}

function TeamWorkspacePage() {
  const [activeIndustry, setActiveIndustry] = useState('全部');
  const [searchValue, setSearchValue] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const visibleResources = teamResources.filter((resource) => !searchValue.trim() || resource.title.toLowerCase().includes(searchValue.trim().toLowerCase()));

  return (
    <section className="team-page" aria-label="团队空间">
      <aside className="team-sidebar">
        <div className="team-sidebar-label">团队资产</div>
        <button type="button" className="team-sidebar-link" onClick={() => notify('我的空间已打开')}><UserRound size={17} />我的空间</button>
        <button type="button" className="team-sidebar-link is-active" onClick={() => notify('当前为团队空间')}><CircleHelp size={17} />团队空间<ChevronDown size={14} /></button>
        <div className="team-sidebar-tree">
          <button type="button" className="team-sidebar-tree-item is-selected" onClick={() => notify('已切换到北京艺源酷科技有限公司')}><span>北京艺源酷科技有...</span></button>
          {['产研中心', '品牌市场部', '创意服务中心｜案...', '🌞参考模板库🌞', '🌞字体资源汇总🌞', '印刷制作商品展示库', 'AIGC关键词（注...', '测试', '小组1', '验证团队模板', '测试资源库2', 'AI电商测试物料', '新建资源库'].map((item) => <button type="button" className="team-sidebar-tree-item" key={item} onClick={() => notify(`打开资源库：${item}`)}><span>{item}</span></button>)}
        </div>
        <div className="team-sidebar-group-title">合规检测</div>
        {['文案合规', '入库审批', '下载审批'].map((item) => <button type="button" className="team-sidebar-service" key={item} onClick={() => notify(`${item}即将上线`)}><CheckSquare size={17} />{item}</button>)}
        <div className="team-sidebar-group-title">更多服务</div>
        <button type="button" className="team-sidebar-service" onClick={() => notify('企业定制服务即将上线')}><BriefcaseBusiness size={17} />企业定制服务</button>
        <div className="team-storage"><span><i /></span><div><b>4.46TB/12TB</b><small>已使用空间</small></div><button type="button" onClick={() => notify('扩充容量即将上线')}>扩充容量</button></div>
      </aside>

      <div className="team-content">
        <div className="team-content-topbar">
          <h1>北京艺源酷科技有限公司</h1>
          <div className="team-content-actions">
            <label className="workspace-search team-search"><Search size={18} /><input value={searchValue} onChange={(event) => setSearchValue(event.currentTarget.value)} placeholder="搜索当前库" aria-label="搜索当前库" /><kbd>⌕</kbd></label>
            <button type="button" aria-label="添加成员" className="team-add-member" onClick={() => notify('添加成员即将上线')}><UserRound size={16} /><Plus size={15} /></button>
            <button type="button" className="workspace-manage-button" onClick={() => notify('团队设置即将上线')}><Settings2 size={16} />设置</button>
            <div className="workspace-create-wrap">
              <button type="button" className="workspace-create-button" onClick={() => setShowUploadMenu((value) => !value)}><Plus size={18} />新建/上传<ChevronDown size={14} /></button>
              {showUploadMenu && <div className="workspace-create-menu"><button type="button" onClick={() => { setShowUploadMenu(false); notify('已创建团队画布'); }}><Plus size={15} />新建设计</button><button type="button" onClick={() => { setShowUploadMenu(false); notify('上传入口已打开'); }}><CloudUpload size={15} />上传文件</button></div>}
            </div>
            <div className="team-storage-meter"><strong>37.19%</strong><span /></div>
          </div>
        </div>

        <div className="team-industry-tabs"><span>零售行业</span>{['全部', '互联网信息服务业', '互联网直播游戏', '零售行业', '金融行业', '汽车制造业'].map((industry) => <button key={industry} type="button" className={activeIndustry === industry ? 'is-active' : ''} onClick={() => setActiveIndustry(industry)}>{industry}</button>)}</div>

        <div className="team-section-heading"><span>文件夹 (10)</span><ChevronDown size={15} /><label><input type="checkbox" defaultChecked />显示子文件夹内的资源</label></div>
        <div className="team-folder-grid">
          <button type="button" className="team-folder-card team-folder-card--new" onClick={() => notify('已打开新建文件夹')}><FolderPlus size={25} /><span>新建文件夹</span></button>
          {teamFolders.map((folder) => <button type="button" className="team-folder-card" key={folder} onClick={() => notify(`打开文件夹：${folder}`)}><Folder size={44} fill="#ffc72c" stroke="#f5a623" /><span>{folder}</span></button>)}
        </div>

        <div className="team-resource-toolbar"><div><strong>资源 (525)</strong>{['类型', '场景', '格式', '标签', '创建人', '时间'].map((filter) => <button type="button" key={filter} onClick={() => notify(`${filter}筛选即将上线`)}>{filter}<ChevronDown size={12} /></button>)}</div><div><button type="button" onClick={() => notify('按创建时间排序')} >创建时间<ChevronDown size={12} /></button><button type="button" aria-label="网格视图"><Grid2x2 size={18} /></button><button type="button" aria-label="批量筛选"><CheckSquare size={18} /></button></div></div>

        <div className="team-resource-grid">
          {visibleResources.map((resource, index) => <button type="button" className="team-resource-card" key={`${resource.title}-${index}`} onClick={() => notify(`打开：${resource.title}`)}><div className="team-resource-thumb"><TeamResourceArtwork resource={resource} />{resource.shared && <span className="team-shared-label">分享中</span>}<span className="team-resource-badge">{resource.badge}</span></div><span className="team-resource-title">{resource.title}</span></button>)}
          {visibleResources.length === 0 && <div className="workspace-empty"><CircleCheck size={22} /><span>没有找到匹配的资源</span></div>}
        </div>
      </div>
      {toast && <div className="workspace-toast" role="status">{toast}</div>}
    </section>
  );
}

interface AgentSkillsHomePageProps {
  onBackToDirectory: () => void;
  onOpenCanvas: () => void;
  onOpenTemplates: () => void;
  onOpenMembershipUpgrade: (currentMember?: MembershipCurrentMember) => void;
  onStartCanvasGeneration: (prompt: string, attachments?: GenerationAttachment[]) => void;
}

export function AgentSkillsHomePage({ onBackToDirectory, onOpenCanvas, onOpenTemplates, onOpenMembershipUpgrade, onStartCanvasGeneration }: AgentSkillsHomePageProps) {
  const [mode, setMode] = useState<HomeMode>('templates');
  const [activeNav, setActiveNav] = useState('首页');
  const [searchTerm, setSearchTerm] = useState('');
  const [homePrompt, setHomePrompt] = useState('');
  const [homeAttachments, setHomeAttachments] = useState<GenerationAttachment[]>([]);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('最近使用');
  const [activeHomeSkillCategory, setActiveHomeSkillCategory] = useState('电商设计');
  const [activeSameStyleCategory, setActiveSameStyleCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [membershipFocusMorePoints, setMembershipFocusMorePoints] = useState(false);
  const [pointsPurchaseOpen, setPointsPurchaseOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileToast, setProfileToast] = useState('');
  const [showSkillEntryBadge, setShowSkillEntryBadge] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.localStorage.getItem('ckt-skills-entry-seen') !== '1';
    } catch {
      return true;
    }
  });
  const [showInspirationOnboarding, setShowInspirationOnboarding] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.localStorage.getItem('ckt-inspiration-collector-guide-seen') !== '1';
    } catch {
      return true;
    }
  });
  const [showInspirationBadge, setShowInspirationBadge] = useState(false);
  const [membershipEntryIntent] = useState(readMembershipEntryIntent);
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, FieldValue>>>({});
  const skillsRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!membershipEntryIntent.openVipPop) return;
    setMembershipFocusMorePoints(membershipEntryIntent.morePoints);
    setMembershipOpen(true);
  }, [membershipEntryIntent]);

  const notifyProfile = (message: string) => {
    setProfileToast(message);
    window.setTimeout(() => setProfileToast(''), 1600);
  };

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    if (label === '我的') {
      setShowInspirationOnboarding(false);
      setShowInspirationBadge(true);
      try {
        window.localStorage.setItem('ckt-inspiration-collector-guide-seen', '1');
      } catch {
        // Keep the onboarding dismissed for the current session when storage is unavailable.
      }
      return;
    }
    if (label === '技能') {
      setShowSkillEntryBadge(false);
      try {
        window.localStorage.setItem('ckt-skills-entry-seen', '1');
      } catch {
        // Keep the badge hidden for the current session when storage is unavailable.
      }
      return;
    }
    if (label === '模板') {
      onOpenTemplates();
      return;
    }
    if (label === 'AI工具') {
      setMode('agent');
      return;
    }
    if (label === '首页') {
      setMode('templates');
    }
  };

  const visibleSkills = useMemo(() => {
    const base = activeCategory === '最近使用'
      ? recentSkillIds.map((id) => skills.find((item) => item.id === id)).filter((item): item is SkillDefinition => Boolean(item))
      : activeCategory === '全部技能'
        ? skills
        : skills.filter((item) => item.category === resolveSkillCategory(activeCategory));
    if (!searchTerm.trim()) return base;
    return base.filter((item) => `${item.title}${item.description}`.includes(searchTerm.trim()));
  }, [activeCategory, searchTerm]);
  const visibleSameStyleCards = activeSameStyleCategory === null
    ? agentSameStyleGallery
    : agentSameStyleGallery.filter((card) => card.category === activeSameStyleCategory);

  const selectedValues = selectedSkill ? fieldValues[selectedSkill.id] ?? {} : {};
  const promptPreview = selectedSkill ? makePrompt(selectedSkill, selectedValues) : '';
  const templateTabActive = mode === 'templates';
  const agentTabActive = mode === 'agent';
  const selectedAttachments: GenerationAttachment[] = selectedSkill
    ? selectedSkill.fields
        .filter((field): field is Extract<SkillField, { type: 'upload' }> => field.type === 'upload')
        .flatMap((field) => {
          const files = selectedValues[field.id];
          return Array.isArray(files) ? files.map((file, index) => ({
            id: `${selectedSkill.id}-${field.id}-${index}-${file.name}`,
            type: 'image' as const,
            url: file.url,
            name: file.name,
          })) : [];
        })
    : [];
  const hasRequiredValues = selectedSkill?.fields.every((field) => {
    if (!field.required) return true;
    const value = selectedValues[field.id];
    if (field.type === 'upload') return Array.isArray(value) && value.length > 0;
    return typeof value === 'string' && value.trim().length > 0;
  }) ?? false;

  const setPickerCategory = (category: string) => {
    const resolvedCategory = resolveSkillCategory(category);
    setActiveCategory(category === '最近使用' || category === '全部技能' ? category : getSkillCategoryLabel(resolvedCategory));
    if (agentCategoryOptions.some((item) => item.value === resolvedCategory)) {
      setActiveHomeSkillCategory(resolvedCategory);
    }
  };

  const openSkillPicker = (category = '最近使用') => {
    setSelectedSkill(null);
    setPickerCategory(category);
    setSearchTerm('');
    setSkillPickerOpen(true);
  };

  const setFieldValue = (fieldId: string, value: FieldValue) => {
    if (!selectedSkill) return;
    setFieldValues((previous) => ({
      ...previous,
      [selectedSkill.id]: { ...(previous[selectedSkill.id] ?? {}), [fieldId]: value },
    }));
  };

  const selectSkill = (skill: SkillDefinition) => {
    setSelectedSkill(skill);
    setFieldValues((previous) => {
      if (previous[skill.id]) return previous;
      return { ...previous, [skill.id]: Object.fromEntries(skill.fields.map((field) => [field.id, getDefaultValue(field)])) };
    });
  };

  const bringIntoPrompt = () => {
    if (!selectedSkill) return;
    setHomePrompt(promptPreview);
    setHomeAttachments(selectedAttachments);
    setMode('agent');
    setSelectedSkill(null);
    setSkillPickerOpen(false);
  };

  const startGeneration = () => {
    if (!selectedSkill || !hasRequiredValues) return;
    onStartCanvasGeneration(promptPreview, selectedAttachments);
  };

  function selectSkillFromChip(skillId: string) {
    const skill = skills.find((item) => item.id === skillId);
    if (!skill) return;
    openSkillPicker(skill.category);
    setSelectedSkill(skill);
    setFieldValues((previous) => previous[skill.id] ? previous : { ...previous, [skill.id]: Object.fromEntries(skill.fields.map((field) => [field.id, getDefaultValue(field)])) });
  }

  const renderField = (field: SkillField) => {
    const value = selectedValues[field.id] ?? getDefaultValue(field);
    return (
      <div key={field.id} className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[14px] font-medium text-[#222733]">
            {field.label}{field.required ? <span className="ml-1 text-[#ff5a5f]">*</span> : null}
          </label>
          {field.type === 'upload' ? <span className="text-[13px] text-[#858c99]">{Array.isArray(value) ? value.length : 0}/{field.max ?? 10}</span> : null}
        </div>

        {field.type === 'upload' ? (
          <label className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-[13px] border border-dashed border-[#d9deea] bg-[#f6f7fa] px-4 py-4 text-center transition hover:border-[#7eaaff] hover:bg-[#f3f7ff]">
            <Upload className="mb-2 h-5 w-5 text-[#5e6573]" />
            <span className="text-[12px] text-[#646b78]">上传图片</span>
            {field.description ? <span className="mt-1 text-[11px] text-[#a0a5ae]">{field.description}</span> : null}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                const existing = Array.isArray(value) ? value : [];
                const uploads = files.slice(0, Math.max(0, (field.max ?? 10) - existing.length)).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
                setFieldValue(field.id, [...existing, ...uploads]);
                event.currentTarget.value = '';
              }}
            />
          </label>
        ) : null}

        {field.type === 'ratio' ? (
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => (
              <button key={option} type="button" onClick={() => setFieldValue(field.id, option)} className={`rounded-[11px] px-3.5 py-2 text-[13px] transition ${value === option ? 'border border-[#c3d8ff] bg-[#f1f6ff] text-[#202633]' : 'border border-transparent bg-[#f4f5f7] text-[#262b34] hover:bg-[#eef0f5]'}`}>
                {option}
              </button>
            ))}
          </div>
        ) : null}

        {field.type === 'select' ? (
          <div className="relative rounded-[12px] bg-[#f5f6f8]">
            <select value={typeof value === 'string' ? value : ''} onChange={(event) => setFieldValue(field.id, event.currentTarget.value)} className="h-[54px] w-full appearance-none rounded-[12px] bg-transparent px-3.5 pb-1 pt-4 text-[13px] text-[#272d38] outline-none">
              {field.options.map((option) => <option key={option}>{option}</option>)}
            </select>
            <span className="pointer-events-none absolute left-3.5 top-1.5 text-[10px] text-[#9399a4]">{field.label}</span>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9299a6]" />
          </div>
        ) : null}

        {field.type === 'textarea' ? (
          <textarea value={typeof value === 'string' ? value : ''} rows={field.rows ?? 3} onChange={(event) => setFieldValue(field.id, event.currentTarget.value)} placeholder={field.placeholder} className="w-full resize-y rounded-[13px] border border-transparent bg-[#f5f6f8] px-3.5 py-3 text-[13px] leading-6 text-[#252b35] outline-none placeholder:text-[#9ba1ab] focus:border-[#bdd4ff]" />
        ) : null}

        {field.type === 'input' ? (
          <input value={typeof value === 'string' ? value : ''} onChange={(event) => setFieldValue(field.id, event.currentTarget.value)} placeholder={field.placeholder} className="h-[48px] w-full rounded-[12px] border border-transparent bg-[#f5f6f8] px-3.5 text-[13px] text-[#252b35] outline-none placeholder:text-[#9ba1ab] focus:border-[#bdd4ff]" />
        ) : null}

        {field.type === 'upload' && Array.isArray(value) && value.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {value.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative h-12 w-12 overflow-hidden rounded-lg border border-[#e6e9f0] bg-white">
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setFieldValue(field.id, value.filter((_, fileIndex) => fileIndex !== index))} className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white" aria-label={`移除${file.name}`}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderSkillFields = () => {
    if (!selectedSkill) return null;
    const rendered: React.ReactNode[] = [];
    for (let index = 0; index < selectedSkill.fields.length; index += 1) {
      const field = selectedSkill.fields[index];
      const nextField = selectedSkill.fields[index + 1];
      if (field.type === 'select' && nextField?.type === 'select') {
        rendered.push(<div key={`${field.id}-${nextField.id}`} className="grid grid-cols-2 gap-2">{renderField(field)}{renderField(nextField)}</div>);
        index += 1;
      } else {
        rendered.push(renderField(field));
      }
    }
    return rendered;
  };

  return (
    <div className={`min-h-screen overflow-x-hidden bg-white font-sans text-[#1d2943] ${activeNav === '我的' ? 'is-workspace-shell' : ''} ${activeNav === '团队' ? 'is-team-workspace-shell' : ''} ${activeNav === '管理' ? 'is-team-management-shell' : ''}`}>
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[92px] flex-col items-center border-r border-[#e8edf7] bg-[linear-gradient(180deg,#f4f8ff_0%,#f1f5ff_100%)] py-4 ${activeNav === '我的' || activeNav === '团队' || activeNav === '管理' ? 'workspace-sidebar' : ''}`}>
        <button type="button" onClick={onBackToDirectory} className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl text-[#52617b] transition hover:bg-white" title="返回目录"><Menu className="h-5 w-5" /></button>
        <div className="flex w-full flex-col items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <React.Fragment key={item.label}>
              {item.label === '我的' ? <div className="my-1 h-px w-[52px] bg-[#e1e7f1]" /> : null}
              <div className="relative">
                <button type="button" onClick={() => handleNavClick(item.label)} className={`relative flex w-[62px] flex-col items-center gap-1 rounded-[12px] py-2 text-[11px] transition ${activeNav === item.label ? 'bg-[#d9eaff] font-medium text-[#1f75ed]' : 'text-[#596986] hover:bg-white/80'}`}><Icon className="h-[22px] w-[22px]" /><span>{item.label}</span>{item.label === '技能' && showSkillEntryBadge ? <i className="absolute right-[9px] top-[5px] h-2.5 w-2.5 rounded-full bg-[#ff5b5f] ring-2 ring-[#f4f8ff]" aria-label="有新技能" /> : null}{item.label === '我的' && showInspirationBadge ? <i className="absolute right-[9px] top-[5px] h-2.5 w-2.5 rounded-full bg-[#ff5b5f] ring-2 ring-[#f4f8ff]" aria-label="有新的灵感采集" /> : null}</button>
                {item.label === '我的' && showInspirationOnboarding ? <div className="inspiration-nav-guide" role="status"><button type="button" className="inspiration-nav-guide__close" onClick={() => setShowInspirationOnboarding(false)} aria-label="关闭引导">×</button><strong>发现灵感采集</strong><p>在淘宝、京东看到喜欢的图片或视频？安装采集插件，一键保存到我的灵感库，回来继续创作。</p><button type="button" className="inspiration-nav-guide__action" onClick={() => handleNavClick('我的')}>去看看</button></div> : null}
              </div>
            </React.Fragment>;
          })}
        </div>
        <div className="mt-auto flex flex-col items-center gap-4 pb-1 text-[11px] text-[#596986]">
          <button type="button" className="flex flex-col items-center gap-1"><UserRound className="h-[22px] w-[22px]" />成员</button>
          <button type="button" onClick={() => handleNavClick('管理')} className={`flex flex-col items-center gap-1 rounded-[12px] px-2 py-2 transition ${activeNav === '管理' ? 'bg-[#d9eaff] font-medium text-[#1f75ed]' : 'hover:bg-white/80'}`}><Settings2 className="h-[22px] w-[22px]" />管理</button>
        </div>
      </aside>

      <header className={`fixed left-[92px] right-0 top-0 z-20 flex h-[86px] items-center justify-between border-b border-[#f1f3f8] bg-white/90 px-10 backdrop-blur-xl ${activeNav === '我的' || activeNav === '团队' || activeNav === '管理' ? 'workspace-header' : ''}`}>
        <button type="button" onClick={onBackToDirectory} className="flex items-center"><img src={cktAiEcomLogo} alt="创客贴" className="h-[40px] w-auto" /></button>
        <div className="flex items-center gap-7 text-[#4f5870]">
          {activeNav === '管理' ? <>
            <button type="button" className="flex items-center gap-1 text-[15px] transition hover:text-[#1677f8]"><Zap className="h-4 w-4 text-[#ffbc3b]" />AI图表</button>
            <button type="button" className="text-[15px] transition hover:text-[#1677f8]">在线印刷</button>
            <button type="button" className="text-[15px] transition hover:text-[#1677f8]">企业服务</button>
            <Grid2x2 className="h-[21px] w-[21px]" />
            <span className="relative"><Bell className="h-[23px] w-[23px]" /><i className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff5e58] px-1 text-[11px] font-medium not-italic text-white">2</i></span>
            <button type="button" className="workspace-team-switch"><span>北京艺源酷</span><ChevronDown /></button>
          </> : <>
            <button type="button" onClick={() => setMode('agent')} className="flex items-center gap-1 text-[15px] transition hover:text-[#1677f8]"><Zap className="h-4 w-4 text-[#ffbc3b]" />PPT生成</button>
            <button type="button" className="text-[15px] transition hover:text-[#1677f8]">印刷店</button>
            <Grid2x2 className="h-[21px] w-[21px]" />
            <span className="relative"><Bell className="h-[23px] w-[23px]" /><i className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff5e58] px-1 text-[11px] font-medium not-italic text-white">4</i></span>
            {activeNav !== '团队' ? <div className="relative">
              {activeNav !== '我的' ? <><div className="pointer-events-none absolute -inset-1 rounded-[16px] border border-dashed border-[#ff665b]" aria-hidden="true" /><span className="absolute -right-5 -top-3 z-10"><RequirementHint text={MEMBERSHIP_CENTER_ENTRY_REQUIREMENT} requirementName={MEMBERSHIP_CENTER_ENTRY_REQUIREMENT_NAME} sections={MEMBERSHIP_CENTER_ENTRY_REQUIREMENT_SECTIONS} /></span></> : null}
              <button type="button" onClick={() => { setMembershipFocusMorePoints(false); setMembershipOpen(true); }} aria-label={activeNav === '我的' ? '开通会员' : '会员中心'} className="flex h-[48px] items-center gap-2 rounded-[14px] bg-[#ffead9] px-4 text-[16px] font-semibold text-[#805638] transition hover:bg-[#ffe1ca]"><span className="rounded-sm bg-[#8d5c34] px-1.5 py-0.5 text-[11px] font-bold text-[#ffe6b9]">VIP</span>{activeNav === '我的' ? '开通会员' : '会员中心'}</button>
            </div> : null}
          </>}
          <div className="user-profile-anchor" onMouseEnter={() => setProfileMenuOpen(true)} onMouseLeave={() => setProfileMenuOpen(false)}>
            <button type="button" className="user-profile-trigger" aria-label="打开用户菜单" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(true)}><UserAccountAvatar /></button>
            {profileMenuOpen ? <UserProfileDropdown onClose={() => setProfileMenuOpen(false)} onNavigateToManagement={() => { setProfileMenuOpen(false); handleNavClick('管理'); }} onNotify={notifyProfile} /> : null}
          </div>
        </div>
      </header>

      <main className={`ml-[92px] pt-[86px] ${activeNav === '我的' || activeNav === '团队' || activeNav === '管理' ? 'workspace-main' : ''}`}>
        {activeNav === '技能' ? <SkillsDirectoryPage sections={skillDirectorySections} onSelectSkill={selectSkillFromChip} /> : activeNav === '我的' ? <MyWorkspacePage inspirationUnread={showInspirationBadge} onMarkInspirationRead={() => setShowInspirationBadge(false)} /> : activeNav === '团队' ? <TeamWorkspacePage /> : activeNav === '管理' ? <TeamManagementPage onOpenMembership={(focusMorePoints) => { setMembershipFocusMorePoints(focusMorePoints); setMembershipOpen(true); }} onOpenPointsPurchase={() => setPointsPurchaseOpen(true)} /> : <>
        <section className={`relative ${mode === 'templates' ? 'min-h-[382px]' : 'min-h-[360px]'} overflow-hidden bg-[radial-gradient(ellipse_at_50%_16%,#e9ecff_0%,#f8f9ff_42%,#ffffff_80%)] px-6 pb-8 pt-[42px]`}>
          <div className="pointer-events-none absolute left-[27%] top-0 h-60 w-60 rounded-full bg-white/80 blur-3xl" />
          <div className="pointer-events-none absolute right-[23%] top-6 h-64 w-64 rounded-full bg-[#dce4ff]/55 blur-3xl" />
          <div className="absolute left-1/2 top-[126px] z-[11] -translate-x-1/2 opacity-[0.64]">
            <button type="button" onClick={() => setMode('templates')} aria-pressed={templateTabActive} className={`pointer-events-auto absolute -left-[230px] flex items-center justify-between overflow-hidden border-2 border-white bg-white/50 text-left shadow-[0_10px_18px_rgba(102,128,187,0.12)] backdrop-blur-sm transition-all hover:opacity-100 hover:shadow-[0_10px_22px_rgba(74,111,190,0.22)] ${templateTabActive ? 'top-0 z-[1] h-[77px] w-[266px] rounded-[18px] pl-4 pr-2' : 'top-[27px] z-[2] h-[50px] w-[231px] rounded-[14px] pl-3 pr-2'}`}>
              <span className="relative z-10 min-w-0 flex-1"><span className={`block truncate font-bold leading-none ${templateTabActive ? 'text-[17px] text-[#e4e8f5]' : 'text-[13px] text-[#e4e8f5]'}`}>Template</span><span className={`mt-1.5 block truncate font-semibold leading-none ${templateTabActive ? 'text-[13px] text-[#3c465d]' : 'text-[10px] text-[#3c465d]'}`}>设计模板</span></span>
              {templateTabActive ? <span className="relative flex h-[88px] w-[99px] shrink-0 -rotate-[8deg] items-center justify-center overflow-hidden rounded-[15px] border-2 border-white/80 bg-[linear-gradient(145deg,#d9f0ff_0%,#76b6ef_58%,#5279c9_100%)] shadow-[0_6px_14px_rgba(72,126,214,0.2)]"><span className="absolute -right-3 -top-4 h-16 w-16 rounded-full bg-white/35 blur-md" /><span className="absolute left-3 top-3 text-[27px] font-semibold leading-none text-white/85">✿</span><span className="absolute bottom-3 left-3 text-[8px] font-semibold tracking-[0.12em] text-white/90 [writing-mode:vertical-rl]">迎光向前</span><span className="absolute bottom-2 right-3 text-[19px] text-white/80">✧</span></span> : null}
            </button>
            <button type="button" onClick={() => setMode('agent')} aria-pressed={agentTabActive} className={`pointer-events-auto absolute left-[5px] flex items-center justify-between overflow-hidden border-2 border-white bg-white/45 text-left shadow-[0_10px_18px_rgba(102,128,187,0.12)] backdrop-blur-sm transition-all hover:opacity-100 hover:shadow-[0_10px_22px_rgba(74,111,190,0.22)] ${agentTabActive ? 'top-0 z-[1] h-[77px] w-[266px] rounded-[18px] pl-4 pr-2' : 'top-[27px] z-[2] h-[50px] w-[231px] rounded-[14px] pl-3 pr-2'}`}>
              <span className="relative z-10 min-w-0 flex-1"><span className={`block truncate font-bold leading-none ${agentTabActive ? 'text-[17px] text-white/70' : 'text-[13px] text-white/70'}`}>AI creation</span><span className={`mt-1.5 block truncate font-semibold leading-none ${agentTabActive ? 'text-[13px] text-[#68718b]' : 'text-[10px] text-[#68718b]'}`}>AI创作</span></span>
              {agentTabActive ? <span className="relative flex h-[66px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/70 bg-[linear-gradient(145deg,#f3e8ff,#d6ddff)]"><span className="absolute -right-2 -top-3 h-12 w-12 rounded-full bg-white/55 blur-md" /><span className="flex h-10 w-7 -rotate-[8deg] items-end justify-center rounded-[5px] border-2 border-white bg-[linear-gradient(160deg,#9fa7ff,#f2d4e7)] pb-0.5 text-[18px] text-white shadow-sm">✦</span><span className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-white/70" /></span> : null}
            </button>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-[126px] z-20 -translate-x-1/2" aria-hidden="true">
            <button type="button" tabIndex={-1} onClick={() => setMode('templates')} className="pointer-events-auto absolute -left-[230px] top-0 h-[77px] w-[170px] opacity-0" />
            <button type="button" tabIndex={-1} onClick={() => setMode('agent')} className="pointer-events-auto absolute left-[5px] top-0 h-[77px] w-[170px] opacity-0" />
          </div>
          <h1 className="relative z-10 text-center text-[31px] font-semibold tracking-[0.035em] text-[#18233d]">今天你想做些什么？</h1>

          {mode === 'templates' ? (
            <div className="relative z-10 mx-auto mt-[112px] flex h-[84px] max-w-[1200px] items-center gap-3 rounded-[29px] border-[3px] border-[#3287ff] bg-white px-4 shadow-[0_12px_25px_rgba(63,116,220,0.14)]">
              <Search className="ml-1 h-6 w-6 shrink-0 text-[#c4cad5]" />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="输入关键词搜索你想要的模板或素材" className="min-w-0 flex-1 text-[18px] outline-none placeholder:text-[#aab4c7]" />
              <Camera className="h-6 w-6 shrink-0 text-[#c4cad5]" />
              <button type="button" className="h-[50px] w-[104px] shrink-0 rounded-[14px] bg-[#1478fa] text-[16px] font-semibold text-white shadow-[0_4px_10px_rgba(20,120,250,0.18)]">搜索</button>
            </div>
          ) : (
            <div className="relative z-10 mx-auto mt-[112px] h-[232px] max-w-[1200px] rounded-[29px] border-[3px] border-[#7166ff] bg-white px-6 pb-6 pt-5 shadow-[0_14px_30px_rgba(87,92,197,0.14)]">
              <textarea value={homePrompt} onChange={(event) => setHomePrompt(event.currentTarget.value)} placeholder="上传参考图片，描述下您想要的内容，我们会为您呈现~" className="h-[138px] w-full resize-none bg-transparent text-[18px] leading-7 text-[#9ba9c0] outline-none placeholder:text-[#9ba9c0]" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#edf0f5] text-[#8490a5] transition hover:border-[#bdb5ff] hover:text-[#6b5ef4]"><Plus className="h-5 w-5" /></button>
                  {homeAttachments.length > 0 ? <span className="text-[12px] text-[#758198]">已添加 {homeAttachments.length} 张参考图</span> : null}
                  <button type="button" onClick={() => openSkillPicker()} className="flex h-11 items-center gap-2 rounded-[13px] border border-[#eef0f5] px-4 text-[17px] font-medium text-[#3c4353] hover:border-[#cbc7ff] hover:text-[#5c5cfc]"><Sparkles className="h-[18px] w-[18px]" />Agent模式</button>
                  <button type="button" className="flex h-11 items-center gap-2 rounded-[13px] border border-[#eef0f5] px-4 text-[17px] text-[#555d70]"><FileImage className="h-[18px] w-[18px]" />自动</button>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="润色" className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-[#edf0f5] text-[#7f8cff]"><WandSparkles className="h-5 w-5" /></button>
                  <button type="button" disabled={!homePrompt.trim()} onClick={() => onStartCanvasGeneration(homePrompt.trim(), homeAttachments)} className={`rounded-[13px] px-5 py-2.5 text-[17px] font-semibold text-white ${homePrompt.trim() ? 'bg-[#695cff] hover:bg-[#5c50ee]' : 'bg-[#dedcff]'}`}>生成</button>
                </div>
              </div>
            </div>
          )}

          {mode === 'templates' ? (
            <div className="relative z-10 mx-auto mt-4 flex max-w-[1160px] flex-wrap items-center justify-center gap-3">
              {['🍁秋日特辑', '🚩喜报', '🌕日签', '无限画布', 'AI电商', '✨展架·次日达', '🗓️2027台历模板'].map((tag) => <button key={tag} type="button" onClick={() => openSkillPicker()} className="rounded-[7px] bg-[#f4f6fb] px-2.5 py-1 text-[10px] font-medium text-[#687187] hover:bg-[#eaf0ff] hover:text-[#4d63bd]">{tag}</button>)}
            </div>
          ) : (
            <div className="relative z-10 mx-auto mt-3 grid max-w-[1600px] grid-cols-2 gap-2.5 xl:grid-cols-6">
              {agentQuickCards.map((card) => (
                <button key={card.title} type="button" onClick={() => openSkillPicker(card.category)} className="flex h-[72px] min-w-0 items-center justify-between rounded-[14px] border border-[#e7ebf4] bg-white px-3.5 text-left shadow-[0_2px_8px_rgba(70,88,130,0.035)] transition hover:-translate-y-0.5 hover:border-[#c7d5ff] hover:shadow-[0_8px_18px_rgba(70,88,130,0.1)]">
                  <span className="min-w-0 pr-2"><span className="block truncate text-[13px] font-semibold text-[#29364f]">{card.title}</span><span className="mt-0.5 block truncate text-[11px] text-[#a0aec2]">{card.desc}</span></span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${card.art === 'poster' ? 'bg-[#dfeaff] text-[#458dff]' : card.art === 'commerce-set' ? 'bg-[#fff0e4] text-[#ff9359]' : card.art === 'video' ? 'bg-[#e9e6ff] text-[#756cf4]' : card.art === 'recruitment' ? 'bg-[#ffe5e8] text-[#f15b6a]' : card.art === 'ppt' ? 'bg-[#e7e9ff] text-[#706cf5]' : 'bg-[#e0f7e8] text-[#5bc47c]'}`}>{card.art === 'poster' ? <ImageIcon className="h-4 w-4" /> : card.art === 'commerce-set' ? <Shirt className="h-4 w-4" /> : card.art === 'video' ? <Video className="h-4 w-4" /> : card.art === 'recruitment' ? <UserRound className="h-4 w-4" /> : card.art === 'ppt' ? <FileImage className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {mode === 'agent' ? (
          <section className="mx-auto max-w-[1920px] space-y-8 px-[42px] pb-16">
            <SkillsCategoryShowcase sections={skillDirectorySections} activeCategory={activeHomeSkillCategory} onCategoryChange={setActiveHomeSkillCategory} onSelectSkill={selectSkillFromChip} />

            <section>
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-[24px] font-semibold text-[#28344c]">一键同款</h2><p className="mt-1 text-[12px] text-[#9aa6bb]">按设计场景浏览相关灵感，选择后可继续使用对应技能</p></div>{activeSameStyleCategory ? <button type="button" onClick={() => setActiveSameStyleCategory(null)} className="text-[12px] text-[#8490a6] hover:text-[#4b77d3]">查看全部</button> : null}</div>
              <div className="mb-5 flex flex-wrap gap-3">
                {agentQuickCards.map((card, index) => {
                  const active = activeSameStyleCategory === card.directoryCategory;
                  return <button key={card.title} type="button" onClick={() => setActiveSameStyleCategory(card.directoryCategory)} className={`rounded-full px-4 py-2 text-[14px] font-medium ${active ? 'bg-[#eef0ff] text-[#5c64ca]' : 'bg-[#f2f4f9] text-[#69758c]'} transition hover:bg-[#e7edff]`}>{index === 0 ? '🎨' : index === 1 ? '💰' : index === 2 ? '🎬' : index === 3 ? '🔥' : index === 4 ? '📄' : '🟢'}{card.title}</button>;
                })}
              </div>
              <div className="agent-same-style-masonry">
                {visibleSameStyleCards.map((card) => (
                  <button key={card.id} type="button" onClick={() => setActiveSameStyleCategory(card.category)} className="agent-same-style-card group">
                    <div className={`agent-same-style-card__art agent-same-style-card__art--${card.size} bg-gradient-to-br ${card.tone}`}><span className="agent-same-style-card__glow" /><span className="agent-same-style-card__frame" /><span className="agent-same-style-card__copy"><span>{card.kicker}</span><strong>{card.title}</strong><small>{card.description}</small></span></div>
                    <span className="agent-same-style-card__meta"><strong>{card.title}</strong><span>{card.description}</span></span>
                  </button>
                ))}
              </div>
            </section>
          </section>
        ) : (
          <section className="mx-auto grid max-w-[1920px] grid-cols-1 gap-5 px-[42px] pb-10 xl:grid-cols-[minmax(400px,0.82fr)_minmax(760px,1.7fr)] 2xl:gap-6">
            <div className="grid grid-cols-2 grid-rows-[148px_108px] gap-3">
              <button type="button" className="relative col-span-2 overflow-hidden rounded-[18px] border border-[#e8e9f5] bg-[linear-gradient(115deg,#f2f2ff_0%,#f9f9ff_66%,#fff_100%)] px-6 py-6 text-left shadow-[0_3px_12px_rgba(85,101,154,0.035)]">
                <span className="block text-[18px] font-semibold text-[#35405a]">创建设计</span>
                <span className="mt-1.5 block text-[12px] text-[#94a3be]">高频创作场景一键直达</span>
                <span className="absolute bottom-6 left-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#e8edff] bg-white text-[22px] leading-none text-[#7a74ff] shadow-sm">›</span>
                <span className="absolute bottom-5 right-7 flex h-[94px] w-[94px] items-center justify-center rounded-[13px] border border-[#e0e9ff] bg-white/75 shadow-[0_8px_24px_rgba(77,127,255,0.1)]"><span className="relative flex h-[64px] w-[58px] items-center justify-center border-2 border-dashed border-[#78a8ff] text-[#3985ff]"><span className="absolute -right-2 -top-2 h-2.5 w-2.5 rounded-sm border-2 border-[#3985ff] bg-white" /><span className="absolute -bottom-2 -left-2 h-2.5 w-2.5 rounded-sm border-2 border-[#3985ff] bg-white" /><Plus className="h-7 w-7" /></span></span>
              </button>
              <button type="button" onClick={onOpenCanvas} className="rounded-[18px] border border-[#eceff4] bg-[radial-gradient(circle_at_25%_20%,#edf8ff_0%,#fff_58%)] px-6 py-5 text-left shadow-[0_3px_12px_rgba(85,101,154,0.025)] transition hover:border-[#c9d9ff]"><span className="block text-[17px] font-semibold text-[#35405a]">无限画布</span><span className="mt-1.5 block text-[12px] text-[#96a5be]">点击即可快速开始</span></button>
              <button type="button" className="rounded-[18px] border border-[#eceff4] bg-[radial-gradient(circle_at_80%_20%,#f0f3ff_0%,#fff_58%)] px-6 py-5 text-left shadow-[0_3px_12px_rgba(85,101,154,0.025)] transition hover:border-[#c9d9ff]"><span className="block text-[17px] font-semibold text-[#35405a]">图片编辑</span><span className="mt-1.5 block text-[12px] text-[#96a5be]">点击即可快速开始</span></button>
            </div>

            <div className="h-[272px] rounded-[18px] bg-[#f2f5fb] p-3 shadow-[0_3px_12px_rgba(85,101,154,0.035)]">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-6 text-[14px] font-medium text-[#75829a]">
                  {['热门推荐', '海报上新', '视频创作', 'AI电商', '印刷制作', '图片处理'].map((tab, index) => <button key={tab} type="button" className={index === 0 ? 'relative font-semibold text-[#263148] after:absolute after:-bottom-2 after:left-0 after:h-[3px] after:w-9 after:rounded-full after:bg-[#8077ff]' : 'transition hover:text-[#263148]'}>{tab}</button>)}
                </div>
                <button type="button" className="shrink-0 text-[12px] text-[#8490a6] transition hover:text-[#3e79d7]">更多 ›</button>
              </div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {homepageFeatureCards.map((card) => (
                  <div key={card.title} className="relative flex h-[94px] min-w-0 items-center justify-between overflow-hidden rounded-[15px] bg-white px-4 py-2.5 shadow-[0_2px_8px_rgba(58,71,101,0.025)]">
                    <div className="relative z-10 min-w-0 pr-2">
                      <div className="truncate text-[15px] font-semibold text-[#273248]">{card.title}</div>
                      <div className="mt-1 line-clamp-2 text-[11px] leading-4.5 text-[#98a6bd]">{card.desc}</div>
                    </div>
                    <FeatureArt kind={card.art} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {mode === 'templates' ? (
          <section className="mx-auto max-w-[1920px] px-[42px] pb-16">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-[25px] font-semibold text-[#28334b]">热点内容速递</h2><button type="button" className="text-[14px] text-[#8a95aa] transition hover:text-[#3d75d2]">更多 ›</button></div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
              {templateCards.slice(0, 6).map((card, index) => (
                <button key={card.title} type="button" className="overflow-hidden rounded-[20px] border border-[#edf0f6] bg-[#f6f8fc] p-3 text-left shadow-[0_3px_12px_rgba(58,71,101,0.025)] transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(58,71,101,0.1)]">
                  <div className={`relative flex aspect-[0.82] items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-br ${card.tone} p-4 text-center text-white`}>
                    <span className="absolute inset-3 rounded border border-white/25" />
                    <span className="relative drop-shadow-sm"><span className="block text-[10px] font-medium tracking-[0.15em]">{card.kicker}</span><span className="mt-4 block text-[19px] font-black leading-tight">{card.title}</span><span className="mt-3 block text-[9px] opacity-80">CREATE · INSPIRE · DESIGN</span></span>
                    {index % 2 === 0 ? <span className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(16,54,112,.48))]" /> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {mode === 'templates' ? (
          <section className="mx-auto max-w-[1920px] space-y-8 px-6 pb-16">
            {templateGallerySections.map((section) => <TemplateGallerySection key={section.title} section={section} />)}
          </section>
        ) : null}
        </>}
      </main>

      <button type="button" className="fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7a879b] shadow-[0_5px_22px_rgba(63,78,112,0.17)]"><CircleHelp className="h-5 w-5" /></button>

      {skillPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172035]/35 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSkillPickerOpen(false); setSelectedSkill(null); } }}>
          <div className="relative flex h-[min(580px,calc(100vh-64px))] w-[min(980px,calc(100vw-64px))] overflow-hidden rounded-[20px] bg-[#f7f8fb] shadow-[0_26px_72px_rgba(21,31,55,0.24)]">
            <aside className="w-[168px] shrink-0 overflow-y-auto border-r border-[#eaedf3] bg-[#f4f5f8] px-2.5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {skillPickerCategories.map((category) => (
                <button key={category} type="button" onClick={() => setPickerCategory(category)} className={`mb-1 flex h-[38px] w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[12px] ${activeCategory === category ? 'bg-[#eaedf4] font-medium text-[#293142]' : 'text-[#41495a] hover:bg-white/75'}`}>
                  {category === '最近使用' ? <Clock3 className="h-4 w-4" /> : category === '全部技能' ? <Grid2x2 className="h-4 w-4" /> : <Puzzle className="h-4 w-4" />}{category}
                </button>
              ))}
            </aside>
            <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="text-[15px] font-semibold text-[#252b37]">{activeCategory}</div>
                <div className="flex h-8 w-[190px] items-center gap-2 rounded-[9px] bg-white px-2.5 text-[#9ba3b3]"><Search className="h-3.5 w-3.5" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="搜索 Agent skills" className="min-w-0 flex-1 text-[11px] text-[#333b4c] outline-none placeholder:text-[#a0a7b4]" /></div>
              </div>
              {activeCategory === '最近使用' && !searchTerm ? (
                <>
                  <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {visibleSkills.slice(0, 4).map((skill) => <button key={skill.id} type="button" onClick={() => selectSkill(skill)} className="flex h-[44px] items-center gap-2 rounded-[10px] bg-white px-3 text-left text-[12px] text-[#323847] hover:bg-[#f0f4ff]"><Puzzle className="h-3.5 w-3.5 text-[#8791a3]" />{skill.title}</button>)}
                  </div>
                  <div className="mb-3 text-[16px] font-semibold text-[#252b37]">电商设计</div>
                  <div className="mb-8 grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {skills.filter((skill) => skill.category === '电商设计').map((skill, index) => <SkillCard key={skill.id} skill={skill} index={index} onClick={() => selectSkill(skill)} />)}
                  </div>
                  <div className="mb-3 text-[16px] font-semibold text-[#252b37]">海报设计</div>
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {skills.filter((skill) => skill.category === '海报设计').map((skill, index) => <SkillCard key={skill.id} skill={skill} index={index + 2} onClick={() => selectSkill(skill)} />)}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {visibleSkills.map((skill, index) => <SkillCard key={skill.id} skill={skill} index={index} onClick={() => selectSkill(skill)} />)}
                  {visibleSkills.length === 0 ? <div className="col-span-full py-20 text-center text-[13px] text-[#9ba3b2]">没有找到相关 Agent skills</div> : null}
                </div>
              )}
            </div>
            <button type="button" onClick={() => { setSkillPickerOpen(false); setSelectedSkill(null); }} aria-label="关闭" className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#202634] shadow"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ) : null}

      {membershipOpen ? <MembershipCenterModal open={membershipOpen} onOpenChange={(open) => { setMembershipOpen(open); if (!open) setMembershipFocusMorePoints(false); }} onClose={() => { setMembershipOpen(false); setMembershipFocusMorePoints(false); }} focusMorePoints={membershipFocusMorePoints} onOpenUpgradePage={(currentMember) => { setMembershipOpen(false); setMembershipFocusMorePoints(false); onOpenMembershipUpgrade(currentMember); }} /> : null}
      {pointsPurchaseOpen ? <MembershipPointsPurchaseModal onClose={() => setPointsPurchaseOpen(false)} onOpenMembership={() => { setMembershipFocusMorePoints(false); setMembershipOpen(true); }} /> : null}

      {profileToast ? <div className="workspace-toast user-profile-toast" role="status">{profileToast}</div> : null}

      {selectedSkill ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1b2335]/40 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSkill(null); }}>
          <section className="relative flex h-[min(660px,calc(100vh-72px))] w-[min(960px,calc(100vw-72px))] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_72px_rgba(25,35,57,0.25)]">
            <aside className="hidden w-[40%] shrink-0 flex-col border-r border-[#eceff4] bg-[#f5f6f9] p-5 lg:flex">
              <SkillResultPreview skill={selectedSkill} />
            </aside>
            <div className="relative flex min-w-0 flex-1 flex-col bg-white">
              <div className="flex h-[58px] shrink-0 items-center border-b border-[#f0f1f4] px-4 sm:px-5">
                <button type="button" onClick={() => setSelectedSkill(null)} className="mr-2 rounded-full p-1 text-[#1f2632] hover:bg-[#f3f4f7]" aria-label="返回技能分类"><ChevronLeft className="h-5 w-5" /></button>
                <h2 className="text-[16px] font-semibold text-[#202631]">{selectedSkill.title}</h2>
                <button type="button" onClick={() => { setSelectedSkill(null); setSkillPickerOpen(false); }} className="ml-auto rounded-full p-2 text-[#6b7280] hover:bg-[#f4f5f7]" aria-label="关闭"><X className="h-4 w-4" /></button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-5">
                {renderSkillFields()}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 border-t border-[#eff0f2] bg-white px-4 py-3 sm:px-5">
                <button type="button" onClick={bringIntoPrompt} className="h-[40px] shrink-0 rounded-[11px] bg-[#f3f4f6] px-3.5 text-[12px] font-medium text-[#8d929a] transition hover:bg-[#e9ebf0] hover:text-[#3b4353]">带入输入框</button>
                <button type="button" disabled={!hasRequiredValues} onClick={startGeneration} className={`h-[40px] flex-1 rounded-[11px] text-[12px] font-semibold text-white transition ${hasRequiredValues ? 'bg-[#615cff] hover:bg-[#514bea]' : 'cursor-not-allowed bg-[#d9d9dc]'}`}>开始生成</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function SkillResultPreview({ skill }: { skill: SkillDefinition }) {
  const hasImageInput = skill.fields.some((field) => field.type === 'upload');
  const [activeIndex, setActiveIndex] = useState(0);
  const slideLabels = ['主视觉预览', '卖点展示', '细节效果', '场景应用', '成品预览'];
  const previousIndex = (activeIndex + slideLabels.length - 1) % slideLabels.length;
  const nextIndex = (activeIndex + 1) % slideLabels.length;
  const moveSlide = (direction: -1 | 1) => setActiveIndex((index) => (index + direction + slideLabels.length) % slideLabels.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[16px] bg-[#eef1f6]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#ffffff_0%,#f4f6fa_60%,#e9edf4_100%)]" />
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="relative flex h-[min(390px,58vh)] w-full shrink-0 items-center justify-center gap-3 overflow-hidden px-0">
            {[previousIndex, activeIndex, nextIndex].map((slideIndex, position) => (
              <ResultPreviewSlide key={slideIndex} skill={skill} label={slideLabels[slideIndex]} index={slideIndex} active={position === 1} hasImageInput={hasImageInput} onClick={() => setActiveIndex(slideIndex)} />
            ))}
            <button type="button" onClick={() => moveSlide(-1)} aria-label="上一张效果示意" className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#697386] shadow-md transition hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => moveSlide(1)} aria-label="下一张效果示意" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#697386] shadow-md transition hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 flex justify-center gap-1.5" aria-label="效果示意轮播">
            {slideLabels.map((label, index) => <button key={label} type="button" onClick={() => setActiveIndex(index)} aria-label={`查看${label}`} className={`h-1.5 rounded-full transition-all ${activeIndex === index ? 'w-5 bg-[#6961f5]' : 'w-1.5 bg-[#c8ced9] hover:bg-[#929bad]'}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultPreviewSlide({ skill, label, index, active, hasImageInput, onClick }: { skill: SkillDefinition; label: string; index: number; active: boolean; hasImageInput: boolean; onClick: () => void }) {
  const palettes = [
    'from-[#fff2ce] via-[#fff2e8] to-[#f8dfe6]',
    'from-[#dff2ff] via-[#f5fbff] to-[#dce8ff]',
    'from-[#d9f8e9] via-[#f6ffe8] to-[#fbf3bd]',
    'from-[#f1e8ff] via-[#fff4fc] to-[#f7e0ef]',
    'from-[#e5efff] via-[#f5f7ff] to-[#d9f8f5]',
  ];

  return (
    <button type="button" onClick={onClick} aria-label={`查看${label}`} className={`relative isolate flex aspect-[3/4] shrink-0 flex-col overflow-hidden rounded-[12px] border border-white/90 bg-gradient-to-br ${palettes[index]} p-3 text-left shadow-[0_12px_28px_rgba(55,68,94,0.18)] transition-all duration-300 ${active ? 'z-10 w-[61%] opacity-100' : 'w-[40%] scale-[0.92] opacity-75'}`}>
      <span className="absolute -right-5 top-[12%] h-20 w-20 rounded-full bg-white/55 blur-xl" />
      <div className="relative flex items-center justify-between gap-1 text-[6px] font-medium tracking-[0.14em] text-[#637086]"><span className="truncate">{skill.category.toUpperCase()}</span><Sparkles className="h-3 w-3 shrink-0 text-[#8d82ff]" /></div>
      <div className="relative mt-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[8px] border border-white/70 bg-white/35">
        {hasImageInput ? (
          <>
            <span className="absolute bottom-[17%] left-[12%] h-[35%] w-[27%] rounded-[8px] border border-white/90 bg-white/75 shadow-sm" />
            <span className={`relative h-[57%] w-[27%] rounded-[10px] border border-white/90 shadow-[0_8px_16px_rgba(45,61,88,0.22)] ${index % 2 === 0 ? 'bg-gradient-to-b from-[#fffdf7] via-[#f4d4ad] to-[#cf8159]' : 'bg-gradient-to-b from-[#f8fbff] via-[#dbeaf2] to-[#829eaa]'}`} />
            <span className="absolute right-[12%] top-[18%] h-[25%] w-[24%] rounded-full border border-white/90 bg-white/65" />
            <span className="absolute bottom-[13%] right-[14%] h-[3px] w-[23%] rounded-full bg-white/90" />
          </>
        ) : (
          <div className="relative w-[82%] rounded-[7px] border border-white/90 bg-white/90 p-2 shadow-sm">
            <span className="block h-1 w-1/3 rounded-full bg-[#9ab6db]" />
            <span className="mt-1 block break-words text-[9px] font-bold leading-tight text-[#3b4c66]">{skill.title}</span>
            <span className="mt-1.5 block h-1 w-full rounded-full bg-[#e1e7ef]" />
            <span className="mt-1 block h-1 w-4/5 rounded-full bg-[#e1e7ef]" />
            <span className="mt-2 block h-8 rounded-[4px] bg-gradient-to-r from-[#d9e8fa] to-[#f6dfd1]" />
          </div>
        )}
      </div>
      <div className="relative mt-2 rounded-[8px] bg-white/75 px-2 py-1.5">
        <span className="block truncate text-[8px] font-semibold text-[#3f4b60]">{active ? skill.title : label}</span>
        <span className="mt-0.5 block truncate text-[6px] text-[#8791a1]">{label} · AI DESIGN</span>
      </div>
    </button>
  );
}

function TemplateGallerySection({ section }: { section: TemplateGallerySectionData }) {
  const columns = section.kind === 'calendar' || section.kind === 'award'
    ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8'
    : section.kind === 'recent' || section.kind === 'redbook' || section.kind === 'marketing' || section.kind === 'amazon' || section.kind === 'detail' || section.kind === 'drama'
      ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-9'
      : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7';

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#30364a]">{section.title}</h2>
          <p className="mt-1 text-[11px] text-[#9aa4b7]">{section.description}</p>
        </div>
        <button type="button" className="shrink-0 text-[11px] text-[#8a95aa] hover:text-[#555d70]">更多 ›</button>
      </div>
      <div className={columns}>
        {section.items.map((item, index) => (
          <button key={item.title} type="button" className="group min-w-0 text-left transition hover:-translate-y-0.5">
            {section.kind === 'editorial' ? (
              <div className="overflow-hidden rounded-[12px] border border-[#edf0f5] bg-white shadow-[0_2px_8px_rgba(51,65,94,0.035)] transition group-hover:shadow-[0_8px_22px_rgba(51,65,94,0.1)]">
                <div className={`relative flex h-[132px] items-center justify-center overflow-hidden bg-gradient-to-br ${item.tone} px-4`}>
                  <span className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-white/25 blur-xl" />
                  <div className="relative flex items-center justify-center">
                    <TemplatePosterArtwork item={item} compact className="w-[64px] -rotate-[8deg] shadow-lg" />
                    <TemplatePosterArtwork item={item} compact className="-ml-2 w-[64px] rotate-[7deg] shadow-lg" />
                  </div>
                </div>
                <div className="flex h-[46px] items-center justify-between gap-2 px-3">
                  <span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-[#343b4b]">{item.title}</span><span className="mt-0.5 block truncate text-[10px] text-[#9aa3b2]">{item.description}</span></span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f1f3f6] text-[#6f7787]"><ChevronRight className="h-3.5 w-3.5" /></span>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[12px] border border-[#edf0f5] bg-[#f2f5fb] p-2 transition group-hover:shadow-[0_8px_22px_rgba(51,65,94,0.1)]">
                {section.kind === 'calendar' ? <TemplateCalendarArtwork item={item} index={index} /> : section.kind === 'award' || section.kind === 'recruitment' || section.kind === 'redbook' || section.kind === 'marketing' ? <TemplatePosterArtwork item={item} /> : <AgentGalleryArtwork item={item} kind={section.kind} index={index} />}
                <div className="px-1 pb-1 pt-2">
                  <span className="block truncate text-[12px] font-semibold text-[#343b4b]">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#9aa3b2]">{item.description}</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function AgentGalleryArtwork({ item, kind, index }: { item: TemplateGalleryItem; kind: TemplateGalleryKind; index: number }) {
  if (kind === 'recent') {
    return (
      <div className={`relative aspect-[1.35/1] overflow-hidden rounded-[7px] bg-gradient-to-br ${item.tone}`}>
        <span className="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute left-[13%] top-[19%] h-[68%] w-[48%] -rotate-[7deg] overflow-hidden rounded-[4px] border border-white/80 bg-white p-1.5 shadow-lg">
          <div className={`flex h-full flex-col items-center justify-center rounded-[2px] bg-gradient-to-br ${item.tone} ${item.foreground} p-1 text-center`}>
            <span className="text-[5px] tracking-widest">{item.kicker}</span><span className="mt-1 text-[9px] font-black leading-tight">{item.title}</span><span className="mt-1 h-1 w-8 rounded-full bg-current/35" />
          </div>
        </div>
        <div className="absolute right-[13%] top-[24%] h-[64%] w-[46%] rotate-[6deg] overflow-hidden rounded-[4px] border border-white/80 bg-white p-1.5 shadow-lg">
          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[2px] bg-white p-1 text-center">
            <div className={`absolute inset-x-0 top-0 h-[40%] bg-gradient-to-br ${item.tone}`} />
            <span className={`relative mt-auto text-[5px] tracking-widest ${item.foreground}`}>{item.kicker}</span><span className="relative mt-1 text-[8px] font-black leading-tight text-[#384153]">{item.title}</span><span className="relative mb-auto mt-1 text-[4px] text-[#7b8493]">{item.description}</span>
          </div>
        </div>
        <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[6px] font-medium text-[#566173]">最近编辑</span>
      </div>
    );
  }

  if (kind === 'drama') {
    return (
      <div className={`relative aspect-[3/4] overflow-hidden rounded-[7px] bg-gradient-to-br ${item.tone}`}>
        <span className="absolute -right-4 top-[10%] h-24 w-24 rounded-full bg-white/20 blur-xl" />
        <div className={`absolute left-1/2 top-[20%] h-[31%] w-[30%] -translate-x-1/2 rounded-full border-[3px] border-white/35 ${index % 3 === 1 ? 'bg-[#edc5b2]' : 'bg-[#d2a58d]'}`} />
        <div className={`absolute bottom-[14%] left-[14%] h-[43%] w-[72%] rounded-t-[48%] border-x border-t border-white/25 ${index % 2 === 0 ? 'bg-gradient-to-b from-[#ead8d0] to-[#38495e]' : 'bg-gradient-to-b from-[#ead2af] to-[#3c2b2d]'}`} />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/35 text-white"><Video className="h-3.5 w-3.5" /></span>
        <div className="absolute inset-x-2 bottom-2 text-white"><span className="block text-[6px] tracking-[0.16em] opacity-80">{item.kicker}</span><span className="mt-1 block truncate text-[13px] font-bold">{item.title}</span><span className="mt-0.5 block truncate text-[8px] opacity-80">{item.description}</span></div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-[7px] bg-gradient-to-br ${item.tone} p-2`}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[4px] border border-white/75 bg-white/90 p-2 text-[#334155] shadow-sm">
        <div className="flex items-center justify-between gap-1 border-b border-[#e8edf2] pb-1">
          <span className="truncate text-[6px] font-semibold tracking-wide">{item.kicker}</span><Sparkles className="h-2.5 w-2.5 shrink-0 text-[#f0a944]" />
        </div>
        <span className="mt-1 truncate text-[9px] font-bold">{item.title}</span>
        <div className={`relative mt-1.5 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[4px] bg-gradient-to-br ${item.tone}`}>
          <span className="absolute left-[9%] top-[17%] h-[28%] w-[23%] rounded-[4px] border border-white/80 bg-white/70 shadow-sm" />
          <span className="absolute right-[9%] top-[24%] h-[21%] w-[26%] rounded-full border border-white/80 bg-white/55 shadow-sm" />
          <span className={`relative h-[53%] w-[29%] rounded-[7px] border border-white/80 shadow-[0_5px_12px_rgba(37,53,78,0.2)] ${kind === 'amazon' ? 'bg-gradient-to-b from-[#f8faf9] via-[#d9e5e1] to-[#829b92]' : 'bg-gradient-to-b from-[#fff4e5] via-[#f5c6a4] to-[#d7826f]'}`} />
          <span className="absolute bottom-[12%] left-[12%] h-[3px] w-[29%] rounded-full bg-white/90" />
          <span className="absolute bottom-[12%] right-[12%] h-[3px] w-[22%] rounded-full bg-white/70" />
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-1">
          {['材质细节', '使用场景', '核心优势', '产品参数'].map((label, labelIndex) => <div key={label} className="rounded-[3px] bg-[#f2f5f8] px-1 py-1"><span className={`mb-1 block h-1 w-3/4 rounded-full ${labelIndex === index % 4 ? 'bg-[#52a9df]' : 'bg-[#c9d5df]'}`} /><span className="block truncate text-[5px] text-[#718093]">{label}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function TemplatePosterArtwork({ item, className = '', compact = false }: { item: TemplateGalleryItem; className?: string; compact?: boolean }) {
  return (
    <div className={`relative isolate flex aspect-[3/4] shrink-0 flex-col items-center overflow-hidden rounded-[5px] bg-gradient-to-br ${item.tone} ${item.foreground} ${compact ? 'p-1.5' : 'w-full p-3'} ${className}`}>
      <span className={`absolute -right-4 top-[28%] h-14 w-14 rounded-full opacity-25 ${item.accent}`} />
      <span className="absolute inset-[5px] rounded-[3px] border border-current/20" />
      <div className={`relative flex w-full items-center justify-between opacity-80 ${compact ? 'text-[5px]' : 'text-[7px]'}`}><span>CKT DESIGN</span><Sparkles className={compact ? 'h-2 w-2' : 'h-3 w-3'} /></div>
      <div className="relative mt-auto flex w-full flex-col items-center pb-1 text-center">
        <span className={`font-medium tracking-[0.14em] opacity-80 ${compact ? 'text-[5px]' : 'text-[7px]'}`}>{item.kicker}</span>
        <span className={`mt-1 max-w-full font-black leading-tight drop-shadow-sm ${compact ? 'text-[9px]' : 'text-[clamp(14px,1vw,22px)]'}`}>{item.title}</span>
        <span className={`mt-1 max-w-full truncate rounded-full px-2 py-0.5 font-medium ${compact ? 'text-[4px]' : 'text-[7px]'} ${item.accent} text-white`}>{item.description}</span>
      </div>
      <div className={`relative mt-auto flex w-full items-center justify-between border-t border-current/20 pt-1 opacity-75 ${compact ? 'text-[4px]' : 'text-[6px]'}`}><span>CREATE · INSPIRE</span><span>2027</span></div>
    </div>
  );
}

function TemplateCalendarArtwork({ item, index }: { item: TemplateGalleryItem; index: number }) {
  const months = ['JAN', 'FEB', 'MAR', 'APR'];
  return (
    <div className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-[7px] bg-white p-1.5 shadow-sm">
      <div className={`relative flex h-[48%] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[4px] bg-gradient-to-br ${item.tone} ${item.foreground}`}>
        <span className={`absolute -right-4 -top-3 h-16 w-16 rounded-full opacity-40 ${item.accent}`} />
        <span className="relative text-[7px] font-medium tracking-[0.13em]">{item.kicker}</span>
        <span className="relative mt-1 text-[clamp(17px,1.5vw,30px)] font-black leading-none">{item.title}</span>
        <span className="relative mt-1 text-[7px] font-medium tracking-[0.2em]">新年 · 新愿 · 新开始</span>
        <span className="absolute bottom-1.5 left-2 h-4 w-8 rounded-t-full bg-white/20" />
        <span className="absolute bottom-1.5 right-2 h-6 w-6 rounded-full border border-white/30 bg-white/15" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1 p-1">
        {months.map((month, monthIndex) => (
          <div key={month} className="rounded-[3px] border border-[#edf0f4] p-1">
            <div className={`mb-1 text-center text-[6px] font-bold ${monthIndex === index % 4 ? 'text-[#e55247]' : 'text-[#778294]'}`}>{month}</div>
            <div className="grid grid-cols-4 gap-[2px]">
              {Array.from({ length: 12 }, (_, day) => <i key={day} className={`h-[3px] rounded-[1px] ${day === (index + monthIndex * 2) % 12 ? 'bg-[#f28f70]' : 'bg-[#dce2ea]'}`} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillCard({ skill, index, hot = index < 2, onClick }: { skill: SkillDefinition; index: number; hot?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex min-h-[88px] w-full items-center gap-3 rounded-[14px] bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(74,92,132,0.09)]">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[#2a303a]">{skill.title}{hot ? <span className="rounded-[4px] bg-[#ffe9e4] px-1.5 py-0.5 text-[9px] font-medium text-[#f07358]">热门</span> : null}</span>
        <span className="mt-1 block truncate text-[11px] text-[#989eaa]">{skill.description}</span>
      </span>
      <span className={`relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] border border-[#edf0f2] ${index % 4 === 0 ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100' : index % 4 === 1 ? 'bg-gradient-to-br from-sky-100 via-white to-blue-100' : index % 4 === 2 ? 'bg-gradient-to-br from-fuchsia-100 via-violet-50 to-blue-100' : 'bg-gradient-to-br from-emerald-100 via-white to-lime-100'}`}>
        <span className="absolute inset-2 rounded-md border border-white/80 bg-white/60 shadow-sm" />
        {index % 4 === 0 ? <ImageIcon className="relative h-6 w-6 text-[#e08754]" /> : index % 4 === 1 ? <Camera className="relative h-6 w-6 text-[#588ebc]" /> : index % 4 === 2 ? <Sparkles className="relative h-6 w-6 text-[#8174db]" /> : <WandSparkles className="relative h-6 w-6 text-[#6f9a71]" />}
      </span>
    </button>
  );
}

function FeatureArt({ kind }: { kind: string }) {
  const common = 'relative ml-2 flex h-[72px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[11px]';
  if (kind === 'calendar') return <div className={`${common} bg-[linear-gradient(135deg,#c1e6ff,#82b8f2)]`}><div className="grid h-[70px] w-[88px] grid-cols-3 gap-1 rounded-lg bg-white/90 p-2 shadow-sm">{Array.from({ length: 9 }, (_, i) => <i key={i} className={`rounded-sm ${i === 4 ? 'bg-[#43a4ff]' : 'bg-[#d5e9ff]'}`} />)}</div><span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-[#ffd34e]" /></div>;
  if (kind === 'video') return <div className={`${common} bg-[#e8edf5]`}><div className="flex h-[70px] w-[95px] items-center justify-center rounded-lg border border-white bg-[linear-gradient(135deg,#d7e4f4,#a7c7e8)]"><Video className="h-9 w-9 text-[#557594]" /><span className="absolute rounded-full bg-white/80 p-1.5"><Video className="h-4 w-4 text-[#6b58ef]" /></span></div></div>;
  if (kind === 'poster') return <div className={`${common} bg-[#ddf5f3]`}><div className="h-[70px] w-[48px] rounded-[6px] bg-[linear-gradient(180deg,#fbffff,#a8d4ff)] p-2 shadow-sm"><span className="block h-3 rounded-sm bg-[#5d93ff]"/><span className="mt-2 block h-1.5 w-7 rounded bg-[#9dbaff]"/></div><div className="ml-2 h-[70px] w-[48px] rounded-[6px] bg-[linear-gradient(180deg,#fef8ed,#ffa689)] p-2 shadow-sm"><span className="block h-3 rounded-sm bg-[#ff795d]"/><span className="mt-2 block h-1.5 w-7 rounded bg-[#ffc38f]"/></div></div>;
  if (kind === 'watermark') return <div className={`${common} bg-[linear-gradient(135deg,#dff5fa,#b0e2f6)]`}><div className="h-[65px] w-[98px] rounded-lg bg-[linear-gradient(135deg,#315c93,#8ec0ee)] p-2"><div className="mt-7 h-5 rounded bg-white/40"/><span className="absolute right-5 top-4 h-4 w-4 rounded-sm bg-white/80"/></div></div>;
  if (kind === 'commerce-set') return <div className={`${common} bg-[linear-gradient(135deg,#f2e0d5,#f7eee5)]`}><div className="h-[66px] w-[45px] -rotate-[8deg] rounded bg-[linear-gradient(180deg,#f5e8d8,#c08f70)] shadow"/><div className="-ml-2 h-[72px] w-[49px] rotate-[5deg] rounded bg-[linear-gradient(180deg,#f4f4ee,#b7b9a7)] p-1 shadow"><div className="h-8 rounded bg-white/60"/><div className="mt-1 h-3 rounded bg-black/10"/></div></div>;
  if (kind === 'ppt') return <div className={`${common} bg-[linear-gradient(135deg,#dfeeff,#c6d7ff)]`}><div className="relative h-[70px] w-[100px] rounded-lg bg-white p-2 shadow"><div className="h-2 w-12 rounded bg-[#5b7cff]"/><div className="mt-2 h-7 rounded bg-[linear-gradient(135deg,#a7d8ff,#827dff)]"/><div className="mt-2 flex gap-1"><span className="h-2 w-7 rounded bg-[#e5ebf8]"/><span className="h-2 w-7 rounded bg-[#e5ebf8]"/></div></div></div>;
  if (kind === 'recruitment') return <div className={`${common} bg-[linear-gradient(135deg,#fff1b3,#d7f0a4)]`}><div className="flex gap-1"><span className="h-[72px] w-[32px] rounded bg-[linear-gradient(180deg,#f8e857,#45bfa2)] shadow"/><span className="h-[58px] w-[32px] rounded bg-[linear-gradient(180deg,#ff8b81,#fff0b6)] shadow"/><span className="h-[66px] w-[32px] rounded bg-[linear-gradient(180deg,#4aa4e8,#cbf2ff)] shadow"/></div></div>;
  if (kind === 'cutout') return <div className={`${common} bg-[linear-gradient(135deg,#d9edff,#f8fbff)]`}><span className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[linear-gradient(140deg,#355f9a,#ffba9d)] text-white"><UserRound className="h-9 w-9" /></span></div>;
  if (kind === 'print') return <div className={`${common} bg-[#edf2f1]`}><FileImage className="h-12 w-12 text-[#538ad1]" /><span className="absolute right-5 top-4 h-9 w-5 rounded-sm bg-[#fb565a]" /></div>;
  return <div className={`${common} bg-[#e7eaf3]`}><Shirt className="h-12 w-12 text-[#4b566a]" /><Sparkles className="absolute right-5 top-4 h-4 w-4 text-[#7065e9]" /></div>;
}
