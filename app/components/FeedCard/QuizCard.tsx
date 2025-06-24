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
  answerResult?: { correct: boolean; correctAnswer: number; userAnswer: number } | null;
  onLike: () => void;
  onSelectOption: (optionIndex: number) => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export default function QuizCard({ feed, selectedOption, answerResult, onSelectOption, ...props }: Props) {
  
  // 옵션 버튼 스타일 결정 함수
  const getOptionStyle = (index: number) => {
    // 아직 답변하지 않은 경우
    if (!answerResult) {
      return [
        styles.optionButton,
        selectedOption === index && styles.selectedOption,
      ];
    }
    
    // 답변한 후의 스타일
    const { correct, correctAnswer, userAnswer } = answerResult;
    
    if (index === correctAnswer) {
      // 정답 옵션 - 파란색
      return [styles.optionButton, styles.correctOption];
    } else if (index === userAnswer && !correct) {
      // 사용자가 선택한 오답 - 빨간색
      return [styles.optionButton, styles.incorrectOption];
    }
    
    return [styles.optionButton];
  };

  // 옵션 텍스트 스타일 결정 함수
  const getOptionTextStyle = (index: number) => {
    // 아직 답변하지 않은 경우
    if (!answerResult) {
      return [
        styles.optionText,
        selectedOption === index && styles.selectedOptionText,
      ];
    }
    
    // 답변한 후의 스타일
    const { correct, correctAnswer, userAnswer } = answerResult;
    
    if (index === correctAnswer || (index === userAnswer && !correct)) {
      return [styles.optionText, styles.resultOptionText];
    }
    
    return [styles.optionText];
  };

  return (
    <BaseCard feed={feed} {...props}>
      <View style={styles.quizContainer}>
        <Text style={styles.question}>{feed.content}</Text>
        <View style={styles.optionsContainer}>
          {feed.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={(e) => {
                e.stopPropagation();
                // 이미 답변한 경우 클릭 비활성화
                if (!answerResult) {
                  onSelectOption(index);
                }
              }}
              disabled={!!answerResult} // 답변 후 비활성화
            >
              <Text style={getOptionTextStyle(index)}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 결과 메시지 */}
        {answerResult && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultText,
              answerResult.correct ? styles.correctText : styles.incorrectText
            ]}>
              {answerResult.correct ? '🎉 정답입니다!' : '❌ 틀렸습니다.'}
            </Text>
          </View>
        )}
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
  correctOption: {
    backgroundColor: '#2196F3', // 파란색
    borderColor: '#2196F3',
  },
  incorrectOption: {
    backgroundColor: '#F44336', // 빨간색
    borderColor: '#F44336',
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
  resultOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  resultContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  resultText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  correctText: {
    color: '#2196F3',
  },
  incorrectText: {
    color: '#F44336',
  },
});
