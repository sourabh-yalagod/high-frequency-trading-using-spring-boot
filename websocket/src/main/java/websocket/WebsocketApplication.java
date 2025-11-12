package websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebsocketApplication implements CommandLineRunner {
    @Value(("${server.port}"))
    private String port;

    public static void main(String[] args) {
        SpringApplication.run(WebsocketApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Application Running on PORT : " + port);
    }
}
