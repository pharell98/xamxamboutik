package sn.boutique.xamxamboutik.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("Configuration de l'endpoint STOMP /ws (WebSocket natif)");
        registry
                .addEndpoint("/ws")
                .setAllowedOrigins(
                        "http://localhost:3000"
                )
                .withSockJS(); // Ajouter le support SockJS pour plus de compatibilité
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(64 * 1024) // 64KB
                .setSendBufferSizeLimit(512 * 1024) // 512KB
                .setSendTimeLimit(20000); // 20 secondes
    }
}