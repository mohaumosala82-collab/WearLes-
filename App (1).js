import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import EstatesScreen from './screens/EstatesScreen';
import HotelsScreen from './screens/HotelsScreen';
import ShuttlesScreen from './screens/ShuttlesScreen';
import FlightsScreen from './screens/FlightsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Estates" component={EstatesScreen} />
        <Tab.Screen name="Hotels" component={HotelsScreen} />
        <Tab.Screen name="Shuttles" component={ShuttlesScreen} />
        <Tab.Screen name="Flights" component={FlightsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}