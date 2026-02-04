"use client";

import { useParams } from "next/navigation";
import PositionDetail from "../../../components/PositionDetail";
import { useI18n } from "../../../components/LanguageProvider";

export default function PositionPage() {
  const params = useParams();
  const { t } = useI18n();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const positionId = idParam ? BigInt(idParam) : 0n;

  return (
    <section className="max-w-5xl">
      <h1 className="font-display text-2xl mb-4">
        {t("loan_details")} #{idParam}
      </h1>
      <PositionDetail positionId={positionId} />
    </section>
  );
}
