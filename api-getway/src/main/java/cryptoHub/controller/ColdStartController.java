package cryptoHub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/public/cold-start")
public class ColdStartController {
    @GetMapping("")
    public ResponseEntity<String> coldStartServer() {
        for (int i = 1; i <= 100; i++) {
            if (i == 100) {
                System.out.println("Server Cold Start Successful.");
            }
        }
        return ResponseEntity.ok("Server Cold Start Successful.");
    }

    @Scheduled(fixedDelay = 45000)
    public void invokeApiGetway() {
        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject("https://order-websocket.onrender.com/api/public/cold-start", String.class);
        System.out.println("WebSocket Response : " + response);
    }
}
