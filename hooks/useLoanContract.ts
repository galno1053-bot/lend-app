import { hybridLoanManagerAbi } from "@pinjaman/shared";
import { CONTRACT_ADDRESS } from "../lib/config";

export function useLoanContract() {
  return {
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi
  } as const;
}
