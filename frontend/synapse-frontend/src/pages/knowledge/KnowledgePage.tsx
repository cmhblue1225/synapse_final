import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useKnowledgeStore } from '../../stores/knowledge.store';
import { knowledgeService } from '../../services/knowledge.service';

export const KnowledgePage: React.FC = () => {
  const { nodes, totalNodes, isLoading, fetchNodes } = useKnowledgeStore();

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['user-nodes'],
    queryFn: () => knowledgeService.getUserNodes({ limit: 50 }),
    onSuccess: (data) => {
      // Update store with fetched data if needed
    }
  });

  const allNodes = data?.nodes || nodes;
  const loading = queryLoading || isLoading;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">지식 노드</h1>
          <p className="mt-2 text-gray-600">
            총 {totalNodes || allNodes.length}개의 노드가 있습니다.
          </p>
        </div>
        <Link
          to="/app/knowledge/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          새 노드 생성
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <select className="block p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option value="">모든 타입</option>
            <option value="Knowledge">지식</option>
            <option value="Concept">개념</option>
            <option value="Fact">사실</option>
          </select>
          <select className="block p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option value="updatedAt">최근 수정순</option>
            <option value="createdAt">최근 생성순</option>
            <option value="title">제목순</option>
          </select>
        </div>
      </div>

      {/* Node grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : allNodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNodes.map((node) => (
            <Link
              key={node.id}
              to={`/app/knowledge/${node.id}`}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {node.title}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                    {node.content.substring(0, 150)}
                    {node.content.length > 150 ? '...' : ''}
                  </p>
                </div>
                <BookOpenIcon className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
              </div>
              
              <div className="mt-4">
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {node.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        #{tag}
                      </span>
                    ))}
                    {node.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        +{node.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{node.nodeType}</span>
                  <span>{new Date(node.updatedAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">노드가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            첫 번째 지식 노드를 생성해보세요.
          </p>
          <div className="mt-6">
            <Link
              to="/app/knowledge/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              새 노드 생성
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};