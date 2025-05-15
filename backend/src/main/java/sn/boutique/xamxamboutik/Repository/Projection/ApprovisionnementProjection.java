package sn.boutique.xamxamboutik.Repository.Projection;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
public interface ApprovisionnementProjection {
    Long getId();
    String getCodeAppro();
    Double getMontantAppro();
    Double getFraisTransport();
    LocalDateTime getDate();
    default String getDateAppro() {
        return getDate() != null
                ? getDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                : null;
    }
}
