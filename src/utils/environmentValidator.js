import { environment } from '@/config/environment';

/**
 * Environment Configuration Validator
 * Ensures all required environment variables are properly set
 */

export const validateEnvironment = () => {
  const errors = [];
  const warnings = [];

  // Required Environment Variables
  const required = {
    'VITE_API_BASE_URL': environment.API_BASE_URL,
    'VITE_FIREBASE_API_KEY': environment.FIREBASE.apiKey,
    'VITE_FIREBASE_AUTH_DOMAIN': environment.FIREBASE.authDomain,
    'VITE_FIREBASE_PROJECT_ID': environment.FIREBASE.projectId,
  };

  // Check required variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value || value === 'your_firebase_api_key' || value.includes('your_')) {
      errors.push(`${key} is not properly configured`);
    }
  });

  // API URL validation
  if (environment.API_BASE_URL) {
    if (!environment.API_BASE_URL.includes('learn-vanguard-server.onrender.com')) {
      warnings.push('API_BASE_URL should point to production backend');
    }
    if (!environment.API_BASE_URL.startsWith('https://')) {
      errors.push('API_BASE_URL must use HTTPS in production');
    }
  }

  // WebSocket URL validation
  if (environment.WS_URL) {
    if (!environment.WS_URL.startsWith('wss://')) {
      errors.push('WebSocket URL must use WSS in production');
    }
  }

  // Development settings check
  if (environment.IS_PROD) {
    if (environment.USE_MOCK_AUTH) {
      warnings.push('Mock authentication should be disabled in production');
    }
    if (environment.DEBUG_MODE) {
      warnings.push('Debug mode should be disabled in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      apiUrl: environment.API_BASE_URL,
      wsUrl: environment.WS_URL,
      environment: environment.IS_PROD ? 'production' : 'development',
      mockAuth: environment.USE_MOCK_AUTH,
      debugMode: environment.DEBUG_MODE
    }
  };
};

/**
 * Display environment validation results
 */
export const displayValidationResults = () => {
  const results = validateEnvironment();
  
  console.group('🔧 Environment Configuration');
  console.log('Summary:', results.summary);
  
  if (results.errors.length > 0) {
    console.group('❌ Errors (Must Fix)');
    results.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (results.warnings.length > 0) {
    console.group('⚠️ Warnings');
    results.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (results.isValid) {
    console.log('✅ Environment configuration is valid');
  } else {
    console.error('❌ Environment configuration has errors');
  }
  
  console.groupEnd();
  
  return results;
};

/**
 * Test API connectivity
 */
export const testApiConnectivity = async () => {
  try {
    const response = await fetch(`${environment.API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connectivity test passed', data);
      return { success: true, data };
    } else {
      console.error('❌ API connectivity test failed', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API connectivity test failed', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Run all environment checks
 */
export const runEnvironmentChecks = async () => {
  console.log('🚀 Running environment checks...');
  
  // Validate configuration
  const configResults = displayValidationResults();
  
  // Test API connectivity
  if (configResults.isValid) {
    const connectivityResults = await testApiConnectivity();
    return {
      config: configResults,
      connectivity: connectivityResults,
      overall: configResults.isValid && connectivityResults.success
    };
  }
  
  return {
    config: configResults,
    connectivity: { success: false, error: 'Skipped due to config errors' },
    overall: false
  };
};

export default {
  validateEnvironment,
  displayValidationResults,
  testApiConnectivity,
  runEnvironmentChecks
}; 