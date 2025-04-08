# VoltMobi Mobile Prepaid Recharge System

## A Smarter Way to Recharge

VoltMobi is a web-based platform that makes mobile prepaid recharges simple, secure, and efficient. Designed for both end-users and administrators, it provides a complete solution for managing mobile top-ups with real-time processing and detailed analytics.

### The Challenge We Solve
Most users rely on third-party services for mobile recharges, which creates several problems:
- Limited control over customer relationships
- No direct access to transaction insights
- Difficulty managing promotions and offers

VoltMobi addresses these challenges by providing a dedicated recharge platform that puts control back in your hands.

### Our Core Goals
- Make mobile recharges effortless for users
- Provide a centralized, secure transaction platform
- Offer powerful management tools for administrators
- Deliver actionable business insights

---

## Key Features

### For Administrators
- **Dashboard:** View real-time statistics and performance metrics
- **Plan Management:** Easily create, update, or remove recharge plans
- **User Management:** Monitor and manage user accounts
- **Reporting Tools:** Generate detailed transaction reports

### For Users
- **Secure Access:** Login via OTP (Twilio SMS verification)
- **Plan Selection:** Browse and filter available recharge options
- **Quick Payments:** Secure transactions via RazorPay integration
- **Transaction History:** View and download past recharge receipts
- **Profile Management:** Update personal information easily
- **Support System:** Submit and track support requests

---

## Technology Overview

### Frontend Development
- Built with standard web technologies: HTML5, CSS3, JavaScript
- Responsive design using Bootstrap 5 framework

### Backend Architecture
- Spring Boot application framework
- Secure authentication with Spring Security (JWT)
- Dependency management with Maven

### Data Management
- MySQL relational database
- Hibernate ORM for database interactions

### Integrated Services
- RESTful API design
- Twilio for SMS-based OTP verification
- RazorPay payment processing
- Email notifications via SMTP

---

## Database Structure

The system maintains several key data entities:

| Component            | Purpose                                   |
|----------------------|------------------------------------------|
| Users                | Stores all user account information      |
| Recharge_plans       | Contains available recharge packages     |
| Recharge_history     | Records completed transactions          |
| Payment_transactions | Tracks payment status and details       |
| Support_tickets      | Manages customer support interactions   |
| Notifications        | Handles system alerts and messages      |

---

## Getting Started

### Backend Setup (Spring Boot)

1. Clone the repository:
   ```sh
   git clone https://github.com/Prasa786/Mobile-Prepaid-Recharge-Service.git
   ```

2. Configure your database connection in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/voltmobi
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. Launch the application:
   ```sh
   mvn spring-boot:run
   ```

### Frontend Setup

1. Open the `index.html` file in any modern web browser
2. Configure API keys in `config.js` for:
   - Twilio (SMS services)
   - RazorPay (payment processing)

---

## Project Maintainer

**Prasanna R S**  
Email: prasannarps786@gmail.com  
GitHub: [@Prasa786](https://github.com/Prasa786)

---

## License

This project is open-source and available under the MIT License.

---

This version maintains all technical information while using:
- Clear, straightforward language
- Logical organization
- Professional tone without jargon
- Approachable explanations of technical concepts
- Consistent formatting for readability
