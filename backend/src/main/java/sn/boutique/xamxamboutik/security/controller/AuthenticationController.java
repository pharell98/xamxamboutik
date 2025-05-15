package sn.boutique.xamxamboutik.security.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import sn.boutique.xamxamboutik.security.dto.LoginRequest;
import sn.boutique.xamxamboutik.security.dto.TokenResponse;
import sn.boutique.xamxamboutik.security.service.AuthenticationService;
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "API d'authentification")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    @PostMapping("/login")
    @Operation(summary = "Authentification d'un utilisateur")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchissement du token")
    public ResponseEntity<TokenResponse> refresh(@RequestHeader("Authorization") String bearerToken) {
        String refreshToken = extractTokenFromHeader(bearerToken);
        TokenResponse response = authenticationService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/logout")
    @Operation(summary = "Déconnexion d'un utilisateur")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String bearerToken) {
        String refreshToken = extractTokenFromHeader(bearerToken);
        authenticationService.logout(refreshToken);
        return ResponseEntity.ok().body(ApiResponse.success("Déconnecté avec succès", null));
    }
    private String extractTokenFromHeader(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            return bearerToken.substring(SecurityConstants.TOKEN_PREFIX.length());
        }
        return bearerToken;
    }
}
