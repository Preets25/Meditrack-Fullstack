import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

// Optional: import messaging from '@react-native-firebase/messaging';
// This assumes firebase setup is instantiated

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder Screens
const HomeScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Dashboard</Text></View>;
const MedicinesScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Medicines</Text></View>;
const ShopsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Shops Directory</Text></View>;
const ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>My Profile</Text></View>;
const LoginScreen = ({ navigation }) => {
  const handleFakeLogin = async () => {
    await AsyncStorage.setItem('token', 'fake-jwt-token');
    navigation.replace('MainTabs');
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text onPress={handleFakeLogin} style={{ color: 'blue', fontSize: 18 }}>Login to continue</Text>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Medicines" component={MedicinesScreen} />
    <Tab.Screen name="Shops" component={ShopsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Initial Auth Check
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    checkAuth();

    // 2. Firebase Messaging Background Handler
    /* 
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    }); 
    */
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
           <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
           <>
             <Stack.Screen name="Login" component={LoginScreen} />
             <Stack.Screen name="MainTabs" component={MainTabs} />
           </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
