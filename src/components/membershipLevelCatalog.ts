/**
 * 会员弹框实际使用的 vipLevelList。
 *
 * 配置约定：名称末尾的数字是会员等级 level，前面的中文（及名称中的字母/括号）是会员等级名称。
 * 这里保留原始字符串，便于和后台/接口返回值对照；运行时统一使用解析后的 name + level。
 */
export const VIP_LEVEL_LIST = [
  { versionId: 4, name: '个人版VIP 4' },
  { versionId: 199, name: '标准版(个人) 199' },
  { versionId: 200, name: '标准版(个人) 200' },
  { versionId: 210, name: '标准版(大企业) 210' },
  { versionId: 201, name: '个人高级版 201' },
  { versionId: 202, name: '企业高级版 202' },
  { versionId: 203, name: '高级版 203' },
  { versionId: 205, name: '协作版 205' },
  { versionId: 220, name: '旗舰版 220' },
  { versionId: 204, name: '高级版(大企业) 204' },
  { versionId: 211, name: '通用版(个人) 211' },
  { versionId: 212, name: '通用版(企业) 212' },
  { versionId: 300, name: '高级版(团队) 300' },
  { versionId: 301, name: '专业版(团队) 301' },
  { versionId: 302, name: '至尊版(团队) 302' },
  { versionId: 230, name: '基础版(单人) 230' },
  { versionId: 231, name: '高级版(单人) 231' },
  { versionId: 232, name: '专业版(单人) 232' },
  { versionId: 233, name: '至尊版(单人) 233' },
  { versionId: 240, name: '基础版（个人） 240' },
  { versionId: 241, name: '专业版（个人） 241' },
  { versionId: 310, name: '基础版（企业） 310' },
  { versionId: 311, name: '专业版（企业） 311' },
  { versionId: 312, name: '旗舰版（企业） 312' },
] as const;

export type MembershipLevelOption = {
  name: string;
  level: number;
  sourceName: string;
};

function parseVipLevelItem(item: (typeof VIP_LEVEL_LIST)[number]): MembershipLevelOption {
  const match = item.name.match(/^(.*?)\s+(\d+)$/);
  if (!match) {
    throw new Error(`会员等级配置缺少末尾 level：${item.name}`);
  }
  const [, name, levelText] = match;
  const level = Number(levelText);
  if (level !== item.versionId) {
    throw new Error(`会员等级配置的 versionId 与名称末尾 level 不一致：${item.name}`);
  }
  return { name, level, sourceName: item.name };
}

export const MEMBERSHIP_LEVEL_OPTIONS: MembershipLevelOption[] = VIP_LEVEL_LIST.map(parseVipLevelItem);

const MEMBERSHIP_LEVEL_OPTIONS_BY_NAME = MEMBERSHIP_LEVEL_OPTIONS.reduce<Record<string, MembershipLevelOption[]>>((result, option) => {
  result[option.name] = [...(result[option.name] ?? []), option];
  return result;
}, {});

export const MEMBERSHIP_LEVEL_BY_NAME: Record<string, number> = Object.fromEntries(
  Object.entries(MEMBERSHIP_LEVEL_OPTIONS_BY_NAME)
    .filter(([, options]) => options.length === 1)
    .map(([name, [option]]) => [name, option.level]),
);

export const MEMBERSHIP_NAME_BY_LEVEL: Record<number, string> = Object.fromEntries(
  MEMBERSHIP_LEVEL_OPTIONS.map((option) => [option.level, option.name]),
);

export function getMembershipLevelOption(name: string, level?: number) {
  const matches = MEMBERSHIP_LEVEL_OPTIONS.filter((option) => option.name === name);
  return level == null ? (matches.length === 1 ? matches[0] : undefined) : matches.find((option) => option.level === level);
}

export function getMembershipNameByLevel(level: number | null | undefined) {
  return level == null ? undefined : MEMBERSHIP_NAME_BY_LEVEL[level];
}
