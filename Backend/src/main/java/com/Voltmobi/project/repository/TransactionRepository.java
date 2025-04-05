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

@Repository
public interface TransactionRepository extends JpaRepository<Transactions, Long> {
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

    @Query("SELECT COUNT(t), SUM(t.payment.amount) " +
           "FROM Transactions t " +
           "WHERE (:fromDate IS NULL OR t.transactionDate >= :fromDate) " +
           "AND (:toDate IS NULL OR t.transactionDate <= :toDate)")
    Object[] getTransactionStatistics(
           @Param("fromDate") LocalDate fromDate,
           @Param("toDate") LocalDate toDate);

    @Query("SELECT t FROM Transactions t " +
           "WHERE t.user.mobile = :mobileNumber")
    List<Transactions> findTransactionsByMobileNumber(
           @Param("mobileNumber") String mobileNumber);

    @Query("SELECT t FROM Transactions t " +
           "WHERE t.transactionDate >= :startDate")
    List<Transactions> findRecentTransactions(
           @Param("startDate") LocalDate startDate);
}