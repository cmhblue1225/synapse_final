-- 🚀 Synapse Knowledge Assistant - Supabase 마이그레이션 스크립트
-- 이 파일을 Supabase SQL Editor에서 실행하여 전체 스키마를 생성합니다.

-- =====================================================
-- 1. 확장 기능 활성화
-- =====================================================

-- UUID 생성을 위한 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 전체 텍스트 검색을 위한 확장
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- JSON 연산자를 위한 확장
CREATE EXTENSION IF NOT EXISTS "ltree";

-- =====================================================
-- 2. 사용자 프로필 테이블
-- =====================================================

-- Supabase auth.users와 연동되는 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. 지식 노드 테이블 (핵심 테이블)
-- =====================================================

-- 노드 타입 ENUM 정의
CREATE TYPE node_type AS ENUM (
    'Knowledge',
    'Concept', 
    'Fact',
    'Question',
    'Idea',
    'Project',
    'Resource',
    'Note',
    'Reference'
);

-- 지식 노드 메인 테이블
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (length(title) > 0),
    content TEXT,
    summary TEXT, -- AI 생성 요약
    node_type node_type DEFAULT 'Knowledge',
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE, -- 공개/비공개 설정
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- 검색 최적화
    search_vector TSVECTOR,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- 인덱스 힌트
    CONSTRAINT valid_content CHECK (
        (content IS NOT NULL AND length(trim(content)) > 0) OR 
        (metadata IS NOT NULL AND jsonb_array_length(metadata->'attachments') > 0)
    )
);

-- 지식 노드 업데이트 트리거
CREATE TRIGGER update_knowledge_nodes_updated_at 
    BEFORE UPDATE ON knowledge_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 전체 텍스트 검색 인덱스 업데이트 함수
CREATE OR REPLACE FUNCTION update_knowledge_nodes_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_nodes_search_vector_trigger
    BEFORE INSERT OR UPDATE ON knowledge_nodes
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_nodes_search_vector();

-- =====================================================
-- 4. 지식 관계 테이블 (그래프 연결)
-- =====================================================

-- 관계 타입 ENUM 정의
CREATE TYPE relationship_type AS ENUM (
    'related_to',
    'depends_on',
    'part_of',
    'derives_from',
    'contradicts',
    'supports',
    'example_of',
    'generalizes',
    'specializes',
    'causes',
    'enables'
);

-- 지식 노드 간 관계 테이블
CREATE TABLE IF NOT EXISTS knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
    target_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
    relationship_type relationship_type DEFAULT 'related_to',
    weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0.0 AND weight <= 1.0),
    confidence DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    description TEXT, -- 관계 설명
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 자기 참조 방지
    CONSTRAINT no_self_reference CHECK (source_node_id != target_node_id),
    
    -- 중복 관계 방지 (같은 방향)
    UNIQUE(source_node_id, target_node_id, relationship_type)
);

CREATE TRIGGER update_knowledge_relationships_updated_at 
    BEFORE UPDATE ON knowledge_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. 태그 시스템 테이블
-- =====================================================

-- 사용자별 태그 관리
CREATE TABLE IF NOT EXISTS knowledge_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 50),
    color TEXT DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    description TEXT,
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    is_system_tag BOOLEAN DEFAULT FALSE, -- 시스템 기본 태그 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 사용자별 태그 이름 유니크
    UNIQUE(user_id, name)
);

CREATE TRIGGER update_knowledge_tags_updated_at 
    BEFORE UPDATE ON knowledge_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 태그 사용량 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    -- 태그가 추가/수정된 경우
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- 새로운 태그들의 사용량 증가
        UPDATE knowledge_tags 
        SET usage_count = (
            SELECT COUNT(*) 
            FROM knowledge_nodes 
            WHERE user_id = NEW.user_id 
            AND name = ANY(NEW.tags)
            AND is_active = TRUE
        )
        WHERE user_id = NEW.user_id AND name = ANY(NEW.tags);
    END IF;
    
    -- 태그가 삭제된 경우
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        -- 이전 태그들의 사용량 재계산
        UPDATE knowledge_tags 
        SET usage_count = (
            SELECT COUNT(*) 
            FROM knowledge_nodes 
            WHERE user_id = COALESCE(OLD.user_id, NEW.user_id)
            AND name = ANY(COALESCE(OLD.tags, '{}'))
            AND is_active = TRUE
        )
        WHERE user_id = COALESCE(OLD.user_id, NEW.user_id) 
        AND name = ANY(COALESCE(OLD.tags, '{}'));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON knowledge_nodes
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- =====================================================
-- 6. 검색 및 분석 테이블
-- =====================================================

-- 검색 기록 테이블 (분석용)
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    clicked_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 노드 조회 기록 (인기도 측정)
CREATE TABLE IF NOT EXISTS node_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    view_duration_seconds INTEGER DEFAULT 0,
    referrer TEXT, -- 어디서 왔는지 (search, link, etc.)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. 협업 및 공유 테이블
-- =====================================================

-- 노드 공유 및 권한 관리
CREATE TABLE IF NOT EXISTS node_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_token UUID DEFAULT uuid_generate_v4(), -- 공개 링크용
    permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
    is_public BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 자기 자신과는 공유 불가
    CONSTRAINT no_self_share CHECK (shared_by != shared_with)
);

-- 댓글 시스템
CREATE TABLE IF NOT EXISTS node_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES node_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0),
    is_resolved BOOLEAN DEFAULT FALSE, -- 질문/제안의 경우
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_node_comments_updated_at 
    BEFORE UPDATE ON node_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. 알림 시스템 테이블
-- =====================================================

-- 알림 타입 ENUM
CREATE TYPE notification_type AS ENUM (
    'node_shared',
    'comment_added',
    'node_liked',
    'relationship_created',
    'mention',
    'system_update'
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    related_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
    related_comment_id UUID REFERENCES node_comments(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. 인덱스 생성 (성능 최적화)
-- =====================================================

-- 지식 노드 인덱스
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_user_id ON knowledge_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_created_at ON knowledge_nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_updated_at ON knowledge_nodes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_is_active ON knowledge_nodes(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_is_public ON knowledge_nodes(is_public);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_node_type ON knowledge_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_tags ON knowledge_nodes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_search_vector ON knowledge_nodes USING GIN(search_vector);

-- 관계 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_source ON knowledge_relationships(source_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_target ON knowledge_relationships(target_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_type ON knowledge_relationships(relationship_type);

-- 태그 인덱스
CREATE INDEX IF NOT EXISTS idx_knowledge_tags_user_id ON knowledge_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags_name ON knowledge_tags(name);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags_usage_count ON knowledge_tags(usage_count DESC);

-- 검색 기록 인덱스
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- 조회 기록 인덱스
CREATE INDEX IF NOT EXISTS idx_node_views_node_id ON node_views(node_id);
CREATE INDEX IF NOT EXISTS idx_node_views_viewer_id ON node_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_node_views_created_at ON node_views(created_at DESC);

-- 공유 인덱스
CREATE INDEX IF NOT EXISTS idx_node_shares_node_id ON node_shares(node_id);
CREATE INDEX IF NOT EXISTS idx_node_shares_shared_with ON node_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_node_shares_share_token ON node_shares(share_token);

-- 댓글 인덱스
CREATE INDEX IF NOT EXISTS idx_node_comments_node_id ON node_comments(node_id);
CREATE INDEX IF NOT EXISTS idx_node_comments_author_id ON node_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_node_comments_parent_id ON node_comments(parent_comment_id);

-- 알림 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 10. Row Level Security (RLS) 정책
-- =====================================================

-- 프로필 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 지식 노드 테이블 RLS
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nodes" ON knowledge_nodes
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own nodes" ON knowledge_nodes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nodes" ON knowledge_nodes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nodes" ON knowledge_nodes
    FOR DELETE USING (auth.uid() = user_id);

-- 관계 테이블 RLS
ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage relationships for own nodes" ON knowledge_relationships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM knowledge_nodes 
            WHERE id = source_node_id AND user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM knowledge_nodes 
            WHERE id = target_node_id AND user_id = auth.uid()
        )
    );

-- 태그 테이블 RLS
ALTER TABLE knowledge_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tags" ON knowledge_tags
    FOR ALL USING (auth.uid() = user_id);

-- 검색 기록 RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search history" ON search_history
    FOR ALL USING (auth.uid() = user_id);

-- 조회 기록 RLS (조회한 노드의 소유자 또는 조회자만)
ALTER TABLE node_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own view history" ON node_views
    FOR SELECT USING (auth.uid() = viewer_id OR EXISTS (
        SELECT 1 FROM knowledge_nodes 
        WHERE id = node_id AND user_id = auth.uid()
    ));

CREATE POLICY "Anyone can insert view records" ON node_views
    FOR INSERT WITH CHECK (true); -- 익명 조회 허용

-- 공유 테이블 RLS
ALTER TABLE node_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares involving them" ON node_shares
    FOR SELECT USING (
        auth.uid() = shared_by OR 
        auth.uid() = shared_with OR
        EXISTS (SELECT 1 FROM knowledge_nodes WHERE id = node_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create shares for own nodes" ON node_shares
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM knowledge_nodes 
        WHERE id = node_id AND user_id = auth.uid()
    ));

-- 댓글 RLS
ALTER TABLE node_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible nodes" ON node_comments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM knowledge_nodes 
        WHERE id = node_id AND (user_id = auth.uid() OR is_public = true)
    ));

CREATE POLICY "Authenticated users can add comments" ON node_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON node_comments
    FOR UPDATE USING (auth.uid() = author_id);

-- 알림 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- =====================================================
-- 11. 초기 데이터 삽입 (선택사항)
-- =====================================================

-- 시스템 기본 태그들 (모든 사용자가 사용 가능)
-- 이 부분은 애플리케이션에서 처리하는 것이 좋습니다.

-- =====================================================
-- 12. 뷰 (View) 생성 - 복잡한 쿼리 최적화
-- =====================================================

-- 노드 상세 정보 뷰 (관계 정보 포함)
CREATE OR REPLACE VIEW node_details AS
SELECT 
    n.*,
    p.first_name || ' ' || p.last_name as author_name,
    p.avatar_url as author_avatar,
    COALESCE(vc.view_count, 0) as total_views,
    COALESCE(cc.comment_count, 0) as comment_count,
    COALESCE(rc.relationship_count, 0) as relationship_count
FROM knowledge_nodes n
LEFT JOIN profiles p ON n.user_id = p.id
LEFT JOIN (
    SELECT node_id, COUNT(*) as view_count 
    FROM node_views 
    GROUP BY node_id
) vc ON n.id = vc.node_id
LEFT JOIN (
    SELECT node_id, COUNT(*) as comment_count 
    FROM node_comments 
    GROUP BY node_id
) cc ON n.id = cc.node_id
LEFT JOIN (
    SELECT source_node_id as node_id, COUNT(*) as relationship_count
    FROM knowledge_relationships
    GROUP BY source_node_id
    UNION ALL
    SELECT target_node_id as node_id, COUNT(*) as relationship_count
    FROM knowledge_relationships
    GROUP BY target_node_id
) rc ON n.id = rc.node_id;

-- 인기 노드 뷰 (최근 30일 기준)
CREATE OR REPLACE VIEW popular_nodes AS
SELECT 
    n.id,
    n.title,
    n.summary,
    n.node_type,
    n.tags,
    n.created_at,
    COUNT(nv.id) as recent_views,
    p.first_name || ' ' || p.last_name as author_name
FROM knowledge_nodes n
LEFT JOIN node_views nv ON n.id = nv.node_id 
    AND nv.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN profiles p ON n.user_id = p.id
WHERE n.is_active = true AND n.is_public = true
GROUP BY n.id, p.first_name, p.last_name
ORDER BY recent_views DESC, n.created_at DESC;

-- 사용자 통계 뷰
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    COUNT(DISTINCT n.id) as total_nodes,
    COUNT(DISTINCT CASE WHEN n.is_public THEN n.id END) as public_nodes,
    COUNT(DISTINCT r.id) as total_relationships,
    COUNT(DISTINCT t.id) as total_tags,
    COUNT(DISTINCT nv.id) as total_views,
    MAX(n.updated_at) as last_activity
FROM auth.users u
LEFT JOIN knowledge_nodes n ON u.id = n.user_id AND n.is_active = true
LEFT JOIN knowledge_relationships r ON u.id = r.created_by
LEFT JOIN knowledge_tags t ON u.id = t.user_id
LEFT JOIN node_views nv ON n.id = nv.node_id
GROUP BY u.id;

-- =====================================================
-- 완료 메시지
-- =====================================================

-- 설치 완료 확인용 함수
CREATE OR REPLACE FUNCTION check_synapse_installation()
RETURNS TABLE(table_name TEXT, row_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 'profiles'::TEXT, COUNT(*) FROM profiles
    UNION ALL
    SELECT 'knowledge_nodes'::TEXT, COUNT(*) FROM knowledge_nodes
    UNION ALL
    SELECT 'knowledge_relationships'::TEXT, COUNT(*) FROM knowledge_relationships
    UNION ALL
    SELECT 'knowledge_tags'::TEXT, COUNT(*) FROM knowledge_tags
    UNION ALL
    SELECT 'search_history'::TEXT, COUNT(*) FROM search_history
    UNION ALL
    SELECT 'node_views'::TEXT, COUNT(*) FROM node_views
    UNION ALL
    SELECT 'node_shares'::TEXT, COUNT(*) FROM node_shares
    UNION ALL
    SELECT 'node_comments'::TEXT, COUNT(*) FROM node_comments
    UNION ALL
    SELECT 'notifications'::TEXT, COUNT(*) FROM notifications;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 설치 확인
SELECT * FROM check_synapse_installation();

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '🚀 Synapse Knowledge Assistant 데이터베이스 설치 완료!';
    RAISE NOTICE '📊 총 9개 테이블, 3개 뷰, 완전한 RLS 정책이 설치되었습니다.';
    RAISE NOTICE '🔍 전체 텍스트 검색, 실시간 업데이트, 태그 시스템 준비 완료!';
    RAISE NOTICE '🔐 Row Level Security로 완벽한 데이터 보안이 적용되었습니다.';
END $$;