package sn.boutique.xamxamboutik.Exception;
public class EntityNotFoundException extends BaseCustomException {
    public EntityNotFoundException(String message, String entityNotFound) {
        super(message, "ENTITE_NON_TROUVEE");
    }
}
