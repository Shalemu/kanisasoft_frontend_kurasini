import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Makundi from "@/components/makundi/makundi";

export default function Page() {
  return (
    <div className="space-y-6">

      <PageBreadcrumb pageTitle="Makundi ya Kanisa" />

      <div className="max-w-7xl mx-auto">
        <Makundi />
      </div>

    </div>
  );
}
