# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from app.core.config import settings


# def send_otp_email(email: str, otp: str):
#     sender_email = settings.SENDER_EMAIL
#     receiver_email = email
#     password = settings.PASSWORD_EMAIL

#     message = MIMEMultipart("alternative")
#     message["Subject"] = "Your OTP Code"
#     message["From"] = sender_email
#     message["To"] = receiver_email

#     text = f"Your OTP code is {otp}."
#     part = MIMEText(text, "plain")

#     message.attach(part)

#     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#         server.login(sender_email, password)
#         server.sendmail(sender_email, receiver_email, message.as_string())


# def send_reset_password_email(email: str, reset_link: str):
#     sender_email = settings.SENDER_EMAIL
#     receiver_email = email
#     password = settings.PASSWORD_EMAIL

#     message = MIMEMultipart("alternative")
#     message["Subject"] = "Reset Your Password"
#     message["From"] = sender_email
#     message["To"] = receiver_email

#     text = f"""
#     Hi,

#     You requested to reset your password. Please click the link below to reset your password:

#     {reset_link}

#     If you did not request this, please ignore this email.

#     Best regards,
#     Your Team
#     """
#     html = f"""
#     <html>
#     <body>
#         <p>Hi,</p>
#         <p>You requested to reset your password. Please click the link below to reset your password:</p>
#         <a href="{reset_link}">Reset Password</a>
#         <p>If you did not request this, please ignore this email.</p>
#         <br>
#         <p>Best regards,</p>
#         <p>Your Team</p>
#     </body>
#     </html>
#     """

#     part1 = MIMEText(text, "plain")
#     part2 = MIMEText(html, "html")

#     message.attach(part1)
#     message.attach(part2)

#     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#         server.login(sender_email, password)
#         server.sendmail(sender_email, receiver_email, message.as_string())



import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.sender_email = settings.SENDER_EMAIL
        self.password = settings.PASSWORD_EMAIL
        self.server = "smtp.gmail.com"
        self.port = 465

    def _send_email(self, receiver_email: str, subject: str, plain_text: str, html_text: str = None):
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.sender_email
        message["To"] = receiver_email

        part1 = MIMEText(plain_text, "plain")
        message.attach(part1)

        if html_text:
            part2 = MIMEText(html_text, "html")
            message.attach(part2)

        with smtplib.SMTP_SSL(self.server, self.port) as server:
            server.login(self.sender_email, self.password)
            server.sendmail(self.sender_email, receiver_email, message.as_string())

    def send_otp_email(self, email: str, otp: str):
        subject = "Your OTP Code"
        text = f"Your OTP code is {otp}."
        self._send_email(email, subject, text)

    def send_reset_password_email(self, email: str, reset_link: str):
        subject = "Reset Your Password"
        text = f"""
        Hi,

        You requested to reset your password. Please click the link below to reset your password:

        {reset_link}

        If you did not request this, please ignore this email.

        Best regards,
        Your Team
        """
        html = f"""
        <html>
        <body>
            <p>Hi,</p>
            <p>You requested to reset your password. Please click the link below to reset your password:</p>
            <a href="{reset_link}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>Your Team</p>
        </body>
        </html>
        """
        self._send_email(email, subject, text, html)
        
    def send_invitation_email(self, email: str, invitation_link: str):
        subject = "Invitation to join our team"
        text = f"""
        Hi,

        You have been added to our team. Please click the link below to open the workspace:

        {invitation_link}

        If you did not request this, please ignore this email.

        Best regards,
        Your Team
        """
        html = f"""
        <html>
        <body>
            <p>Hi,</p>
            <p>You have been added to our team. Please click the link below to open the workspace:</p>
            <a href="{invitation_link}">Workspace</a>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>Your Team</p>
        </body>
        </html>
        """
        self._send_email(email, subject, text, html)
