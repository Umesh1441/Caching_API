import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';


export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchFromCache, setFetchFromCache] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Check if image URLs are cached in AsyncStorage
        const cachedData = await AsyncStorage.getItem('cachedImages');
        if (cachedData) {
          setFetchFromCache(true); // Indicate that data is fetched from cache
          setImages(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Fetch image URLs from API
        const response = await axios.get('https://api.flickr.com/services/rest/', {
          params: {
            method: 'flickr.photos.getRecent',
            per_page: 20,
            page: 1,
            api_key: '6f102c62f41998d151e5a1b48713cf13',
            format: 'json',
            nojsoncallback: 1,
            extras: 'url_s',
          }
        });

        // Cache image URLs in AsyncStorage
        await AsyncStorage.setItem('cachedImages', JSON.stringify(response.data.photos.photo));

        setFetchFromCache(false); // Indicate that data is fetched from the network
        setImages(response.data.photos.photo);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const renderItem = ({ item }) => (
    <Image source={{ uri: item.url_s }} style={styles.image} />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fetchFromCache ? (
        <Text style={{top:30,}}>Data fetched from cache</Text>
      ) : (
        <Text style={{top:30,}}>Data fetched from network</Text>
      )}
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 8,
    paddingVertical: 30,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    margin: 8,
  },
});
