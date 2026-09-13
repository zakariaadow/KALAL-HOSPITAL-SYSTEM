from flask_mail import Message
from flask import current_app
from app import mail

def send_email(to, subject, body, html=None):
    """Send an email"""
    try:
        msg = Message(
            subject,
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[to]
        )
        msg.body = body
        if html:
            msg.html = html
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_appointment_confirmation(appointment):
    """Send appointment confirmation email"""
    patient = appointment.patient
    doctor = appointment.doctor
    
    subject = f"Appointment Confirmation - {appointment.appointment_date.strftime('%B %d, %Y')}"
    body = f"""
    Dear {patient.full_name()},
    
    Your appointment has been confirmed.
    
    Details:
    - Date: {appointment.appointment_date.strftime('%B %d, %Y')}
    - Time: {appointment.appointment_date.strftime('%I:%M %p')}
    - Doctor: {doctor.full_name()}
    - Type: {appointment.type}
    - Reason: {appointment.reason or 'Regular checkup'}
    
    Please arrive 15 minutes before your appointment time.
    
    Thank you,
    KALAL Hospital System
    """
    
    return send_email(patient.user.email, subject, body)

def send_bill_notification(bill):
    """Send bill notification email"""
    patient = bill.patient
    
    subject = f"Bill Generated - {bill.bill_number}"
    body = f"""
    Dear {patient.full_name()},
    
    A new bill has been generated for you.
    
    Details:
    - Bill Number: {bill.bill_number}
    - Amount: ${bill.total_amount:.2f}
    - Due Date: {bill.due_date.strftime('%B %d, %Y') if bill.due_date else 'Immediate'}
    
    Please make the payment at your earliest convenience.
    
    Thank you,
    KALAL Hospital System
    """
    
    return send_email(patient.user.email, subject, body)

def send_password_reset_email(user, reset_token):
    """Send password reset email"""
    subject = "Password Reset Request"
    reset_link = f"http://localhost:3000/reset-password/{reset_token}"
    
    body = f"""
    Dear {user.username},
    
    We received a request to reset your password.
    
    Please click the following link to reset your password:
    {reset_link}
    
    If you did not request this, please ignore this email.
    
    Thank you,
    KALAL Hospital System
    """
    
    return send_email(user.email, subject, body)