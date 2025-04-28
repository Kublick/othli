export interface Accounts {
  accounts: {
    id: string;
    balance: number;
    subtypeName: string;
    name: string;
    typeName: string;
    displayName: string;
    balanceAsOf: string;
    closedOn: string;
    institutionName: string;
    excludeTransactions: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  totalBalance: number;
}
