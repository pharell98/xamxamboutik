package sn.boutique.xamxamboutik.Exception;
public class InternalServiceException extends BaseCustomException {
    public InternalServiceException(String message, Throwable cause) {
        super(message, "INTERNAL_ERROR");
        initCause(cause);
    }
}
