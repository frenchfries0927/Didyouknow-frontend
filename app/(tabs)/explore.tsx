// app/(tabs)/explore.tsx
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';

// 모의 탐색 데이터
const exploreMockData = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  imageUrl: `https://picsum.photos/id/${i + 100}/300/300`
}));

export default function ExplorePage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>탐색</Text>
      </View>
      
      <FlatList
        data={exploreMockData}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');
const imageSize = width / 3 - 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    margin: 1
  },
  image: {
    width: '100%',
    height: '100%'
  }
});