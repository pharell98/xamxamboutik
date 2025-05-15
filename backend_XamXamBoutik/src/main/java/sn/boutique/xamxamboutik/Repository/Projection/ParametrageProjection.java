package sn.boutique.xamxamboutik.Repository.Projection;

public interface ParametrageProjection {
    Long getId();
    String getShopName();
    String getLogo();
    String getEmail();
    String getPhone();
    String getCountry();
    String getRegion();
    String getDepartment();
    String getNeighborhood();
    String getStreet();
    String getFacebookUrl();
    String getInstagramUrl();
    String getTwitterUrl();
    String getWebsiteUrl();
    boolean isDeleted();
}