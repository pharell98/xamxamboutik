package sn.boutique.xamxamboutik.Exception;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import java.io.Serial;
@Getter
@Slf4j
public class TokenException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 1L;
    private final String errorCode;
    private final HttpStatus status; // Pour indiquer un code HTTP par défaut
    public TokenException(String message) {
        super(message);
        this.errorCode = "TOKEN_ERROR";
        this.status = HttpStatus.UNAUTHORIZED;
    }
    public TokenException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.status = HttpStatus.UNAUTHORIZED;
    }
    public TokenException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "TOKEN_ERROR";
        this.status = HttpStatus.UNAUTHORIZED;
    }
    public static TokenException expired() {
        return new TokenException(SecurityConstants.ErrorMessages.TOKEN_EXPIRED, "TOKEN_EXPIRED");
    }
    public static TokenException invalid() {
        return new TokenException(SecurityConstants.ErrorMessages.TOKEN_INVALID, "TOKEN_INVALID");
    }
    public static TokenException missing() {
        return new TokenException(SecurityConstants.ErrorMessages.TOKEN_MISSING, "TOKEN_MISSING");
    }
}
