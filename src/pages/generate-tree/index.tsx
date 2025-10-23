import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { TreeForm } from './components/TreeForm';

export default function GenerateTree() {
  return (
    <div>
      <PageHeader
        title="Generate Tree"
        description="Parse and create a new decision tree from FIGS format"
      />
      <TreeForm />
    </div>
  );
}
