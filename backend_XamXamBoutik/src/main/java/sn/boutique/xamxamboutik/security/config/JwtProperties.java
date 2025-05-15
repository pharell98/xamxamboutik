package sn.boutique.xamxamboutik.security.config;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
@Getter
@Setter
@Validated
@Configuration
@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {
    @NotBlank(message = "La clé secrète JWT est obligatoire")
    private String secretKey;
    private final TokenConfig accessToken = new TokenConfig();
    private final TokenConfig refreshToken = new TokenConfig();
    @Getter
    @Setter
    @Validated
    public static class TokenConfig {
        @Min(1)
        private long validity;
        public long getValidityInMillis() {
            return validity * 1000;
        }
    }
}
