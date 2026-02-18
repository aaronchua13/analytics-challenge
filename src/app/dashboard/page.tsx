import DashboardContent from '@/components/dashboard/dashboard-content';

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <DashboardContent searchParams={props.searchParams} />;
}