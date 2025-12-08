'use client';

import { useQuery } from '@tanstack/react-query';

export default function TestQueryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      console.log('🔍 Test query running...');
      return { message: 'React Query is working!' };
    },
  });

  console.log('Test Query State:', { data, isLoading, error });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">React Query Test</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {String(error)}</p>}
      {data && (
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-800 font-bold">{data.message}</p>
        </div>
      )}
    </div>
  );
}
