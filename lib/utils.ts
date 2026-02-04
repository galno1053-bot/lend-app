import { keccak256, stringToBytes } from "viem";

export const STATUS_KEYS = [
  "payout_pending",
  "active",
  "repay_requested",
  "closed",
  "liquidated"
] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export function statusToKey(status: number): StatusKey | "unknown" {
  return STATUS_KEYS[status] ?? "unknown";
}

export function buildRepayRef(positionId: bigint) {
  return keccak256(stringToBytes(`repay:${positionId}:${Date.now()}`));
}
