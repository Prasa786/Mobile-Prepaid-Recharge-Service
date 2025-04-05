package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.UserUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserUsageRepository extends JpaRepository<UserUsage, Long> {
    List<UserUsage> findByUser_UserId(Long userId);
    List<UserUsage> findByUsageType(String usageType);
    List<UserUsage> findByUser_UserIdAndUsageType(Long userId, String usageType); 
}
