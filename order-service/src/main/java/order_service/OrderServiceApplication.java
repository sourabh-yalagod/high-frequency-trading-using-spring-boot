package order_service;

import lombok.RequiredArgsConstructor;
import order_service.service.CryptoCacheService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
@RequiredArgsConstructor
public class OrderServiceApplication implements CommandLineRunner {
    private final CryptoCacheService cryptoCacheService;
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Application  Running on PORT : 8080");
        cryptoCacheService.process();
    }
}
