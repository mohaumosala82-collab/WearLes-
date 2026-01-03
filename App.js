import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ListingsScreen from './screens/ListingsScreen';
import BookingScreen from './screens/BookingScreen';
import FlightsScreen from './screens/FlightsScreen';
import ShuttlesScreen from './screens/ShuttlesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Listings" component={ListingsScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Flights" component={FlightsScreen} />
        <Stack.Screen name="Shuttles" component={ShuttlesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}