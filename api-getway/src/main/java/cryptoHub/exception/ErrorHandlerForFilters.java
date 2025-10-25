package cryptoHub.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class ErrorHandlerForFilters {
    public void writeErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        if (response.isCommitted()) {
            return;
        }

        response.resetBuffer(); // clear any previous content
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        ErrorResponse errorResponse = new ErrorResponse(status.value(), status.getReasonPhrase(), message, LocalDateTime.now());
        new ObjectMapper().writeValue(response.getWriter(), errorResponse);

        response.flushBuffer(); // ensure it's written and stop further output
    }
}

