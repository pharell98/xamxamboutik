package sn.boutique.xamxamboutik.security.constants;
public final class SecurityConstants {
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final class ErrorMessages {
        public static final String USER_NOT_FOUND = "Utilisateur non trouvé";
        public static final String INVALID_CREDENTIALS = "Login ou mot de passe incorrect";
        public static final String TOKEN_EXPIRED = "Token expiré";
        public static final String TOKEN_INVALID = "Token invalide";
        public static final String TOKEN_MISSING = "Token manquant";
        public static final String UNAUTHORIZED = "Non autorisé";
        private ErrorMessages() {}
    }
    public static final class PublicUrls {
        public static final String[] AUTH_URLS = {
                "/api/v1/auth/**",
                "/auth/**"
        };
        public static final String[] SWAGGER_URLS = {
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html"
        };
        private PublicUrls() {}
    }
    public static final class JwtClaims {
        public static final String ROLES = "roles";
        public static final String USER_ID = "userId";
        public static final String ISSUER = "gestion-darou-salam-app";
        public static final String CREATED_AT = "createdAt";
        private JwtClaims() {}
    }
    public static final class Defaults {
        public static final String TOKEN_TYPE = "Bearer";
        public static final String ROLE_PREFIX = "ROLE_";
        public static final String AUTH_TYPE = "Bearer";
        private Defaults() {}
    }
    private SecurityConstants() {
        throw new AssertionError("Cette classe utilitaire ne doit pas être instanciée");
    }
}