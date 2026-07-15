import React, { useState } from 'react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';
import {
  ArrowRight,
  Bot,
  Box,
  ChevronDown,
  BriefcaseBusiness,
  BrushCleaning,
  Camera,
  CirclePlus,
  Crown,
  Gift,
  Globe,
  Grid2x2,
  Home,
  ImagePlus,
  ImageUpscale,
  Info,
  LayoutGrid,
  LayoutTemplate,
  Menu,
  Package,
  PanelsTopLeft,
  PencilRuler,
  PlaySquare,
  Puzzle,
  Search,
  Sparkles,
  Star,
  SquarePen,
  Triangle,
  User,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';

type TopMode = 'design' | 'agent' | 'image' | 'video';
type PluginSectionKey = 'create' | 'template' | 'commerce' | 'image' | 'video' | 'team' | 'mine';

interface PluginPrototypePageProps {
  onBack: () => void;
  onOpenCanvas: () => void;
}

const leftNavItems = [
  { label: '首页', icon: Home, active: true },
  { label: 'AI工具', icon: Bot },
  { label: '跨境工具', icon: Globe },
  { label: '图片工具', icon: BriefcaseBusiness },
  { label: '模板', icon: LayoutTemplate },
  { label: '素材', icon: Triangle },
  { label: '空间', icon: Box },
];

const quickAbilities = [
  { label: '创建设计', icon: CirclePlus },
  { label: '无限画布', icon: Sparkles, action: 'canvas' as const },
  { label: 'AI抠图', icon: Search },
  { label: 'AI电商', icon: Package },
  { label: 'AI印刷设计', icon: PencilRuler },
  { label: 'AI图片', icon: ImagePlus },
  { label: '海报', icon: LayoutTemplate },
  { label: '公众号', icon: PanelsTopLeft },
  { label: 'AI消除', icon: BrushCleaning },
  { label: '图片编辑', icon: SquarePen },
];

const morningCards = [
  { title: 'MORNING', subtitle: '早安太阳花', tint: 'from-sky-500 via-cyan-500 to-blue-700' },
  { title: '早安·你好', subtitle: 'Morning', tint: 'from-sky-300 via-cyan-200 to-lime-100' },
  { title: '休闲时光', subtitle: '海边气泡', tint: 'from-blue-600 via-sky-500 to-orange-300' },
  { title: '早餐时刻', subtitle: '暖咖色', tint: 'from-amber-300 via-orange-400 to-stone-700' },
];

const calendarCards = [
  { title: '女神节', date: '02.14 周五', tag: '今天', tone: 'border-blue-400 text-blue-600' },
  { title: '春分', date: '02.14 周五', tag: '今天', tone: 'border-stone-200 text-stone-700' },
  { title: '三月你好', date: '02.14 周五', tag: '15天后', tone: 'border-stone-200 text-stone-700' },
];

const posterCards = [
  { title: '女神节快乐', code: '871 Q211', tint: 'from-pink-100 via-rose-100 to-red-200' },
  { title: '38妇女节', code: '女神节海报', tint: 'from-orange-100 via-pink-100 to-fuchsia-200' },
  { title: 'Happy Women’s Day', code: '节日模板', tint: 'from-rose-50 via-pink-100 to-orange-100' },
];

const featureTabs = ['热门推荐', 'AI商拍', '跨境电商', '视频工具', 'POD设计', '图片处理'];

const featureCards = [
  {
    title: '商品套图',
    desc: '一键生成套图详情页',
    tint: 'from-white via-rose-50 to-purple-50',
  },
  {
    title: '爆款视频生成',
    desc: '爆款带货视频生成',
    tint: 'from-white via-sky-50 to-cyan-50',
  },
  {
    title: '图片翻译',
    desc: '跨境商品一键翻译',
    tint: 'from-white via-amber-50 to-orange-50',
  },
  {
    title: '合规标签',
    desc: '标准标签快速生成',
    tint: 'from-white via-emerald-50 to-cyan-50',
  },
];

const pluginRail: Array<{ key: PluginSectionKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'create', label: '创作', icon: Sparkles },
  { key: 'template', label: '模板', icon: LayoutTemplate },
  { key: 'commerce', label: '电商', icon: Package },
  { key: 'image', label: '图片', icon: ImageUpscale },
  { key: 'video', label: '视频', icon: PlaySquare },
  { key: 'team', label: '团队', icon: User },
  { key: 'mine', label: '我的', icon: User },
];

const topModes: Array<{ key: TopMode; label: string }> = [
  { key: 'design', label: '设计模板' },
  { key: 'agent', label: 'Agent创作' },
  { key: 'image', label: '图片生成' },
  { key: 'video', label: '视频生成' },
];

const templateFilterGroups = [
  { label: '分类：', items: ['推荐', '海报', '新媒体', 'PPT', '电商', '印刷物料'], active: '推荐' },
  { label: '场景：', items: ['推荐', '每日一签', '手机海报', '全屏海报', '更多'], active: '推荐' },
  { label: '行业：', items: ['全部', '通用', '教育培训', '餐饮美食', '金融', '更多'], active: '全部' },
];

const templateWaterfallCards = [
  { title: '春光正好', subtitle: '春风拂面，万物舒展', tint: 'from-[#f8ffe8] via-[#d9ff9b] to-[#fff28e]', height: 'h-[250px]' },
  { title: '春分', subtitle: '把春天分一半给你', tint: 'from-[#eef8ff] via-[#dff7e5] to-[#b9e66a]', height: 'h-[190px]' },
  { title: '国家喊你减肥了！', subtitle: '一起来养成健康生活', tint: 'from-[#ef9863] via-[#d8642c] to-[#8f3d18]', height: 'h-[150px]' },
  { title: '春分无腰福利计划', subtitle: '200-20 限时促销', tint: 'from-[#76d9ff] via-[#69c8fb] to-[#f8b4d9]', height: 'h-[168px]' },
  { title: '春分', subtitle: '亭亭玉立 春色正好', tint: 'from-[#f7f0e4] via-[#d6e7b8] to-[#87ba66]', height: 'h-[300px]' },
  { title: '春分', subtitle: '太阳昼长，日渐生长', tint: 'from-[#20312a] via-[#3f6a4b] to-[#9ed967]', height: 'h-[210px]' },
  { title: '春分时至 万物知晓', subtitle: '蝶恋花开 春色正当时', tint: 'from-[#6ed1ff] via-[#3190ff] to-[#2e49f0]', height: 'h-[226px]' },
  { title: '春分', subtitle: '仲春片片，樱花半开', tint: 'from-[#f7fff3] via-[#cce8d0] to-[#6fa1f2]', height: 'h-[268px]' },
];

export function PluginPrototypePage({ onBack, onOpenCanvas }: PluginPrototypePageProps) {
  const [activeMode, setActiveMode] = useState<TopMode>('agent');
  const [isPluginOpen, setIsPluginOpen] = useState(true);
  const [activePluginSection, setActivePluginSection] = useState<PluginSectionKey>('create');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginGuideBar = !isLoggedIn ? (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-[18px] border border-[#edf0f7] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(98,111,151,0.06)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e9edf5] bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fb_100%)] text-[#b3b9c8]">
          <User className="h-5 w-5" />
        </div>
        <div className="truncate text-[13px] font-medium text-[#2d3447]">
          一键注册登录，免费获得海量设计营销方案
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsLoggedIn(true)}
        className="shrink-0 rounded-[10px] bg-[linear-gradient(180deg,#5c667d_0%,#49536b_100%)] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(73,83,107,0.16)]"
      >
        立即登录
      </button>
    </div>
  ) : null;

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f3f5ff_0%,#f8f9fe_52%,#fbfbff_100%)] text-stone-900">
      <div className="border-b border-[#d7ddea] bg-[linear-gradient(180deg,#dfe8f8_0%,#d7e1f2_100%)] px-4 py-3 shadow-[inset_0_-1px_0_rgba(255,255,255,0.72)]">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#28c840] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" />
          </div>

          <div className="flex h-9 min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-[14px] bg-[rgba(189,205,233,0.72)] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
              {[
                '创客贴',
                'Figma',
                'AHub',
                '百度',
                '抖音',
                '项目打标',
                '设计站',
                '插件',
              ].map((tab, index) => (
                <div
                  key={tab}
                  className={`flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[11px] font-medium ${
                    index === 7
                      ? 'bg-[linear-gradient(180deg,#fdfefe_0%,#eef3fb_100%)] text-stone-900 shadow-[0_1px_1px_rgba(84,99,135,0.14)]'
                      : 'text-stone-600'
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-[4px] ${
                      index === 7 ? 'bg-[linear-gradient(135deg,#4f7fff_0%,#7b61ff_100%)]' : 'bg-white/70'
                    }`}
                  />
                  <span className="whitespace-nowrap">{tab}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1.5 pl-2 text-stone-600">
                <button type="button" className="rounded-[10px] bg-white/55 p-1.5">
                  <X className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="rounded-[10px] bg-white/55 p-1.5">
                  <CirclePlus className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="rounded-[10px] bg-white/55 p-1.5">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
          </div>
        </div>

        <div className="mt-2 flex w-full items-center gap-3">
          <div className="flex items-center gap-2 text-stone-500">
            <button type="button" className="rounded-[12px] bg-[rgba(255,255,255,0.62)] p-2 shadow-[0_1px_1px_rgba(93,106,139,0.06)]">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button type="button" className="rounded-[12px] bg-[rgba(255,255,255,0.62)] p-2 shadow-[0_1px_1px_rgba(93,106,139,0.06)]">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(180deg,#eef3fb_0%,#e9eff8_100%)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_1px_2px_rgba(92,106,141,0.06)]">
            <Info className="h-4.5 w-4.5 shrink-0 text-stone-500" />
            <span className="truncate text-[14px] font-medium text-stone-700">localhost:3002/plugin-prototype</span>
            <div className="ml-auto flex items-center gap-3 text-stone-500">
              <Star className="h-4.5 w-4.5" />
              <Menu className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPluginOpen((prev) => !prev)}
              className={`flex items-center gap-2 rounded-[14px] border px-2.5 py-2 shadow-[0_1px_2px_rgba(92,106,141,0.08)] transition ${
                isPluginOpen
                  ? 'border-[#c4d6fb] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)] text-[#2f6cff]'
                  : 'border-white/70 bg-[rgba(255,255,255,0.62)] text-stone-600'
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#49a0ff_0%,#7b61ff_100%)] text-white">
                <Puzzle className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] leading-none text-stone-400">侧边插件</div>
                <div className="mt-1 text-[12px] font-semibold">{isPluginOpen ? '已开启' : '点击打开'}</div>
              </div>
            </button>
            <div className="rounded-full bg-[rgba(255,255,255,0.62)] p-2 shadow-[0_1px_2px_rgba(92,106,141,0.08)]">
              <User className="h-4.5 w-4.5 text-[#7b61ff]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-118px)]">
        <section className="relative flex min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[18%] top-[2%] h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(142,180,255,0.22)_0%,rgba(142,180,255,0)_72%)]" />
            <div className="absolute left-[30%] top-[30%] h-[320px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0)_74%)]" />
            <div className="absolute bottom-[15%] left-[10%] h-[360px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,224,241,0.34)_0%,rgba(255,224,241,0)_74%)]" />
            <div className="absolute bottom-[8%] right-[18%] h-[300px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(205,235,255,0.26)_0%,rgba(205,235,255,0)_72%)]" />
          </div>

          <div className="relative z-10 flex w-[94px] shrink-0 flex-col border-r border-white/60 bg-white/18 px-2.5 pb-5 pt-4 backdrop-blur-[18px]">
            <div className="pl-1 text-[24px] font-black tracking-[-0.1em] text-[#232323]">易可图</div>

            <div className="mt-8 flex flex-col gap-3.5">
              {leftNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.label}>
                    <button
                      type="button"
                      className={`flex flex-col items-center gap-2 rounded-[20px] px-2 py-3.5 text-[13px] font-medium transition ${
                        item.active
                          ? 'border-2 border-[#2f73ff] bg-white text-stone-900 shadow-[0_12px_32px_rgba(62,96,255,0.14)]'
                          : 'text-stone-500 hover:bg-white/70 hover:text-stone-900'
                      }`}
                    >
                      <Icon className={`${item.active ? 'h-6.5 w-6.5' : 'h-6 w-6'}`} />
                      <span>{item.label}</span>
                    </button>
                    {item.label === '图片工具' && <div className="mx-auto my-1 h-px w-9 bg-[#dfe4ef]" />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="mt-auto flex h-[118px] items-end justify-center">
              <div className="rounded-2xl border border-[#d8deeb] bg-white/72 p-2 text-stone-500 shadow-[0_10px_22px_rgba(81,97,138,0.08)]">
                <PanelsTopLeft className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="relative z-10 min-w-0 flex-1 px-7 pb-8 pt-4">
            <div className="flex items-center justify-end gap-3">
              <div className="rounded-full bg-[linear-gradient(180deg,#ffe7bf_0%,#ffd79f_100%)] px-4 py-1.5 text-[13px] font-semibold text-[#8f5d09] shadow-[0_10px_20px_rgba(255,207,129,0.26)]">
                推广返现
              </div>
              <div className="rounded-2xl bg-[linear-gradient(180deg,#ffd5de_0%,#ffc7d4_100%)] p-2 text-[#ef5b7b] shadow-[0_10px_20px_rgba(255,183,201,0.22)]">
                <Gift className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/56 px-4 py-2.5 shadow-[0_12px_24px_rgba(98,111,151,0.08)] backdrop-blur-sm">
                <div className="flex items-center gap-1 text-[13px] font-semibold text-stone-700">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  0
                </div>
                <div className="text-[13px] text-stone-600">充值</div>
                <div className="flex items-center gap-1 rounded-xl bg-[#292622] px-3 py-2 text-[13px] font-semibold text-[#f6d79c]">
                  <Crown className="h-3.5 w-3.5" />
                  升级会员
                </div>
              </div>
              <div className="rounded-full bg-white/70 p-2 shadow-sm">
                <User className="h-5.5 w-5.5 text-stone-400" />
              </div>
            </div>

            <div className="mx-auto mt-9 max-w-[1120px]">
              <div className="text-center text-[31px] font-black tracking-[-0.065em] text-stone-900">
                <span className="bg-[linear-gradient(90deg,#8f5cff_0%,#4f7fff_100%)] bg-clip-text text-transparent">
                  易可图
                </span>{' '}
                电商人都在用的设计平台
              </div>

              <div className="relative mt-8">
                <div className="flex items-end justify-center gap-4">
                  <div className="flex rounded-[24px] border border-white/70 bg-[#eef1f7] p-1 shadow-[0_12px_30px_rgba(58,72,115,0.08)]">
                    <button
                      type="button"
                      className="min-w-[138px] rounded-[17px] bg-white px-7 py-2.5 text-[17px] font-semibold text-stone-800 shadow-[0_10px_18px_rgba(87,105,160,0.08)]"
                    >
                      Agent
                    </button>
                    <button
                      type="button"
                      className="min-w-[132px] rounded-[17px] px-7 py-2.5 text-[17px] font-semibold text-stone-400"
                    >
                      搜索
                    </button>
                  </div>

                  <div className="mb-1.5 flex items-center gap-4 text-[16px] font-semibold text-stone-700">
                    <div className="-rotate-[14deg] rounded-[18px] border border-white/70 bg-[linear-gradient(180deg,#b78144_0%,#e7c79b_100%)] px-4 py-2.5 text-white shadow-[0_16px_32px_rgba(162,109,52,0.22)]">
                      套图详情页
                    </div>
                    <div className="flex items-center gap-2">
                      <ImagePlus className="h-4.5 w-4.5" />
                      商品换背景
                    </div>
                    <div className="h-5 w-px bg-stone-300" />
                    <div className="flex items-center gap-2">
                      <SquarePen className="h-4.5 w-4.5" />一句话改图
                    </div>
                  </div>
                </div>

                <div className="mx-auto max-w-[920px] rounded-[28px] border border-[#edf1fb] bg-white/92 px-7 pb-6 pt-6 shadow-[0_22px_54px_rgba(91,101,133,0.12)] backdrop-blur-sm">
                  <div className="flex gap-5">
                    <div className="relative flex h-[124px] w-[84px] shrink-0 items-center justify-center rounded-[22px] border border-white/90 bg-[linear-gradient(180deg,#f5efff_0%,#eef3ff_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.84),0_14px_34px_rgba(105,111,177,0.12)]">
                      <div className="absolute inset-[10px] rounded-[18px] border border-white/70" />
                      <CirclePlus className="relative z-10 h-9 w-9 text-[#7058ff]" />
                    </div>

                    <div className="flex min-h-[190px] flex-1 flex-col justify-between">
                      <div className="pt-3 text-[16px] font-medium text-[#c5cad8]">
                        请上传图片，并描述您想完成的任务
                      </div>
                      <div className="flex justify-end">
                        <div className="relative">
                          <div className="absolute -left-1 top-0 rounded-full bg-[#ff684a] px-2 py-1 text-[12px] font-semibold text-white shadow-[0_8px_16px_rgba(255,104,74,0.24)]">
                            限时优惠
                          </div>
                          <button
                            type="button"
                            className="mt-3 flex h-[48px] w-[84px] items-center justify-center rounded-full bg-[#f1f5fb] text-stone-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                          >
                            <ArrowRight className="h-6 w-6 -rotate-45" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-[1.18fr_0.82fr] gap-5">
                <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#f3e9ff_0%,#f9f4ff_48%,#fff5f1_100%)] p-7 shadow-[0_20px_46px_rgba(93,102,131,0.08)]">
                  <div className="absolute -right-16 -top-14 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_70%)]" />
                  <div className="inline-flex rounded-full bg-[#8c59ff] px-4 py-2 text-[15px] font-bold text-white shadow-sm">
                    商品套图 全新升级
                  </div>
                  <div className="mt-5 text-[23px] font-black leading-tight tracking-[-0.05em] text-[#1f2a6b]">
                    一图成组 惊艳细节
                  </div>
                  <div className="mt-3 text-[16px] font-medium text-[#8d8cb0]">视觉营销一步到位</div>
                  <button
                    type="button"
                    className="mt-7 inline-flex items-center gap-2 text-[16px] font-semibold text-stone-800"
                  >
                    立即体验
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>

                  <div className="absolute bottom-5 right-4 flex items-end gap-3">
                    <div className="rotate-[-9deg] rounded-[16px] bg-white p-3 shadow-[0_14px_30px_rgba(115,89,188,0.12)]">
                      <div className="h-14 w-14 rounded-[12px] bg-[radial-gradient(circle_at_45%_40%,#545454_0%,#252525_58%,#111_100%)]" />
                    </div>
                    <div className="grid h-[196px] w-[238px] rotate-[-7deg] grid-cols-3 gap-2 overflow-hidden rounded-[22px] bg-white/72 p-3 shadow-[0_18px_40px_rgba(115,89,188,0.14)]">
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`rounded-[14px] ${
                            idx % 3 === 0
                              ? 'bg-[linear-gradient(180deg,#f7e4e0_0%,#d4baa4_100%)]'
                              : idx % 3 === 1
                                ? 'bg-[linear-gradient(180deg,#ded9f5_0%,#a7abcf_100%)]'
                                : 'bg-[linear-gradient(180deg,#e7d5c9_0%,#b99376_100%)]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5">
                  {[
                    { title: '图片编辑', icon: ImageUpscale, tint: 'from-[#f0f7ff] to-[#f8fbff]' },
                    { title: '创建设计', icon: CirclePlus, tint: 'from-[#fff8fb] to-[#fcf7ff]' },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        type="button"
                        onClick={card.title === '创建设计' ? onOpenCanvas : undefined}
                        className={`flex items-center justify-between rounded-[26px] border border-white/70 bg-[linear-gradient(135deg,${card.tint === 'from-[#f0f7ff] to-[#f8fbff]' ? '#f0f7ff,#f8fbff' : '#fff8fb,#fcf7ff'})] px-7 py-7 text-left shadow-[0_18px_40px_rgba(93,102,131,0.08)]`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="rounded-[16px] bg-white p-3 shadow-sm">
                            <Icon className="h-7 w-7 text-stone-800" />
                          </div>
                          <div className="text-[19px] font-black tracking-[-0.04em] text-stone-900">{card.title}</div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-10 rounded-[32px] border border-white/70 bg-white/92 px-6 py-6 shadow-[0_20px_54px_rgba(91,101,133,0.10)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    {featureTabs.map((tab, index) => (
                      <button
                        key={tab}
                        type="button"
                        className={`relative text-[18px] font-semibold ${
                          index === 0 ? 'text-stone-900' : 'text-stone-500'
                        }`}
                      >
                        {tab}
                        {index === 0 && (
                          <span className="absolute -bottom-2 left-0 h-[4px] w-[42px] rounded-full bg-[linear-gradient(90deg,#7aaeff_0%,#b08cff_100%)]" />
                        )}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="text-[18px] font-semibold text-stone-400">
                    更多功能
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-5">
                  {featureCards.map((card, index) => (
                    <div
                      key={card.title}
                      className={`relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,${card.tint
                        .replace('from-', '')
                        .replace(' via-', ',')
                        .replace(' to-', ',')})] p-7`}
                    >
                      <div className="text-[18px] font-black text-stone-900">{card.title}</div>
                      <div className="mt-3 text-[16px] text-stone-500">{card.desc}</div>
                      <div className="mt-8 h-[150px] overflow-hidden rounded-[22px] bg-white/75 p-3 shadow-inner">
                        <div
                          className={`grid h-full w-full gap-2 ${
                            index === 0 ? 'grid-cols-[1.05fr_0.95fr]' : index === 1 ? 'grid-cols-[1fr]' : 'grid-cols-2'
                          }`}
                        >
                          {index === 0 && (
                            <>
                              <div className="rounded-[18px] bg-[linear-gradient(180deg,#fff7f8_0%,#f8d9dd_100%)]" />
                              <div className="grid gap-2">
                                <div className="rounded-[16px] bg-[linear-gradient(180deg,#f8eef3_0%,#e2bfd1_100%)]" />
                                <div className="rounded-[16px] bg-[linear-gradient(180deg,#fef2d9_0%,#efc189_100%)]" />
                              </div>
                            </>
                          )}
                          {index === 1 && (
                            <div className="rounded-[18px] bg-[linear-gradient(135deg,#eef9ff_0%,#dcecff_45%,#e5f5ff_100%)]" />
                          )}
                          {index === 2 && (
                            <>
                              <div className="rounded-[18px] bg-[linear-gradient(180deg,#fff2de_0%,#f8c88f_100%)]" />
                              <div className="rounded-[18px] bg-[linear-gradient(180deg,#fff9ef_0%,#f6ddaf_100%)]" />
                            </>
                          )}
                          {index === 3 && (
                            <>
                              <div className="rounded-[18px] bg-[linear-gradient(180deg,#eaf9f0_0%,#bde9cf_100%)]" />
                              <div className="rounded-[18px] bg-[linear-gradient(180deg,#effcff_0%,#ccecf5_100%)]" />
                            </>
                          )}
                        </div>
                      </div>
                      {index === 1 && (
                        <div className="absolute bottom-5 right-5 rounded-[24px] bg-[linear-gradient(135deg,#e8fbff_0%,#dbf0ff_45%,#eef6ff_100%)] p-4 shadow-[0_18px_30px_rgba(80,138,200,0.12)]">
                          <div className="text-[18px] font-black text-[#3157d2]">作图难？</div>
                          <div className="mt-1 text-[14px] font-semibold text-[#3f74df]">点我3步出图</div>
                          <div className="mt-3 inline-flex rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">
                            点击体验
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-8 flex flex-col gap-3">
              {!isPluginOpen && (
                <button
                  type="button"
                  onClick={() => setIsPluginOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-4 py-3 text-sm font-semibold text-stone-700 shadow-[0_12px_32px_rgba(91,101,133,0.14)] backdrop-blur-sm transition hover:bg-white"
                >
                  <PanelsTopLeft className="h-4.5 w-4.5" />
                  打开插件
                </button>
              )}
              <div className="rounded-full bg-white p-4 shadow-[0_12px_32px_rgba(91,101,133,0.12)]">
                <Gift className="h-6 w-6 text-orange-500" />
              </div>
              <div className="rounded-full bg-white p-4 shadow-[0_12px_32px_rgba(91,101,133,0.12)]">
                <Bot className="h-6 w-6 text-[#ffb000]" />
              </div>
              <div className="rounded-full bg-white p-4 shadow-[0_12px_32px_rgba(91,101,133,0.12)]">
                <Grid2x2 className="h-6 w-6 text-stone-700" />
              </div>
            </div>
          </div>
        </section>

        {isPluginOpen && (
          <aside className="flex h-screen w-[492px] shrink-0 border-l border-[#e8edf7] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)]">
          <div className="min-w-0 flex-1 px-8 pb-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={cktAiEcomLogo}
                  alt="创客贴"
                  className="h-10 w-auto shrink-0"
                />
                <div className="pt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-stone-400">小插件</div>
              </div>
            </div>

            {activePluginSection === 'template' ? (
              <div className="mt-6">
                {loginGuideBar}

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-[18px] border border-[#edf0f7] bg-white px-4 py-3 text-left shadow-[0_14px_30px_rgba(98,111,151,0.06)]"
                >
                  <Search className="h-4.5 w-4.5 text-[#96a0b5]" />
                  <span className="text-[14px] text-[#9aa3b7]">搜索模板，如：春分海报、电商主图、邀请函</span>
                </button>

                <div className="mt-3 space-y-3 rounded-[22px] border border-[#edf0f7] bg-white px-4 py-4 shadow-[0_18px_38px_rgba(98,111,151,0.06)]">
                  {templateFilterGroups.map((group) => (
                    <div key={group.label} className="flex items-start gap-3">
                      <div className="w-[48px] pt-1.5 text-[13px] font-medium text-[#5f6b85]">{group.label}</div>
                      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-2">
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`rounded-[9px] px-3 py-1.5 text-[13px] font-medium leading-none transition ${
                              group.active === item
                                ? 'bg-[#eff2f8] text-stone-900'
                                : item === '更多'
                                  ? 'text-[#47546f]'
                                  : 'text-[#2e3547]'
                            }`}
                          >
                            {item}
                            {item === '更多' ? <span className="ml-1 text-[12px]">⌄</span> : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 columns-3 gap-4 space-y-4">
                  {templateWaterfallCards.map((card, index) => (
                    <button
                      key={`${card.title}-${index}`}
                      type="button"
                      className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-[20px] bg-white text-left shadow-[0_14px_26px_rgba(88,104,160,0.08)]"
                    >
                      <div className={`relative overflow-hidden bg-gradient-to-b ${card.tint} ${card.height} p-4`}>
                        <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-white/70" />
                        <div className="absolute left-3 top-3 h-3 w-10 rounded-full bg-white/55" />
                        <div className="absolute left-4 top-9 h-1.5 w-16 rounded-full bg-white/45" />

                        {index === 0 && (
                          <>
                            <div className="absolute -bottom-8 -left-6 h-36 w-36 rounded-full bg-[#fff68d]/95" />
                            <div className="absolute bottom-10 left-8 h-24 w-6 rounded-full bg-[#74b742]" />
                            <div className="absolute bottom-16 left-12 h-16 w-20 rounded-[60px_60px_0_60px] bg-[#a8e95d]/90 rotate-[-18deg]" />
                            <div className="absolute bottom-24 left-4 h-12 w-14 rounded-[0_50px_50px_50px] bg-[#8cd449]/90 rotate-[18deg]" />
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(218,244,180,0)_0%,rgba(181,226,96,0.95)_100%)]" />
                            <div className="absolute left-8 top-12 h-16 w-16 rounded-full bg-white/40 blur-[2px]" />
                            <div className="absolute left-16 top-20 h-20 w-1 bg-white/50 rotate-[28deg]" />
                            <div className="absolute left-24 top-24 h-24 w-1 bg-white/35 rotate-[22deg]" />
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_35%)]" />
                            <div className="absolute right-10 top-8 h-20 w-20 rounded-full border-[12px] border-[#4aa0d8] shadow-[0_8px_18px_rgba(0,0,0,0.12)]" />
                            <div className="absolute bottom-8 left-10 h-20 w-28 rotate-[-8deg] rounded-[10px] bg-white/95 shadow-[0_10px_18px_rgba(0,0,0,0.14)]" />
                            <div className="absolute bottom-16 left-16 h-3 w-14 rounded-full bg-[#f0912f]" />
                            <div className="absolute bottom-10 left-16 h-3 w-10 rounded-full bg-[#f0912f]/75" />
                          </>
                        )}
                        {index === 3 && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,198,230,0.45)_100%)]" />
                            <div className="absolute right-5 bottom-6 h-24 w-24 rounded-full bg-[#ff86c5]/80" />
                            <div className="absolute left-5 top-8 h-4 w-20 rounded-full bg-[#1a2444]/75" />
                            <div className="absolute left-5 top-16 space-y-2">
                              <div className="h-3 w-24 rounded-full bg-[#d8ff44]" />
                              <div className="h-3 w-20 rounded-full bg-[#d8ff44]" />
                              <div className="h-3 w-16 rounded-full bg-[#d8ff44]" />
                            </div>
                          </>
                        )}
                        {index === 4 && (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_24%)]" />
                            <div className="absolute bottom-0 left-0 right-0 h-28 bg-[linear-gradient(180deg,rgba(77,112,74,0)_0%,rgba(81,128,63,0.82)_100%)]" />
                            <div className="absolute bottom-14 left-6 h-28 w-1 rounded-full bg-[#473928]" />
                            <div className="absolute bottom-28 left-0 h-20 w-24 rounded-full bg-[#44793e]/90 blur-[1px]" />
                            <div className="absolute bottom-8 right-6 h-4 w-12 rounded-full bg-white/80" />
                          </>
                        )}
                        {index === 5 && (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_22%)]" />
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(105,162,255,0.55)_100%)]" />
                            <div className="absolute left-8 top-16 h-28 w-28 rounded-full bg-white/45" />
                            <div className="absolute left-14 top-22 h-10 w-10 rounded-full bg-[#a6d737]" />
                            <div className="absolute left-24 top-26 h-12 w-12 rounded-full bg-[#f6de48]" />
                            <div className="absolute left-34 top-30 h-10 w-10 rounded-full bg-[#8ad7ff]" />
                          </>
                        )}
                        {index === 6 && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,184,219,0.28)_100%)]" />
                            <div className="absolute left-10 top-20 h-24 w-24 rounded-full bg-white/65" />
                            <div className="absolute left-16 top-28 h-5 w-5 rounded-full bg-[#f2d587]" />
                            <div className="absolute left-28 top-30 h-5 w-5 rounded-full bg-[#e29bff]" />
                            <div className="absolute left-40 top-26 h-4 w-4 rounded-full bg-[#ffd38a]" />
                          </>
                        )}
                        {index === 7 && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(147,181,255,0.42)_100%)]" />
                            <div className="absolute left-12 top-12 h-18 w-18 rounded-full bg-white/70" />
                            <div className="absolute left-14 top-18 h-2 w-10 rounded-full bg-[#90ba55]" />
                            <div className="absolute left-18 top-22 h-24 w-1 rounded-full bg-[#6b9345]" />
                            <div className="absolute left-26 top-16 h-20 w-1 rounded-full bg-[#6b9345]" />
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  {loginGuideBar}

                  <div className="grid w-full grid-cols-4 rounded-[24px] rounded-b-none border border-[#e6ebf6] border-b-0 bg-[linear-gradient(180deg,#f7f9ff_0%,#f1f4fb_100%)] p-1.5 pb-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_rgba(98,111,151,0.06)]">
                    {topModes.map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setActiveMode(mode.key)}
                        className={`min-w-0 whitespace-nowrap rounded-[18px] px-3 py-3 text-[13px] font-semibold tracking-[-0.02em] transition ${
                          activeMode === mode.key
                            ? 'bg-[linear-gradient(180deg,#ffffff_0%,#fcfdff_100%)] text-stone-900 shadow-[0_10px_18px_rgba(88,104,160,0.10)]'
                            : 'text-[#6c7488] hover:text-stone-900'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[24px] rounded-t-none border border-[#cbc7ff] bg-[linear-gradient(180deg,#ffffff_0%,#fcfbff_100%)] px-4 py-4 shadow-[0_14px_32px_rgba(129,125,255,0.10)]">
                    <div className="text-[14px] font-medium text-stone-300">
                      输入一句话描述你的需求，让AI帮你规划和设计
                    </div>
                    <div className="mt-10 flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-[12px] border border-[#eceef7] bg-white px-3.5 py-2 text-[13px] font-semibold text-stone-700"
                        >
                          ✧ Agent模式
                        </button>
                        <button
                          type="button"
                          className="rounded-[12px] border border-[#eceef7] bg-white px-3.5 py-2 text-[13px] font-semibold text-stone-700"
                        >
                          ￮ 自动
                        </button>
                      </div>
                      <button
                        type="button"
                        className="rounded-[12px] bg-[linear-gradient(180deg,#f1efff_0%,#ebe8ff_100%)] px-4 py-2.5 text-[13px] font-semibold text-[#7a71ff]"
                      >
                        开始设计
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-5 gap-x-3 gap-y-5">
                  {quickAbilities.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.action === 'canvas' ? onOpenCanvas : undefined}
                        className="group flex flex-col items-center gap-2 text-center"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fcfdff_0%,#f4f7fd_100%)] text-stone-700 shadow-[inset_0_0_0_1px_rgba(232,236,248,0.86),0_8px_18px_rgba(97,112,150,0.06)] transition group-hover:-translate-y-0.5">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-[13px] font-medium text-stone-600">{item.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-9">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[16px] font-black text-stone-900">每日一签</div>
                      <div className="mt-1 text-[12px] text-stone-400">每日一签，开启一天好心情</div>
                    </div>
                    <button type="button" className="text-sm font-semibold text-stone-400">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {morningCards.map((card) => (
                      <button
                        key={card.title}
                        type="button"
                        className={`relative aspect-[0.63] overflow-hidden rounded-[16px] bg-gradient-to-b ${card.tint} p-3 text-left text-white shadow-[0_14px_26px_rgba(88,104,160,0.10)]`}
                      >
                        <div className="absolute left-3 top-3 h-2.5 w-10 rounded-full bg-white/65" />
                        <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-white/75" />
                        {card.title === 'MORNING' && (
                          <>
                            <div className="absolute left-1/2 top-[36%] h-16 w-16 -translate-x-1/2 rounded-full bg-[#ffd84f]" />
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="absolute left-1/2 top-[36%] h-7 w-3 -translate-x-1/2 rounded-full bg-[#ffe9a2]"
                                style={{ transform: `translateX(-50%) rotate(${idx * 45}deg) translateY(-28px)` }}
                              />
                            ))}
                            <div className="absolute left-1/2 top-[36%] h-8 w-8 -translate-x-1/2 rounded-full bg-[#ff9cc1]" />
                            <div className="absolute bottom-0 left-1/2 h-20 w-1 -translate-x-1/2 bg-[#5ea14c]" />
                          </>
                        )}
                        {card.title === '早安·你好' && (
                          <>
                            <div className="absolute right-5 top-8 h-14 w-14 rounded-full bg-white/45" />
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(172,230,122,0.92)_100%)]" />
                            <div className="absolute left-10 top-20 h-14 w-1 rounded-full bg-white/60 rotate-[24deg]" />
                            <div className="absolute left-20 top-24 h-18 w-1 rounded-full bg-white/40 rotate-[18deg]" />
                          </>
                        )}
                        {card.title === '休闲时光' && (
                          <>
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,160,90,0)_0%,rgba(255,163,108,0.82)_100%)]" />
                            <div className="absolute left-8 top-14 h-16 w-12 rounded-[30px] bg-white/30 blur-[1px]" />
                            <div className="absolute left-16 top-18 h-20 w-10 rounded-[22px] bg-white/40" />
                          </>
                        )}
                        {card.title === '早餐时刻' && (
                          <>
                            <div className="absolute bottom-8 right-5 h-14 w-20 rounded-[18px] bg-white/80 shadow-[0_8px_18px_rgba(0,0,0,0.12)]" />
                            <div className="absolute bottom-18 right-9 h-7 w-12 rounded-t-full border-4 border-white/70 border-b-0" />
                            <div className="absolute bottom-12 right-8 h-2 w-10 rounded-full bg-[#9c6232]/50" />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] font-black text-stone-900">热点日历</div>
                    <button type="button" className="text-[13px] font-semibold text-stone-400">
                      更多
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {calendarCards.map((card) => (
                      <div key={card.title} className={`rounded-[15px] border bg-white px-4 py-3 shadow-[0_8px_18px_rgba(97,112,150,0.04)] ${card.tone}`}>
                        <div className="flex items-start justify-between">
                          <div className="text-[14px] font-semibold">{card.title}</div>
                          <div className="rounded-full bg-[#fff1f1] px-2 py-1 text-[11px] font-semibold text-[#ff6b6b]">
                            {card.tag}
                          </div>
                        </div>
                        <div className="mt-3 text-[12px] text-stone-400">{card.date}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {posterCards.map((card) => (
                      <button
                        key={card.title}
                        type="button"
                        className={`relative aspect-[0.68] overflow-hidden rounded-[16px] bg-gradient-to-b ${card.tint} p-4 text-left shadow-[0_14px_28px_rgba(88,104,160,0.08)]`}
                      >
                        <div className="absolute left-4 top-4 h-2.5 w-10 rounded-full bg-white/60" />
                        <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-white/70" />
                        {card.title === '女神节快乐' && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,189,205,0.55)_100%)]" />
                            <div className="absolute left-8 bottom-12 h-24 w-24 rounded-full bg-white/38" />
                            <div className="absolute right-6 bottom-10 h-32 w-20 rounded-[100px_100px_0_100px] bg-[#f67aa8]/75" />
                          </>
                        )}
                        {card.title === '38妇女节' && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,178,196,0.52)_100%)]" />
                            <div className="absolute left-8 top-14 h-12 w-12 rounded-full bg-[#ffc77b]/90" />
                            <div className="absolute left-5 top-24 h-26 w-26 rounded-full bg-[#ffd2df]/90" />
                            <div className="absolute right-6 bottom-8 h-18 w-18 rounded-full bg-white/42" />
                          </>
                        )}
                        {card.title === 'Happy Women’s Day' && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,211,150,0.38)_100%)]" />
                            <div className="absolute left-8 top-16 h-18 w-12 rounded-[24px] bg-[#ffb46a]/90 rotate-[18deg]" />
                            <div className="absolute left-16 top-8 h-28 w-14 rounded-[24px] bg-[#ffddb6]/82 rotate-[-20deg]" />
                            <div className="absolute right-8 top-20 h-16 w-10 rounded-[20px] bg-[#f28ba7]/84 rotate-[12deg]" />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative flex w-[74px] shrink-0 flex-col items-center border-l border-[#edf0fa] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] py-16">
            <button
              type="button"
              onClick={() => setIsPluginOpen(false)}
              className="absolute left-1/2 top-5 -translate-x-1/2 rounded-[16px] p-2 text-stone-400 transition hover:bg-stone-50 hover:text-stone-700"
              aria-label="关闭插件"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col gap-4">
              {pluginRail.map((item) => {
                const Icon = item.icon;
                const active = activePluginSection === item.key;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActivePluginSection(item.key)}
                    className={`flex flex-col items-center gap-2 text-[12px] font-medium ${
                      active ? 'text-[#2f6cff]' : 'text-stone-500'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[14px] shadow-[0_8px_20px_rgba(97,112,150,0.04)] ${
                        active ? 'bg-[linear-gradient(180deg,#eaf2ff_0%,#f4f8ff_100%)] text-[#2f6cff]' : 'bg-white text-stone-500'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </aside>
        )}
      </div>
    </div>
  );
}
