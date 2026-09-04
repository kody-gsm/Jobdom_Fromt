export type StudentNavItem = {
  href: "/" | "/counsel";
  label: string;
};

export const STUDENT_NAV_ITEMS: readonly StudentNavItem[] = [
  { href: "/", label: "상담 대시보드" },
  { href: "/counsel", label: "상담 신청" },
];

export const isStudentNavActive = (pathname: string, href: StudentNavItem["href"]) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};
