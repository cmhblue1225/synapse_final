import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '../../stores/search.store';

export const SearchPage: React.FC = () => {
  const { 
    results, 
    isSearching, 
    totalCount, 
    currentPage, 
    totalPages,
    searchTime,
    quickSearch,
    clearResults
  } = useSearchStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Clear results when component mounts
    return () => clearResults();
  }, [clearResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await quickSearch(searchQuery.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">지식 검색</h1>
        
        {/* Search form */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="지식을 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              필터
            </button>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '검색 중...' : '검색'}
            </button>
          </div>
        </form>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  노드 타입
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                  <option value="">모든 타입</option>
                  <option value="Knowledge">지식</option>
                  <option value="Concept">개념</option>
                  <option value="Fact">사실</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  콘텐츠 타입
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                  <option value="">모든 타입</option>
                  <option value="text">텍스트</option>
                  <option value="document">문서</option>
                  <option value="image">이미지</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                  <option value="relevance">관련도순</option>
                  <option value="date">날짜순</option>
                  <option value="title">제목순</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      <div className="space-y-6">
        {/* Results header */}
        {results.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              총 {totalCount.toLocaleString()}개의 결과 ({searchTime}ms)
            </span>
            <span>
              페이지 {currentPage} / {totalPages}
            </span>
          </div>
        )}

        {/* Search results */}
        {isSearching ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <a href={`/app/knowledge/${result.id}`} className="hover:text-primary-600">
                    {result.title}
                  </a>
                </h3>
                <p className="text-gray-600 mb-3">
                  {result.content}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">
                      {new Date(result.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-gray-500">
                      관련도: {(result.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  {result.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {result.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Highlights */}
                {result.highlights.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    {result.highlights.map((highlight, index) => (
                      <div key={index} dangerouslySetInnerHTML={{ __html: highlight }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과 없음</h3>
            <p className="mt-1 text-sm text-gray-500">
              '{searchQuery}'에 대한 검색 결과를 찾을 수 없습니다.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">지식 검색</h3>
            <p className="mt-1 text-sm text-gray-500">
              저장된 지식 노드를 검색해보세요.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                이전
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNum === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};