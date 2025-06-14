import React from 'react';
import { FeedItem } from '../../services/api/types';
import KnowledgeCard from './KnowledgeCard';
import QuizCard from './QuizCard';

type Props = {
  feed: FeedItem;
  liked: boolean;
  bookmarked?: boolean;
  showDeleteButton?: boolean;
  selectedOption?: number;
  onLike: () => void;
  onSelectOption?: (optionIndex: number) => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export default function FeedCard({ feed, onSelectOption, onShare, onBookmark, onDelete, onPress, ...props }: Props) {
  if (feed.type === 'quiz') {
    return <QuizCard feed={feed} onSelectOption={onSelectOption!} onShare={onShare} onBookmark={onBookmark} onDelete={onDelete} onPress={onPress} {...props} />;
  }
  return <KnowledgeCard feed={feed} onShare={onShare} onBookmark={onBookmark} onDelete={onDelete} onPress={onPress} {...props} />;
}
