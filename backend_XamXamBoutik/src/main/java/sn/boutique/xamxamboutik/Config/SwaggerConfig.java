package sn.boutique.xamxamboutik.Config;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;
@Configuration
@OpenAPIDefinition
public class SwaggerConfig {
    @Bean
    public OpenAPI apiDoc() {
        return new OpenAPI()
                .addServersItem(new Server()
                        .url("http://localhost:8080/api/v1")
                        .description("Serveur local avec context-path /api/v1"))
                .info(new Info()
                        .title("Darou Salam API")
                        .description("API de Gestion de Stock Darou Salam")
                        .version("V.1.0.0")
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .security(List.of(
                        new SecurityRequirement().addList("bearer-jwt")
                ));
    }
}
