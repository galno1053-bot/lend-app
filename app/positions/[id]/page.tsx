"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import WalletConnectButton from "../../../components/WalletConnectButton";
import PositionDetail from "../../../components/PositionDetail";

export default function PositionPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const positionId = idParam ? BigInt(idParam) : 0n;

  return (
    <main className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-display">
          Pinjaman Hybrid
        </Link>
        <WalletConnectButton />
      </header>

      <section className="mt-10 max-w-4xl">
        <h1 className="font-display text-2xl mb-4">Detail Posisi #{idParam}</h1>
        <PositionDetail positionId={positionId} />
      </section>
    </main>
  );
}
