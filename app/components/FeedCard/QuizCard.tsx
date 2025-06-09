import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FeedItem } from '../../services/api/types';
import BaseCard from './BaseCard';

type Props = {
  feed: FeedItem;
  liked: boolean;
  bookmarked?: boolean;
  showDeleteButton?: boolean;
  selectedOption?: number;
  onLike: () => void;
  onSelectOption: (optionIndex: number) => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export default function QuizCard({ feed, selectedOption, onSelectOption, ...props }: Props) {
  return (
    <BaseCard feed={feed} {...props}>
      <View style={styles.quizContainer}>
        <Text style={styles.question}>{feed.content}</Text>
        <View style={styles.optionsContainer}>
          {feed.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && styles.selectedOption,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onSelectOption(index);
              }}
            >
              <Text style={[
                styles.optionText,
                selectedOption === index && styles.selectedOptionText,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  quizContainer: {
    marginTop: 8,
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
});
