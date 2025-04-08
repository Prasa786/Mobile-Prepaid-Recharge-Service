package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.UserPlans;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserPlanRepository extends JpaRepository<UserPlans, Long> {
    List<UserPlans> findByUser_UserId(Long userId);
    List<UserPlans> findByUser_UserIdAndIsActiveTrue(Long userId);
}
