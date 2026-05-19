import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';

export default function CompanyOverview() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Company Overview', href: '/company' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <p>Company Overview - coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
