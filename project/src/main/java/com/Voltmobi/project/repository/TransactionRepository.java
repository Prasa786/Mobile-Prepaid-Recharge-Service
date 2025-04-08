package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.Transactions;
import com.Voltmobi.project.model.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface TransactionRepository extends JpaRepository<Transactions, Long> {
    
    // Basic CRUD and filter operations
    List<Transactions> findByUser_UserId(long userId);
    List<Transactions> findByPlan_PlanId(long planId);
    List<Transactions> findByPayment_PaymentId(long paymentId);
    List<Transactions> findByStatus(TransactionStatus status);
    
    @Query("SELECT t FROM Transactions t " +
           "WHERE t.expiryDate BETWEEN :now AND :threeDaysFromNow " +
           "AND t.status = com.Voltmobi.project.model.TransactionStatus.SUCCESS")
    List<Transactions> findSoonToExpireTransactions(
           @Param("now") LocalDateTime now,
           @Param("threeDaysFromNow") LocalDateTime threeDaysFromNow);

    @Query("SELECT t FROM Transactions t " +
           "WHERE (:status IS NULL OR t.status = :status) " +
           "AND (:fromDate IS NULL OR t.transactionDate >= :fromDate) " +
           "AND (:toDate IS NULL OR t.transactionDate <= :toDate) " +
           "AND (:planId IS NULL OR t.plan.planId = :planId)")
    List<Transactions> findTransactionsWithFilters(
           @Param("status") String status,
           @Param("fromDate") LocalDate fromDate,
           @Param("toDate") LocalDate toDate,
           @Param("planId") Long planId);

    @Query("SELECT t FROM Transactions t " +
           "WHERE t.user.mobile = :mobileNumber")
    List<Transactions> findTransactionsByMobileNumber(
           @Param("mobileNumber") String mobileNumber);

    @Query("SELECT t FROM Transactions t " +
           "WHERE t.transactionDate >= :startDate")
    List<Transactions> findRecentTransactions(
           @Param("startDate") LocalDate startDate);
    
    // Enhanced analytics methods
    @Query("SELECT new map(" +
           "COUNT(t) as totalTransactions, " +
           "COALESCE(SUM(t.amount), 0) as totalRevenue, " +
           "SUM(CASE WHEN t.status = 'SUCCESS' THEN 1 ELSE 0 END) as successCount, " +
           "SUM(CASE WHEN t.status = 'FAILED' THEN 1 ELSE 0 END) as failedCount, " +
           "SUM(CASE WHEN t.status = 'PENDING' THEN 1 ELSE 0 END) as pendingCount) " +
           "FROM Transactions t WHERE " +
           "(cast(:fromDate as date) IS NULL OR t.transactionDate >= :fromDate) AND " +
           "(cast(:toDate as date) IS NULL OR t.transactionDate <= :toDate)")
    Map<String, Object> getTransactionStats(
           @Param("fromDate") LocalDate fromDate, 
           @Param("toDate") LocalDate toDate);

    @Query("SELECT new map(" +
           "FUNCTION('DATE', t.transactionDate) as date, " +
           "SUM(t.amount) as revenue) " +
           "FROM Transactions t WHERE t.status = 'SUCCESS' AND " +
           "(cast(:fromDate as date) IS NULL OR t.transactionDate >= :fromDate) AND " +
           "(cast(:toDate as date) IS NULL OR t.transactionDate <= :toDate) " +
           "GROUP BY FUNCTION('DATE', t.transactionDate) " +
           "ORDER BY FUNCTION('DATE', t.transactionDate)")
    List<Map<String, Object>> getDailyRevenueTrend(
           @Param("fromDate") LocalDate fromDate, 
           @Param("toDate") LocalDate toDate);


    // Count methods for different statuses
    long countByStatus(TransactionStatus status);
    
    long countByStatusAndTransactionDateBetween(
           TransactionStatus status, 
           LocalDateTime startDate, 
           LocalDateTime endDate);
    @Query("SELECT new map(" +
    	       "p.name as planName, " +
    	       "COUNT(t) as purchaseCount, " +
    	       "SUM(t.payment.amount) as totalRevenue) " + // Join with payment to get amount
    	       "FROM Transactions t JOIN t.plan p JOIN t.payment pm " + // Added JOIN with payment
    	       "WHERE t.status = 'SUCCESS' AND " +
    	       "(cast(:fromDate as date) IS NULL OR t.transactionDate >= :fromDate) AND " +
    	       "(cast(:toDate as date) IS NULL OR t.transactionDate <= :toDate) " +
    	       "GROUP BY p.name " +
    	       "ORDER BY COUNT(t) DESC")
    	List<Map<String, Object>> getPopularPlans(
    	       @Param("fromDate") LocalDate fromDate,
    	       @Param("toDate") LocalDate toDate,
    	       @Param("limit") int limit);
}