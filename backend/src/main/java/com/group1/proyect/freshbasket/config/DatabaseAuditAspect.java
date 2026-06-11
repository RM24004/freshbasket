package com.group1.proyect.freshbasket.config;

import com.group1.proyect.freshbasket.utils.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class DatabaseAuditAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.group1.proyect.freshbasket.service.impl.*.*(..))")
    public void setAuditUserInDatabaseSession() {
        String currentUserId = SecurityUtils.getCurrentUserId();

        if (currentUserId != null) {
            entityManager.createNativeQuery("SELECT set_config('app.current_user_id', ?, false)")
                    .setParameter(1, currentUserId)
                    .getSingleResult();
        }
    }
}