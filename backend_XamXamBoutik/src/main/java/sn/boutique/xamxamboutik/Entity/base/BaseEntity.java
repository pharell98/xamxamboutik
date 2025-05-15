package sn.boutique.xamxamboutik.Entity.base;
import sn.boutique.xamxamboutik.Entity.interfaces.Auditable;
import sn.boutique.xamxamboutik.Entity.interfaces.Identifiable;
import sn.boutique.xamxamboutik.Entity.interfaces.SoftDeletable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity implements Identifiable<Long>, Auditable, SoftDeletable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    @LastModifiedBy
    private String updatedBy;
    @Column(nullable = false)
    private boolean deleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;
    @Version
    private Long version;
}
