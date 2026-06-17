package com.group1.proyect.freshbasket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class FreshbasketApplication {

    public static void main(String[] args)
    {SpringApplication.run(FreshbasketApplication.class, args);}

}