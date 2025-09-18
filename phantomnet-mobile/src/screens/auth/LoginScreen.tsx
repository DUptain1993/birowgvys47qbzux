// Login Screen Component

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import API service and types
import apiService from '../../services/api';
import { LoginCredentials } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverConfig, setServerConfig] = useState({
    url: 'into-the-nothingnesssss.duckdns.org',
    port: '8443',
    useSSL: true,
  });

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      // Set server configuration
      await apiService.setServerConfig({
        url: serverConfig.url,
        port: parseInt(serverConfig.port),
        useSSL: serverConfig.useSSL,
        timeout: 30000,
      });

      // Test connection first
      const connectionTest = await apiService.testConnection();
      if (!connectionTest) {
        Alert.alert(
          'Connection Failed',
          'Unable to connect to the C2 server. Please check your server configuration.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Attempt login
      const result = await apiService.login(credentials);

      if (result.success) {
        // Navigate to main app
        // This should trigger the navigation state change
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will be handled by the auth state change
            },
          },
        ]);
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={80} color={COLORS.primary} />
            <Text style={styles.title}>PhantomNet C2</Text>
            <Text style={styles.subtitle}>Command & Control Center</Text>
          </View>

          {/* Server Configuration */}
          <View style={styles.serverConfig}>
            <Text style={styles.sectionTitle}>Server Configuration</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Server URL</Text>
              <TextInput
                style={styles.input}
                value={serverConfig.url}
                onChangeText={(url) => setServerConfig({ ...serverConfig, url })}
                placeholder="your-c2-server.com"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Port</Text>
              <TextInput
                style={styles.input}
                value={serverConfig.port}
                onChangeText={(port) => setServerConfig({ ...serverConfig, port })}
                placeholder="8443"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.sslContainer}>
              <Text style={styles.sslLabel}>Use SSL</Text>
              <TouchableOpacity
                style={[styles.sslToggle, serverConfig.useSSL && styles.sslToggleActive]}
                onPress={() => setServerConfig({ ...serverConfig, useSSL: !serverConfig.useSSL })}
              >
                <View style={[styles.sslToggleCircle, serverConfig.useSSL && styles.sslToggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.loginForm}>
            <Text style={styles.sectionTitle}>Authentication</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={credentials.username}
                onChangeText={(username) => setCredentials({ ...credentials, username })}
                placeholder="Enter username"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={credentials.password}
                  onChangeText={(password) => setCredentials({ ...credentials, password })}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="#ffffff" style={styles.loginIcon} />
                  <Text style={styles.loginButtonText}>Login to C2 Server</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Default credentials: admin / phantom_admin_2024
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  serverConfig: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  loginForm: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.surface,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  passwordToggle: {
    padding: SPACING.md,
  },
  sslContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  sslLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  sslToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  sslToggleActive: {
    backgroundColor: COLORS.primary,
  },
  sslToggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    transform: [{ translateX: 0 }],
  },
  sslToggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  loginIcon: {
    marginRight: SPACING.sm,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
