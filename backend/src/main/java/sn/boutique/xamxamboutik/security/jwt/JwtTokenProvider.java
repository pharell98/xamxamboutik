package sn.boutique.xamxamboutik.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Exception.TokenException;
import sn.boutique.xamxamboutik.security.config.JwtProperties;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import sn.boutique.xamxamboutik.security.model.AuthenticatedUser;
import sn.boutique.xamxamboutik.security.service.CustomUserDetailsService;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    private final JwtProperties jwtProperties;
    private final CustomUserDetailsService customUserDetailsService;
    private SecretKey secretKey;

    @PostConstruct
    protected void init() {
        // Décoder la clé Base64 fournie dans JWT_SECRET
        byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.getSecretKey());
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(Authentication authentication, boolean isRefreshToken) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        Claims claims = Jwts.claims().setSubject(user.getUsername());
        claims.put(SecurityConstants.JwtClaims.USER_ID, user.getId());
        claims.put("nom", user.getUtilisateur().getNom());
        claims.put("login", user.getUsername());
        claims.put(SecurityConstants.JwtClaims.ROLES, getRolesFromAuth(authentication));
        Date validity = getValidity(isRefreshToken);
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(validity)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jws<Claims> claims = parseToken(token);
            return !claims.getBody().getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            throw new TokenException("Token invalide ou expiré");
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseToken(token).getBody();
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(claims.getSubject());
        return new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities());
    }

    public Date getExpirationDate(String token) {
        Claims claims = parseToken(token).getBody();
        return claims.getExpiration();
    }

    private Long getLongFromClaims(Claims claims, String key) {
        Object value = claims.get(key);
        return value != null ? Long.valueOf(value.toString()) : null;
    }

    private Date getValidity(boolean isRefreshToken) {
        long validityDuration = isRefreshToken ?
                jwtProperties.getRefreshToken().getValidityInMillis() :
                jwtProperties.getAccessToken().getValidityInMillis();
        return new Date(System.currentTimeMillis() + validityDuration);
    }

    private Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token);
    }

    private Collection<? extends GrantedAuthority> getAuthoritiesFromClaims(Claims claims) {
        String roles = claims.get(SecurityConstants.JwtClaims.ROLES).toString();
        return Arrays.stream(roles.split(","))
                .filter(role -> !role.trim().isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    private String getRolesFromAuth(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
    }
}