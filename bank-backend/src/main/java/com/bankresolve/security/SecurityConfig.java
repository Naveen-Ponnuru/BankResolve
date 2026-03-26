package com.bankresolve.security;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.bankresolve.filter.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/**
 * Central Spring Security configuration.
 *
 * <pre>
 *   /api/auth/**      → permitAll
 *   /api/banks/**     → permitAll  (registration dropdown)
 *   /api/admin/**     → ROLE_ADMIN
 *   /api/manager/**   → ROLE_MANAGER, ROLE_ADMIN
 *   /api/staff/**     → ROLE_STAFF, ROLE_MANAGER, ROLE_ADMIN
 *   /api/customer/**  → ROLE_CUSTOMER, ROLE_STAFF, ROLE_MANAGER, ROLE_ADMIN
 *   everything else   → authenticated
 * </pre>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> {
                    // ─── CORS Preflight ───────────────────────────────────
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                    // ─── Public endpoints ─────────────────────────────────
                    auth.requestMatchers("/api/auth/**").permitAll();
                    auth.requestMatchers("/api/banks", "/api/banks/**").permitAll();
                    auth.requestMatchers("/api/contacts", "/api/contacts/**").permitAll();
                    auth.requestMatchers("/ws/**").permitAll();
                    auth.requestMatchers("/actuator/health").permitAll();
                        auth.requestMatchers("/swagger-ui.html", "/swagger-ui/**",
                            "/v3/api-docs/**").permitAll();

                        // ─── Role-based access ────────────────────────────────
                        auth.requestMatchers("/api/admin/**").hasRole("ADMIN");
                        auth.requestMatchers("/api/manager/**").hasRole("MANAGER");
                        auth.requestMatchers("/api/staff/**").hasRole("STAFF");
                        auth.requestMatchers("/api/customer/**").hasRole("CUSTOMER");

                        // ─── Customer endpoints ───────────────────────────────
                        auth.requestMatchers("/api/dashboard-summary").hasAnyRole("CUSTOMER", "STAFF", "MANAGER", "ADMIN");
                        auth.requestMatchers("/api/grievances/my").hasRole("CUSTOMER");
                        auth.requestMatchers("/api/customer/grievances").hasRole("CUSTOMER");

                        // ─── Staff endpoints ────────────────────────────────
                        auth.requestMatchers("/api/grievances/bank").hasRole("STAFF");

                        // ─── Manager endpoints ──────────────────────────────
                        auth.requestMatchers("/api/grievances/high").hasRole("MANAGER");


                        // ─── Dashboard endpoints ────────────────────────────
                        auth.requestMatchers("/api/dashboard-summary").hasAnyRole("CUSTOMER","STAFF","MANAGER","ADMIN");
                        auth.requestMatchers("/api/grievances", 
                            "/api/grievances/dashboard-summary", 
                            "/api/grievances/monthly-trend").hasAnyRole("CUSTOMER","STAFF","MANAGER","ADMIN");

                        // Keep generic grievances access for existing controllers
                        auth.requestMatchers("/api/grievances/**")
                            .hasAnyRole("CUSTOMER", "STAFF", "MANAGER", "ADMIN");

                        auth.requestMatchers("/api/notifications/**").authenticated();

                        // ─── Everything else requires authentication ──────────
                        auth.anyRequest().authenticated();
                })
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> 
                        response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage())
                ))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // ─── Authentication Provider ──────────────────────────────────────────────

    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ─── Password Encoder ─────────────────────────────────────────────────────

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ─── CORS ─────────────────────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("CORS: Initializing centralized configuration source");
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = List.of("http://localhost:5173", "http://localhost:5174");
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        
        log.info("CORS: Allowed origin patterns: {}", origins);
        log.info("CORS: Allow credentials: {}", config.getAllowCredentials());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
