import React from 'react';
import { FeedItem } from '../../services/api/types';
import KnowledgeCard from './KnowledgeCard';
import QuizCard from './QuizCard';

type Props = {
  feed: FeedItem;
  liked: boolean;
  selectedOption?: number;
  onLike: () => void;
  onSelectOption?: (optionIndex: number) => void;
  onComment: () => void;
};

export default function FeedCard({ feed, onSelectOption, ...props }: Props) {
  if (feed.type === 'quiz') {
    return <QuizCard feed={feed} onSelectOption={onSelectOption!} {...props} />;
  }
  return <KnowledgeCard feed={feed} {...props} />;
}
