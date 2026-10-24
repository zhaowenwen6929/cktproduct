import { Inbox } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type UserAuthorizationViewPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
};

export function UserAuthorizationViewPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig }: UserAuthorizationViewPageProps) {
  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="用户授权信息查看" onNavigate={handleNavigate} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <section className="overflow-hidden bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="border-b border-[#e8edf3] px-8 py-6">
              <h1 className="text-[20px] font-semibold text-[#282d34]">用户授权信息查看</h1>
            </header>

            <div className="px-8 py-8">
              <label className="flex items-center gap-3 text-[16px] text-[#30343b]">
                <span>查询：</span>
                <input aria-label="设计ID查询" placeholder="输入设计ID查询" className="h-11 w-[435px] rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
              </label>

              <div className="mt-8 overflow-hidden">
                <table className="w-full table-fixed border-collapse text-[14px] text-[#30343b]">
                  <colgroup>
                    <col className="w-[45%]" />
                    <col className="w-[35%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead>
                    <tr className="h-[72px] bg-[#fafafa] text-[16px] font-medium">
                      <th className="px-4">设计缩略图</th>
                      <th className="px-4">设计ID</th>
                      <th className="px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="h-[228px] border-b border-[#edf0f4]">
                        <div className="flex flex-col items-center justify-center gap-3 text-[14px] text-[#c8ccd1]">
                          <Inbox className="h-12 w-12 stroke-[1.2] text-[#dfe2e5]" />
                          <span>暂无数据</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="mt-16 pb-4 text-center text-[13px] text-[#30343b]">Copyright©北京艺源酷科技有限公司 京ICP备 14056892号-1</footer>
        </div>
      </main>
    </div>
  );
}
