package sn.boutique.xamxamboutik.Exception;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import java.io.Serial;
@Getter
@Slf4j
public class CustomAuthenticationException extends AuthenticationException {
    @Serial
    private static final long serialVersionUID = 1L;
    private final String errorCode;
    public CustomAuthenticationException(String message) {
        super(message);
        this.errorCode = "AUTHENTICATION_ERROR";
    }
    public CustomAuthenticationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    public static CustomAuthenticationException invalidCredentials() {
        return new CustomAuthenticationException(
                SecurityConstants.ErrorMessages.INVALID_CREDENTIALS,
                "INVALID_CREDENTIALS"
        );
    }
    public static CustomAuthenticationException userNotFound() {
        return new CustomAuthenticationException(
                SecurityConstants.ErrorMessages.USER_NOT_FOUND,
                "USER_NOT_FOUND"
        );
    }
}
