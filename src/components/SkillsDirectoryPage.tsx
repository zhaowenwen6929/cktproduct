import React, { useMemo, useState } from 'react';
import { ChevronRight, Search, Sparkles } from 'lucide-react';

export interface SkillsDirectoryCard {
  id: string;
  skillId: string;
  title: string;
  description: string;
  category: string;
  image: string;
  badge?: string;
  tags?: string[];
}

export interface SkillsDirectorySection {
  id: string;
  title: string;
  cards: SkillsDirectoryCard[];
}

interface SkillsDirectoryPageProps {
  sections: SkillsDirectorySection[];
  onSelectSkill: (skillId: string) => void;
}

interface SkillsCategoryShowcaseProps {
  sections: SkillsDirectorySection[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectSkill: (skillId: string) => void;
}

const categoryTabs = ['推荐', '电商设计', '服饰穿戴', '视频创作', '品牌设计', '海报设计', '自媒体营销', '办公设计', '图像处理'];
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=84`;

const imageByCard = {
  model: image('photo-1529139574466-a303027c1d8b'),
  snacks: image('photo-1556742049-0cfed4f6a45d'),
  skateboard: image('photo-1520045892732-304bc3ac5d8e'),
  dog: image('photo-1558788353-f76d92427f16'),
  clothes: image('photo-1521572163474-6864f9cf17ab'),
  tumbler: image('photo-1495474472287-4d71bcdd2085'),
  toy: image('photo-1559454403-b8fb88521f11'),
  social: image('photo-1558655146-d09347e92766'),
  package: image('photo-1585386959984-a4155228c6b1'),
  poster: image('photo-1541701494587-cb58502866ab'),
  green: image('photo-1547887538-e3a2f32cb1cc'),
  headphones: image('photo-1505740420928-5e560c06d30e'),
  sport: image('photo-1517836357463-d25dfeac3438'),
  earrings: image('photo-1535632066927-ab7c9ab60908'),
  jacket: image('photo-1551488831-00ddcb6c6bd3'),
};

function SkillImage({ card }: { card: SkillsDirectoryCard }) {
  return (
    <div className="skills-reference-card__image-wrap">
      <span className="skills-reference-card__fallback">{card.title}</span>
      <img src={card.image} alt="" className="skills-reference-card__image" loading="lazy" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.opacity = '0'; }} />
      <span className="skills-reference-card__image-shade" />
      {card.badge ? <span className="skills-reference-card__badge">{card.badge}</span> : null}
      {card.tags?.length ? <span className="skills-reference-card__tags">{card.tags.map((tag) => <i key={tag}>{tag}</i>)}</span> : null}
    </div>
  );
}

function SkillCard({ card, onSelectSkill }: { card: SkillsDirectoryCard; onSelectSkill: (skillId: string) => void }) {
  return (
    <button type="button" className="skills-reference-card" onClick={() => onSelectSkill(card.skillId)}>
      <SkillImage card={card} />
      <span className="skills-reference-card__title">{card.title}</span>
      <span className="skills-reference-card__description">{card.description}</span>
    </button>
  );
}

export function SkillsCategoryShowcase({ sections, activeCategory, onCategoryChange, onSelectSkill }: SkillsCategoryShowcaseProps) {
  const availableSections = sections.filter((section) => section.title !== '推荐');
  const activeSection = sections.find((section) => section.title === activeCategory) ?? availableSections[0] ?? sections[0];

  return (
    <section className="skills-home-showcase" aria-label="首页技能">
      <div className="skills-home-showcase__toolbar">
        <nav className="skills-home-showcase__tabs" aria-label="技能分类切换">
          {['推荐', ...availableSections.map((section) => section.title)].map((category) => <button key={category} type="button" className={activeSection?.title === category ? 'is-active' : ''} onClick={() => onCategoryChange(category)}>{category}</button>)}
        </nav>
        <button type="button" className="skills-home-showcase__more" onClick={() => onCategoryChange('推荐')}>查看全部<ChevronRight size={14} /></button>
      </div>
      {activeSection ? (
        <>
          <div className="skills-home-showcase__heading"><h2>{activeSection.title === '推荐' ? '精选技能' : `${activeSection.title}技能`}</h2><span>{activeSection.cards.length} 项技能</span></div>
          <div className="skills-reference-grid skills-home-showcase__grid">
            {activeSection.cards.map((card) => <SkillCard key={card.id} card={card} onSelectSkill={onSelectSkill} />)}
          </div>
        </>
      ) : <div className="skills-home-showcase__empty">当前分类暂无技能</div>}
    </section>
  );
}

export function SkillsDirectoryPage({ sections, onSelectSkill }: SkillsDirectoryPageProps) {
  const [activeCategory, setActiveCategory] = useState('推荐');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleSections = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return sections.map((section) => ({
      ...section,
      cards: section.cards.filter((card) => !keyword || `${card.title}${card.description}${card.category}`.toLowerCase().includes(keyword)),
    })).filter((section) => section.cards.length > 0);
  }, [searchTerm, sections]);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    const target = document.getElementById(`skills-section-${category}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="skills-reference-page" aria-label="技能">
      <h1 className="skills-reference-page__title">技能</h1>
      <div className="skills-reference-toolbar">
        <nav className="skills-reference-tabs" aria-label="技能分类">
          {categoryTabs.map((category) => <button key={category} type="button" className={activeCategory === category ? 'is-active' : ''} onClick={() => selectCategory(category)}>{category}</button>)}
        </nav>
        <label className="skills-reference-search"><Search size={16} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="搜索技能" aria-label="搜索技能" /></label>
      </div>

      <div className="skills-reference-content">
        {visibleSections.map((section) => (
          <section key={section.id} id={`skills-section-${section.title}`} className="skills-reference-section">
            {section.title !== '推荐' ? <div className="skills-reference-section__heading"><h2>{section.title}</h2><button type="button" onClick={() => selectCategory(section.title)}>查看更多<ChevronRight size={14} /></button></div> : null}
            <div className="skills-reference-grid">{section.cards.map((card) => <SkillCard key={card.id} card={card} onSelectSkill={onSelectSkill} />)}</div>
          </section>
        ))}
        {visibleSections.length === 0 ? <div className="skills-reference-empty"><Sparkles size={22} /><strong>没有找到相关技能</strong><span>换个关键词试试</span></div> : null}
      </div>

      <div className="skills-reference-composer" aria-label="AI创作输入框"><Sparkles size={16} /><span>请输入你的设计需求，支持 <b>/</b> 使用技能，<b>@</b> 引用上传素材</span><button type="button" aria-label="发送"><ChevronRight size={17} /></button></div>
      <button type="button" className="skills-reference-help" aria-label="帮助">?</button>
    </section>
  );
}

export const skillDirectorySections: SkillsDirectorySection[] = [
  {
    id: 'recommend',
    title: '推荐',
    cards: [
      { id: 'swap-model', skillId: 'apparel-styling', title: '换模特', description: '保留服装，更换模特形象', category: '服饰穿戴', image: imageByCard.model },
      { id: 'viral-remake', skillId: 'viral-remake', title: '爆款图复刻', description: '一张商品图，成套复刻爆款风格', category: '电商设计', image: imageByCard.snacks, badge: '热门' },
      { id: 'viral-video', skillId: 'video-agent', title: '爆款视频复刻', description: '上传参考视频，同款复刻成片', category: '视频创作', image: imageByCard.skateboard },
      { id: 'story-ad', skillId: 'video-agent', title: '剧情广告', description: '因感式短视频，脚本+出片', category: '视频创作', image: imageByCard.dog },
      { id: 'apparel-sku', skillId: 'sku-variants', title: '服饰SKU变体', description: '换色/换材质/换花纹，多变体生成', category: '服饰穿戴', image: imageByCard.clothes },
      { id: 'product-sku', skillId: 'sku-variants', title: '商品SKU变体', description: '多色/多款SKU批量生成', category: '电商设计', image: imageByCard.tumbler, tags: ['家具', '3C', '家居'] },
      { id: 'social-ip', skillId: 'brand-visual', title: '定制社媒IP', description: '创建社媒IP，或基于已有IP续写图文', category: '品牌设计', image: imageByCard.toy },
      { id: 'social-commerce', skillId: 'social-cover', title: '社媒图文带货', description: '上传产品图，生成社媒种草带货图', category: '自媒体营销', image: imageByCard.social, badge: '热门' },
      { id: 'package-design', skillId: 'brand-visual', title: '包装设计', description: '包装方案/效果图/平面正稿', category: '品牌设计', image: imageByCard.package },
      { id: 'social-note', skillId: 'social-cover', title: '社媒图文笔记', description: '输入主题或文案，生成社媒图文笔记', category: '自媒体营销', image: imageByCard.poster, badge: '热门' },
      { id: 'logo-design', skillId: 'brand-visual', title: 'Logo设计', description: '品牌Logo/图标设计，多种结构', category: '品牌设计', image: imageByCard.green },
    ],
  },
  {
    id: 'commerce',
    title: '电商设计',
    cards: [
      { id: 'product-set', skillId: 'product-set', title: '商品套图', description: '上传产品图，生成全套电商主图', category: '电商设计', image: imageByCard.headphones },
      { id: 'a-plus', skillId: 'a-plus', title: 'A+详情页', description: 'A+/详情页模块图，提升转化率', category: '电商设计', image: imageByCard.sport },
      { id: 'commerce-remake', skillId: 'viral-remake', title: '爆款图复刻', description: '一张商品图，成套复刻爆款风格', category: '电商设计', image: imageByCard.snacks, badge: '热门' },
      { id: 'jewelry-white', skillId: 'white-background', title: '饰品白底', description: '生成电商商品白底图与细节图', category: '电商设计', image: imageByCard.earrings },
      { id: 'commerce-sku', skillId: 'sku-variants', title: '商品SKU变体', description: '多色/多款SKU批量生成', category: '电商设计', image: imageByCard.tumbler, tags: ['家具', '3C', '家居'] },
    ],
  },
  {
    id: 'fashion',
    title: '服饰穿戴',
    cards: [
      { id: 'fashion-model', skillId: 'apparel-styling', title: '服饰穿搭图', description: '为服装商品生成自然的模特穿搭展示', category: '服饰穿戴', image: imageByCard.jacket },
      { id: 'fashion-sku', skillId: 'sku-variants', title: '服饰SKU变体', description: '换色/换材质/换花纹，多变体生成', category: '服饰穿戴', image: imageByCard.clothes },
      { id: 'fashion-swap', skillId: 'apparel-styling', title: '换模特', description: '保留服装，更换模特形象', category: '服饰穿戴', image: imageByCard.model },
    ],
  },
  {
    id: 'video',
    title: '视频创作',
    cards: [
      { id: 'video-create', skillId: 'video-agent', title: '视频创作', description: '从创意到脚本，规划一条完整短视频', category: '视频创作', image: imageByCard.skateboard },
      { id: 'video-story', skillId: 'video-agent', title: '剧情广告', description: '因感式短视频，脚本+出片', category: '视频创作', image: imageByCard.dog },
      { id: 'video-remake', skillId: 'video-agent', title: '爆款视频复刻', description: '上传参考视频，同款复刻成片', category: '视频创作', image: imageByCard.poster },
      { id: 'video-fashion', skillId: 'apparel-styling', title: '服饰动态展示', description: '让商品在真实场景中自然呈现', category: '视频创作', image: imageByCard.jacket },
      { id: 'video-social', skillId: 'social-cover', title: '社媒短视频', description: '快速生成适合社媒发布的视频内容', category: '视频创作', image: imageByCard.social },
    ],
  },
  {
    id: 'brand',
    title: '品牌设计',
    cards: [
      { id: 'brand-visual', skillId: 'brand-visual', title: '品牌视觉方案', description: '定义品牌标识、配色和整体视觉方向', category: '品牌设计', image: imageByCard.green },
      { id: 'brand-logo', skillId: 'brand-visual', title: 'Logo设计', description: '品牌Logo/图标设计，多种结构', category: '品牌设计', image: imageByCard.package },
      { id: 'brand-package', skillId: 'brand-visual', title: '包装设计', description: '包装方案/效果图/平面正稿', category: '品牌设计', image: imageByCard.package },
      { id: 'brand-ip', skillId: 'brand-visual', title: '定制社媒IP', description: '创建社媒IP，或基于已有IP续写图文', category: '品牌设计', image: imageByCard.toy },
      { id: 'brand-poster', skillId: 'poster', title: '品牌宣传海报', description: '围绕品牌主题生成完整视觉物料', category: '品牌设计', image: imageByCard.poster },
    ],
  },
  {
    id: 'poster',
    title: '海报设计',
    cards: [
      { id: 'poster-create', skillId: 'poster', title: '海报设计', description: '围绕活动主题生成完整海报方案', category: '海报设计', image: imageByCard.poster },
      { id: 'poster-marketing', skillId: 'marketing-poster', title: '营销海报', description: '促销、活动、节日与发布会主题海报', category: '海报设计', image: imageByCard.social },
      { id: 'poster-beautify', skillId: 'poster-beautify', title: '海报美化', description: '旧海报快速美化升级', category: '海报设计', image: imageByCard.green },
      { id: 'poster-commerce', skillId: 'promo-image', title: '促销主图', description: '突出促销信息，快速制作电商主图', category: '海报设计', image: imageByCard.snacks },
      { id: 'poster-event', skillId: 'marketing-poster', title: '活动主视觉', description: '一键生成活动宣传主视觉', category: '海报设计', image: imageByCard.model },
    ],
  },
  {
    id: 'social',
    title: '自媒体营销',
    cards: [
      { id: 'social-cover-page', skillId: 'social-cover', title: '小红书封面', description: '制作醒目、有信息层次的笔记封面', category: '自媒体营销', image: imageByCard.social, badge: '热门' },
      { id: 'social-note-page', skillId: 'social-cover', title: '社媒图文笔记', description: '输入主题或文案，生成社媒图文笔记', category: '自媒体营销', image: imageByCard.poster },
      { id: 'social-commerce-page', skillId: 'social-cover', title: '社媒图文带货', description: '上传产品图，生成社媒种草带货图', category: '自媒体营销', image: imageByCard.package },
      { id: 'social-product', skillId: 'promo-image', title: '商品种草图', description: '快速制作适合传播的商品内容', category: '自媒体营销', image: imageByCard.tumbler },
      { id: 'social-topic', skillId: 'product-copy', title: '选题文案', description: '围绕主题生成多平台传播文案', category: '自媒体营销', image: imageByCard.headphones },
    ],
  },
  {
    id: 'office',
    title: '办公设计',
    cards: [
      { id: 'office-notice', skillId: 'daily-notice', title: '通知与日常物料', description: '通知、邀请函、招聘、证书、日签等', category: '办公设计', image: imageByCard.poster },
      { id: 'office-poster', skillId: 'poster', title: '企业宣传海报', description: '快速生成专业的办公宣传物料', category: '办公设计', image: imageByCard.sport },
      { id: 'office-brand', skillId: 'brand-visual', title: '品牌汇报视觉', description: '统一品牌风格，提升演示表达', category: '办公设计', image: imageByCard.green },
      { id: 'office-product', skillId: 'product-copy', title: '商品介绍文案', description: '让产品信息更清晰、更有说服力', category: '办公设计', image: imageByCard.package },
      { id: 'office-image', skillId: 'image-edit', title: '办公图片扩图', description: '智能补全画面，适配不同版式', category: '办公设计', image: imageByCard.model },
    ],
  },
  {
    id: 'image',
    title: '图像处理',
    cards: [
      { id: 'image-white-background', skillId: 'white-background', title: '白底精修', description: '去除背景并优化商品质感与细节', category: '图像处理', image: imageByCard.earrings },
      { id: 'image-expand', skillId: 'image-edit', title: '图片扩图', description: '智能扩展画布，补全自然的画面内容', category: '图像处理', image: imageByCard.jacket },
      { id: 'image-poster', skillId: 'poster-beautify', title: '图片美化', description: '优化画面布局、字体和色彩层级', category: '图像处理', image: imageByCard.poster },
      { id: 'image-commerce', skillId: 'promo-image', title: '商品主图', description: '快速制作清晰有重点的商品视觉', category: '图像处理', image: imageByCard.snacks },
      { id: 'image-brand', skillId: 'brand-visual', title: '品牌图片', description: '统一品牌图片的视觉方向', category: '图像处理', image: imageByCard.green },
    ],
  },
];
