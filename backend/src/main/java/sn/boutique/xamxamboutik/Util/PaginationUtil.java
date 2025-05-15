package sn.boutique.xamxamboutik.Util;
import org.springframework.data.domain.Page;
import java.util.HashMap;
import java.util.Map;
public class PaginationUtil {
    public static Map<String, Object> buildPaginationMap(Page<?> page, Object content) {
        Map<String, Object> data = new HashMap<>();
        data.put("content", content);
        data.put("totalPages", page.getTotalPages());
        data.put("totalElements", page.getTotalElements());
        data.put("pageNumber", page.getNumber() + 1); // Conversion en 1-based si nécessaire
        data.put("pageSize", page.getSize());
        return data;
    }
}
