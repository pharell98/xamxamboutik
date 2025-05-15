package sn.boutique.xamxamboutik.Exception;
public class InvalidRequestException extends BaseCustomException {
    public InvalidRequestException(String message) {
        super(message, "INVALID_REQUEST");
    }
}