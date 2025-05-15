package sn.boutique.xamxamboutik.Repository.Projection;

import sn.boutique.xamxamboutik.Enums.Role;

public interface UserProjection {
    Long getId();
    String getNom();
    String getLogin();
    Role getRole();
}