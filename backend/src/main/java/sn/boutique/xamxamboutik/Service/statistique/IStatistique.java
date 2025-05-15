package sn.boutique.xamxamboutik.Service.statistique;
import java.time.LocalDateTime;
public interface IStatistique {
    double getCumulativeBenefit();
    double getBenefitBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    LocalDateTime getFirstSaleDate();
    LocalDateTime getLastSaleDate();
}
