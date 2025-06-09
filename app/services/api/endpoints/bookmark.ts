import api from '../config/axios';

export interface BookmarkItem {
  id: number;
  type: 'knowledge' | 'quiz';
  title: string;
  content: string;
  authorNickname: string;
  publishDate: string;
  imageUrls?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  bookmarkedAt: string;
  options?: string[];
}

export const bookmarkApi = {
  // 북마크 토글
  toggleBookmark: (userId: number, targetType: string, targetId: number) =>
    api.post<{ isBookmarked: boolean }>('/api/bookmarks/toggle', null, {
      params: { userId, targetType, targetId }
    }),

  // 북마크 상태 확인
  checkBookmark: (userId: number, targetType: string, targetId: number) =>
    api.get<{ isBookmarked: boolean }>('/api/bookmarks/check', {
      params: { userId, targetType, targetId }
    }),

  // 북마크 피드 가져오기
  getBookmarkFeed: (userId: number) =>
    api.get<BookmarkItem[]>('/api/bookmarks/feed', {
      params: { userId }
    }),

  // 내 북마크 목록
  getMyBookmarks: (userId: number) =>
    api.get('/api/bookmarks/my', {
      params: { userId }
    })
}; 