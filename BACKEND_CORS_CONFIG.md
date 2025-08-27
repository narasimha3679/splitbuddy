# Backend CORS Configuration for Expo Go

## Current Issue
Your CORS configuration only allows specific origins, but Expo Go on mobile makes requests from different origins that aren't in your allowed list.

## Updated CORS Configuration

Replace your current CORS configuration with this:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Allow all origins for development (you can restrict this in production)
    configuration.setAllowedOriginPatterns(List.of("*")); // More permissive for development
    
    // Or if you want to be more specific, add these origins:
    // configuration.setAllowedOrigins(List.of(
    //     "http://localhost:8281",
    //     "http://100.73.30.54:8281",
    //     "http://localhost:3000",
    //     "http://100.78.225.115:3000",
    //     "exp://192.168.18.47:8281", // Add your Expo development server
    //     "exp://localhost:8281"
    // ));
    
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## Alternative: Development vs Production Configuration

For better security, you can use different configurations:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Check if we're in development mode
    String activeProfile = environment.getActiveProfiles().length > 0 
        ? environment.getActiveProfiles()[0] 
        : "default";
    
    if ("dev".equals(activeProfile) || "development".equals(activeProfile)) {
        // Development: Allow all origins
        configuration.setAllowedOriginPatterns(List.of("*"));
    } else {
        // Production: Restrict to specific origins
        configuration.setAllowedOrigins(List.of(
            "https://your-production-domain.com",
            "https://your-app-domain.com"
        ));
    }
    
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## Testing the Configuration

1. **Restart your backend server** after making these changes
2. **Test from web**: Should still work
3. **Test from Expo Go**: Should now work
4. **Check the logs**: Look for CORS-related errors

## Common Expo Development Origins

When using Expo Go, your app might make requests from origins like:
- `exp://192.168.18.47:8281`
- `exp://localhost:8281`
- `exp://10.0.2.2:8281` (Android emulator)
- `exp://127.0.0.1:8281`

## Security Note

For production, make sure to:
1. Remove `setAllowedOriginPatterns(List.of("*"))`
2. Use specific allowed origins
3. Consider using environment variables for origin configuration
