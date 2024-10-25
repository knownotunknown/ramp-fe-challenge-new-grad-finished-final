import { FunctionComponent } from "react";
import { Transaction } from "../../utils/types";
import { SetTransactionApprovalFunction } from "../../utils/types";

type TransactionsProps = { transactions: Transaction[] | null };

type TransactionPaneProps = {
  transaction: Transaction;
  loading: boolean;
  approved?: boolean;
  setTransactionApproval: SetTransactionApprovalFunction;
};

export type TransactionsComponent = FunctionComponent<TransactionsProps>;
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>;
