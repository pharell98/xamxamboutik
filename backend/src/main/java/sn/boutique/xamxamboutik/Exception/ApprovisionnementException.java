package sn.boutique.xamxamboutik.Exception;

import lombok.Getter;

@Getter
public class ApprovisionnementException extends BaseCustomException {
    private final String details; // Informations supplémentaires (facultatif)

    public ApprovisionnementException(String message, String details) {
        super(message, "APPRO_ERROR");
        this.details = details;
    }
}
