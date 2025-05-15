package sn.boutique.xamxamboutik.Exception;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import java.util.HashMap;
import java.util.Map;
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BaseCustomException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustomException(BaseCustomException ex) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(
                false,
                ex.getMessage(),
                Map.of("errorCode", ex.getErrorCode())
        );
        HttpStatus status = mapErrorCodeToStatus(ex.getErrorCode());
        return new ResponseEntity<>(apiResponse, status);
    }
    @ExceptionHandler(CustomAuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(CustomAuthenticationException ex) {
        ApiResponse<Object> response = new ApiResponse<>(
                false,
                ex.getMessage(),
                Map.of("errorCode", ex.getErrorCode())
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
    @ExceptionHandler(TokenException.class)
    public ResponseEntity<ApiResponse<Object>> handleTokenException(TokenException ex) {
        String userMessage;
        switch (ex.getErrorCode()) {
            case "TOKEN_EXPIRED" -> userMessage = "Votre token a expiré. Veuillez vous reconnecter.";
            case "TOKEN_INVALID" -> userMessage = "Votre token est invalide. Vérifiez ou reconnectez-vous.";
            case "TOKEN_MISSING" -> userMessage = "Aucun token fourni. Vous devez être connecté.";
            default -> userMessage = ex.getMessage();
        }
        ApiResponse<Object> response = new ApiResponse<>(
                false,
                userMessage,
                Map.of("errorCode", ex.getErrorCode())
        );
        return new ResponseEntity<>(response, ex.getStatus());
    }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex) {
        ApiResponse<Object> response = new ApiResponse<>(
                false,
                "Vous êtes connecté, mais vous n'avez pas le rôle requis pour accéder à cette ressource.",
                Map.of("errorCode", "ACCESS_DENIED")
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ApiResponse<Object> response = new ApiResponse<>(
                false,
                "La donnée n'a pas pu être sauvegardée en raison d'une violation de contrainte (doublon ou autre).",
                Map.of("errorCode", ErrorCodes.DUPLICATE_ENTITY)
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        ApiResponse<Object> response = new ApiResponse<>(
                false,
                "Erreur de validation des données",
                errors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception ex) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(
                false,
                "Une erreur interne est survenue. Veuillez réessayer plus tard.",
                null
        );
        return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    private HttpStatus mapErrorCodeToStatus(String errorCode) {
        Map<String, HttpStatus> errorMapping = new HashMap<>();
        errorMapping.put(ErrorCodes.ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND);
        errorMapping.put(ErrorCodes.DUPLICATE_ENTITY, HttpStatus.CONFLICT);
        errorMapping.put(ErrorCodes.INVALID_REQUEST, HttpStatus.BAD_REQUEST);
        errorMapping.put(ErrorCodes.INSUFFICIENT_STOCK, HttpStatus.BAD_REQUEST);
        errorMapping.put(ErrorCodes.PAYMENT_FAILED, HttpStatus.BAD_REQUEST);
        errorMapping.put(ErrorCodes.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        errorMapping.put(ErrorCodes.FORBIDDEN, HttpStatus.FORBIDDEN);
        errorMapping.put(ErrorCodes.VALIDATION_ERROR, HttpStatus.BAD_REQUEST);
        errorMapping.put(ErrorCodes.DATA_INTEGRITY_VIOLATION, HttpStatus.CONFLICT);
        errorMapping.put(ErrorCodes.SERVICE_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
        errorMapping.put(ErrorCodes.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        return errorMapping.getOrDefault(errorCode, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
