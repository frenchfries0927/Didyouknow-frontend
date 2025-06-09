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
  onPress?: () => void;
};

export default function FeedCard({ feed, onSelectOption, onPress, ...props }: Props) {
  if (feed.type === 'quiz') {
    return <QuizCard feed={feed} onSelectOption={onSelectOption!} onPress={onPress} {...props} />;
  }
  return <KnowledgeCard feed={feed} onPress={onPress} {...props} />;
}
