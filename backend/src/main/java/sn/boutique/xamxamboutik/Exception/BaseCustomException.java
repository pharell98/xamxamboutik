package sn.boutique.xamxamboutik.Exception;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
@Getter
@RequiredArgsConstructor
public class BaseCustomException extends RuntimeException {
    private final String errorCode; // Code d'erreur unique
    public BaseCustomException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
