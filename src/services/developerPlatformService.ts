export type DeveloperPlatformStatus = '已开放' | '已有接口' | 'SDK 支持' | '内测中' | '即将开放' | '规划中';

export type DeveloperPlatformAccessModeId = 'open-api' | 'product-sdk' | 'cli' | 'mcp';

export type DeveloperPlatformDataSource = 'api' | 'fallback';

export type DeveloperOverviewAccessMode = {
  id: DeveloperPlatformAccessModeId;
  eyebrow: string;
  title: string;
  description: string;
  value: string;
  representativeCapabilities: string[];
  ctaLabel: string;
};

export type DeveloperOverviewDomain = {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
};

export type DeveloperOverviewResponse = {
  source: DeveloperPlatformDataSource;
  version: string;
  publishedAt: string;
  hero: { eyebrow: string; title: string; subtitle: string };
  accessModes: DeveloperOverviewAccessMode[];
  domains: DeveloperOverviewDomain[];
  quickStart: { number: string; title: string; description: string }[];
};

export type DeveloperCapabilityEntry = {
  id: string;
  title: string;
  summary: string;
  status: DeveloperPlatformStatus;
  accessModes: DeveloperPlatformAccessModeId[];
  permission: string;
  requiresApp: boolean;
  consumption: string;
  version?: string;
  sourceUrl: string;
  kind: 'api' | 'sdk' | 'event';
};

export type DeveloperCapabilityDomain = {
  id: string;
  title: string;
  description: string;
  entries: DeveloperCapabilityEntry[];
};

export type DeveloperCapabilitiesResponse = {
  source: DeveloperPlatformDataSource;
  version: string;
  publishedAt: string;
  sourceUrl: string;
  interfaces: OpenPlatformInterface[];
  sdks: OpenPlatformSdk[];
  callbacks: readonly (readonly [string, string, string])[];
  responseFields: readonly (readonly [string, string])[];
  editorParams: readonly (readonly [string, string])[];
  imageParams: readonly (readonly [string, string])[];
  spaceParams: readonly (readonly [string, string])[];
  domains: DeveloperCapabilityDomain[];
  billing: { summary: string; items: { label: string; description: string; status: DeveloperPlatformStatus }[] };
  integration: { cliVersion: string; cliInstallCommand: string; apiBaseUrl: string; mcpServerUrl: string };
};

export const DEVELOPER_PLATFORM_OVERVIEW_ENDPOINT = '/api/developer-platform/overview';
export const DEVELOPER_PLATFORM_CAPABILITIES_ENDPOINT = '/api/developer-platform/capabilities';

export const OPEN_PLATFORM_SOURCE_URL = 'https://chuangkit.yuque.com/qltowx/openapi3.0/ln9rmy';

export type OpenPlatformInterface = {
  category: string;
  method: string;
  path: string;
  required: string;
  optional: string;
  purpose: string;
};

export type OpenPlatformSdk = {
  name: string;
  version: string;
  required: string;
  methods: string;
  purpose: string;
};

export const OPEN_PLATFORM_HTTP_INTERFACES: OpenPlatformInterface[] = [
  { category: 'Token', method: 'GET', path: '/openApi/getApiToken.do', required: 'api_id、timestamp、sign', optional: '—', purpose: '获取 accessToken、refreshToken；有效期分别约 2 小时、3 天' },
  { category: 'Token', method: 'GET', path: '/openApi/refreshApiToken.do', required: 'appId、refreshToken', optional: '—', purpose: '刷新 API Token' },
  { category: '缩略图', method: 'POST', path: '/api/template/queryUserDesignThumb.do', required: 'app_id、user_flag、app_token、design_id', optional: 'scale_width，默认 400，最大 2000', purpose: '获取用户设计缩略图，URL 有效期约 10 分钟' },
  { category: '下载', method: 'POST', path: '/api/template/getSourceImage.do', required: 'appId、userFlag、designId、token、noticeUrl', optional: 'renderType、packageType、pageNoRange、prediction、terminalType、size、reSizeHigh、reSizeWidth、mp4Time、limitTime、transitionDuration、filterMode', purpose: '获取设计成品图、PDF、PPT、MP4、PSD 等' },
  { category: '下载', method: 'POST', path: '/api/template/getDesignDownloadList.do', required: 'appId、apiToken、userFlag', optional: 'pageNo、pageSize，最大 50', purpose: '查询设计下载历史' },
  { category: '团队模板', method: 'POST', path: '/api/template/createTemplateByDesign.do', required: 'app_id、user_flag、token、design_id', optional: 'status：1 上架、2 待上架', purpose: '将设计转换为团队模板' },
  { category: '团队模板', method: 'POST', path: '/api/template/createByOfficialTemplate.do', required: 'app_id、token、user_flag、official_template_id', optional: 'status、title、template_kind_ids、style_tag_ids、color_tag_ids、keywords', purpose: '官方模板转换为团队模板' },
  { category: '团队模板', method: 'POST', path: '/api/template/detail.do', required: 'app_id、token、template_id', optional: '—', purpose: '查询团队模板详情' },
  { category: '团队模板', method: 'POST', path: '/api/template/listAllTemplateKind.do', required: 'app_id、token', optional: '—', purpose: '查询团队模板分类' },
  { category: '团队模板', method: 'POST', path: '/api/template/pageTeamTemplate.do', required: 'app_id、token、page_num、page_size', optional: 'order_type、first_template_kind_ids、second_template_kind_ids、style_tag_ids、color_tag_ids、keywords、intellect_id、mark_state', purpose: '分页查询团队模板' },
  { category: '团队模板', method: 'POST', path: '/api/template/updateTemplateStatus.do', required: 'app_id、token、template_id、status', optional: 'status=0 删除、1 上架、2 下架', purpose: '修改团队模板状态' },
  { category: '团队模板', method: 'POST', path: '/api/template/updateTemplate.do', required: 'app_id、token、user_flag、template_id、design_id', optional: '—', purpose: '更新团队模板关联设计' },
  { category: '团队模板', method: 'POST', path: '/api/template/updateTemplateDetail.do', required: 'app_id、token、template_id、title、template_kind_ids、style_tag_id、color_tag_id、keywords', optional: '—', purpose: '更新团队模板基础信息' },
  { category: '用户', method: 'POST', path: '/openApi/createUser.do', required: 'app_id、user_flag、token', optional: 'user_flag 多个用户用逗号分隔；单次最多 20 个，每日最多 1000 个', purpose: '批量注册用户' },
  { category: '授权', method: 'POST', path: '/api/designPowerOfAttorney/list.do', required: 'JSON：app_id、token、design_id', optional: '—', purpose: '查询设计授权记录、授权状态、授权书地址' },
  { category: '素材', method: 'POST', path: '/api/material/getOfficialMaterials.do', required: 'JSON：app_id、token', optional: 'second_kind_ids、third_kind_ids、label_ids、fee_type、keyword、sort_type、material_formats、page_no、page_size', purpose: '查询官方素材' },
  { category: '素材', method: 'POST', path: '/api/material/addFavorite.do', required: 'app_id、token、user_flag、material_id', optional: '—', purpose: '收藏素材' },
  { category: '素材', method: 'POST', path: '/api/material/removeFavorite.do', required: 'app_id、token、user_flag、material_id', optional: '—', purpose: '取消收藏素材' },
  { category: '素材', method: 'POST', path: '/api/material/getMyFavorite.do', required: 'app_id、token', optional: 'user_flag，不传表示查询应用下全部用户收藏', purpose: '查询用户收藏素材' },
  { category: 'PSD', method: 'POST', path: '/api/psd/upload.do', required: 'JSON：appId、token、userFlag、psdFile', optional: 'psdFile 为可访问的 PSD 公网地址', purpose: '上传 PSD，返回 taskId' },
  { category: 'PSD', method: 'POST', path: '/api/psd/getUploadResult.do', required: 'JSON：appId、token、taskId', optional: '—', purpose: '查询 PSD 上传结果，成功后返回 materialId' },
  { category: 'PSD', method: 'POST', path: '/api/psd/analyze.do', required: 'JSON：appId、token、userFlag、materialId', optional: '—', purpose: '解析 PSD，返回 taskId' },
  { category: 'PSD', method: 'POST', path: '/api/psd/getAnalyzeResult.do', required: 'JSON：appId、token、userFlag、taskId', optional: '—', purpose: '查询 PSD 解析结果，成功后返回 designId' },
  { category: '无限画布', method: 'POST', path: '/api/aiCanvas/page.do', required: 'JSON：appId、token、userFlag、pageNo、pageSize', optional: 'timeOrder、canvasName；pageSize 最大 1000', purpose: '分页查询无限画布' },
  { category: '无限画布', method: 'POST', path: '/api/aiCanvas/detail.do', required: 'JSON：appId、token、userFlag、designId', optional: '—', purpose: '查询无限画布详情' },
  { category: '官方模板', method: 'POST', path: '/api/template/queryTemplateForApiUser.do', required: 'appId、apiToken、kindIds', optional: 'searchType、kindIdType、industryTagIds、colorTagIds、styleTagIds、useTagIds、isTagCombinedQuery、format、sortType、priceType、keyword、pageNo、pageSize、thumbnailsType、onlyApi、terminalType、userFlag、templateTypes；kindIds 最多 20 个，pageSize 最大 500', purpose: '查询官方模板列表' },
  { category: '官方模板', method: 'POST', path: '/api/template/detailTemplate.do', required: 'JSON：app_id、token、template_id', optional: '—', purpose: '查询官方模板详情' },
  { category: '模板配置', method: 'POST', path: '/api/templateCenter/getAllCustomConfig.do', required: 'JSON：app_id、setting_code、token、terminal_type', optional: 'terminal_type：0 PC、1 移动、2 仅行业', purpose: '获取模板中心的场景、行业配置' },
  { category: '营销日历', method: 'POST', path: '/api/festival/list.do', required: 'app_id、token、size', optional: 'detail_display、recommend_display、status', purpose: '查询节日信息、节日日期、农历日期、关键词' },
  { category: '我的设计', method: 'POST', path: '/openApi/queryUserDesigns.do', required: 'app_id、user_flag、token、time_order、page_no、page_size', optional: 'kind_id、terminal、design_name；kind_id 最多 20 个', purpose: '查询用户设计列表' },
  { category: '我的设计', method: 'POST', path: '/openApi/deleteDesign.do', required: 'app_id、user_flag、token、design_ids', optional: 'terminal', purpose: '删除一个或多个设计' },
  { category: '我的设计', method: 'POST', path: '/openApi/copyDesign.do', required: 'app_id、user_flag、token、design_id', optional: 'terminal', purpose: '复制设计并返回新设计 ID' },
  { category: '我的设计', method: 'POST', path: '/openApi/updateTitle.do', required: 'app_id、token、design_id、title', optional: 'user_flag、terminal', purpose: '修改设计标题' },
  { category: '我的设计', method: 'GET/POST', path: '/api/template/getDesignDetail.do', required: 'app_id、design_id、token', optional: '—', purpose: '查询设计详情' },
  { category: '我的设计', method: 'POST', path: '/api/template/getDesignDownloadInfo.do', required: 'appId、apiToken、userFlag、startTime、endTime', optional: 'pageNo、pageSize，最大 50', purpose: '查询用户设计下载记录' },
  { category: '模板收藏', method: 'POST', path: '/api/templateCollection/collection.do', required: 'app_id、token、user_flag、template_id', optional: '—', purpose: '收藏模板；已收藏时返回对应状态码' },
  { category: '模板收藏', method: 'POST', path: '/api/templateCollection/cancelCollection.do', required: 'app_id、token、user_flag、template_id', optional: '—', purpose: '取消收藏模板；原文档地址写的是 http://' },
  { category: '模板收藏', method: 'POST', path: '/api/templateCollection/getCollection.do', required: 'app_id、token、page_no、page_size', optional: 'user_flag、kind_id；最大 50 条/页', purpose: '查询用户收藏模板' },
];

export const OPEN_PLATFORM_SDKS: OpenPlatformSdk[] = [
  { name: '模板编辑器 Web SDK', version: '当前版本', required: 'app_id、expire_time、user_flag、device_type=1、sign', methods: 'cktDesign.open()；design.openDownloadModal()；design.openBatch()；window.chuangkitComplete；window.chuangkitAddImg()；replaceTemplate；insertImage；close', purpose: '打开模板编辑器、指定场景/模板/设计、插入图片、替换模板、下载、批量设计' },
  { name: '模板编辑器移动端 SDK', version: '当前版本', required: 'app_id、expire_time、user_flag、device_type=2、sign', methods: '移动 H5 编辑器；支持 kind_id、template_id、design_id、mtc_code', purpose: '移动端模板编辑、模板中心、图片插入、底部 Tab、自定义下载' },
  { name: '小程序接入', version: '依赖移动端 SDK', required: 'app_id、expire_time、user_flag、device_type=2、sign', methods: 'web-view 打开 https://www.chuangkit.com/api/miniview.html?...', purpose: '微信小程序内嵌移动端编辑器' },
  { name: '模板中心 Web SDK', version: '>=1.3.8', required: 'appId、timestamp、sign、container、settingCode', methods: 'CktDesign.createTemplateCenter(params)；open()；close()；setParams()；onChooseTemplate()；onParamsChange()', purpose: '展示模板中心，支持场景、行业、标签、价格、排序筛选' },
  { name: '模板中心移动端 SDK', version: '>=1.5.0', required: '移动编辑器参数 + mtc_code', methods: '通过移动端编辑器参数调起', purpose: '移动端模板中心' },
  { name: '专题页 SDK', version: '>=1.6.9', required: 'appId、timestamp、sign、container、settingCode', methods: 'CktDesign.createTopicPage(options)；open()；close()；onChooseTemplate()', purpose: '展示专题页模板' },
  { name: '营销日历 SDK', version: '>=2.0.3', required: 'appId、timestamp、sign、unionId', methods: '文档提供打开、关闭、模板点击监听', purpose: '节日/营销日历模板展示' },
  { name: '图片编辑器 Web SDK', version: '当前版本', required: 'appId、unionId、timestamp、sign', methods: 'CktDesign.createImageDesign(options)', purpose: '调整、裁剪、文字、水印、抠图、滤镜' },
  { name: '我的空间 SDK', version: '>=2.1.4', required: 'appId、timestamp、sign、userFlag', methods: '文档提供打开、关闭、按钮点击、设计/素材回调', purpose: '我的设计、我的素材、回收站、我的收藏' },
  { name: '无限画布 SDK', version: '当前文档版本', required: 'appId、unionId、timestamp、sign、container', methods: 'CktDesign.createAiCanvas()；open()；close()；destroy()；on()；off()；事件：ready、export、generationResult、error', purpose: 'AI 无限画布、生成结果、导出' },
];

export const OPEN_PLATFORM_CALLBACKS = [
  ['Web 编辑器回调', 'window.chuangkitComplete(data)', 'kind=1 保存、2 下载、3 关闭、4 设计 ID 变化、-1 错误；字段包含 design-id、template_id、cover-urls、thumb-urls、source-urls、error'],
  ['Web 插图', 'window.chuangkitAddImg()', '向编辑器插入一张或多张图片'],
  ['移动端消息', 'type=replaceTemplate / insertImage / close', '通过 window.parent.postMessage 触发替换模板、插入图片、关闭编辑器'],
  ['移动端图片回调', 'redirect_url?image_urls=...', '编辑完成后推送图片地址'],
  ['无限画布事件', 'ready / export / generationResult / error', '画布初始化完成、导出、AI 生成结果和异常信息'],
] as const;

export const OPEN_PLATFORM_RESPONSE_FIELDS = [
  ['Token', 'accessToken、refreshToken'],
  ['模板列表', 'hasNext、totalCount、resultCount、queryDesignTemplateBeanList'],
  ['模板详情', 'designKindId、designTemplateId、templateTitle、designTemplateImageUrl、price、width、height、priceType'],
  ['我的设计', 'designId、designTitle、kindId、kindName、createTime、updateTime、thumbUrl、templateId'],
  ['下载历史', 'designId、downloadUrls、permanentDownloadUrls、thumbUrls、formatName、width、height'],
  ['PSD 任务', 'taskId、taskState、materialId、designId'],
  ['素材', '素材列表、素材 ID、缩略图、收藏状态'],
  ['节日', 'festivalId、festivalName、festivalDate、lunarDate、festivalType'],
  ['授权', 'userId、nickName、authorizationUrl、authorizationType、authorizationState'],
] as const;

export const OPEN_PLATFORM_EDITOR_PARAMS = [
  ['kind_id', '按场景打开模板中心'],
  ['template_id', '按官方模板打开'],
  ['design_id', '打开已有设计'],
  ['random_id', '随机打开指定场景模板'],
  ['charge_type', '资源计费控制：免费、付费调起、付费拦截'],
  ['package_id', '付费调起时使用'],
  ['coop_material_limit', '素材权限控制'],
  ['coop_font_limit', '字体权限控制'],
  ['charging_template_limit', '付费模板权限控制'],
  ['width / height / unit', '自定义画布尺寸'],
  ['upload_img_url', '初始化时插入单张图片'],
  ['add_img_list', '批量插入图片，最多 20 张'],
  ['download_mime', '下载格式：jpg、png、gif、pdf、ppt、mp4、psd 等'],
  ['download_quality', '标准 / 高清'],
  ['size', '输出倍率，0～3'],
  ['show_watermark', '是否显示水印'],
  ['show_batch', '是否显示批量设计'],
  ['enable_authorize', '是否开启授权书'],
  ['custom_fields', '自定义业务字段'],
] as const;

export const OPEN_PLATFORM_IMAGE_PARAMS = [
  ['functions', '0 全部、1 调整、2 裁剪、3 文字、4 水印、5 抠图、6 滤镜'],
  ['designId', '编辑已有图片设计'],
  ['finishBtn', '完成按钮文案'],
  ['hideLogo', '隐藏 Logo'],
  ['closeType', '完成后是否关闭弹窗'],
] as const;

export const OPEN_PLATFORM_SPACE_PARAMS = [
  ['functions', '0 全部、1 我的空间、2 我的收藏'],
  ['defaultFunction', '默认进入我的空间或我的收藏'],
  ['spaceTabs', '1 设计、2 素材、3 回收站'],
  ['collectionTab', '1 官方模板、2 官方素材'],
  ['mobileUpload', '是否允许手机上传'],
  ['showName', '是否显示资源名称'],
  ['uploadSvg', '是否支持 SVG 上传'],
  ['designButtonName', '设计按钮名称'],
  ['materialButtonName', '素材按钮名称'],
  ['favTemplateButtonName', '收藏模板按钮名称'],
  ['favMaterialButtonName', '收藏素材按钮名称'],
] as const;


const OVERVIEW_ACCESS_MODES: DeveloperOverviewAccessMode[] = [
  { id: 'open-api', eyebrow: '公共能力底座', title: 'Open API', description: '适合后端系统、企业应用和第三方 SaaS，通过 HTTP API 连接创客贴的模板、设计、AI、素材和导出能力。', value: '服务端集成', representativeCapabilities: ['模板检索', '设计创建', 'AI 任务'], ctaLabel: '查看 API 文档' },
  { id: 'product-sdk', eyebrow: '产品能力集合', title: 'Product SDK', description: '将创客贴成熟的产品能力组合进自己的应用、网站和业务系统，Editor SDK 只是其中一个模块。', value: '产品嵌入', representativeCapabilities: ['模板与设计嵌入', '图片编辑', '资源能力'], ctaLabel: '查看 Product SDK' },
  { id: 'cli', eyebrow: '本地自动化', title: 'CLI', description: '适合脚本、批量生产、本地自动化和开发调试，在终端里登录、调用工具并追踪异步任务。', value: '脚本与批量', representativeCapabilities: ['脚本调用', '批量生产', '任务查询'], ctaLabel: '查看 CLI' },
  { id: 'mcp', eyebrow: 'Agent 工作流', title: 'MCP / Agent Skills', description: '适合 ChatGPT、Claude、Cursor 和企业内部 Agent，通过自然语言调用创客贴能力。', value: '自然语言调用', representativeCapabilities: ['模板检索', 'AI 创作', '品牌资产'], ctaLabel: '配置 MCP' },
];

export const developerPlatformOverviewFallback: DeveloperOverviewResponse = {
  source: 'fallback', version: '2026.11', publishedAt: '2026-11-03',
  hero: { eyebrow: 'DEVELOPER PLATFORM', title: '选择适合你的创客贴接入方式', subtitle: '同一套应用、凭证、OAuth 和权限模型，覆盖服务端集成、产品 SDK、本地自动化与 AI Agent 工作流。' },
  accessModes: OVERVIEW_ACCESS_MODES,
  domains: [
    { id: 'template-design', title: '模板与设计', summary: '从模板发现、创建设计到编辑和导出，连接完整的设计生产链路。', highlights: ['模板检索', '创建设计', '导出与分享'] },
    { id: 'ai-creation', title: 'AI 创作', summary: '将生成、改图、抠图和异步任务接入你的产品工作流。', highlights: ['AI 生图', '图片编辑', '异步任务'] },
    { id: 'material-brand', title: '素材与品牌', summary: '接入官方素材、企业资源库和品牌资产，让内容生产保持一致。', highlights: ['素材检索', '品牌资产', 'DAM 资源'] },
    { id: 'enterprise-automation', title: '企业自动化', summary: '围绕组织、权限、任务和批量生产构建企业级自动化能力。', highlights: ['组织权限', '批量生产', '任务与 Webhook'] },
  ],
  quickStart: [
    { number: '01', title: '创建应用', description: '建立统一的应用身份' },
    { number: '02', title: '获取凭证', description: '配置 OAuth、Scope 和环境' },
    { number: '03', title: '选择接入方式', description: '按场景选择 API、SDK、CLI 或 MCP' },
    { number: '04', title: '开始调用', description: '查看任务、结果和用量' },
  ],
};

const domainForCategory = (category: string): string => {
  if (category.includes('素材') || category.includes('PSD')) return 'material-brand';
  if (category.includes('AI') || category.includes('无限画布')) return 'ai-creation';
  if (category.includes('用户') || category.includes('授权') || category.includes('Token')) return 'enterprise-automation';
  return 'template-design';
};

const buildCapabilityDomains = (): DeveloperCapabilityDomain[] => {
  const domains = new Map<string, DeveloperCapabilityEntry[]>();
  developerPlatformOverviewFallback.domains.forEach((domain) => domains.set(domain.id, []));
  OPEN_PLATFORM_HTTP_INTERFACES.forEach((item, index) => {
    const domainId = domainForCategory(item.category);
    domains.get(domainId)?.push({ id: `api-${index}`, title: item.purpose, summary: `${item.method} ${item.path}`, status: '已有接口', accessModes: ['open-api', 'cli', 'mcp'], permission: item.category === '授权' ? '组织授权' : '按能力 Scope', requiresApp: true, consumption: '以组织额度配置为准', sourceUrl: OPEN_PLATFORM_SOURCE_URL, kind: 'api' });
  });
  OPEN_PLATFORM_SDKS.forEach((item, index) => {
    domains.get('template-design')?.push({ id: `sdk-${index}`, title: item.name, summary: item.purpose, status: 'SDK 支持', accessModes: ['product-sdk'], permission: '应用授权', requiresApp: true, consumption: '以管理后台发布配置为准', version: item.version, sourceUrl: OPEN_PLATFORM_SOURCE_URL, kind: 'sdk' });
  });
  OPEN_PLATFORM_CALLBACKS.forEach(([title, api, description], index) => {
    domains.get('enterprise-automation')?.push({ id: `event-${index}`, title, summary: `${api} · ${description}`, status: '已有接口', accessModes: ['open-api', 'product-sdk', 'mcp'], permission: '应用授权', requiresApp: true, consumption: '不单独计费', sourceUrl: OPEN_PLATFORM_SOURCE_URL, kind: 'event' });
  });
  return developerPlatformOverviewFallback.domains.map((domain) => ({ ...domain, description: domain.summary, entries: domains.get(domain.id) ?? [] }));
};

export const developerPlatformCapabilitiesFallback: DeveloperCapabilitiesResponse = {
  source: 'fallback', version: '2026.11', publishedAt: '2026-11-03', sourceUrl: OPEN_PLATFORM_SOURCE_URL,
  interfaces: OPEN_PLATFORM_HTTP_INTERFACES, sdks: OPEN_PLATFORM_SDKS, callbacks: OPEN_PLATFORM_CALLBACKS, responseFields: OPEN_PLATFORM_RESPONSE_FIELDS, editorParams: OPEN_PLATFORM_EDITOR_PARAMS, imageParams: OPEN_PLATFORM_IMAGE_PARAMS, spaceParams: OPEN_PLATFORM_SPACE_PARAMS,
  domains: buildCapabilityDomains(),
  billing: { summary: '计费、额度和 AI 消耗以管理后台发布的组织配置为准，首页不展示具体价格。', items: [{ label: 'API 请求', description: '按接口、组织和应用额度配置展示。', status: '已有接口' }, { label: 'AI 任务', description: '按 AI 能力和组织积分配置展示。', status: '已有接口' }, { label: '导出与批量任务', description: '按任务类型和组织策略展示。', status: '已有接口' }] },
  integration: { cliVersion: 'v0.9.0', cliInstallCommand: 'npm install -g @chuangkit/open-cli@latest', apiBaseUrl: 'https://api.chuangkit.com/v1', mcpServerUrl: 'https://api.chuangkit.com/connect/v1/mcp' },
};

async function fetchPublishedData<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json() as T;
  } catch {
    return fallback;
  }
}

export const fetchDeveloperPlatformOverview = () => fetchPublishedData(DEVELOPER_PLATFORM_OVERVIEW_ENDPOINT, developerPlatformOverviewFallback);
export const fetchDeveloperPlatformCapabilities = () => fetchPublishedData(DEVELOPER_PLATFORM_CAPABILITIES_ENDPOINT, developerPlatformCapabilitiesFallback);
