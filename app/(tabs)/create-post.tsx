// app/create-post.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// API URL
const API_BASE_URL = 'http://localhost:8080';

// 가상의 사용자 ID (실제로는 로그인 시스템에서 가져와야 함)
const CURRENT_USER_ID = 1;

export default function CreateKnowledgePostScreen() {
  const router = useRouter();
  
  // 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 선택 함수
  const pickImage = async () => {
    // 이미지 라이브러리 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('권한 필요', '이미지 선택을 위해 사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    // 이미지 선택기 실행
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // 이미지 제거 핸들러
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 이미지 없이 텍스트만 전송하는 테스트 함수
  const testTextOnly = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('입력 필요', '제목과 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('authorId', CURRENT_USER_ID.toString());
      formData.append('post', JSON.stringify({
        title,
        content,
        publishDate: date.toISOString().split('T')[0]
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/posts/knowledge/no-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log('텍스트 전송 성공:', response.data);
      Alert.alert('성공', '텍스트 데이터가 성공적으로 전송되었습니다.');
    } catch (error: any) {
      console.error('텍스트 전송 실패:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 게시물 생성 함수
  const createPost = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
        // FormData 생성
        const formData = new FormData();
        
        // authorId와 post JSON 추가
        formData.append('authorId', CURRENT_USER_ID.toString());
        formData.append('post', JSON.stringify({
          title,
          content,
          publishDate: date.toISOString().split('T')[0]
        }));
        
        // 이미지가 있는 경우 처리
        if (images.length > 0) {
          if (Platform.OS === 'web') {
            // 웹 환경에서는 이미지를 개별적으로 처리
            const imageFiles = await Promise.all(
              images.map(async (uri, index) => {
                try {
                  const response = await fetch(uri);
                  const blob = await response.blob();
                  const fileName = `image_${index}.jpg`;
                  return new File([blob], fileName, { type: 'image/jpeg' });
                } catch (error) {
                  console.error(`이미지 ${index} 변환 실패:`, error);
                  return null;
                }
              })
            );
            
            // 변환된 이미지 파일 추가
            imageFiles.forEach(file => {
              if (file) {
                // 각 이미지를 별도의 'images' 필드로 추가
                formData.append('images', file);
                console.log(`이미지 추가: ${file.name}, 타입: ${file.type}, 크기: ${file.size} 바이트`);
              }
            });
          } else {
            // 네이티브 환경에서 이미지 처리
            images.forEach((uri, index) => {
              const fileName = `image_${index}.jpg`;
              formData.append('images', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: fileName,
                type: 'image/jpeg'
              } as any);
              console.log(`이미지 추가: ${fileName}`);
            });
          }
        }
        
        // FormData 내용 로깅
        console.log('FormData 구성 완료');
        
        // API 요청
        console.log('API 요청 시작...');
        const response = await axios.post(
          `${API_BASE_URL}/api/posts/knowledge`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000
          }
        );
        
        console.log('API 응답:', response.status);
        console.log('게시물 생성 성공:', response.data);
        
        // 성공 메시지 표시
        Alert.alert('성공', '게시물이 작성되었습니다.', [
          { 
            text: '확인', 
            onPress: () => router.replace('/') 
          }
        ]);
      } catch (error: any) {
        // 오류 처리 코드
      } finally {
        setIsLoading(false);
      }
    };

  // 성공 처리 함수
  const handleSuccess = (response: any) => {
    console.log('API 응답:', response.status);
    console.log('게시물 생성 성공:', response.data);

    // 성공 메시지 표시
    Alert.alert('성공', '게시물이 작성되었습니다.', [
      { 
        text: '확인', 
        onPress: () => router.replace('/') 
      }
    ]);
  };

  // 오류 처리 함수
  const handleError = (error: any) => {
    // 상세 오류 로깅
    if (error.response) {
      // 서버에서 응답이 온 경우
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
      console.error('응답 헤더:', error.response.headers);
      setError(`서버 오류: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      console.error('요청 객체:', error.request);
      setError('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.');
    } else {
      // 요청 설정 중 오류 발생
      console.error('오류 메시지:', error.message);
      setError(`요청 오류: ${error.message}`);
    }
    
    Alert.alert('오류', '게시물 작성에 실패했습니다. 자세한 내용은 콘솔을 확인하세요.');
  };

  // 테스트 API 요청 - 디버깅용
  const testApiConnection = async () => {
    try {
      setIsLoading(true);
      console.log('API 연결 테스트 시작...');
      
      const response = await axios.get(`${API_BASE_URL}/api/health-check`, {
        timeout: 5000
      });
      
      console.log('API 연결 성공:', response.data);
      Alert.alert('성공', '서버 연결이 정상입니다.');
    } catch (error) {
      console.error('API 연결 테스트 실패:', error);
      Alert.alert('실패', '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새 게시물 작성</Text>
          <View style={styles.headerRight}>
            {/* 서버 연결 테스트 버튼 - 개발 중에만 사용 */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.testButton}
                onPress={testApiConnection}
                disabled={isLoading}
              >
                <Ionicons name="server-outline" size={20} color="#555" />
              </TouchableOpacity>
            )}
            {/* 텍스트만 테스트 버튼 - 개발 중에만 사용 */}
            {__DEV__ && (
              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: '#E3F2FD' }]}
                onPress={testTextOnly}
                disabled={isLoading}
              >
                <Text style={{ fontSize: 10, color: '#0D47A1' }}>텍스트만</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.submitButton, (!title || !content) && styles.submitButtonDisabled]}
              onPress={createPost}
              disabled={!title || !content || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>게시</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 오류 메시지 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="내용을 입력하세요"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>날짜</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{date.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={24} color="#666" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>이미지</Text>
          <View style={styles.imageSection}>
            {/* 선택된 이미지 미리보기 */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewContainer}
            >
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* 이미지 추가 버튼 */}
              {images.length < 5 && (
                <TouchableOpacity 
                  style={styles.addImageButton}
                  onPress={pickImage}
                >
                  <Ionicons name="add" size={40} color="#0095F6" />
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* 도움말 텍스트 */}
            <Text style={styles.helpText}>
              최대 5개의 이미지를 추가할 수 있습니다. 정사각형 비율의 이미지가 가장 잘 보입니다.
            </Text>
            {Platform.OS === 'web' && (
              <Text style={[styles.helpText, { color: '#D32F2F' }]}>
                주의: 웹 환경에서는 이미지 업로드가 불안정할 수 있습니다. 문제가 발생하면 먼저 텍스트만 테스트해보세요.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    marginRight: 8,
    padding: 4,
    borderRadius: 4,
  },
  submitButton: {
    backgroundColor: '#0095F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#B2DFFC',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#D32F2F',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#262626',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    height: 150,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 4,
    padding: 12,
  },
  imageSection: {
    marginTop: 8,
  },
  imagePreviewContainer: {
    paddingVertical: 8,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 4,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 8,
  },
});

