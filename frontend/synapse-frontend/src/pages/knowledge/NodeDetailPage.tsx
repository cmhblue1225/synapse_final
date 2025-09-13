import React from 'react';
import { useParams } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';

export const NodeDetailPage: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">노드 상세</h1>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <BookOpenIcon className="mx-auto h-24 w-24 text-gray-400" />
              <h2 className="mt-4 text-xl font-medium text-gray-900">노드 상세 페이지</h2>
              <p className="mt-2 text-gray-600">노드 ID: {nodeId}</p>
              <p className="mt-1 text-gray-600">곧 추가될 예정입니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};