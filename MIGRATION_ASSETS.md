# 📦 Synapse → Supabase 마이그레이션 자산 정리

## 🎯 100% 재사용 가능한 자산들

### 1. 🎨 UI 컴포넌트 (완전 재사용)

#### 재사용할 파일 목록
```bash
# 프론트엔드 컴포넌트 (수정 없이 그대로 사용 가능)
/Users/dev/synapse/frontend/synapse-frontend/src/components/
├── Header.tsx                    # 상단 네비게이션
├── Sidebar.tsx                   # 사이드바 메뉴
├── LoadingSpinner.tsx           # 로딩 인디케이터
├── ErrorBoundary.tsx            # 에러 처리 컴포넌트
└── ui/                          # 기본 UI 컴포넌트
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── Card.tsx

# 페이지 컴포넌트 (API 호출 부분만 수정 필요)
/Users/dev/synapse/frontend/synapse-frontend/src/pages/
├── auth/
│   ├── LoginPage.tsx            # 로그인 페이지
│   └── RegisterPage.tsx         # 회원가입 페이지
├── DashboardPage.tsx            # 메인 대시보드
├── knowledge/
│   ├── KnowledgeListPage.tsx    # 지식 목록
│   ├── KnowledgeDetailPage.tsx  # 지식 상세보기
│   └── KnowledgeFormPage.tsx    # 지식 작성/편집
└── search/
    └── SearchPage.tsx           # 검색 페이지

# 스타일 파일 (완전 재사용)
/Users/dev/synapse/frontend/synapse-frontend/src/index.css
/Users/dev/synapse/frontend/synapse-frontend/tailwind.config.js
/Users/dev/synapse/frontend/synapse-frontend/postcss.config.js
```

#### 복사 명령어
```bash
# Supabase 새 프로젝트에서 실행
cd /Users/dev/synapse-supabase

# 컴포넌트 및 페이지 복사
cp -r /Users/dev/synapse/frontend/synapse-frontend/src/components ./src/
cp -r /Users/dev/synapse/frontend/synapse-frontend/src/pages ./src/

# 설정 파일 복사
cp /Users/dev/synapse/frontend/synapse-frontend/tailwind.config.js ./
cp /Users/dev/synapse/frontend/synapse-frontend/postcss.config.js ./
cp /Users/dev/synapse/frontend/synapse-frontend/src/index.css ./src/
```

### 2. 🔍 타입 정의 (일부 수정으로 재사용)

#### 재사용 가능한 타입들
```typescript
// /Users/dev/synapse/frontend/synapse-frontend/src/types/api.ts
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface KnowledgeNode {
  id: string
  userId: string
  title: string
  content: string
  nodeType: 'Knowledge' | 'Concept' | 'Fact' | 'Question' | 'Idea' | 'Project'
  contentType: 'text' | 'markdown' | 'html'
  tags: string[]
  metadata: Record<string, any>
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface KnowledgeRelationship {
  id: string
  sourceNodeId: string
  targetNodeId: string
  relationshipType: string
  weight: number
  metadata: Record<string, any>
  createdAt: string
}

export interface SearchQuery {
  query: string
  filters: {
    nodeTypes?: string[]
    tags?: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
  limit: number
  offset: number
}

export interface SearchResult {
  nodes: KnowledgeNode[]
  total: number
  facets: {
    nodeTypes: Record<string, number>
    tags: Record<string, number>
  }
}

// Supabase용으로 약간 수정된 버전
export interface SupabaseKnowledgeNode {
  id: string
  user_id: string  // camelCase → snake_case
  title: string
  content: string | null
  node_type: string
  content_type: string
  tags: string[]
  metadata: any
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### 3. 🧩 유틸리티 함수 (완전 재사용)

#### 재사용 가능한 유틸리티들
```typescript
// /Users/dev/synapse/frontend/synapse-frontend/src/lib/utils.ts
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const generateId = () => {
  return crypto.randomUUID()
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export const highlightText = (text: string, query: string) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 태그 색상 생성기
export const generateTagColor = (tag: string): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
```

### 4. 🎭 상태 관리 (구조 재사용, 구현 수정)

#### Zustand 스토어 구조
```typescript
// /Users/dev/synapse/frontend/synapse-frontend/src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

// Supabase용으로 수정된 버전
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: 'synapse-auth'
    }
  )
)

// 지식 노드 상태 관리
interface KnowledgeState {
  nodes: KnowledgeNode[]
  selectedNode: KnowledgeNode | null
  isLoading: boolean
  searchQuery: string
  setNodes: (nodes: KnowledgeNode[]) => void
  addNode: (node: KnowledgeNode) => void
  updateNode: (node: KnowledgeNode) => void
  removeNode: (nodeId: string) => void
  setSelectedNode: (node: KnowledgeNode | null) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useKnowledgeStore = create<KnowledgeState>()((set, get) => ({
  nodes: [],
  selectedNode: null,
  isLoading: false,
  searchQuery: '',
  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set({ nodes: [node, ...get().nodes] }),
  updateNode: (updatedNode) => set({
    nodes: get().nodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ),
    selectedNode: get().selectedNode?.id === updatedNode.id ? updatedNode : get().selectedNode
  }),
  removeNode: (nodeId) => set({
    nodes: get().nodes.filter(node => node.id !== nodeId),
    selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode
  }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery })
}))
```

## 🔄 API 호출 변환 가이드

### 기존 마이크로서비스 API → Supabase 변환

#### 1. 인증 API 변환
```typescript
// ❌ 기존 (마이크로서비스)
const response = await authApi.post('/auth/register', {
  email,
  password,
  firstName,
  lastName
})

// ✅ 새로운 (Supabase)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { first_name: firstName, last_name: lastName }
  }
})
```

#### 2. 지식 노드 CRUD 변환
```typescript
// ❌ 기존 (마이크로서비스)
const response = await ingestionApi.get('/nodes')
const nodes = response.data

// ✅ 새로운 (Supabase)
const { data: nodes } = await supabase
  .from('knowledge_nodes')
  .select('*')
  .eq('is_active', true)
  .order('updated_at', { ascending: false })

// ❌ 기존 (마이크로서비스)
const response = await ingestionApi.post('/nodes', nodeData)

// ✅ 새로운 (Supabase)
const { data } = await supabase
  .from('knowledge_nodes')
  .insert(nodeData)
  .select()
  .single()
```

#### 3. 검색 API 변환
```typescript
// ❌ 기존 (마이크로서비스)
const response = await searchApi.post('/search', { query, filters })

// ✅ 새로운 (Supabase)
const { data } = await supabase
  .from('knowledge_nodes')
  .select('*')
  .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  .eq('is_active', true)
```

#### 4. 실시간 업데이트 변환
```typescript
// ❌ 기존 (WebSocket)
const socket = io('ws://localhost:3000')
socket.on('nodeUpdated', (updatedNode) => {
  // 상태 업데이트
})

// ✅ 새로운 (Supabase Realtime)
const subscription = supabase
  .channel('knowledge_nodes_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'knowledge_nodes' },
    (payload) => {
      // 상태 업데이트
    }
  )
  .subscribe()
```

## 🗃️ 데이터베이스 스키마 마이그레이션

### PostgreSQL 테이블 정의 변환

#### 1. 사용자 테이블
```sql
-- ❌ 기존 마이크로서비스 (users 서비스 DB)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ✅ Supabase 버전 (auth.users는 내장, profiles 추가)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. 지식 노드 테이블 (거의 동일)
```sql
-- ✅ 마이그레이션 가능 (컬럼 타입만 약간 수정)
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- auth.users 참조
    title TEXT NOT NULL,
    content TEXT,
    node_type TEXT DEFAULT 'Knowledge',
    content_type TEXT DEFAULT 'text',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. 관계 테이블 (동일)
```sql
-- ✅ 완전 재사용 가능
CREATE TABLE knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'related_to',
    weight DECIMAL DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 개발 환경 설정

### 패키지 의존성 매핑
```json
{
  "dependencies": {
    // ✅ 기존 + Supabase
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "@supabase/supabase-js": "^2.x.x",        // 새로 추가
    "@supabase/auth-ui-react": "^0.x.x",       // 새로 추가
    
    // ✅ 그대로 유지
    "react-router-dom": "^7.9.0",
    "zustand": "^5.0.8",
    "@tanstack/react-query": "^5.87.4",
    "react-hook-form": "^7.62.0",
    "@hookform/resolvers": "^5.2.1",
    "zod": "^4.1.8",
    "tailwindcss": "^3.4.17",
    "lucide-react": "^0.544.0",
    "react-toastify": "^11.0.5",
    
    // 🔄 그래프 시각화 (기존 없음, 새로 추가)
    "d3": "^7.x.x",
    "@types/d3": "^7.x.x"
  }
}
```

### 환경 변수 변환
```bash
# ❌ 기존 마이크로서비스 환경변수
NODE_ENV=development
JWT_SECRET=synapse_jwt_secret
USERS_SERVICE_URL=http://localhost:3001
GRAPH_SERVICE_URL=http://localhost:3002
SEARCH_SERVICE_URL=http://localhost:3003
INGESTION_SERVICE_URL=http://localhost:3004
REDIS_URL=redis://localhost:6379
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=synapse_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# ✅ 새로운 Supabase 환경변수 (매우 간단)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📈 성능 최적화 자산

### 기존 최적화 패턴들
```typescript
// ✅ React Query 캐싱 패턴 재사용
const useNodes = () => {
  return useQuery({
    queryKey: ['knowledge-nodes'],
    queryFn: () => knowledgeService.getNodes(),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  })
}

// ✅ 디바운싱된 검색 재사용
const useSearchNodes = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, 500)
  
  return useQuery({
    queryKey: ['search-nodes', debouncedQuery],
    queryFn: () => knowledgeService.searchNodes(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  })
}

// ✅ 가상화된 리스트 패턴 재사용 가능
const VirtualizedNodeList = ({ nodes }) => {
  const parentRef = useRef()
  const rowVirtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  })
  
  return (
    <div ref={parentRef} className="h-400 overflow-auto">
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div key={virtualRow.index} className="absolute top-0 left-0 w-full">
          <NodeCard node={nodes[virtualRow.index]} />
        </div>
      ))}
    </div>
  )
}
```

## 🎨 디자인 시스템 자산

### 완전 재사용 가능한 디자인 토큰들
```css
/* /Users/dev/synapse/frontend/synapse-frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #3B82F6;
  --color-primary-dark: #1E40AF;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-gray-50: #F9FAFB;
  --color-gray-900: #111827;
  
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

/* 커스텀 컴포넌트 클래스들 */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors;
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500;
}
```

## 📋 마이그레이션 체크리스트

### ✅ 완전 준비된 자산들
- [x] **UI 컴포넌트**: Header, Sidebar, Button, Input, Modal 등
- [x] **페이지 컴포넌트**: 로그인, 회원가입, 대시보드, 지식 관리
- [x] **타입 정의**: User, KnowledgeNode, SearchResult 등
- [x] **유틸리티 함수**: formatDate, truncateText, debounce 등
- [x] **상태 관리 패턴**: Zustand 스토어 구조
- [x] **스타일 시스템**: TailwindCSS 설정 및 커스텀 클래스
- [x] **성능 최적화**: React Query, 가상화, 디바운싱

### 🔄 약간 수정 필요한 자산들
- [ ] **API 호출 로직**: Supabase 클라이언트로 교체
- [ ] **인증 플로우**: Supabase Auth로 변경
- [ ] **실시간 구독**: WebSocket → Supabase Realtime
- [ ] **데이터베이스 컬럼명**: camelCase → snake_case

### ➕ 새로 추가할 기능들
- [ ] **그래프 시각화**: D3.js 기반 네트워크 다이어그램
- [ ] **파일 업로드**: Supabase Storage 연동
- [ ] **AI 기능**: Supabase Edge Functions + OpenAI
- [ ] **배포 설정**: Vercel/Netlify 연동

**💡 예상 마이그레이션 시간: 3.5시간 (기존 자산 80% 재사용 가능)**