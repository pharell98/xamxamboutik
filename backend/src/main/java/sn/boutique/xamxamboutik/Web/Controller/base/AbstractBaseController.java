package sn.boutique.xamxamboutik.Web.Controller.base;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import sn.boutique.xamxamboutik.Entity.interfaces.Identifiable;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Service.base.BaseService;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import java.util.List;
import java.util.Map;
public abstract class AbstractBaseController<E extends Identifiable<Long>, DRequest, DWebResponse, DMobileResponse>
        implements BaseController<DRequest> {
    protected abstract BaseService<E, Long> getService();
    protected abstract E toEntity(DRequest dto);
    protected abstract DWebResponse toWebResponse(E entity);
    protected abstract DMobileResponse toMobileResponse(E entity);
    protected abstract List<DWebResponse> toWebResponseList(List<E> entities);
    protected abstract List<DMobileResponse> toMobileResponseList(List<E> entities);
    @Override
    public ResponseEntity<ApiResponse<?>> findAll(Integer page, Integer size, String clientType) {
        Page<E> pagedEntities = getService().findAll(PageRequest.of(page, size));
        Map<String, Object> data;
        if ("mobile".equalsIgnoreCase(clientType)) {
            List<DMobileResponse> dtos = toMobileResponseList(pagedEntities.getContent());
            data = PaginationUtil.buildPaginationMap(pagedEntities, dtos);
            return ResponseEntity.ok(ApiResponse.success("Liste paginée récupérée avec succès (mobile)", data));
        } else {
            List<DWebResponse> dtos = toWebResponseList(pagedEntities.getContent());
            data = PaginationUtil.buildPaginationMap(pagedEntities, dtos);
            return ResponseEntity.ok(ApiResponse.success("Liste paginée récupérée avec succès (web)", data));
        }
    }
    @Override
    public ResponseEntity<ApiResponse<?>> findById(Long id, String clientType) {
        E entity = getService().findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entité non trouvée (ID: " + id + ")", ErrorCodes.ENTITY_NOT_FOUND));
        if ("mobile".equalsIgnoreCase(clientType)) {
            DMobileResponse dto = toMobileResponse(entity);
            return ResponseEntity.ok(ApiResponse.success("Détails récupérés avec succès (mobile)", dto));
        } else {
            DWebResponse dto = toWebResponse(entity);
            return ResponseEntity.ok(ApiResponse.success("Détails récupérés avec succès (web)", dto));
        }
    }
    @Override
    public ResponseEntity<ApiResponse<?>> save(DRequest request) {
        E entity = toEntity(request);
        E savedEntity = getService().save(entity);
        DWebResponse dto = toWebResponse(savedEntity);
        return ResponseEntity.ok(ApiResponse.success("Enregistré avec succès", dto));
    }
    @Override
    public ResponseEntity<ApiResponse<Void>> delete(Long id) {
        getService().deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Supprimé avec succès", null));
    }
    @Override
    public ResponseEntity<ApiResponse<?>> update(Long id, DRequest request) {
        E entity = toEntity(request);
        entity.setId(id);  // S'assurer que l'entité à mettre à jour a l'ID fourni
        E updatedEntity = getService().update(entity);
        DWebResponse dto = toWebResponse(updatedEntity);
        return ResponseEntity.ok(ApiResponse.success("Mise à jour réussie", dto));
    }
}
