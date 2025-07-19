declare type Dashboard = {
  info: DashboardInfo[];
  account: DashboardAccount[];
  sub: string[];
  heartbeat: DashboardHeartbeat[];
};

declare type DashboardAccount = {
  id: string;
  ign: string;
  idx: string;
};

declare type DashboardHeartbeat = {
  subName: string;
  info: string;
  time: string;
  status: string;
  warning: boolean;
};

declare type DashboardInfo = {
  online: string;
  dcName: string;
  ign: string;
  id: string;
  idx: string;
};
