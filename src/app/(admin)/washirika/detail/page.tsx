import { Suspense } from "react";
import DetailContent from "./DetailContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Inapakia...</div>}>
      <DetailContent />
    </Suspense>
  );
}