package sn.boutique.xamxamboutik.Service.imageservice.service;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Service.imageservice.ImageStorageService;
@Service
public class ImageBackgroundService {
    private final ImageStorageService imageStorageService;
    private final ProduitRepository produitRepository;
    public ImageBackgroundService(ImageStorageService imageStorageService,
                                  ProduitRepository produitRepository) {
        this.imageStorageService = imageStorageService;
        this.produitRepository = produitRepository;
    }
    @Async
    public void uploadImageAsync(Long produitId, byte[] fileData, String originalFilename) {
        try {
            Produit produit = produitRepository.findById(produitId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Produit introuvable (ID: " + produitId + ")", ErrorCodes.ENTITY_NOT_FOUND));
            String imageUrl = imageStorageService.uploadImage(fileData);
            produit.setImage(imageUrl);
            produitRepository.save(produit);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ [Async] Erreur upload produit " + produitId + ": " + e.getMessage());
        }
    }
    @Async
    public void replaceImageAsync(Long produitId, String oldPublicId, byte[] fileData, String originalFilename) {
        int maxRetries = 3;
        int attempt = 0;
        boolean updated = false;
        while (!updated && attempt < maxRetries) {
            try {
                attempt++;
                if (oldPublicId != null) {
                    imageStorageService.deleteImage(oldPublicId);
                }
                Produit produit = produitRepository.findById(produitId)
                        .orElseThrow(() -> new EntityNotFoundException("Produit introuvable (ID: " + produitId + ")", ErrorCodes.ENTITY_NOT_FOUND));
                String newImageUrl = imageStorageService.uploadImage(fileData);
                produit.setImage(newImageUrl);
                produitRepository.save(produit);
                updated = true;
            } catch (ObjectOptimisticLockingFailureException e) {
                System.err.println("❌ [Async] Conflit d'optimistic locking lors de la tentative " + attempt + " pour produit " + produitId + " : " + e.getMessage());
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("❌ [Async] Erreur lors du remplacement de l'image pour produit " + produitId + " à la tentative " + attempt + " : " + e.getMessage());
                break;
            }
        }
        if (!updated) {
            System.err.println("❌ [Async] Échec du remplacement d'image pour produit " + produitId + " après " + maxRetries + " tentatives.");
        }
    }
    @Async
    public void deleteImageAsync(String publicId) {
        try {
            imageStorageService.deleteImage(publicId);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ [Async] Erreur suppression image " + publicId + ": " + e.getMessage());
        }
    }
}