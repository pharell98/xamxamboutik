package sn.boutique.xamxamboutik.security.service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Exception.CustomAuthenticationException;
import sn.boutique.xamxamboutik.Exception.TokenException;
import sn.boutique.xamxamboutik.security.config.JwtProperties;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import sn.boutique.xamxamboutik.security.dto.LoginRequest;
import sn.boutique.xamxamboutik.security.dto.TokenResponse;
import sn.boutique.xamxamboutik.security.jwt.JwtTokenProvider;
import sn.boutique.xamxamboutik.security.model.AuthenticatedUser;
import sn.boutique.xamxamboutik.security.model.RefreshToken;
import sn.boutique.xamxamboutik.security.repository.RefreshTokenRepository;
import sn.boutique.xamxamboutik.security.model.UserAuthInfo;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    public TokenResponse authenticate(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getLogin(),
                            request.getPassword()
                    )
            );
            String accessToken = jwtTokenProvider.createToken(authentication, false);
            String refreshToken = jwtTokenProvider.createToken(authentication, true);
            UserAuthInfo user = (UserAuthInfo) authentication.getPrincipal();
            saveRefreshToken(user, refreshToken);
            return TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType(SecurityConstants.Defaults.TOKEN_TYPE)
                    .expiresIn(jwtProperties.getAccessToken().getValidityInMillis() / 1000)
                    .userInfo(TokenResponse.UserInfo.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .roles(user.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.toSet()))
                            .build())
                    .build();
        } catch (Exception e) {
            throw new CustomAuthenticationException(SecurityConstants.ErrorMessages.INVALID_CREDENTIALS);
        }
    }
    private void saveRefreshToken(UserAuthInfo user, String refreshToken) {
        Utilisateur utilisateur = ((AuthenticatedUser) user).getUtilisateur();
        RefreshToken token = RefreshToken.builder()
                .token(refreshToken)
                .user(utilisateur)
                .expiryDate(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshToken().getValidityInMillis() / 1000))
                .build();
        refreshTokenRepository.save(token);
    }
    public TokenResponse refreshToken(String refreshToken) {
        try {
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                throw new TokenException(SecurityConstants.ErrorMessages.TOKEN_INVALID);
            }
            Optional<RefreshToken> storedTokenOpt = refreshTokenRepository.findByToken(refreshToken);
            if (storedTokenOpt.isEmpty()) {
                throw new TokenException(SecurityConstants.ErrorMessages.TOKEN_INVALID);
            }
            RefreshToken storedToken = storedTokenOpt.get();
            if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                refreshTokenRepository.delete(storedToken);
                throw new TokenException(SecurityConstants.ErrorMessages.TOKEN_EXPIRED);
            }
            Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);
            String newAccessToken = jwtTokenProvider.createToken(authentication, false);
            return TokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken) // Utilisez un nouveau refresh token si vous implémentez la rotation
                    .tokenType(SecurityConstants.Defaults.TOKEN_TYPE)
                    .expiresIn(jwtProperties.getAccessToken().getValidityInMillis() / 1000)
                    .userInfo(TokenResponse.UserInfo.builder()
                            .id(((UserAuthInfo) authentication.getPrincipal()).getId())
                            .username(authentication.getName())
                            .roles(authentication.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.toSet()))
                            .build())
                    .build();
        } catch (Exception e) {
            throw new TokenException(SecurityConstants.ErrorMessages.TOKEN_INVALID);
        }
    }
    public void logout(String refreshToken) {
        Optional<RefreshToken> storedTokenOpt = refreshTokenRepository.findByToken(refreshToken);
        if (storedTokenOpt.isPresent()) {
            refreshTokenRepository.delete(storedTokenOpt.get());
        } else {
        }
    }
}
