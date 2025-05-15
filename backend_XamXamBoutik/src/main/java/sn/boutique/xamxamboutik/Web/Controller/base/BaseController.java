package sn.boutique.xamxamboutik.Web.Controller.base;
import org.springframework.http.ResponseEntity;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
public interface BaseController<DRequest> {
    ResponseEntity<ApiResponse<?>> findAll(Integer page, Integer size, String clientType);
    ResponseEntity<ApiResponse<?>> findById(Long id, String clientType);
    ResponseEntity<ApiResponse<?>> save(DRequest request);
    ResponseEntity<ApiResponse<Void>> delete(Long id);
    ResponseEntity<ApiResponse<?>> update(Long id, DRequest request);
}
