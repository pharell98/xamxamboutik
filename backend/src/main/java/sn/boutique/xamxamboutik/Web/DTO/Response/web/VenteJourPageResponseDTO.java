package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;
import java.util.List;

@Data
public class VenteJourPageResponseDTO {
    private List<VenteJourResponseDTO> content;
    private Double totalAmount;
}