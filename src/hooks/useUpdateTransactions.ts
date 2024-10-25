import { useCallback } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import {
  SetTransactionApprovalParams,
  SetTransactionApprovalFunction,
  PaginatedResponse,
  Transaction,
} from "src/utils/types";

export function useUpdateTransactions() {
  const { fetchWithoutCache, updateCacheByEndpoint, loading } =
    useCustomFetch();

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>(
        "setTransactionApproval",
        {
          transactionId,
          value: newValue,
        }
      );

      const updateTransaction = (transaction: Transaction) =>
        transaction.id === transactionId
          ? { ...transaction, approved: newValue }
          : transaction;

      const updatePaginatedData = (data: PaginatedResponse<Transaction[]>) => ({
        ...data,
        data: data.data.map(updateTransaction),
      });

      const updateTransactionArray = (data: Transaction[]) =>
        data.map(updateTransaction);

      updateCacheByEndpoint<PaginatedResponse<Transaction[]> | Transaction[]>(
        ["paginatedTransactions", "transactionsByEmployee"],
        (data) => {
          const isPaginated = !Array.isArray(data) && "data" in data;
          return isPaginated
            ? updatePaginatedData(data)
            : updateTransactionArray(data);
        }
      );
    },
    [fetchWithoutCache, updateCacheByEndpoint]
  );

  return { setTransactionApproval, loading };
}
