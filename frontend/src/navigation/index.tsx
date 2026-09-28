import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { lightColors, darkColors } from '../theme';
import { t } from '../i18n';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { OfflineGuidesScreen } from '../screens/OfflineGuidesScreen';
import { GuideDetailScreen } from '../screens/GuideDetailScreen';
import { HelplinesScreen } from '../screens/HelplinesScreen';
import { MedicalProfileScreen } from '../screens/MedicalProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ActiveSosScreen } from '../screens/ActiveSosScreen';

// Tools Hub & Tool Screens (importing from screens)
import { ToolsHubScreen } from '../screens/ToolsHubScreen';
import { FakeCallScreen } from '../screens/FakeCallScreen';
import { SirenScreen } from '../screens/SirenScreen';
import { MorseSosScreen } from '../screens/MorseSosScreen';
import { VoiceSosScreen } from '../screens/VoiceSosScreen';
import { AudioEvidenceScreen } from '../screens/AudioEvidenceScreen';
import { EmergencyChatScreen } from '../screens/EmergencyChatScreen';
import { HazardMapScreen } from '../screens/HazardMapScreen';
import { ReportHazardScreen } from '../screens/ReportHazardScreen';
import { ResponderTrackingScreen } from '../screens/ResponderTrackingScreen';
import { BleMeshScreen } from '../screens/BleMeshScreen';
import { VoiceStressScreen } from '../screens/VoiceStressScreen';
import { AcousticGunshotScreen } from '../screens/AcousticGunshotScreen';
import { LostChildScreen } from '../screens/LostChildScreen';
import { VideoRelayScreen } from '../screens/VideoRelayScreen';
import { GreenCorridorScreen } from '../screens/GreenCorridorScreen';
import { MedicalDossierScreen } from '../screens/MedicalDossierScreen';
import { SatelliteBridgeScreen } from '../screens/SatelliteBridgeScreen';
import { DevTestPanelScreen } from '../screens/DevTestPanelScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: settings.seniorMode ? 68 : 58,
          paddingBottom: settings.seniorMode ? 8 : 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: settings.seniorMode ? 14 : 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert';
          const iconSize = settings.seniorMode ? 28 : 22;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'ContactsTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'GuidesTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ToolsTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: t('tabHome', settings.language) }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactsScreen}
        options={{ tabBarLabel: t('tabContacts', settings.language) }}
      />
      <Tab.Screen
        name="GuidesTab"
        component={OfflineGuidesScreen}
        options={{ tabBarLabel: t('tabGuides', settings.language) }}
      />
      <Tab.Screen
        name="ToolsTab"
        component={ToolsHubScreen}
        options={{ tabBarLabel: t('tabTools', settings.language) }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: t('tabSettings', settings.language) }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="ActiveSos" component={ActiveSosScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
      <Stack.Screen name="Helplines" component={HelplinesScreen} />
      <Stack.Screen name="MedicalProfile" component={MedicalProfileScreen} />

      {/* Tools Screens */}
      <Stack.Screen name="FakeCall" component={FakeCallScreen} />
      <Stack.Screen name="Siren" component={SirenScreen} />
      <Stack.Screen name="MorseSos" component={MorseSosScreen} />
      <Stack.Screen name="VoiceSos" component={VoiceSosScreen} />
      <Stack.Screen name="AudioEvidence" component={AudioEvidenceScreen} />
      <Stack.Screen name="EmergencyChat" component={EmergencyChatScreen} />
      <Stack.Screen name="HazardMap" component={HazardMapScreen} />
      <Stack.Screen name="ReportHazard" component={ReportHazardScreen} />
      <Stack.Screen name="ResponderTracking" component={ResponderTrackingScreen} />
      <Stack.Screen name="BleMesh" component={BleMeshScreen} />
      <Stack.Screen name="VoiceStress" component={VoiceStressScreen} />
      <Stack.Screen name="AcousticGunshot" component={AcousticGunshotScreen} />
      <Stack.Screen name="LostChild" component={LostChildScreen} />
      <Stack.Screen name="VideoRelay" component={VideoRelayScreen} />
      <Stack.Screen name="GreenCorridor" component={GreenCorridorScreen} />
      <Stack.Screen name="MedicalDossier" component={MedicalDossierScreen} />
      <Stack.Screen name="SatelliteBridge" component={SatelliteBridgeScreen} />
      <Stack.Screen name="DevTestPanel" component={DevTestPanelScreen} />
    </Stack.Navigator>
  );
}
