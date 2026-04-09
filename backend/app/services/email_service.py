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
            
            # Using synchronous smtplib but we can wrap it if needed. 
            # In a production app, use an async library or background tasks.
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {str(e)}")
