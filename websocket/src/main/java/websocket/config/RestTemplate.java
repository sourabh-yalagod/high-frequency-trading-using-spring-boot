package websocket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestTemplate {
    @Bean
    public RestTemplate restClient(){
        return new RestTemplate();
    }
}
