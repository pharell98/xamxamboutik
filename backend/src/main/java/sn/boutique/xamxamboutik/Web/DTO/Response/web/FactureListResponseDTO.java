package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;

import java.util.List;

@Data
public class FactureListResponseDTO {
    private List<FactureSummaryDTO> factures;
    private Long totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;
}
