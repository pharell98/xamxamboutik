package sn.boutique.xamxamboutik.Entity.interfaces;
import java.time.LocalDateTime;
public interface Auditable {
    LocalDateTime getCreatedAt();
    void setCreatedAt(LocalDateTime createdAt);
    LocalDateTime getUpdatedAt();
    void setUpdatedAt(LocalDateTime updatedAt);
    String getCreatedBy();
    void setCreatedBy(String createdBy);
    String getUpdatedBy();
    void setUpdatedBy(String updatedBy);
}
