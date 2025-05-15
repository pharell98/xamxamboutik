package sn.boutique.xamxamboutik.Service.imageservice.service;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Service.imageservice.ImageStorageService;
import java.io.IOException;
import java.util.Map;
@Service
public class CloudinaryImageStorageService implements ImageStorageService {
    private final Cloudinary cloudinary;
    @Autowired
    public CloudinaryImageStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    @Override
    public String uploadImage(MultipartFile file) throws Exception {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader()
                    .upload(file.getBytes(), ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new Exception("Erreur lors de l'upload de l'image sur Cloudinary", e);
        }
    }
    @Override
    public String uploadImage(byte[] data) throws Exception {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader()
                    .upload(data, ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new Exception("Erreur lors de l'upload de l'image sur Cloudinary", e);
        }
    }
    @Override
    public String modifyImage(String publicId, MultipartFile file) throws Exception {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("public_id", publicId, "overwrite", true)
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new Exception("Erreur lors de la modification de l'image sur Cloudinary", e);
        }
    }
    @Override
    public String modifyImage(String publicId, byte[] data) throws Exception {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    data,
                    ObjectUtils.asMap("public_id", publicId, "overwrite", true)
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new Exception("Erreur lors de la modification de l'image sur Cloudinary", e);
        }
    }
    @Override
    public void deleteImage(String publicId) throws Exception {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new Exception("Erreur lors de la suppression de l'image sur Cloudinary", e);
        }
    }
}