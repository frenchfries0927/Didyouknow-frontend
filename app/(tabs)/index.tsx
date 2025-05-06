import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [tmi, setTmi] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/tmi')  // ✅ 아래 주의 참고
      .then(res => res.text())
      .then(data => setTmi(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 그거 아세요?</Text>
      <Text>{tmi || '불러오는 중...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
