package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.Role;
import com.Voltmobi.project.model.RoleType;
import com.Voltmobi.project.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*") // Allows all origins (modify as needed)
public class RoleController {

    @Autowired
    private RoleService roleService;

    // ADMIN CAN GET ALL ROLES
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    // ADMIN CAN GET ROLE BY NAME
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{roleName}")
    public ResponseEntity<Role> getRoleByName(@PathVariable RoleType roleName) {
        return ResponseEntity.ok(roleService.getRoleByName(roleName));
    }

    // ADMIN CAN CREATE A NEW ROLE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        return new ResponseEntity<>(roleService.saveRole(role), HttpStatus.CREATED);
    }

    // ADMIN CAN DELETE A ROLE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully");
    }
}
