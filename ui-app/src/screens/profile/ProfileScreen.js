// src/screens/profile/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';

export function ProfileScreen() {
  const { user, directMode, signOut, disableDirectMode } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDisableDirectMode = () => {
    Alert.alert(
      'Disable Direct Mode',
      'This will disable direct mode and require Cognito authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          onPress: async () => {
            try {
              await disableDirectMode();
            } catch (error) {
              Alert.alert('Error', 'Failed to disable direct mode');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Text style={styles.title}>Profile</Text>
          
          {directMode ? (
            <View style={styles.directModeInfo}>
              <Text style={styles.directModeTitle}>🔧 Development Mode</Text>
              <Text style={styles.directModeText}>
                You are currently using direct mode, which bypasses Cognito authentication 
                and connects directly to the ALB endpoints.
              </Text>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userLabel}>Username:</Text>
              <Text style={styles.userValue}>
                {user?.username || user?.email || 'Unknown User'}
              </Text>
              
              {user?.email && (
                <>
                  <Text style={styles.userLabel}>Email:</Text>
                  <Text style={styles.userValue}>{user.email}</Text>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Authentication Mode</Text>
              <Text style={styles.settingValue}>
                {directMode ? 'Direct ALB Access' : 'Cognito JWT'}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>API Endpoint</Text>
              <Text style={styles.settingValue}>
                {directMode ? 'ALB Direct' : 'API Gateway'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          {directMode ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleDisableDirectMode}
            >
              <Text style={styles.buttonText}>Disable Direct Mode</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>App Information</Text>
          <Text style={styles.appInfoText}>Pet Store Mobile App v1.0.0</Text>
          <Text style={styles.appInfoText}>
            Built with React Native and Expo
          </Text>
          <Text style={styles.appInfoText}>
            Connects to AWS microservices architecture
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  profileSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xlarge,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  directModeInfo: {
    backgroundColor: COLORS.warning,
    borderRadius: 6,
    padding: SPACING.md,
  },
  directModeTitle: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  directModeText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.surface,
    lineHeight: 18,
  },
  userInfo: {
    marginTop: SPACING.sm,
  },
  userLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  userValue: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    color: COLORS.text,
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.large,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingsList: {
    marginTop: SPACING.sm,
  },
  settingItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    color: COLORS.text,
  },
  actionsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  button: {
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  appInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: TYPOGRAPHY.fontSize.medium,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  appInfoText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
});