import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const hours = Array.from({ length: 24 }, (_, i) => i);

export default function AlarmSetup({ onClose, onComplete }) {
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmHour, setAlarmHour] = useState(9); // 기본 9시
  const [showHourPicker, setShowHourPicker] = useState(false);

  const handleHourSelect = (hour) => {
    setAlarmHour(hour);
    setShowHourPicker(false);
  };

  const getHourLabel = (hour) => {
    const ampm = hour < 12 ? '오전' : '오후';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${ampm} ${hour12}시`;
  };

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원 정보</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 로고 및 안내 */}
      <Text style={styles.logo}>logo</Text>
      <Text style={styles.welcome}>환영합니다!</Text>
      <Text style={styles.subText}>회원가입이 완료되었습니다. 이제 알림 설정을 해볼까요?</Text>
      <Text style={styles.tmiTitle}>오늘의 TMI를 알림으로 보내드려요!</Text>

      {/* TMI 카드 */}
      <View style={styles.tmiCard}>
        <Text style={styles.tmiCardTitle}>그거 아세요?</Text>
        <View style={styles.tmiCardContent}>
          <Text style={styles.tmiCardText}>카드 사먹처럼 '일반잔이', '오픈발잔이'가 있답니다.</Text>
        </View>
        <Text style={styles.tmiCardSub}>매일 이런 재미있는 TMI를 받아보세요!</Text>
      </View>

      {/* 알림 시간 설정 */}
      <Text style={styles.alarmLabel}>알림 시간 설정</Text>
      <Text style={styles.alarmDesc}>하루 중 TMI를 받고 싶은 시간을 선택해주세요.</Text>
      <TouchableOpacity style={styles.alarmTimeBox} onPress={() => setShowHourPicker(true)}>
        <View style={styles.alarmTimeRow}>
          <Text style={styles.alarmTimeSelect}>{getHourLabel(alarmHour)}</Text>
          <Ionicons name="chevron-down" size={18} color="#888" />
        </View>
        <Text style={styles.alarmTimeBig}>{alarmHour.toString().padStart(2, '0')}:00</Text>
      </TouchableOpacity>
      <Modal visible={showHourPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 320 }}>
              {hours.map((h) => (
                <TouchableOpacity key={h} onPress={() => handleHourSelect(h)} style={styles.hourItem}>
                  <Text style={{ fontSize: 18 }}>{getHourLabel(h)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 알림 스위치 */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>알림 시간</Text>
        <Switch
          value={alarmEnabled}
          onValueChange={setAlarmEnabled}
          trackColor={{ false: '#eee', true: '#FF5A5F' }}
          thumbColor={alarmEnabled ? '#FF5A5F' : '#ccc'}
        />
        <Text style={styles.switchValue}>{getHourLabel(alarmHour)}</Text>
      </View>

      {/* 설정 완료 버튼 */}
      <TouchableOpacity
        style={styles.completeBtn}
        onPress={() => onComplete && onComplete(alarmEnabled, alarmHour)}
      >
        <Text style={styles.completeBtnText}>설정 완료</Text>
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
    marginBottom: 8
  },
  tmiTitle: {
    color: '#5A5A89',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10
  },
  tmiCard: {
    width: '100%',
    backgroundColor: '#F6F7FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18
  },
  tmiCardTitle: {
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6
  },
  tmiCardContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  tmiCardText: {
    color: '#222',
    fontSize: 14
  },
  tmiCardSub: {
    color: '#888',
    fontSize: 12
  },
  alarmLabel: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 14,
    marginBottom: 2
  },
  alarmDesc: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8
  },
  alarmTimeBox: {
    width: '100%',
    backgroundColor: '#F6F7FB',
    borderRadius: 12,
    alignItems: 'center',
    padding: 16,
    marginBottom: 10
  },
  alarmTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  alarmTimeSelect: {
    fontSize: 15,
    color: '#222',
    marginRight: 4
  },
  alarmTimeBig: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5A5A89'
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18
  },
  switchLabel: {
    color: '#888',
    fontSize: 13,
    marginRight: 8
  },
  switchValue: {
    color: '#5A5A89',
    fontWeight: 'bold',
    marginLeft: 8
  },
  completeBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FF5A5F',
    marginTop: 8
  },
  completeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, width: 220, maxHeight: 400
  },
  hourItem: {
    paddingVertical: 10, alignItems: 'center'
  }
}); 