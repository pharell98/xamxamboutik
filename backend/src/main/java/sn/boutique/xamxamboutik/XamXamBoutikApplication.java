package sn.boutique.xamxamboutik;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class XamXamBoutikApplication {
    public static void main(String[] args) {
        SpringApplication.run(XamXamBoutikApplication.class, args);
    }
}
