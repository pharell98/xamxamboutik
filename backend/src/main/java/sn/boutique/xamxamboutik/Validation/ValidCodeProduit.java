package sn.boutique.xamxamboutik.Validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = {})
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Pattern(regexp = "^[a-zA-Z0-9\\-_\\s]+$", message = "Le code produit peut contenir des lettres, chiffres, tirets, underscores et espaces")
public @interface ValidCodeProduit {
    String message() default "Le code produit peut contenir des lettres, chiffres, tirets, underscores et espaces";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
