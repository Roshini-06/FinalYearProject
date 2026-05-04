import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_complaint_confirmation(email_to: str):
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            logger.warning("SMTP settings not configured. Skipping email.")
            return

        subject = "Complaint Submitted Successfully"
        message = "Your complaint has been successfully registered. Our team will take action soon."
        
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg['To'] = email_to
            msg['Subject'] = subject
            msg.attach(MIMEText(message, 'plain'))
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {str(e)}")

    @staticmethod
    async def send_status_update_notification(email_to: str, complaint_id: int, new_status: str):
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            logger.warning("SMTP settings not configured. Skipping email.")
            return

        subject = f"Complaint Status Updated: Complaint #{complaint_id}"
        
        if new_status == "Resolved":
            subject = f"SUCCESS: Complaint #{complaint_id} Resolved"
            message = f"Great news!\n\nYour complaint (ID: #{complaint_id}) has been successfully RESOLVED by our team.\n\nWe hope you are satisfied with the resolution. If you have any further issues, please feel free to submit a new report.\n\nThank you for helping us improve our city!\n{settings.PROJECT_NAME} Team"
        else:
            message = f"Hello,\n\nThe status of your complaint (ID: #{complaint_id}) has been updated to: {new_status}.\n\nYou can track the progress on your dashboard.\n\nThank you,\n{settings.PROJECT_NAME} Team"
        
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg['To'] = email_to
            msg['Subject'] = subject
            msg.attach(MIMEText(message, 'plain'))
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Status update email sent to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send status update email: {str(e)}")

    @staticmethod
    async def send_admin_priority_alert(admin_email: str, complaint_id: int, priority: str):
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            return

        subject = f"URGENT: High Priority Complaint #{complaint_id}"
        message = f"Attention Admin,\n\nA new HIGH PRIORITY complaint has been submitted.\n\nComplaint ID: #{complaint_id}\nPriority: {priority}\n\nPlease take immediate action."
        
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg['To'] = admin_email
            msg['Subject'] = subject
            msg.attach(MIMEText(message, 'plain'))
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Admin priority alert sent to {admin_email}")
        except Exception as e:
            logger.error(f"Failed to send admin alert: {str(e)}")
