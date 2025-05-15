package sn.boutique.xamxamboutik.Web.Controller.parametrage;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.parametrage.Parametrage;
import sn.boutique.xamxamboutik.Repository.Projection.ParametrageProjection;
import sn.boutique.xamxamboutik.Service.parametrage.ParametrageService;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ParametrageMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ParametrageRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;

@Tag(name = "Parametrage", description = "API de gestion des paramètres de la boutique")
@RestController
@RequestMapping(value = "/settings", produces = "application/json")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ParametrageController {

    private final ParametrageService parametrageService;
    private final ParametrageMapper parametrageMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getSettings() {
        ParametrageProjection settings = parametrageService.getSettings();
        return ResponseEntity.ok(ApiResponse.success("Paramètres récupérés", parametrageMapper.toResponseWebDTOFromProjection(settings)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> saveSettings(
            @Valid @RequestPart("settings") ParametrageRequestDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {
        Parametrage saved = parametrageService.save(dto, file);
        return ResponseEntity.ok(ApiResponse.success("Paramètres créés", parametrageMapper.toResponseWebDTO(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateSettings(
            @PathVariable Long id,
            @Valid @RequestPart("settings") ParametrageRequestDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {
        Parametrage updated = parametrageService.update(id, dto, file);
        return ResponseEntity.ok(ApiResponse.success("Paramètres mis à jour", parametrageMapper.toResponseWebDTO(updated)));
    }
}