package com.Voltmobi.project.repository;




import com.Voltmobi.project.model.Role;
import com.Voltmobi.project.model.RoleType;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
	
	    Optional<Role> findByRoleType(RoleType roleType); // Use roleType instead of roleName
	

}
