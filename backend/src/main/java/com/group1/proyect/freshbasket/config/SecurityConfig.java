package com.group1.proyect.freshbasket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Rutas públicas para swagger y el login
                .requestMatchers(
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/webjars/**"
                ).permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/countries/**").permitAll()


                // Rutas para products y detalles de permisos
                .requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "CLIENTE", "SOPORTE")
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "SOPORTE")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("ADMINISTRADOR")


                // Rutas para entries y exits
                .requestMatchers(HttpMethod.GET, "/api/entries/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "SOPORTE")
                .requestMatchers(HttpMethod.GET, "/api/exits/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "SOPORTE")

                .requestMatchers(HttpMethod.POST, "/api/entries/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "SOPORTE")
                .requestMatchers(HttpMethod.POST, "/api/exits/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "SOPORTE")

                .requestMatchers(HttpMethod.PUT, "/api/entries/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE")
                .requestMatchers(HttpMethod.PUT, "/api/exits/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE")

                .requestMatchers(HttpMethod.DELETE, "/api/entries/**").hasAuthority("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/exits/**").hasAuthority("ADMINISTRADOR")


                // Rutas para suppliers y categories
                .requestMatchers(HttpMethod.GET, "/api/suppliers/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "CLIENTE", "SOPORTE")
                .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "CLIENTE", "SOPORTE")

                .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE", "EMPLEADO")
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE", "EMPLEADO")

                .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE")

                .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasAuthority("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("ADMINISTRADOR")


                // Rutas para countries
                .requestMatchers(HttpMethod.GET, "/api/countries/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO", "SOPORTE")
                .requestMatchers(HttpMethod.POST, "/api/countries/**").hasAnyAuthority("ADMINISTRADOR", "EMPLEADO")
                .requestMatchers(HttpMethod.PUT, "/api/countries/**").hasAuthority("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/countries/**").hasAuthority("ADMINISTRADOR")

                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()

                // Rutas para Users
                .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyAuthority("ADMINISTRADOR", "SOPORTE")
                .requestMatchers("/api/users/**").hasAuthority("ADMINISTRADOR")


                // Seguridad global
                .anyRequest().authenticated()
        );

        // Filtro JWT antes del filtro de autenticación por defecto
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://192.168.1.60:5173",
                "http://localhost",
                "http://127.0.0.1",
                "http://192.168.1.60",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}