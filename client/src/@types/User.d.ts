declare type User = {
  id: number;
  global_name: string;
  permissions: {
    hl: 0 | 1 | 2;
    teamId: number;
  };
};
