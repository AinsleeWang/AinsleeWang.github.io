// The one place tag names are written. Everything else reads from here.
export type Tag = 'essay' | 'build' | 'photo' | 'travel';
export type FilterTag = Tag | 'all';

export const TAG_LABEL: Record<FilterTag, string> = {
  essay: '隨筆',
  build: '實作',
  photo: '攝影',
  travel: '旅行',
  all: '全部',
};

export const TAGS: Tag[] = ['essay', 'build', 'photo', 'travel'];
