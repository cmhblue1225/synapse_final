import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ChartBarIcon,
  TagIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/auth.store';
import { knowledgeService } from '../services/knowledge.service';
import { searchService } from '../services/search.service';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Fetch recent nodes
  const { data: recentNodes, isLoading: nodesLoading } = useQuery({
    queryKey: ['recent-nodes'],
    queryFn: () => knowledgeService.getUserNodes({ 
      limit: 5, 
      sortBy: 'updatedAt', 
      sortOrder: 'DESC' 
    }),
  });

  // Fetch node stats
  const { data: nodeStats, isLoading: statsLoading } = useQuery({
    queryKey: ['node-stats'],
    queryFn: () => knowledgeService.getNodeStats(),
  });

  // Fetch popular tags
  const { data: popularTags, isLoading: tagsLoading } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: () => searchService.getPopularTags(10),
  });

  const quickActions = [
    {
      name: '새 노트 작성',
      description: '아이디어를 빠르게 기록하세요',
      href: '/app/knowledge/create',
      icon: PlusIcon,
      color: 'bg-primary-500',
    },
    {
      name: '지식 검색',
      description: '저장된 지식을 찾아보세요',
      href: '/app/search',
      icon: MagnifyingGlassIcon,
      color: 'bg-green-500',
    },
    {
      name: '지식 노드',
      description: '모든 노드를 살펴보세요',
      href: '/app/knowledge',
      icon: BookOpenIcon,
      color: 'bg-blue-500',
    },
    {
      name: '통계 보기',
      description: '지식 활동을 분석하세요',
      href: '/app/stats',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
  ];

  const stats = [
    {
      name: '전체 노드',
      value: nodeStats?.totalNodes || 0,
      change: '+12%',
      changeType: 'positive',
      icon: BookOpenIcon,
    },
    {
      name: '이번 주 생성',
      value: '8',
      change: '+5.4%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
    },
    {
      name: '연결된 관계',
      value: '23',
      change: '+3.2%',
      changeType: 'positive',
      icon: TagIcon,
    },
    {
      name: '검색 횟수',
      value: '47',
      change: '-1.2%',
      changeType: 'negative',
      icon: MagnifyingGlassIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {user?.username || user?.firstName || '사용자'}님! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          오늘도 새로운 지식을 발견해보세요. 현재까지 {nodeStats?.totalNodes || 0}개의 노드를 생성하셨습니다.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">빠른 작업</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                        <action.icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                        {action.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent nodes */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">최근 노드</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {nodesLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentNodes?.nodes?.length ? (
                recentNodes.nodes.map((node) => (
                  <Link
                    key={node.id}
                    to={`/app/knowledge/${node.id}`}
                    className="block hover:bg-gray-50 px-6 py-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <BookOpenIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {node.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {node.content.substring(0, 100)}...
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-400">
                          <ClockIcon className="h-3 w-3" />
                          <span>{new Date(node.updatedAt).toLocaleDateString('ko-KR')}</span>
                          {node.tags?.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex space-x-1">
                                {node.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">노드가 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">첫 번째 지식 노드를 생성해보세요.</p>
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Popular tags */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">인기 태그</h3>
            </div>
            <div className="p-6">
              {tagsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              ) : popularTags?.tags?.length ? (
                <div className="space-y-3">
                  {popularTags.tags.map((tag) => (
                    <div key={tag.tag} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">#{tag.tag}</span>
                      <span className="text-sm text-gray-500">{tag.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">아직 태그가 없습니다.</p>
              )}
            </div>
          </div>

          {/* Activity summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">활동 요약</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-sm font-medium text-gray-900">3개 노드 생성</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-sm font-medium text-gray-900">8개 노드 생성</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">총 검색</span>
                <span className="text-sm font-medium text-gray-900">47회</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};