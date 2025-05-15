package sn.boutique.xamxamboutik.Service.imageservice;
import org.springframework.web.multipart.MultipartFile;
public interface ImageStorageService {
    String uploadImage(MultipartFile file) throws Exception;
    String modifyImage(String publicId, MultipartFile file) throws Exception;
    void deleteImage(String publicId) throws Exception;
    String uploadImage(byte[] data) throws Exception;
    String modifyImage(String publicId, byte[] data) throws Exception;
}
