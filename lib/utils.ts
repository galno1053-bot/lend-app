import { keccak256, stringToBytes } from "viem";

export const STATUS_LABELS = [
  "PAYOUT_PENDING",
  "ACTIVE",
  "REPAY_REQUESTED",
  "CLOSED",
  "LIQUIDATED"
] as const;

export function statusToLabel(status: number) {
  return STATUS_LABELS[status] ?? "UNKNOWN";
}

export function buildRepayRef(positionId: bigint) {
  return keccak256(stringToBytes(`repay:${positionId}:${Date.now()}`));
}
