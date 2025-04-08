package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.model.Statuses;  // Import Status enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
	 Optional<Users> findByUsername(String username); 
    List<Users> findByStatus(String status); 
    List<Users> findByRole_RoleId(Long roleId);
    List<Users> findByUsernameContainingIgnoreCase(String username);
    Optional<Users> findByMobile(String mobile);
    Optional<Users> findByEmail(String email);

    boolean existsByMobile(String mobile);
}
