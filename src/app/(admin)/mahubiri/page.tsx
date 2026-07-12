import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Mahubiri from "@/components/mahubiri";


export default function Page() {
  return (
    <div className="space-y-6">

      <PageBreadcrumb pageTitle="Mahubiri ya Kanisa" />

      <div className="max-w-7xl mx-auto">
        <Mahubiri />
      </div>

    </div>
  );
}
