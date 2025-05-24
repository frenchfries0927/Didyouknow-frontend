import React, { useState } from 'react';
import { 
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Alert, Image, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

export default function CreateQuizScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 이미지 선택 함수
  const pickImages = async () => {
    try {
      // 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('권한 오류', '갤러리 접근 권한이 필요합니다.');
        return;
      }
      
      // 이미지 선택 - 최대 5개
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        if (result.assets.length > 5) {
          Alert.alert('최대 5개의 이미지만 선택할 수 있습니다.');
          return setImages(result.assets.slice(0, 5));
        }
        
        setImages(result.assets);
        console.log("선택된 이미지:", result.assets);
      }
    } catch (error) {
      console.error('이미지 선택 중 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };
  
  // 이미지 제거 함수
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // 옵션 업데이트 함수
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  // 정답 선택 함수
  const selectCorrectOption = (index: number) => {
    setCorrectOption(index);
  };
  
  // 퀴즈 제출 함수
  const handleSubmit = async () => {
    // 유효성 검사
    if (!question.trim()) {
      return Alert.alert('알림', '질문을 입력해주세요.');
    }
    
    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      return Alert.alert('알림', '최소 2개의 보기를 입력해주세요.');
    }
    
    if (correctOption === null) {
      return Alert.alert('알림', '정답을 선택해주세요.');
    }
    
    try {
      setIsSubmitting(true);
      
      // 사용자 정보 가져오기
      const userInfo = await AsyncStorage.getItem('@user');
      let user;
      try {
        user = userInfo ? JSON.parse(userInfo) : null;
      } catch (parseError) {
        console.error('사용자 정보 파싱 오류:', parseError);
        user = null;
      }
      
      // 사용자 정보가 없거나 ID가 없는 경우 기본값 사용
      if (!user || !user.id) {
        user = { id: 1 };  // 기본값으로 1 설정
      }
      
      // FormData 생성
      const formData = new FormData();
      
      // 사용자 ID 추가 - 백엔드에서 @RequestParam("userId")로 수정했으므로
      formData.append('userId', String(user.id));
      
      // 퀴즈 정보를 개별 필드로 추가
      formData.append('question', question);
      formData.append('option1', options[0]);
      formData.append('option2', options[1]);
      formData.append('option3', options[2]);
      formData.append('option4', options[3]);
      formData.append('correctOption', String(correctOption + 1));  // 서버는 1부터 시작하는 인덱스 사용
      formData.append('publishDate', new Date().toISOString().split('T')[0]);  // 오늘 날짜를 YYYY-MM-DD 형식으로
      
      // 이미지 추가
      for (const image of images) {
        const imageUri = image.uri;
        const filename = imageUri.split('/').pop() || 'image.jpg';
        
        // 웹 환경과 네이티브 환경에서 다른 방식으로 처리
        if (Platform.OS === 'web') {
          // 웹에서는 fetch로 파일을 가져와서 Blob으로 변환
          try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: 'image/jpeg' });
            formData.append('images', file);
            console.log('웹 환경에서 이미지 추가:', filename);
          } catch (error) {
            console.error('웹 환경에서 이미지 변환 오류:', error);
          }
        } else {
          // iOS나 Android에서는 파일 경로 처리
          const localUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
          formData.append('images', {
            uri: localUri,
            name: filename,
            type: 'image/jpeg',
          } as any);
          console.log('네이티브 환경에서 이미지 추가:', filename);
        }
      }
      
      // FormData 내용 디버깅을 위해 출력
      console.log('FormData 준비됨, 요청 전송 중... userId:', user.id);
      
      // API 호출 - Content-Type 헤더 명시적 추가
      const response = await axios.post(
        `${API_URL}/api/quizzes`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true // CORS 요청에 쿠키 포함
        }
      );
      
      console.log('퀴즈 작성 성공:', response.data);
      Alert.alert('성공', '퀴즈가 작성되었습니다.', [
        { text: 'OK', onPress: () => router.push('/(tabs)') }
      ]);
    } catch (error) {
      console.error('퀴즈 제출 오류:', error);
      Alert.alert('오류', '퀴즈 작성 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>퀴즈 출제하기</Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isSubmitting || !question.trim() || correctOption === null}
          style={[
            styles.submitButton, 
            (!question.trim() || correctOption === null || isSubmitting) ? styles.disabledButton : {}
          ]}
        >
          {isSubmitting ? 
            <ActivityIndicator color="#fff" size="small" /> : 
            <Text style={styles.submitText}>게시</Text>
          }
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 질문 입력 */}
        <TextInput
          style={styles.questionInput}
          placeholder="질문을 입력하세요"
          placeholderTextColor="#999"
          value={question}
          onChangeText={setQuestion}
          maxLength={100}
        />
        
        {/* 이미지 목록 */}
        <View style={styles.imageSection}>
          <View style={styles.imageHeader}>
            <Text style={styles.sectionTitle}>이미지</Text>
            <TouchableOpacity 
              onPress={pickImages}
              style={styles.addImageButton}
            >
              <Ionicons name="add-circle" size={24} color="#4ECDC4" />
              <Text style={styles.addImageText}>이미지 추가</Text>
            </TouchableOpacity>
          </View>
          
          {images.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imageList}
            >
              {images.map((image, index) => (
                <View key={image.uri + index} style={styles.imageContainer}>
                  <Image 
                    source={{ uri: image.uri }} 
                    style={styles.imagePreview} 
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="images-outline" size={48} color="#ddd" />
              <Text style={styles.noImageText}>이미지를 추가해주세요</Text>
            </View>
          )}
        </View>
        
        {/* 선택지 입력 */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>선택지</Text>
          
          {options.map((option, index) => (
            <View key={`option-${index}`} style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.correctButton,
                  correctOption === index ? styles.correctButtonSelected : {}
                ]}
                onPress={() => selectCorrectOption(index)}
              >
                <Ionicons 
                  name={correctOption === index ? "checkmark-circle" : "radio-button-off"} 
                  size={24} 
                  color={correctOption === index ? "#4ECDC4" : "#ccc"} 
                />
              </TouchableOpacity>
              
              <TextInput
                style={styles.optionInput}
                placeholder={`선택지 ${index + 1}`}
                placeholderTextColor="#999"
                value={option}
                onChangeText={(text) => updateOption(index, text)}
              />
            </View>
          ))}
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4ECDC4" />
          <Text style={styles.infoText}>정답으로 선택할 선택지 앞의 동그라미를 눌러주세요.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imageSection: {
    marginTop: 20,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageText: {
    color: '#4ECDC4',
    marginLeft: 4,
    fontWeight: '500',
  },
  imageList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  noImageContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  noImageText: {
    color: '#999',
    marginTop: 8,
  },
  optionsSection: {
    marginTop: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  correctButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctButtonSelected: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 18,
  },
  optionInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  infoText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  }
}); 