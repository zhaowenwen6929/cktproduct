import React, { useMemo, useRef, useState } from 'react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';
import {
  Bell,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileImage,
  Grid2x2,
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  Plus,
  Puzzle,
  Search,
  Settings2,
  Shirt,
  Sparkles,
  Upload,
  UserRound,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';
import { GenerationAttachment } from '../types';

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

const skillCategories = ['电商设计', '海报设计', '品牌营销', '企业宣传', '新媒体运营', '文案策划', '企业办公', '专业内容', '图片处理', '视频处理', '服饰穿戴', '文旅娱乐', '产品包装'];
const skillPickerCategories = ['最近使用', ...skillCategories, '全部技能'];

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
  { title: 'AI爆款视频', desc: '一键生成带货视频', art: 'video' },
  { title: 'AI海报/封面', desc: '一键生成营销海报', art: 'poster' },
  { title: 'AI去水印', desc: '无痕去水印', art: 'watermark' },
  { title: '高级感A+图', desc: '全方位展示细节，还原产品真实性', art: 'detail' },
  { title: '电商主图', desc: '一键生成爆款主图', art: 'commerce' },
  { title: '智能抠图', desc: '一键抠图', art: 'cutout' },
  { title: '印刷定制', desc: '点击即可快速开始', art: 'print' },
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
  { label: 'AI工具', icon: Sparkles },
  { label: '创建', icon: Plus },
  { label: '我的', icon: UserRound },
  { label: '团队', icon: BriefcaseBusiness },
];

interface AgentSkillsHomePageProps {
  onBackToDirectory: () => void;
  onOpenCanvas: () => void;
  onStartCanvasGeneration: (prompt: string, attachments?: GenerationAttachment[]) => void;
}

export function AgentSkillsHomePage({ onBackToDirectory, onOpenCanvas, onStartCanvasGeneration }: AgentSkillsHomePageProps) {
  const [mode, setMode] = useState<HomeMode>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [homePrompt, setHomePrompt] = useState('');
  const [homeAttachments, setHomeAttachments] = useState<GenerationAttachment[]>([]);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('最近使用');
  const [activeHomeSkillCategory, setActiveHomeSkillCategory] = useState('电商设计');
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, FieldValue>>>({});
  const skillsRailRef = useRef<HTMLDivElement>(null);

  const visibleSkills = useMemo(() => {
    const base = activeCategory === '最近使用'
      ? recentSkillIds.map((id) => skills.find((item) => item.id === id)).filter((item): item is SkillDefinition => Boolean(item))
      : activeCategory === '全部技能'
        ? skills
        : skills.filter((item) => item.category === activeCategory);
    if (!searchTerm.trim()) return base;
    return base.filter((item) => `${item.title}${item.description}`.includes(searchTerm.trim()));
  }, [activeCategory, searchTerm]);
  const homepageSkillRows = useMemo(() => {
    const filteredSkills = activeHomeSkillCategory === '全部技能'
      ? aiSkillRows.flat().map((id) => skills.find((skill) => skill.id === id)).filter((skill): skill is SkillDefinition => Boolean(skill))
      : skills.filter((skill) => skill.category === activeHomeSkillCategory);
    return Array.from({ length: Math.ceil(filteredSkills.length / 6) }, (_, index) => filteredSkills.slice(index * 6, index * 6 + 6));
  }, [activeHomeSkillCategory]);

  const selectedValues = selectedSkill ? fieldValues[selectedSkill.id] ?? {} : {};
  const promptPreview = selectedSkill ? makePrompt(selectedSkill, selectedValues) : '';
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

  const openSkillPicker = (category = '最近使用') => {
    setSelectedSkill(null);
    setActiveCategory(category);
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
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-[#20263a]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[56px] flex-col items-center border-r border-[#e8edf7] bg-[#f3f7ff] py-3">
        <button type="button" onClick={onBackToDirectory} className="mb-7 flex h-8 w-8 items-center justify-center rounded-lg text-[#75839e] hover:bg-white" title="返回目录"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex w-full flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.label} type="button" className={`flex w-[44px] flex-col items-center gap-1 rounded-[10px] py-2 text-[10px] ${item.active ? 'bg-[#dceaff] text-[#2677ed]' : 'text-[#63708a] hover:bg-white/80'}`}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span></button>;
          })}
        </div>
        <div className="mt-auto flex flex-col items-center gap-3 pb-2 text-[10px] text-[#64728b]">
          <button type="button" className="flex flex-col items-center gap-1"><UserRound className="h-[18px] w-[18px]" />成员</button>
          <button type="button" className="flex flex-col items-center gap-1"><Settings2 className="h-[18px] w-[18px]" />管理</button>
        </div>
      </aside>

      <header className="fixed left-[56px] right-0 top-0 z-20 flex h-[56px] items-center justify-between bg-white/95 px-6 backdrop-blur">
        <button type="button" onClick={onBackToDirectory} className="flex items-center"><img src={cktAiEcomLogo} alt="创客贴" className="h-[30px] w-auto" /></button>
        <div className="flex items-center gap-5 text-[#5e6679]">
          <button type="button" className="text-[12px]">印刷店</button>
          <Grid2x2 className="h-[17px] w-[17px]" />
          <span className="relative"><Bell className="h-[18px] w-[18px]" /><i className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff4c48] text-[9px] not-italic text-white">4</i></span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9c6aa,#8ba6bb)] text-white"><UserRound className="h-4 w-4" /></span>
        </div>
      </header>

      <main className="ml-[56px] pt-[56px]">
        <section className={`relative ${mode === 'templates' ? 'min-h-[240px]' : 'min-h-[325px]'} overflow-hidden bg-[radial-gradient(ellipse_at_50%_25%,#eef1ff_0%,#f8f9ff_48%,#ffffff_82%)] px-4 pb-7 pt-[28px]`}>
          <div className="pointer-events-none absolute left-[38%] top-[12px] h-32 w-32 rounded-full bg-white/80 blur-3xl" />
          <div className="pointer-events-none absolute right-[28%] top-[10px] h-36 w-36 rounded-full bg-[#d8e4ff]/50 blur-3xl" />
          <h1 className="relative text-center text-[21px] font-semibold tracking-[0.04em] text-[#30364a]">今天你想做些什么？</h1>

          <div className="relative mx-auto mt-5 flex h-12 w-fit items-end justify-center gap-1.5">
            {modeOptions.map((option) => {
              const isSelected = mode === option.key;
              const isTemplate = option.key === 'templates';
              return (
                <div key={option.key} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMode(option.key)}
                    className={`relative -skew-x-6 rounded-t-[15px] border px-5 transition-all duration-200 ${isSelected ? 'z-20 h-11 min-w-[156px] border-[#2784ff] bg-white text-[13px] font-semibold text-[#272d40] shadow-[0_7px_18px_rgba(39,132,255,0.16)]' : 'z-10 h-9 min-w-[142px] border-[#e9edf6] bg-white/65 text-[12px] font-medium text-[#8b93a7] hover:bg-white'}`}
                  >
                    <span className="block skew-x-6">{option.label}</span>
                  </button>
                  {isSelected ? (
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute -right-[24px] -top-[14px] z-30 rotate-[5deg] rounded-[10px] border border-white bg-white p-[3px] shadow-[0_6px_18px_rgba(73,114,190,0.22)] transition-all duration-200 ${isTemplate ? 'h-[56px] w-[46px]' : 'h-[52px] w-[42px]'}`}
                    >
                      <div className={`relative flex h-full items-center justify-center overflow-hidden rounded-[7px] ${isTemplate ? 'bg-[linear-gradient(155deg,#d8f4ff_0%,#7ec5ff_48%,#7267ff_100%)]' : 'bg-[linear-gradient(155deg,#e8e3ff_0%,#9a91ff_52%,#695cff_100%)]'}`}>
                        {isTemplate ? (
                          <>
                            <div className="absolute left-1.5 top-1.5 h-1.5 w-5 rounded-full bg-white/80" />
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 h-6 rounded-[4px] border border-white/80 bg-[linear-gradient(145deg,#fff6cc_0%,#ffb568_48%,#fa6e69_100%)] shadow-sm" />
                            <LayoutTemplate className="relative z-10 h-4 w-4 text-white drop-shadow" />
                          </>
                        ) : (
                          <>
                            <div className="absolute left-1.5 top-1.5 h-2 w-4 rounded-full bg-white/80" />
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 h-5 rounded-[4px] border border-white/80 bg-[linear-gradient(145deg,#f5f1ff_0%,#c4bcff_100%)] shadow-sm" />
                            <Sparkles className="relative z-10 h-4 w-4 text-white drop-shadow" />
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {mode === 'templates' ? (
            <div className="relative mx-auto -mt-0 flex h-[52px] max-w-[710px] items-center gap-3 rounded-[17px] border-2 border-[#2784ff] bg-white px-3 shadow-[0_12px_25px_rgba(55,95,158,0.14)]">
              <Search className="h-4 w-4 shrink-0 text-[#9aa3b6]" />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="输入关键词搜索你想要的模板或素材" className="min-w-0 flex-1 text-[12px] outline-none placeholder:text-[#a5adc0]" />
              <button type="button" className="rounded-[9px] bg-[#1677f8] px-5 py-2 text-[12px] font-medium text-white">搜索</button>
            </div>
          ) : (
            <div className="relative mx-auto -mt-0 max-w-[710px] rounded-[17px] border-2 border-[#7166ff] bg-white px-3.5 pb-3 pt-3 shadow-[0_12px_25px_rgba(87,92,197,0.14)]">
              <textarea value={homePrompt} onChange={(event) => setHomePrompt(event.currentTarget.value)} placeholder="上传参考图片，描述下您想要的内容，我们会为您呈现~" className="h-[58px] w-full resize-none bg-transparent text-[12px] leading-5 text-[#394156] outline-none placeholder:text-[#a7b0c3]" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-[#edf0f5] text-[#8490a5]"><Plus className="h-4 w-4" /></button>
                  {homeAttachments.length > 0 ? <span className="text-[10px] text-[#758198]">已添加 {homeAttachments.length} 张参考图</span> : null}
                  <button type="button" onClick={() => openSkillPicker()} className="flex h-7 items-center gap-1.5 rounded-[9px] border border-[#eef0f5] px-2.5 text-[11px] font-medium text-[#3c4353] hover:border-[#cbc7ff] hover:text-[#5c5cfc]"><Sparkles className="h-3.5 w-3.5" />Agent模式</button>
                  <button type="button" className="flex h-7 items-center gap-1.5 rounded-[9px] border border-[#eef0f5] px-2.5 text-[11px] text-[#555d70]"><FileImage className="h-3.5 w-3.5" />自动</button>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="润色" className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#edf0f5] text-[#7f8cff]"><WandSparkles className="h-4 w-4" /></button>
                  <button type="button" disabled={!homePrompt.trim()} onClick={() => onStartCanvasGeneration(homePrompt.trim(), homeAttachments)} className={`rounded-[8px] px-3.5 py-1.5 text-[11px] font-semibold text-white ${homePrompt.trim() ? 'bg-[#695cff] hover:bg-[#5c50ee]' : 'bg-[#d6d7dc]'}`}>生成</button>
                </div>
              </div>
            </div>
          )}

          <div className="relative mx-auto mt-2 flex max-w-[710px] flex-wrap items-center justify-center gap-2">
            {(mode === 'templates'
              ? ['🟠 中秋', '🍂 邀请函', '🟥 小红书', '无图画布', 'AI电商', '喜报', '✨ 展架·次日达', '🇨🇳 2027台历模板']
              : ['🔔 提示词库', '🛍 商品套图Agent', '👗 服饰穿搭Agent', '🎨 海报Agent', '🎬 视频Agent']).map((tag, index) => {
              const skillId = ['product-set', 'apparel-styling', 'poster', 'video-agent'][index - 1];
              return (
                <button key={tag} type="button" onClick={() => skillId ? selectSkillFromChip(skillId) : openSkillPicker()} className="rounded-[7px] bg-[#f4f6fb] px-2.5 py-1 text-[10px] font-medium text-[#687187] hover:bg-[#eaf0ff] hover:text-[#4d63bd]">{tag}</button>
              );
            })}
          </div>
        </section>

        {mode === 'agent' ? (
          <section className="mx-auto max-w-[1920px] px-6 pb-7">
            <div className="mb-2 flex items-center gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap text-[11px] font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {skillCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveHomeSkillCategory(category);
                      skillsRailRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                    }}
                    aria-pressed={activeHomeSkillCategory === category}
                    className={`relative shrink-0 py-1.5 transition-colors ${activeHomeSkillCategory === category ? 'text-[#303749] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:bg-[#8377ff]' : 'text-[#7d879a] hover:text-[#303749]'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => openSkillPicker('全部技能')} className="flex shrink-0 items-center gap-0.5 py-1.5 text-[11px] font-medium text-[#7d879a] hover:text-[#5c5cfc]">
                全部技能<ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[16px] bg-[#f5f6f9] p-2">
              <div ref={skillsRailRef} className="space-y-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {homepageSkillRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex w-max gap-2.5">
                    {row.map((skill, columnIndex) => (
                      <div key={skill.id} className="w-[300px] shrink-0">
                        <SkillCard skill={skill} index={columnIndex + 2} hot={columnIndex === 0} onClick={() => selectSkillFromChip(skill.id)} />
                      </div>
                    ))}
                  </div>
                ))}
                {homepageSkillRows.length === 0 ? <div className="flex h-[170px] w-full items-center justify-center rounded-[12px] bg-white text-[12px] text-[#9ba3b2]">该分类下暂无技能</div> : null}
              </div>
              <button type="button" onClick={() => skillsRailRef.current?.scrollBy({ left: 620, behavior: 'smooth' })} aria-label="查看更多 skills" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#525b6d] shadow-[0_4px_14px_rgba(52,65,92,0.18)]"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </section>
        ) : (
          <section className="mx-auto grid max-w-[1920px] grid-cols-1 gap-3 px-6 pb-7 xl:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
            <div className="grid grid-cols-2 grid-rows-[132px_88px] gap-3">
              <button type="button" className="relative col-span-2 overflow-hidden rounded-[17px] border border-[#ececf8] bg-[linear-gradient(110deg,#f2f2ff_0%,#f8f8ff_72%,#fff_100%)] px-5 py-4 text-left">
                <span className="block text-[14px] font-semibold text-[#4e5872]">创建设计</span>
                <span className="mt-1 block text-[10px] text-[#9aa3b8]">高频创作场景一键直达</span>
                <span className="absolute bottom-5 left-5 flex h-7 w-7 items-center justify-center rounded-full border border-[#edf0ff] bg-white text-[#8176ff]">›</span>
                <span className="absolute right-5 top-6 flex h-[82px] w-[78px] items-center justify-center rounded-[13px] border border-[#e3e9ff] bg-white/75 shadow-[0_6px_18px_rgba(77,127,255,0.08)]"><span className="flex h-12 w-12 items-center justify-center border border-dashed border-[#7aaaff] text-[#3985ff]"><Plus className="h-5 w-5" /></span></span>
              </button>
              <button type="button" onClick={onOpenCanvas} className="rounded-[15px] border border-[#eef0f5] bg-[linear-gradient(120deg,#f8fbff,#fff)] px-4 py-3 text-left hover:border-[#ccd9ff]"><span className="block text-[13px] font-semibold text-[#515a70]">无限画布</span><span className="mt-1 block text-[10px] text-[#9da7ba]">点击即可快速开始</span></button>
              <button type="button" className="rounded-[15px] border border-[#eef0f5] bg-[linear-gradient(120deg,#f8f9ff,#fff)] px-4 py-3 text-left"><span className="block text-[13px] font-semibold text-[#515a70]">图片编辑</span><span className="mt-1 block text-[10px] text-[#9da7ba]">点击即可快速开始</span></button>
            </div>

            <div className="rounded-[17px] bg-[#f3f6fc] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-[#7d879a]">
                  {['热门推荐', 'AI商拍', '模板特效', '视频创作', 'POD印花', '图片处理', '印刷制作'].map((tab, index) => <button key={tab} type="button" className={index === 0 ? 'relative text-[#252b3b] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-6 after:bg-[#8e80ff]' : 'hover:text-[#252b3b]'}>{tab}</button>)}
                </div>
                <button type="button" className="shrink-0 text-[10px] text-[#8490a6]">更多 ›</button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 2xl:grid-cols-4">
                {homepageFeatureCards.map((card) => (
                  <div key={card.title} className="relative flex h-[80px] min-w-0 items-center justify-between overflow-hidden rounded-[14px] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(58,71,101,0.025)]">
                    <div className="relative z-10 min-w-0">
                      <div className="truncate text-[12px] font-semibold text-[#303749]">{card.title}</div>
                      <div className="mt-1 truncate text-[10px] text-[#9aa4b7]">{card.desc}</div>
                    </div>
                    <FeatureArt kind={card.art} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {mode === 'agent' ? (
          <section className="mx-auto max-w-[1920px] space-y-8 px-6 pb-12">
            {agentGallerySections.map((section) => <TemplateGallerySection key={section.title} section={section} />)}
          </section>
        ) : null}

        {mode === 'templates' ? (
          <section className="mx-auto max-w-[1920px] px-6 pb-16">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-semibold text-[#30364a]">为你推荐</h2><button type="button" className="text-[11px] text-[#8a95aa]">更多 ›</button></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              {templateCards.map((card, index) => (
                <button key={card.title} type="button" className="overflow-hidden rounded-[12px] border border-[#edf0f6] bg-[#f4f7fc] p-2 text-left">
                  <div className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[6px] bg-gradient-to-br ${card.tone} p-4 text-center text-white`}>
                    <span className="absolute inset-2 rounded border border-white/25" />
                    <span className="relative drop-shadow-sm"><span className="block text-[9px] font-medium tracking-[0.15em]">{card.kicker}</span><span className="mt-3 block text-[15px] font-black leading-tight">{card.title}</span><span className="mt-2 block text-[8px] opacity-80">CREATE · INSPIRE · DESIGN</span></span>
                    {index === 0 ? <span className="absolute bottom-5 left-0 right-0 h-12 bg-[linear-gradient(180deg,transparent,rgba(16,54,112,.5))]" /> : null}
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
      </main>

      <button type="button" className="fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7a879b] shadow-[0_5px_22px_rgba(63,78,112,0.17)]"><CircleHelp className="h-5 w-5" /></button>

      {skillPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172035]/35 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSkillPickerOpen(false); setSelectedSkill(null); } }}>
          <div className="relative flex h-[min(640px,calc(100vh-48px))] w-[min(1120px,calc(100vw-48px))] overflow-hidden rounded-[24px] bg-[#f7f8fb] shadow-[0_30px_90px_rgba(21,31,55,0.26)]">
            <aside className="w-[190px] shrink-0 overflow-y-auto border-r border-[#eaedf3] bg-[#f4f5f8] px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {skillPickerCategories.map((category) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`mb-1.5 flex h-[43px] w-full items-center gap-3 rounded-[11px] px-3 text-left text-[13px] ${activeCategory === category ? 'bg-[#eaedf4] font-medium text-[#293142]' : 'text-[#41495a] hover:bg-white/75'}`}>
                  {category === '最近使用' ? <Clock3 className="h-[17px] w-[17px]" /> : category === '全部技能' ? <Grid2x2 className="h-[17px] w-[17px]" /> : <Puzzle className="h-[17px] w-[17px]" />}{category}
                </button>
              ))}
            </aside>
            <div className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="text-[16px] font-semibold text-[#252b37]">{activeCategory}</div>
                <div className="flex h-9 w-[220px] items-center gap-2 rounded-[10px] bg-white px-3 text-[#9ba3b3]"><Search className="h-4 w-4" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="搜索 Agent skills" className="min-w-0 flex-1 text-[12px] text-[#333b4c] outline-none placeholder:text-[#a0a7b4]" /></div>
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
            <button type="button" onClick={() => { setSkillPickerOpen(false); setSelectedSkill(null); }} aria-label="关闭" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#202634] shadow"><X className="h-4 w-4" /></button>
          </div>
        </div>
      ) : null}

      {selectedSkill ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1b2335]/40 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSkill(null); }}>
          <section className="relative flex h-[min(760px,calc(100vh-40px))] w-[min(1080px,calc(100vw-40px))] overflow-hidden rounded-[22px] bg-white shadow-[0_28px_90px_rgba(25,35,57,0.28)]">
            <aside className="hidden w-[42%] shrink-0 flex-col border-r border-[#eceff4] bg-[#f5f6f9] p-6 lg:flex">
              <SkillResultPreview skill={selectedSkill} />
            </aside>
            <div className="relative flex min-w-0 flex-1 flex-col bg-white">
              <div className="flex h-[66px] shrink-0 items-center border-b border-[#f0f1f4] px-5 sm:px-6">
                <button type="button" onClick={() => setSelectedSkill(null)} className="mr-2 rounded-full p-1 text-[#1f2632] hover:bg-[#f3f4f7]" aria-label="返回技能分类"><ChevronLeft className="h-5 w-5" /></button>
                <h2 className="text-[16px] font-semibold text-[#202631]">{selectedSkill.title}</h2>
                <button type="button" onClick={() => { setSelectedSkill(null); setSkillPickerOpen(false); }} className="ml-auto rounded-full p-2 text-[#6b7280] hover:bg-[#f4f5f7]" aria-label="关闭"><X className="h-4 w-4" /></button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-5 sm:px-7">
                {renderSkillFields()}
                <div className="mt-2 rounded-[12px] border border-[#edf0f5] bg-[#fbfcfe] p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-[#858da0]"><Sparkles className="h-3.5 w-3.5 text-[#8378ff]" />生成提示词预览</div>
                  <p className="line-clamp-3 whitespace-pre-line text-[11px] leading-5 text-[#858da0]">{promptPreview}</p>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-[#eff0f2] bg-white px-5 py-4 sm:px-7">
                <button type="button" onClick={bringIntoPrompt} className="h-[44px] shrink-0 rounded-[12px] bg-[#f3f4f6] px-4 text-[13px] font-medium text-[#8d929a] transition hover:bg-[#e9ebf0] hover:text-[#3b4353]">带入输入框</button>
                <button type="button" disabled={!hasRequiredValues} onClick={startGeneration} className={`h-[44px] flex-1 rounded-[12px] text-[13px] font-semibold text-white transition ${hasRequiredValues ? 'bg-[#615cff] hover:bg-[#514bea]' : 'cursor-not-allowed bg-[#d9d9dc]'}`}>开始生成</button>
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
  const common = 'relative ml-2 flex h-[58px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-[10px]';
  if (kind === 'calendar') return <div className={`${common} bg-[linear-gradient(135deg,#b9e6ff,#92c7ff)]`}><div className="grid h-[44px] w-[50px] grid-cols-3 gap-1 rounded-md bg-white/90 p-1">{Array.from({ length: 9 }, (_, i) => <i key={i} className={`rounded-sm ${i === 4 ? 'bg-[#43a4ff]' : 'bg-[#d5e9ff]'}`} />)}</div></div>;
  if (kind === 'video') return <div className={`${common} bg-[#e8edf5]`}><div className="flex h-[43px] w-[58px] items-center justify-center rounded-md border border-white bg-[#d7e4f4]"><Video className="h-6 w-6 text-[#557594]" /><span className="absolute rounded-full bg-white/80 p-1"><Video className="h-3 w-3 text-[#6b58ef]" /></span></div></div>;
  if (kind === 'poster') return <div className={`${common} bg-[#ddf5f3]`}><div className="h-[44px] w-[29px] rounded-[4px] bg-[linear-gradient(180deg,#fbffff,#a8d4ff)] p-1 shadow-sm"><span className="block h-2 rounded-sm bg-[#5d93ff]"/><span className="mt-1 block h-1 w-4 rounded bg-[#9dbaff]"/></div><div className="ml-1 h-[44px] w-[29px] rounded-[4px] bg-[linear-gradient(180deg,#fef8ed,#ffa689)] p-1 shadow-sm"><span className="block h-2 rounded-sm bg-[#ff795d]"/><span className="mt-1 block h-1 w-4 rounded bg-[#ffc38f]"/></div></div>;
  if (kind === 'watermark') return <div className={`${common} bg-[linear-gradient(135deg,#dff5fa,#b0e2f6)]`}><div className="h-[40px] w-[56px] rounded-md bg-[linear-gradient(135deg,#315c93,#8ec0ee)] p-1"><div className="mt-4 h-4 rounded bg-white/40"/><span className="absolute right-3 top-3 h-3 w-3 rounded-sm bg-white/80"/></div></div>;
  if (kind === 'commerce') return <div className={`${common} bg-[#f3e8dc]`}><div className="h-10 w-7 rounded bg-[linear-gradient(180deg,#dec2aa,#966644)] shadow"/><div className="ml-1 h-8 w-7 rounded bg-[linear-gradient(180deg,#f4f4ee,#b7b9a7)] shadow"/></div>;
  if (kind === 'cutout') return <div className={`${common} bg-[linear-gradient(135deg,#d9edff,#f8fbff)]`}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(140deg,#355f9a,#ffba9d)] text-white"><UserRound className="h-5 w-5" /></span></div>;
  if (kind === 'print') return <div className={`${common} bg-[#edf2f1]`}><FileImage className="h-8 w-8 text-[#538ad1]" /><span className="absolute right-3 top-2 h-6 w-3 rounded-sm bg-[#fb565a]" /></div>;
  return <div className={`${common} bg-[#e7eaf3]`}><Shirt className="h-8 w-8 text-[#4b566a]" /><Sparkles className="absolute right-3 top-2 h-3 w-3 text-[#7065e9]" /></div>;
}
