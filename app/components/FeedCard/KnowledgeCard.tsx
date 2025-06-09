import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FeedItem } from '../../services/api/types';
import BaseCard from './BaseCard';

type Props = {
  feed: FeedItem;
  liked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onPress?: () => void;
};

export default function KnowledgeCard({ feed, ...props }: Props) {
  return (
    <BaseCard feed={feed} {...props}>
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{feed.content}</Text>
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    marginTop: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
