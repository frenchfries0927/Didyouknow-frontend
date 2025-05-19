import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileSetup({ onClose, onNext }) {
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // 실제로는 이미지 업로드 로직 필요
  const handleImagePick = () => {
    // 이미지 선택 로직
  };

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>회원 정보</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* 로고 및 안내 */}
      <Text style={styles.logo}>logo</Text>
      <Text style={styles.welcome}>환영합니다!</Text>
      <Text style={styles.subText}>기본 정보를 설정해주세요.</Text>

      {/* 프로필 사진 */}
      <View style={styles.profileImageWrapper}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person" size={48} color="#bbb" />
        )}
        <TouchableOpacity style={styles.imageEditBtn} onPress={handleImagePick}>
          <Ionicons name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.profileImageLabel}>프로필 사진을 설정해주세요</Text>

      {/* 닉네임 입력 */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>닉네임 <Text style={{ color: '#FF5A5F' }}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력해주세요"
          value={nickname}
          onChangeText={setNickname}
        />
      </View>

      {/* 다음 버튼 */}
      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: nickname ? '#FF5A5F' : '#eee' }]}
        onPress={() => onNext && onNext(nickname, profileImage)}
        disabled={!nickname}
      >
        <Text style={styles.nextBtnText}>다음  <Ionicons name="arrow-forward" size={16} color="#fff" /></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222'
  },
  logo: {
    fontFamily: 'cursive',
    fontSize: 28,
    color: '#4FC3F7',
    marginBottom: 12
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4
  },
  subText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24
  },
  profileImageWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44
  },
  imageEditBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FF5A5F',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  profileImageLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 24
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FAFAFA'
  },
  nextBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
}); 