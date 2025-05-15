package sn.boutique.xamxamboutik.Exception;
public class DuplicateEntityException extends BaseCustomException {
    public DuplicateEntityException(String message) {
        super(message, "ENTITE_DUPLIQUEE");
    }
}
