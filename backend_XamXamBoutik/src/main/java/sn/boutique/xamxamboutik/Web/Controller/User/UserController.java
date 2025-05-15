package sn.boutique.xamxamboutik.Web.Controller.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Enums.Role;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.UserProjection;
import sn.boutique.xamxamboutik.Service.base.BaseService;
import sn.boutique.xamxamboutik.Service.user.IUserService;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import sn.boutique.xamxamboutik.Web.Controller.base.AbstractBaseController;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.UserMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.PasswordUpdateRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.UserRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.UserResponseDTO;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Utilisateur", description = "API de gestion des utilisateurs")
@RestController
@RequestMapping(value = "/users", produces = "application/json")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UserController extends AbstractBaseController<Utilisateur, UserRequestDTO, UserResponseDTO, UserResponseDTO> {
    private final IUserService userService;
    private final UserMapper userMapper;

    @Override
    protected BaseService<Utilisateur, Long> getService() {
        return userService;
    }

    @Override
    protected Utilisateur toEntity(UserRequestDTO dto) {
        return userMapper.toEntity(dto);
    }

    @Override
    protected UserResponseDTO toWebResponse(Utilisateur entity) {
        return userMapper.toResponseDTO(entity);
    }

    @Override
    protected UserResponseDTO toMobileResponse(Utilisateur entity) {
        return userMapper.toResponseDTO(entity);
    }

    @Override
    protected List<UserResponseDTO> toWebResponseList(List<Utilisateur> entities) {
        return userMapper.toResponseDTOs(entities);
    }

    @Override
    protected List<UserResponseDTO> toMobileResponseList(List<Utilisateur> entities) {
        return userMapper.toResponseDTOs(entities);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> findAllActive(@RequestParam(defaultValue = "0") Integer page,
                                                        @RequestParam(defaultValue = "10") Integer size,
                                                        @RequestParam(defaultValue = "web") String clientType) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Utilisateur> pagedEntities = userService.findAllActive(pageable);
        if ("mobile".equalsIgnoreCase(clientType)) {
            List<UserResponseDTO> dtos = toMobileResponseList(pagedEntities.getContent());
            Map<String, Object> data = PaginationUtil.buildPaginationMap(pagedEntities, dtos);
            return ResponseEntity.ok(ApiResponse.success("Utilisateurs actifs (mobile)", data));
        }
        List<UserResponseDTO> dtos = toWebResponseList(pagedEntities.getContent());
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pagedEntities, dtos);
        return ResponseEntity.ok(ApiResponse.success("Utilisateurs actifs (web)", data));
    }

    @GetMapping("/deleted")
    public ResponseEntity<ApiResponse<?>> findAllDeleted(Pageable pageable) {
        Page<UserProjection> pagedProjections = userService.findAllProjected(pageable);
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pagedProjections,
                userMapper.toResponseDTOsFromProjection(pagedProjections.getContent()));
        return ResponseEntity.ok(ApiResponse.success("Utilisateurs supprimés", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> findById(@PathVariable Long id,
                                                   @RequestParam(defaultValue = "web") String clientType) {
        Utilisateur entity = userService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur " + id, ErrorCodes.ENTITY_NOT_FOUND));
        if ("mobile".equalsIgnoreCase(clientType)) {
            UserResponseDTO dto = toMobileResponse(entity);
            return ResponseEntity.ok(ApiResponse.success("Détails récupérés (mobile)", dto));
        }
        UserResponseDTO dto = toWebResponse(entity);
        return ResponseEntity.ok(ApiResponse.success("Détails récupérés (web)", dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> save(@Valid @RequestBody UserRequestDTO request) {
        Utilisateur saved = userService.save(request);
        UserResponseDTO dto = userMapper.toResponseDTO(saved);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur créé", dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody UserRequestDTO request) {
        request.setId(id);
        Utilisateur updated = userService.update(request);
        UserResponseDTO dto = userMapper.toResponseDTO(updated);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur mis à jour", dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur supprimé", null));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<?>> updatePassword(@PathVariable Long id,
                                                         @Valid @RequestBody PasswordUpdateRequestDTO request) {
        Utilisateur updated = userService.updatePassword(id, request.getNewPassword());
        UserResponseDTO dto = userMapper.toResponseDTO(updated);
        return ResponseEntity.ok(ApiResponse.success("Mot de passe mis à jour", dto));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<?>> restore(@PathVariable Long id) {
        Utilisateur restored = userService.restore(id);
        UserResponseDTO dto = userMapper.toResponseDTO(restored);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur restauré", dto));
    }

    @GetMapping("/roles")
    @Operation(summary = "Obtenir la liste des rôles")
    public ResponseEntity<ApiResponse<List<String>>> getRoles() {
        List<String> roles = Arrays.stream(Role.values())
                .map(Role::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Liste des rôles", roles));
    }
}