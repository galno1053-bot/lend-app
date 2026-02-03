import { useReadContract } from "wagmi";
import { useLoanContract } from "./useLoanContract";

export function usePrices() {
  const contract = useLoanContract();

  const ethUsd = useReadContract({
    ...contract,
    functionName: "getEthUsd"
  });

  const usdIdrRate = useReadContract({
    ...contract,
    functionName: "usdIdrRate"
  });

  const usdIdrUpdatedAt = useReadContract({
    ...contract,
    functionName: "usdIdrUpdatedAt"
  });

  const isFxStale = useReadContract({
    ...contract,
    functionName: "isFxRateStale"
  });

  return {
    ethUsd,
    usdIdrRate,
    usdIdrUpdatedAt,
    isFxStale
  };
}
