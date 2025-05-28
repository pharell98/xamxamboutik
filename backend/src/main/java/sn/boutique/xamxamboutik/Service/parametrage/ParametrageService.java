package sn.boutique.xamxamboutik.Service.parametrage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.parametrage.Parametrage;
import sn.boutique.xamxamboutik.Exception.BaseCustomException;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.ParametrageProjection;
import sn.boutique.xamxamboutik.Repository.parametrage.ParametrageRepository;
import sn.boutique.xamxamboutik.Service.base.AbstractBaseService;
import sn.boutique.xamxamboutik.Service.imageservice.ImageStorageService;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ParametrageMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ParametrageRequestDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParametrageService extends AbstractBaseService<Parametrage> {

    private final ParametrageRepository parametrageRepository;
    private final ImageStorageService imageStorageService;
    private final ParametrageMapper parametrageMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    protected ParametrageRepository getRepository() {
        return parametrageRepository;
    }

    @Transactional(readOnly = true)
    public ParametrageProjection getSettings() {
        log.info("Récupération des paramètres actifs");
        return parametrageRepository.findActiveParametrageProjection()
                .orElseThrow(() -> {
                    log.error("Aucun paramétrage actif trouvé");
                    return new EntityNotFoundException("Aucun paramétrage trouvé.", ErrorCodes.ENTITY_NOT_FOUND);
                });
    }

    @Transactional
    public Parametrage save(ParametrageRequestDTO dto, MultipartFile file) throws Exception {
        log.info("Tentative de création d'un nouveau paramétrage: {}", dto);
        if (parametrageRepository.existsByDeletedFalse()) {
            log.error("Un paramétrage existe déjà");
            throw new BaseCustomException("Un paramétrage existe déjà. Veuillez le modifier.", "SINGLETON_ENTITY");
        }
        Parametrage parametrage = parametrageMapper.toEntity(dto);
        log.debug("Paramétrage mappé: {}", parametrage);
        Parametrage saved = parametrageRepository.save(parametrage);
        log.info("Paramétrage enregistré avec ID: {}", saved.getId());
        handleImageUpload(saved, file, dto.getImageURL());
        // Publish STOMP message
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/settings", parametrageMapper.toResponseWebDTO(saved));
            log.info("Message STOMP envoyé à /topic/settings pour paramétrage ID: {}", saved.getId());
        } else {
            log.warn("SimpMessagingTemplate non disponible, message STOMP non envoyé pour paramétrage ID: {}", saved.getId());
        }
        return saved;
    }

    @Transactional
    public Parametrage update(Long id, ParametrageRequestDTO dto, MultipartFile file) throws Exception {
        log.info("Tentative de mise à jour du paramétrage ID: {}", id);
        Parametrage existing = parametrageRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Paramétrage avec ID {} non trouvé", id);
                    return new EntityNotFoundException("Paramétrage avec l'ID " + id + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND);
                });
        updateParametrageFields(existing, dto);
        log.debug("Champs du paramétrage mis à jour: {}", existing);
        handleImageUpdate(existing, file, dto.getImageURL());
        Parametrage updated = parametrageRepository.save(existing);
        log.info("Paramétrage mis à jour avec succès: {}", updated.getId());
        // Publish STOMP message
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/settings", parametrageMapper.toResponseWebDTO(updated));
            log.info("Message STOMP envoyé à /topic/settings pour paramétrage ID: {}", updated.getId());
        } else {
            log.warn("SimpMessagingTemplate non disponible, message STOMP non envoyé pour paramétrage ID: {}", updated.getId());
        }
        return updated;
    }

    private void updateParametrageFields(Parametrage parametrage, ParametrageRequestDTO dto) {
        parametrage.setShopName(dto.getShopName());
        parametrage.setEmail(dto.getEmail());
        parametrage.setPhone(dto.getPhone());
        parametrage.setCountry(dto.getCountry());
        parametrage.setRegion(dto.getRegion());
        parametrage.setDepartment(dto.getDepartment());
        parametrage.setNeighborhood(dto.getNeighborhood());
        parametrage.setStreet(dto.getStreet());
        parametrage.setFacebookUrl(dto.getFacebookUrl());
        parametrage.setInstagramUrl(dto.getInstagramUrl());
        parametrage.setTwitterUrl(dto.getTwitterUrl());
        parametrage.setWebsiteUrl(dto.getWebsiteUrl());
    }

    private void handleImageUpload(Parametrage parametrage, MultipartFile file, String url) throws Exception {
        log.info("Traitement de l'image pour le paramétrage ID: {}", parametrage.getId());
        if (url != null) {
            log.debug("Utilisation de l'URL fournie pour le logo: {}", url);
            parametrage.setLogo(url);
            parametrageRepository.save(parametrage);
            return;
        }
        if (file != null && !file.isEmpty()) {
            try {
                log.info("Envoi de l'image pour le paramétrage: {}", file.getOriginalFilename());
                String imageUrl = imageStorageService.uploadImage(file);
                parametrage.setLogo(imageUrl);
                parametrageRepository.save(parametrage);
                log.debug("Logo défini avec URL: {}", imageUrl);
            } catch (Exception e) {
                log.error("Erreur lors du traitement de l'image: {}", e.getMessage());
                throw new RuntimeException("Erreur lors du traitement de l'image.", e);
            }
        } else {
            log.debug("Aucun fichier fourni pour le logo");
            parametrage.setLogo(null);
            parametrageRepository.save(parametrage);
        }
    }

    private void handleImageUpdate(Parametrage parametrage, MultipartFile file, String url) throws Exception {
        log.info("Mise à jour de l'image pour le paramétrage ID: {}", parametrage.getId());
        if (url != null) {
            String oldId = extractPublicId(parametrage.getLogo());
            if (oldId != null) {
                log.debug("Suppression de l'ancienne image: {}", oldId);
                imageStorageService.deleteImage(oldId);
            }
            parametrage.setLogo(url);
            parametrageRepository.save(parametrage);
            log.debug("Nouvelle URL de logo définie: {}", url);
            return;
        }
        if (file != null && !file.isEmpty()) {
            try {
                log.info("Envoi de l'image pour le paramétrage: {}", file.getOriginalFilename());
                String oldId = extractPublicId(parametrage.getLogo());
                if (oldId != null) {
                    log.debug("Suppression de l'ancienne image: {}", oldId);
                    imageStorageService.deleteImage(oldId);
                }
                String imageUrl = imageStorageService.uploadImage(file);
                parametrage.setLogo(imageUrl);
                parametrageRepository.save(parametrage);
                log.debug("Logo mis à jour avec URL: {}", imageUrl);
            } catch (Exception e) {
                log.error("Erreur lors de la mise à jour de l'image: {}", e.getMessage());
                throw new RuntimeException("Erreur lors de la mise à jour de l'image.", e);
            }
        } else {
            log.debug("Aucun fichier fourni pour la mise à jour du logo");
            parametrage.setLogo(null);
            parametrageRepository.save(parametrage);
        }
    }

    private String extractPublicId(String url) {
        if (url == null || !url.contains("/")) {
            log.debug("URL de logo invalide ou absente: {}", url);
            return null;
        }
        String[] part = url.split("/");
        String result = part[part.length - 1].split("\\.")[0];
        log.debug("Public ID extrait: {}", result);
        return result;
    }
}