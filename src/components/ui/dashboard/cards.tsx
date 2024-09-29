import {
    BanknotesIcon,
    ClockIcon,
    UserGroupIcon,
    InboxIcon,
    ExclamationTriangleIcon,
  } from '@heroicons/react/24/outline';
  import { lusitana } from '@/components/fonts';
  import { fetchCardData } from '@/lib/mknnClassifier';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  
  const iconMap = {
    collected: BanknotesIcon,
    customers: UserGroupIcon,
    pending: ClockIcon,
    invoices: InboxIcon,
    violations: ExclamationTriangleIcon,
  };
  
  export default async function Component() {
    const zoneData = await fetchCardData();
   
    return (
      <div className="flex gap-1">
        {Object.entries(zoneData).map(([zone, data]) => (
          <ZoneCard key={zone} zone={zone} data={data} />
        ))}
      </div>
    );
  }
  
  function ZoneCard({ zone, data }: { 
    zone: string, 
    data: { 
      challans: number, 
      amount: number, 
      avgAmount: number,
      violations: { name: string, count: number }[]
    } 
  }) {
    return (
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle>{zone}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DataRow title="Total Challans" value={data.challans} type="invoices" />
            <DataRow title="Total Amount" value={`₹${data.amount.toLocaleString()}`} type="collected" />
            <DataRow title="Average Amount" value={`₹${data.avgAmount.toFixed(2)}`} type="pending" />
            <ViolationRow violations={data.violations} />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  function DataRow({
    title,
    value,
    type,
  }: {
    title: string;
    value: number | string;
    type: 'invoices' | 'customers' | 'pending' | 'collected' | 'violations';
  }) {
    const Icon = iconMap[type];
  
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <p className={`${lusitana.className} text-lg font-semibold`}>
          {value}
        </p>
      </div>
    );
  }
  
  function ViolationRow({ violations }: { violations: { name: string; count: number }[] }) {
    return (
      <div className="space-y-2 ">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Top Violations</h3>
        </div>
        <ul className="space-y-1">
          {violations.slice(0, 3).map((violation, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span>{violation.name}</span>
              <span className="font-semibold">{violation.count}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }