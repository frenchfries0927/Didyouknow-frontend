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

export default function CreateKnowledgeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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
  
  // 게시글 작성 제출 함수
  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim()) {
      return Alert.alert('알림', '제목을 입력해주세요.');
    }
    
    if (!content.trim()) {
      return Alert.alert('알림', '내용을 입력해주세요.');
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
      
      // 폼데이터 생성
      const formData = new FormData();
      
      // 사용자 ID 추가
      formData.append('userId', String(user.id));
      
      // 제목, 내용 추가
      formData.append('title', title);
      formData.append('content', content);
      
      // 현재 날짜를 YYYY-MM-DD 형식으로 추가
      const today = new Date();
      const publishDate = today.toISOString().split('T')[0];
      formData.append('publishDate', publishDate);
      
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
      
      console.log('FormData 준비됨, 요청 전송 중... userId:', user.id);
      
      // API 호출
      const response = await axios.post(
        `${API_URL}/api/posts`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true // CORS 요청에 쿠키 포함
        }
      );
      
      console.log('게시글 작성 성공:', response.data);
      Alert.alert('성공', '게시글이 작성되었습니다.', [
        { text: 'OK', onPress: () => router.push('/(tabs)') }
      ]);
    } catch (error) {
      console.error('게시글 제출 오류:', error);
      Alert.alert('오류', '게시글 작성 중 문제가 발생했습니다.');
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
        <Text style={styles.headerTitle}>지식 공유하기</Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim()}
          style={[
            styles.submitButton, 
            (!title.trim() || !content.trim() || isSubmitting) ? styles.disabledButton : {}
          ]}
        >
          {isSubmitting ? 
            <ActivityIndicator color="#fff" size="small" /> : 
            <Text style={styles.submitText}>게시</Text>
          }
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 제목 입력 */}
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
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
              <Ionicons name="add-circle" size={24} color="#FF6B6B" />
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
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
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
        
        {/* 내용 입력 */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="재미있는 지식을 공유해보세요..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
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
    backgroundColor: '#FF6B6B',
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
  titleInput: {
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
    color: '#FF6B6B',
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
  contentSection: {
    marginTop: 20,
  },
  contentInput: {
    height: 200,
    padding: 12,
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    fontSize: 16,
    lineHeight: 24,
  },
}); 