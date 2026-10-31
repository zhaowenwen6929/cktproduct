/** 会员套餐配置约定：终身套餐统一按 36135 天（99 年）保存。 */
export const LIFETIME_MEMBER_DAYS = 36135;

export function isLifetimeDuration(duration: string | number) {
  return Number(duration) === LIFETIME_MEMBER_DAYS;
}
