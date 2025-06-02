import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commentApi, CommentResponse, CommentRequest } from '../services/api/endpoints/comment';
import { useRouter } from 'expo-router';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'post' | 'quiz';
  targetId: number;
}

export default function CommentModal({ visible, onClose, targetType, targetId }: CommentModalProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      loadComments();
      getCurrentUserId();
    }
  }, [visible, targetType, targetId]);

  const getCurrentUserId = async () => {
    try {
      // 먼저 @userId를 확인
      let userIdStr = await AsyncStorage.getItem('@userId');
      console.log('AsyncStorage에서 가져온 @userId:', userIdStr);
      
      if (!userIdStr) {
        // @userId가 없으면 @user 객체에서 가져오기
        const userStr = await AsyncStorage.getItem('@user');
        console.log('AsyncStorage에서 가져온 @user:', userStr);
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('파싱된 user 객체:', user);
            
            if (user && user.id) {
              userIdStr = user.id.toString();
              console.log('@user 객체에서 추출한 userId:', userIdStr);
            }
          } catch (parseError) {
            console.error('User 객체 파싱 실패:', parseError);
          }
        }
      }
      
      if (userIdStr) {
        const userId = parseInt(userIdStr);
        console.log('파싱된 userId:', userId);
        setCurrentUserId(userId);
      } else {
        console.log('사용자 ID를 찾을 수 없음');
      }
    } catch (error) {
      console.error('사용자 ID 조회 실패:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await commentApi.getByTarget(targetType, targetId);
      setComments(commentsData);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      Alert.alert('오류', '댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    console.log('댓글 작성 시도:', { newComment: newComment.trim(), currentUserId });
    
    if (!newComment.trim()) {
      console.log('댓글 내용이 비어있음');
      return;
    }
    
    if (!currentUserId) {
      console.log('사용자 ID가 없음');
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    try {
      console.log('댓글 작성 요청 시작');
      const request: CommentRequest = {
        targetType,
        targetId,
        content: newComment.trim(),
      };

      console.log('댓글 작성 요청 데이터:', request);
      const result = await commentApi.create(currentUserId, request);
      console.log('댓글 작성 성공:', result);
      
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    }
  };

  const handleAddReply = async (parentCommentId: number) => {
    if (!replyText.trim() || !currentUserId) return;

    try {
      const request: CommentRequest = {
        targetType,
        targetId,
        parentCommentId,
        content: replyText.trim(),
      };

      await commentApi.create(currentUserId, request);
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      Alert.alert('오류', '대댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentApi.delete(commentId);
              await loadComments();
            } catch (error) {
              console.error('댓글 삭제 실패:', error);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleProfilePress = (authorId: number) => {
    onClose();
    router.push(`/user-profile?userId=${authorId}`);
  };

  const renderReply = ({ item }: { item: CommentResponse }) => (
    <View style={styles.replyContainer}>
      <View style={styles.replyLine} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity 
            style={styles.authorInfo}
            onPress={() => handleProfilePress(item.authorId)}
          >
            <Image 
              source={{ uri: 'https://via.placeholder.com/30x30/FF5A5F/FFFFFF?text=U' }} 
              style={styles.smallProfileImage} 
            />
            <Text style={styles.authorName}>{item.writerNickname}</Text>
          </TouchableOpacity>
          {currentUserId === item.authorId && (
            <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
              <Ionicons name="trash-outline" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderComment = ({ item }: { item: CommentResponse }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity 
            style={styles.authorInfo}
            onPress={() => handleProfilePress(item.authorId)}
          >
            <Image 
              source={{ uri: 'https://via.placeholder.com/40x40/FF5A5F/FFFFFF?text=U' }} 
              style={styles.profileImage} 
            />
            <Text style={styles.authorName}>{item.writerNickname}</Text>
          </TouchableOpacity>
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.replyButton}
              onPress={() => setReplyingTo(item.id)}
            >
              <Text style={styles.replyButtonText}>답글</Text>
            </TouchableOpacity>
            {currentUserId === item.authorId && (
              <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                <Ionicons name="trash-outline" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentTime}>{new Date(item.createdAt).toLocaleString()}</Text>
        
        {/* 대댓글 목록 */}
        {item.replies && item.replies.length > 0 && (
          <FlatList
            data={item.replies}
            renderItem={renderReply}
            keyExtractor={(reply) => reply.id.toString()}
            style={styles.repliesList}
          />
        )}
        
        {/* 대댓글 입력 */}
        {replyingTo === item.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="답글을 입력하세요..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <View style={styles.replyInputActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => handleAddReply(item.id)}
              >
                <Text style={styles.submitButtonText}>답글</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>댓글</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 댓글 목록 */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          style={styles.commentsList}
          refreshing={loading}
          onRefresh={loadComments}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>아직 댓글이 없습니다</Text>
              <Text style={styles.emptySubText}>첫 번째 댓글을 작성해보세요!</Text>
            </View>
          }
        />

        {/* 댓글 입력 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Ionicons name="send" size={20} color={newComment.trim() ? "#FF5A5F" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  smallProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButton: {
    marginRight: 12,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#FF5A5F',
    fontWeight: '500',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 20,
  },
  replyLine: {
    width: 2,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  repliesList: {
    marginTop: 8,
  },
  replyInputContainer: {
    marginTop: 8,
    marginLeft: 20,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  replyInput: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    minHeight: 40,
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
}); 