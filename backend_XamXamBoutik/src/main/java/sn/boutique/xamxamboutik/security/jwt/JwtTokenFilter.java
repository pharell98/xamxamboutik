package sn.boutique.xamxamboutik.security.jwt;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import sn.boutique.xamxamboutik.Exception.TokenException;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper; // Pour écrire du JSON en cas de besoin
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String bearerToken = request.getHeader(SecurityConstants.HEADER_STRING);
            if (bearerToken != null && bearerToken.startsWith(SecurityConstants.TOKEN_PREFIX)) {
                String token = bearerToken.substring(SecurityConstants.TOKEN_PREFIX.length());
                if (tokenProvider.validateToken(token)) {
                    Authentication auth = tokenProvider.getAuthentication(token);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
            filterChain.doFilter(request, response);
        } catch (TokenException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("errorCode", "TOKEN_ERROR");
            errorResponse.put("timestamp", System.currentTimeMillis());
            objectMapper.writeValue(response.getOutputStream(), errorResponse);
        }
    }
}
