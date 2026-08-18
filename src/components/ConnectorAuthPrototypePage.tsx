import React, { useEffect, useMemo, useState } from 'react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  CirclePlus,
  Copy,
  ExternalLink,
  Info,
  Menu,
  Monitor,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  WandSparkles,
  X,
} from 'lucide-react';

type FlowStep = 'login' | 'keys' | 'authorize' | 'success';

type AccessKeyItem = {
  id: string;
  createdAt: string;
  value: string;
};

type MockAccount = {
  nickname: string;
  avatar: string;
};

interface ConnectorAuthPrototypePageProps {
  onBack: () => void;
}

const initialKeys: AccessKeyItem[] = [
  {
    id: 'key-1',
    createdAt: '2026-08-13 20:51',
    value: 'fd6c17e52f7d8ab13d4c6ef9a2b80137af2c',
  },
  {
    id: 'key-2',
    createdAt: '2026-06-05 00:04',
    value: '3c7f6ab19de45ca20f9b7338514fce02605b2',
  },
];

const permissionList = [
  '读取你的账户基本信息',
  '读取你的设计元数据',
  '创建设计稿并写入内容',
  '读取你的设计内容与资源',
  '上传、修改并删除连接器生成的资源',
  '读取团队品牌管理中的元数据',
];

const browserTabs = ['创客贴', '授权中心', 'WorkBuddy', '项目打标', '插件'];

const maskKey = (value: string) => {
  if (value.length <= 12) return value;
  return `${value.slice(0, 4)}${'*'.repeat(Math.max(8, value.length - 8))}${value.slice(-4)}`;
};

const createMockKey = () => {
  const stamp = Date.now().toString(16);
  const random = Math.random().toString(16).slice(2, 18);
  return `${stamp}${random}`.slice(0, 36);
};

const defaultAccount: MockAccount = {
  nickname: '创客贴用户',
  avatar: '创',
};

export function ConnectorAuthPrototypePage({ onBack }: ConnectorAuthPrototypePageProps) {
  const [step, setStep] = useState<FlowStep>('login');
  const [keys, setKeys] = useState<AccessKeyItem[]>(initialKeys);
  const [selectedKeyId, setSelectedKeyId] = useState<string>(initialKeys[0]?.id ?? '');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [alwaysAllow, setAlwaysAllow] = useState(false);
  const [showWorkBuddyPrompt, setShowWorkBuddyPrompt] = useState(false);
  const [account, setAccount] = useState<MockAccount | null>(null);

  const selectedKey = useMemo(
    () => keys.find((item) => item.id === selectedKeyId) ?? keys[0] ?? null,
    [keys, selectedKeyId],
  );

  useEffect(() => {
    if (step === 'success') {
      const timer = window.setTimeout(() => setShowWorkBuddyPrompt(true), 500);
      return () => window.clearTimeout(timer);
    }
    setShowWorkBuddyPrompt(false);
    return undefined;
  }, [step]);

  useEffect(() => {
    if (!copiedKeyId) return undefined;
    const timer = window.setTimeout(() => setCopiedKeyId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedKeyId]);

  const handleLogin = () => {
    setAccount(defaultAccount);
    setStep('keys');
  };

  const handleSwitchAccount = () => {
    setAccount(null);
    setSelectedKeyId(initialKeys[0]?.id ?? '');
    setAlwaysAllow(false);
    setShowWorkBuddyPrompt(false);
    setStep('login');
  };

  const handleCreateKey = () => {
    const nextKey: AccessKeyItem = {
      id: `key-${Date.now()}`,
      createdAt: '2026-08-18 10:24',
      value: createMockKey(),
    };
    setKeys((prev) => [nextKey, ...prev]);
    setSelectedKeyId(nextKey.id);
  };

  const handleDeleteKey = (id: string) => {
    setKeys((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (selectedKeyId === id) {
        setSelectedKeyId(next[0]?.id ?? '');
      }
      return next;
    });
  };

  const handleCopyKey = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKeyId(id);
    } catch {
      window.alert(`复制失败，请手动复制：${value}`);
    }
  };

  const addressText =
    step === 'login'
      ? 'passport.chuangkit.com/login?from=mcp_connector'
      : step === 'authorize'
        ? 'mcp.chuangkit.com/api/oauth/authorize?client_id=workbuddy-connector&redirect_uri=https%3A%2F%2Fmcp.chuangkit.com%2Fcallback'
        : step === 'success'
          ? 'mcp.chuangkit.com/callback/success?redirectTo=workbuddy%3A%2F%2Fworkbuddy%2Fmcp%2Fconnector%2Foauth%2Fcallback'
          : 'mcp.chuangkit.com/connector/access-key';

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f4f7ff_0%,#edf2ff_35%,#f7f9ff_100%)] text-[#1f2430]">
      <div className="border-b border-[#dbe4f3] bg-[linear-gradient(180deg,#e4ebf8_0%,#dbe5f4_100%)] px-4 py-3 shadow-[inset_0_-1px_0_rgba(255,255,255,0.78)]">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-[14px] bg-[rgba(189,205,233,0.72)] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
            {browserTabs.map((tab, index) => (
              <div
                key={tab}
                className={`flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[11px] font-medium ${
                  index === 1
                    ? 'bg-[linear-gradient(180deg,#fdfefe_0%,#eef3fb_100%)] text-stone-900 shadow-[0_1px_1px_rgba(84,99,135,0.14)]'
                    : 'text-stone-600'
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-[4px] ${index === 1 ? 'bg-[#5f7cff]' : 'bg-white/70'}`} />
                <span className="whitespace-nowrap">{tab}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-2 text-stone-500">
            <button type="button" className="rounded-[12px] bg-[rgba(255,255,255,0.62)] p-2">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-[12px] bg-[rgba(255,255,255,0.62)] p-2">
              <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-[12px] bg-[rgba(255,255,255,0.62)] p-2">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(180deg,#eef3fb_0%,#e9eff8_100%)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_1px_2px_rgba(92,106,141,0.06)]">
            <Info className="h-4.5 w-4.5 shrink-0 text-stone-500" />
            <span className="truncate text-[14px] font-medium text-stone-700">{addressText}</span>
            <div className="ml-auto flex items-center gap-3 text-stone-500">
              <Star className="h-4.5 w-4.5" />
              <Menu className="h-4.5 w-4.5" />
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-[0_1px_2px_rgba(92,106,141,0.08)]"
          >
            <ChevronLeft className="h-4 w-4" />
            返回首页
          </button>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-110px)] max-w-[1520px] gap-6 px-6 py-6">
        <section className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-white/70 bg-white/60 shadow-[0_24px_60px_rgba(78,96,145,0.10)] backdrop-blur-sm">
          {step === 'login' && (
            <div className="grid min-h-full lg:grid-cols-[1.18fr_0.82fr]">
              <div className="relative overflow-hidden bg-[linear-gradient(180deg,#1977ff_0%,#156bf2_100%)] px-10 py-14 text-white">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.3)_0,rgba(255,255,255,0.3)_30px,transparent_31px),radial-gradient(circle_at_55%_20%,rgba(255,255,255,0.2)_0,rgba(255,255,255,0.2)_56px,transparent_57px),radial-gradient(circle_at_30%_65%,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_70px,transparent_71px)]" />
                <img src={cktAiEcomLogo} alt="创客贴" className="relative z-10 h-16 w-auto" />
                <div className="relative z-10 mt-20 max-w-[420px]">
                  <h1 className="text-[58px] font-black leading-[1.1] tracking-[-0.06em]">让设计触手可得</h1>
                  <div className="mt-10 space-y-5 text-[28px] font-semibold tracking-[-0.03em] text-white/96">
                    <div>一步登录即可继续连接器授权</div>
                    <div>登录后直接选择或创建 Access Key</div>
                    <div>完成授权后自动回到 WorkBuddy</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center bg-[linear-gradient(180deg,#fdfefe_0%,#f8f9ff_100%)] px-8 py-10">
                <div className="w-full max-w-[430px] rounded-[28px] border border-[#edf0f7] bg-white px-8 py-8 shadow-[0_26px_60px_rgba(91,101,133,0.12)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[#eff7ff] p-3 text-[#1a7dff]">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="text-[28px] font-bold tracking-[-0.04em] text-stone-900">微信安全登录</div>
                    </div>
                    <div className="rounded-full border border-[#d7e3ff] px-3 py-1 text-xs font-semibold text-[#2f6cff]">
                      模拟流程
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <div className="rounded-[18px] border border-[#eceff5] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)]">
                      <div className="grid h-[184px] w-[184px] grid-cols-6 gap-1 rounded-[10px] bg-white p-2">
                        {Array.from({ length: 36 }).map((_, index) => (
                          <span
                            key={index}
                            className={`${index % 5 === 0 || index % 7 === 0 || index % 11 === 0 ? 'bg-stone-900' : 'bg-white'} rounded-[2px] border border-stone-100`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-center text-[15px] text-[#616b7f]">
                    扫码登录或点击下方按钮，直接模拟登录成功
                  </div>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(90deg,#2f6cff_0%,#7c58ff_100%)] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_30px_rgba(84,105,255,0.26)]"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    模拟登录成功
                  </button>
                  <div className="mt-4 text-center text-[12px] text-[#9aa3b7]">
                    原型说明：当前只模拟登录结果，不接真实账号体系
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'keys' && (
            <div className="flex min-h-full items-start justify-center bg-[radial-gradient(circle_at_top,rgba(110,143,255,0.08)_0%,rgba(255,255,255,0)_42%)] px-6 py-10">
              <div className="w-full max-w-[980px] rounded-[28px] border border-[#eaedf6] bg-white px-8 py-7 shadow-[0_26px_60px_rgba(91,101,133,0.10)]">
                <div>
                  <div>
                    <div className="text-[30px] font-black tracking-[-0.05em] text-stone-900">我的 Access Key</div>
                    <div className="mt-4 space-y-2 text-[15px] leading-7 text-[#4d5871]">
                      <div>· Access key 仅用于创客贴智能体 skills 的调用授权使用，请谨慎保管。</div>
                      <div>· 连接器授权将基于你选择的 key，为 WorkBuddy 建立调用映射关系。</div>
                      <div>· 如当前没有可用 key，可先创建一个新的 Access Key 再继续授权。</div>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateKey}
                    className="inline-flex shrink-0 items-center gap-2 rounded-[14px] bg-[linear-gradient(90deg,#6f63ff_0%,#5d82ff_100%)] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_16px_26px_rgba(98,108,255,0.24)]"
                  >
                    <CirclePlus className="h-4.5 w-4.5" />
                    创建新 Access Key
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-[#edf0f6]">
                  <div className="grid grid-cols-[210px_minmax(0,1fr)_216px] bg-[#f7f8fd] px-6 py-4 text-[13px] font-semibold text-[#788197]">
                    <div>创建日期</div>
                    <div>Access key</div>
                    <div className="text-right">操作</div>
                  </div>

                  {keys.length === 0 ? (
                    <div className="px-6 py-10 text-[15px] text-[#8a94aa]">暂无 Access key</div>
                  ) : (
                    keys.map((item, index) => {
                      const active = item.id === selectedKey?.id;
                      return (
                        <div
                          key={item.id}
                          className={`grid grid-cols-[210px_minmax(0,1fr)_216px] items-center gap-4 px-6 py-4 text-[15px] ${
                            index !== keys.length - 1 ? 'border-t border-[#f0f2f7]' : ''
                          } ${active ? 'bg-[linear-gradient(90deg,rgba(111,99,255,0.05)_0%,rgba(93,130,255,0.03)_100%)]' : 'bg-white'}`}
                        >
                          <div className="font-medium text-[#38445f]">{item.createdAt}</div>
                          <div className="min-w-0 truncate font-mono text-[#2b3650]">{maskKey(item.value)}</div>
                          <div className="flex items-center justify-end gap-2 text-[12px] font-medium">
                            <button
                              type="button"
                              onClick={() => handleCopyKey(item.id, item.value)}
                              className="inline-flex items-center gap-1 rounded-[10px] px-2 py-1 text-[#7081a3] transition hover:bg-[#f6f8ff]"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              {copiedKeyId === item.id ? '已复制' : '复制'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedKeyId(item.id);
                                setStep('authorize');
                              }}
                              className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(90deg,#2f6cff_0%,#6d63ff_100%)] px-3.5 py-1.5 text-[12px] text-white shadow-[0_8px_16px_rgba(84,105,255,0.18)]"
                            >
                              <WandSparkles className="h-3.5 w-3.5" />
                              使用
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteKey(item.id)}
                              className="inline-flex items-center gap-1 rounded-[10px] px-2 py-1 text-[#9aa3b7] transition hover:bg-[#fff4f4] hover:text-[#df4d61]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              删除
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'authorize' && selectedKey && (
            <div className="flex min-h-full items-center justify-center bg-[linear-gradient(180deg,#fbfcff_0%,#f5f7ff_100%)] px-6 py-10">
              <div className="w-full max-w-[470px] rounded-[30px] border border-[#e8edf7] bg-white px-8 py-8 shadow-[0_28px_70px_rgba(96,104,145,0.14)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00c7d8_0%,#6d3cff_100%)] text-white shadow-[0_16px_34px_rgba(86,88,223,0.22)]">
                  <Monitor className="h-7 w-7" />
                </div>
                <div className="mt-6 text-center text-[34px] font-black tracking-[-0.05em] text-stone-900">
                  创客贴 AI 连接器想要访问你的创客贴账户
                </div>
                <div className="mt-5 rounded-[20px] border border-[#edf1f7] bg-[#fbfcff] px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2f6cff_0%,#6d63ff_100%)] text-[18px] font-semibold text-white">
                        {account?.avatar ?? '创'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-[#8b94a8]">当前授权账号</div>
                        <div className="truncate text-[16px] font-semibold text-[#2b3650]">{account?.nickname ?? '创客贴用户'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="shrink-0 text-[13px] font-semibold text-[#4f75ff] transition hover:text-[#355fff]"
                    >
                      切换账号
                    </button>
                  </div>
                  <div className="mt-4 border-t border-[#eef2f8] pt-4 text-center">
                    <div className="text-[15px] text-[#5f6b85]">将绑定 key：</div>
                    <div className="mt-2 break-all font-mono text-[15px] text-[#2b3650]">{maskKey(selectedKey.value)}</div>
                  </div>
                </div>

                <div className="mt-7 rounded-[22px] bg-[#fbfcff] px-5 py-5">
                  <div className="text-[15px] font-semibold text-stone-900">此操作将允许连接器：</div>
                  <div className="mt-4 space-y-3">
                    {permissionList.map((permission) => (
                      <div key={permission} className="flex items-start gap-3 text-[15px] text-[#45506a]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e9f7ee] text-[#1f9f55]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('success')}
                    className="rounded-[16px] bg-[linear-gradient(90deg,#7a3cff_0%,#4f88ff_100%)] px-5 py-3.5 text-[16px] font-semibold text-white shadow-[0_16px_28px_rgba(95,99,255,0.24)]"
                  >
                    允许并继续
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('keys')}
                    className="rounded-[16px] border border-[#e2e8f5] px-5 py-3.5 text-[16px] font-semibold text-[#4f5d79]"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="relative flex min-h-full items-center justify-center bg-[linear-gradient(180deg,#fafcff_0%,#f4f7ff_100%)] px-6 py-10">
              <div className="w-full max-w-[620px] rounded-[32px] border border-[#e8edf7] bg-white px-8 py-10 text-center shadow-[0_28px_70px_rgba(96,104,145,0.14)]">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-[0_16px_34px_rgba(34,197,94,0.22)]">
                  <Check className="h-9 w-9" />
                </div>
                <div className="mt-8 text-[48px] font-black tracking-[-0.06em] text-stone-900">授权成功</div>
                <div className="mt-4 text-[22px] font-semibold text-[#36425b]">应用已成功打开</div>
                        <div className="mt-4 text-[17px] leading-8 text-[#66728b]">
                          当前原型将模拟回调到 `workbuddy://workbuddy/mcp/connector/oauth/callback`
                          <br />
                          你现在可以关闭此窗口，或继续点击下方按钮返回授权方。
                </div>
                <button
                  type="button"
                  onClick={() => setShowWorkBuddyPrompt(true)}
                  className="mt-8 inline-flex items-center gap-2 rounded-[16px] bg-[linear-gradient(90deg,#2f6cff_0%,#6d63ff_100%)] px-6 py-3.5 text-[16px] font-semibold text-white shadow-[0_16px_28px_rgba(84,105,255,0.22)]"
                >
                  <ExternalLink className="h-4.5 w-4.5" />
                  返回 WorkBuddy
                </button>
              </div>

              {showWorkBuddyPrompt && (
                <div className="absolute inset-0 flex items-start justify-center bg-[rgba(23,29,45,0.34)] px-6 pt-12 backdrop-blur-[2px]">
                  <div className="w-full max-w-[720px] rounded-[28px] border border-[#e7ebf4] bg-white px-8 py-8 shadow-[0_34px_80px_rgba(37,47,75,0.28)]">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="text-[28px] font-black tracking-[-0.05em] text-stone-900">要打开 WorkBuddy 吗？</div>
                        <div className="mt-4 text-[18px] leading-8 text-[#53617d]">
                          `https://mcp.chuangkit.com` 想打开此应用。
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWorkBuddyPrompt(false)}
                        className="rounded-full p-2 text-[#98a2b8]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-center gap-3 text-[16px] text-[#53617d]">
                      <input
                        type="checkbox"
                        checked={alwaysAllow}
                        onChange={(event) => setAlwaysAllow(event.target.checked)}
                        className="h-5 w-5 rounded border-[#c7d2e9]"
                      />
                      始终允许 `mcp.chuangkit.com` 在关联的应用中打开此类链接
                    </label>

                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setShowWorkBuddyPrompt(false)}
                        className="rounded-[16px] bg-[#eef2f7] px-6 py-3 text-[16px] font-semibold text-[#5a6884]"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        className="rounded-[16px] bg-[linear-gradient(90deg,#2f6cff_0%,#6d63ff_100%)] px-6 py-3 text-[16px] font-semibold text-white shadow-[0_16px_28px_rgba(84,105,255,0.22)]"
                      >
                        打开 WorkBuddy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="hidden w-[320px] shrink-0 rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_60px_rgba(78,96,145,0.10)] backdrop-blur-sm xl:block">
          <div className="text-[13px] font-semibold uppercase tracking-[0.24em] text-[#8893aa]">Flow State</div>
          <div className="mt-4 space-y-3">
            {[
              { key: 'login', label: '1. 登录创客贴' },
              { key: 'keys', label: '2. 查看 / 创建 Access Key' },
              { key: 'authorize', label: '3. 确认授权信息' },
              { key: 'success', label: '4. 回跳 WorkBuddy' },
            ].map((item) => {
              const active = item.key === step;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStep(item.key as FlowStep)}
                  className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-[15px] font-semibold transition ${
                    active
                      ? 'bg-[linear-gradient(90deg,#2f6cff_0%,#6d63ff_100%)] text-white shadow-[0_16px_26px_rgba(84,105,255,0.22)]'
                      : 'bg-[#f7f9ff] text-[#4d5871]'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${
                      active ? 'bg-white/18 text-white' : 'bg-white text-[#6d63ff]'
                    }`}
                  >
                    {item.label.slice(0, 1)}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[22px] border border-[#edf0f7] bg-[#fbfcff] p-4">
            <div className="text-[16px] font-bold text-stone-900">原型说明</div>
            <div className="mt-3 space-y-3 text-[14px] leading-7 text-[#5f6b85]">
              <div>1. 登录页参考图 1，使用按钮模拟登录成功。</div>
              <div>2. Key 列表参考图 2 / 图 3，支持创建、复制、删除和“使用”。</div>
              <div>3. 授权页参考图 4，展示权限说明与绑定的 Access Key。</div>
              <div>4. 成功态参考图 5，模拟回调并弹出“打开 WorkBuddy”确认框。</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
