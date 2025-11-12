package websocket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/public/cold-start")
public class CostStartController {

    @GetMapping("")
    public ResponseEntity<String> coldStartMachine() {
        for (int i = 1; i <= 100; i++) {
            if (i == 100) {
                System.out.println("Machine Warmup...!");
            }
        }
        return ResponseEntity.ok("Machine Started....!");
    }

    @Scheduled(fixedDelay = 45000)
    public void invokeApiGetway() {
        RestTemplate restTemplate = new RestTemplate();
        String  response = restTemplate.getForObject("https://cryptohub-api-getway.onrender.com/api/public/cold-start", String.class);
        System.out.println(response);
    }
}
