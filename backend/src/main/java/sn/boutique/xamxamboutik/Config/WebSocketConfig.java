package sn.boutique.xamxamboutik.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("Configuration de l'endpoint STOMP /ws (WebSocket natif)");
        registry
                .addEndpoint("/ws")
                .setAllowedOrigins(
                        "http://localhost:3000",
                        "https://xamxamboutik.shop",
                        "https://darou-salam.xamxamboutik.shop",
                        "https://hadia.xamxamboutik.shop"
                );
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}