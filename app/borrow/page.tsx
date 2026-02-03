import Link from "next/link";
import WalletConnectButton from "../../components/WalletConnectButton";
import BorrowForm from "../../components/BorrowForm";

export default function BorrowPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-display">
          Pinjaman Hybrid
        </Link>
        <WalletConnectButton />
      </header>

      <section className="mt-10 max-w-3xl">
        <BorrowForm />
      </section>
    </main>
  );
}
