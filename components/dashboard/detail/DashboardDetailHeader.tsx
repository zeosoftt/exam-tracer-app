'use client';

import { AppBrandLink, AppHeaderActions, AppPageHeader } from '@/components/ui';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

type DashboardDetailHeaderProps = {
  user: DashboardUser;
};

export function DashboardDetailHeader({ user }: DashboardDetailHeaderProps) {
  return (
    <AppPageHeader
      left={<AppBrandLink variant="gradient" />}
      right={
        <AppHeaderActions
          userName={user.name}
          showUserName
          showSupport={false}
          userNameVisibility="always"
          userNameClassName="max-w-[100px] sm:max-w-none"
          supportVariant="icon"
        />
      }
    />
  );
}
