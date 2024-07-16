import DynamicTable from '../../components/DynamicTable';

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4">Bảng Thống Kê</h1>
      <DynamicTable />
    </div>
  );
}