import Image from "next/image";
import Link from "next/link";

const DEFAULT_NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", label: "대시보드" },
  { key: "coolingoff", href: "/coolingoff", label: "쿨링오프" },
];

function getNavItemClassName(isActive) {
  return [
    "rounded-xl px-5 py-3 text-base font-semibold transition-colors",
    isActive ? "bg-[#9AB79E] text-white" : "text-black hover:bg-[#E8F1E9]",
  ].join(" ");
}

export default function Header({
  variant = "default",
  activeMenu,
  navItems,
  rightSlot,
  logoHref = "/",
  className = "",
}) {
  const isAuthPage = variant === "auth";
  const resolvedNavItems = navItems ?? (isAuthPage ? [] : DEFAULT_NAV_ITEMS);
  const resolvedRightSlot =
    rightSlot ??
    (!isAuthPage ? (
      <Link
        href="/auth/login"
        className="text-base font-semibold text-[#5D7A62]"
      >
        로그아웃
      </Link>
    ) : null);

  return (
    <header
      className={`fixed left-0 top-0 z-10 w-full px-10 py-2 ${className}`}
    >
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link href={logoHref}>
            <Image
              src="/images/logo.png"
              alt="살래말래"
              width={68}
              height={68}
              priority
              className="h-[68px] w-auto"
            />
          </Link>

          {resolvedNavItems.length > 0 && (
            <nav className="flex items-center gap-4">
              {resolvedNavItems.map((item) => (
                <Link
                  key={item.key ?? item.href}
                  href={item.href}
                  className={getNavItemClassName(activeMenu === item.key)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {resolvedRightSlot}
      </div>
    </header>
  );
}
