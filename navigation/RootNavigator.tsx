import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types';
import { Colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import TodoFormScreen from '../screens/TodoFormScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Tabs: undefined;
  TodoForm: { todo?: Todo };
  Home: undefined;
  Report: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} onFabPress={() => navigation.navigate('TodoForm', {})} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

interface CustomTabBarProps {
  state: any;
  navigation: any;
  onFabPress: () => void;
}

function CustomTabBar({ state, navigation: tabNav, onFabPress }: CustomTabBarProps) {
  const tabs = [
    { key: 'Home',     label: '홈',     icon: 'home-outline',      iconActive: 'home' },
    { key: 'Calendar', label: '캘린더',  icon: 'calendar-outline',  iconActive: 'calendar' },
    { key: 'FAB',      label: '',       icon: 'add',               iconActive: 'add' },
    { key: 'Report',   label: '리포트',  icon: 'bar-chart-outline', iconActive: 'bar-chart' },
    { key: 'Profile',  label: '내 정보', icon: 'person-outline',    iconActive: 'person' },
  ];

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) => {
        if (tab.key === 'FAB') {
          return (
            <TouchableOpacity key="fab" style={tabStyles.fabWrap} onPress={onFabPress} activeOpacity={0.85}>
              <View style={tabStyles.fab}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        }
        const routeIndex = state.routes.findIndex((r: any) => r.name === tab.key);
        const isFocused = state.index === routeIndex;
        return (
          <TouchableOpacity
            key={tab.key}
            style={tabStyles.tabItem}
            onPress={() => tabNav.navigate(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isFocused ? tab.iconActive : tab.icon) as any}
              size={22}
              color={isFocused ? Colors.primary : Colors.textTertiary}
            />
            <Text style={[tabStyles.tabLabel, isFocused && tabStyles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 8,
    height: 72,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 10, color: Colors.textTertiary },
  tabLabelActive: { color: Colors.primary, fontWeight: '600' },
  fabWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -20 },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="TodoForm" component={TodoFormScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
