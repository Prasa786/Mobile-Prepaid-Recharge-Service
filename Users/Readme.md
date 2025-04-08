# **VoltMobi - Mobile Prepaid Recharge System**  

## **Overview**  
**VoltMobi** is a **web-based mobile prepaid recharge platform** designed for seamless and secure mobile recharges. It provides an **intuitive interface** for users to browse plans, recharge instantly, and manage transactions efficiently. The system integrates **OTP-based authentication** and **secure payment processing** for a smooth user experience.  

### **Problem Statement**  
Many users depend on third-party apps for mobile recharges, leading to **lack of control over promotions, customer engagement, and transaction insights**. VoltMobi solves this by offering a **dedicated, secure, and scalable** recharge solution with **real-time analytics** for business growth.  

### **Key Objectives**  
✔ **Simplify mobile recharges** for end-users  
✔ **Centralized platform** for prepaid transactions  
✔ **Secure payment processing** with instant confirmations  
✔ **Admin-controlled plan management** & customer insights  

---

## **Features**  

### **🔹 Admin Panel**  
- **Role-based access control** (Admin, Support, Analytics)  
- **Dashboard** with real-time sales & user analytics  
- **Plan Management** (Add/Edit/Delete recharge plans)  
- **User Management** (Block/Unblock, View transactions)  
- **Reports & Export** (Transactions, Recharge history)  

### **🔹 User Features**  
- **Secure Login:**  
  - OTP-based authentication (Twilio SMS)   
- **Recharge Plans:**  
  - Browse & filter plans (Data, Talktime, Combo)  
  - Dynamic pricing & real-time updates  
- **Payment & Transactions:**  
  - RazorPay integration for secure payments  
  - Instant recharge confirmation & SMS alerts  
  - Downloadable invoices  
- **User Profile:**  
  - Update personal details  
  - View recharge history  
- **Support:**  
  - Raise tickets & track status  

---

## **Tech Stack**  

### **Frontend**  
- **HTML5, CSS3, JavaScript**  
- **Bootstrap 5** (Responsive UI)  

### **Backend**  
- **Spring Boot** (Java)  
- **Spring Security** (JWT Authentication)  
- **Maven** (Dependency Management)  

### **Database**  
- **MySQL** (Relational DB)  
- **Hibernate** (ORM)  

### **APIs & Services**  
- **RESTful APIs**  
- **Twilio** (OTP SMS)  
- **RazorPay** (Payments)  
- **SMTP** (Email Notifications)  

---

## **Database Structure (Key Entities)**  
| Entity               | Description                                  |
|----------------------|--------------------------------------------|
| `Users`              | User profiles & auth details               |
| `Recharge_plans`     | Available prepaid plans                    |
| `Recharge_history`   | User transaction records                   |
| `Payment_transactions` | Payment status & gateway logs            |
| `Support_tickets`    | Customer queries & resolutions             |
| `Notifications`      | SMS/Email alerts                           |

---

## **Installation & Setup**  

### **🔹 Backend (Spring Boot)**  
1. Clone the repo:  
   ```sh
   git clone https://github.com/Prasa786/Mobile-Prepaid-Recharge-Service.git
   ```
2. Configure `application.properties`:  
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/voltmobi
   spring.datasource.username=db_user
   spring.datasource.password=db_password
   ```
3. Run the app:  
   ```sh
   mvn spring-boot:run
   ```

### **🔹 Frontend (Static HTML/JS)**  
1. Open `index.html` in a browser.  
2. For Twilio/RazorPay, update API keys in `config.js`.  

---

## **Contributors**  
- **[Prasanna R S]**  
- **Email:** prasannarps786@gmail.com
- **GitHub:** [@yourusername](https://github.com/Prasa786)  

---

### **License**  
This project is licensed under **MIT License**.  

--- 

