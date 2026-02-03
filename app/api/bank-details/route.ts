import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyMessage } from "viem";
import { buildBankDetailsMessage, computeOffchainRefHash } from "@pinjaman/shared";
import { getSupabaseServerClient } from "@pinjaman/db/client";

const schema = z.object({
  draftId: z.string().uuid(),
  offchainRefHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  address: z.string(),
  token: z.enum(["ETH", "USDC"]),
  collateralAmount: z.string(),
  requestedIdr: z.string(),
  timestamp: z.string(),
  chainId: z.number(),
  recipientName: z.string(),
  bankName: z.string(),
  accountNumber: z.string(),
  signature: z.string(),
  message: z.string()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const expectedHash = computeOffchainRefHash(body.draftId);
    if (expectedHash.toLowerCase() !== body.offchainRefHash.toLowerCase()) {
      return NextResponse.json({ error: "Invalid offchain ref hash" }, { status: 400 });
    }

    const expectedMessage = buildBankDetailsMessage({
      address: body.address,
      token: body.token,
      collateralAmount: body.collateralAmount,
      requestedIdr: body.requestedIdr,
      draftId: body.draftId,
      timestamp: body.timestamp,
      chainId: String(body.chainId)
    });

    if (expectedMessage !== body.message) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const isValid = await verifyMessage({
      address: body.address as `0x${string}`,
      message: body.message,
      signature: body.signature as `0x${string}`
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("bank_details").insert({
      draft_id: body.draftId,
      offchain_ref_hash: body.offchainRefHash,
      wallet_address: body.address,
      recipient_name: body.recipientName,
      bank_name: body.bankName,
      account_number: body.accountNumber
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
