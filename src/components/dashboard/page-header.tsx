'use client';

import { usePathname } from 'next/navigation';

const titleMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/resume': 'Resume Analyzer',
  '/interview': 'Mock Interview',
  '/mentor': 'AI Mentor',
  '/trends': 'Job Market Trends',
  '/settings': 'Settings',
};

const PageHeader = () => {
  const pathname = usePathname();
  const title = titleMap[pathname] || 'PathFinders AI';

  return <h1 className="font-semibold text-lg">{title}</h1>;
};

export default PageHeader;