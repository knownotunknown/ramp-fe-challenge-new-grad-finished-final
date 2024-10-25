import { useCustomFetch } from "src/hooks/useCustomFetch";
import { TransactionPane } from "./TransactionPane";
import { TransactionsComponent } from "./types";
import { useUpdateTransactions } from "src/hooks/useUpdateTransactions";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { setTransactionApproval, loading } = useUpdateTransactions();

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  );
};
