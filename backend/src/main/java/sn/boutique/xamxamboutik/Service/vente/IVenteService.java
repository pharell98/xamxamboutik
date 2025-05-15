package sn.boutique.xamxamboutik.Service.vente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Web.DTO.Request.VenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.VenteJourResponseDTO;

import java.time.LocalDate;

public interface IVenteService {
    Vente createVente(VenteRequestDTO dto);
    Page<?> getAllProductsBySalesPage(String clientType, Pageable pageable);
    Page<VenteJourResponseDTO> getTodaySales(Pageable pageable, Double minAmount, Double maxAmount);
    Page<VenteJourResponseDTO> getLast7DaysSales(Pageable pageable, Double minAmount, Double maxAmount);
    Page<VenteJourResponseDTO> getMonthSales(Pageable pageable, Double minAmount, Double maxAmount);
    Page<VenteJourResponseDTO> getYearSales(Pageable pageable, Double minAmount, Double maxAmount);
    Page<VenteJourResponseDTO> getSalesByExactDate(LocalDate date, Pageable pageable, Double minAmount, Double maxAmount);
    Page<VenteJourResponseDTO> getAllSales(Pageable pageable, Double minAmount, Double maxAmount);
}