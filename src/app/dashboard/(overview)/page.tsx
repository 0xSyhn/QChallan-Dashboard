import { lusitana } from "@/components/fonts";
import { Suspense } from "react";
import { LatestInvoicesSkeleton, RevenueChartSkeleton, CardSkeleton } from "@/components/skeleton";
import CardWrapper from "@/components/ui/dashboard/cards";


export default async function Page(){

    return(
        <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton/>}>
          <CardWrapper/>
        </Suspense>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          {/* <RevenueChart revenue={revenue}  /> */}
          <Suspense fallback={<RevenueChartSkeleton />}>
          {/* <RevenueChart/> */}
        </Suspense>
        <Suspense fallback = {<LatestInvoicesSkeleton/>}>
          {/* <LatestInvoices /> */}
          </Suspense>
        </div>
      </main>   
    );
}