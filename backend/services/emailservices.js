const nodemailer = require('nodemailer');

// Create transporter with better Gmail configuration
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
  tls: {
    rejectUnauthorized: false // Only for development - set to true in production
  }
});

// Verify transporter configuration
transport.verify((error, success) => {
  if (error) {
    console.warn('SMTP transporter verification failed:', error.message);
    console.warn('Emails will not be sent until SMTP is properly configured.');
  } else {
    console.log('SMTP transporter is ready to send emails');
  }
});

async function sendEmail({ to, subject, html }) {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not fully configured. Email not sent:', { to, subject });
    console.warn('Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    return;
  }
  
  if (!to) {
    console.warn('No recipient email provided');
    return;
  }
  
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
    console.log('Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email sending failed:', err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}

exports.sendWelcomeEmail = async (user) => {
  try {
    console.log('Preparing to send welcome email to:', user.email);
    const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Manager' : 'User';
    console.log('User role for email:', user.role, '-> Label:', roleLabel);
    
    const emailResult = await sendEmail({
      to: user.email,
      subject: `Welcome to SADS - Your User ID: ${user.userId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .user-id-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .user-id { font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Welcome to SADS!</h1>
              <p style="margin: 10px 0 0 0;">Smart Animal Deterrent System</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Your ${roleLabel} account has been successfully created. Below is your unique User ID:</p>
              
              <div class="user-id-box">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">YOUR USER ID</p>
                <div class="user-id">${user.userId}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Please save this ID for your records</p>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Account Details</h3>
                <p style="margin: 5px 0;"><strong>User ID:</strong> ${user.userId}</p>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                <p style="margin: 5px 0;"><strong>Role:</strong> ${roleLabel}</p>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">🔑 Important Notes</h3>
                <ul style="margin: 10px 0;">
                  <li>Your User ID (${user.userId}) is unique and will be used to identify your detections</li>
                  <li>Keep this ID safe - you'll see it in your detection reports and notifications</li>
                  <li>You can now log in to the SADS system using your email and password</li>
                  <li>All your camera detections will be tracked using this User ID</li>
                </ul>
              </div>
              
              <p style="margin-top: 20px;">If you have any questions or need assistance, please contact your system administrator.</p>
              
              <div class="footer">
                <p><strong>SADS Team</strong></p>
                <p>Smart Animal Deterrent System</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('Welcome email with userId sent successfully to:', user.email, 'Message ID:', emailResult?.messageId);
  } catch (err) {
    console.error('Failed to send welcome email to', user.email, ':', err);
  }
};

exports.notifyAdminNewUser = async (user, admins) => {
  try {
    const list = (admins || []).filter(Boolean);
    if (!list.length) return;
    await sendEmail({
      to: list.join(','),
      subject: `New ${user.role} joined: ${user.email}`,
      html: `<p>${user.name} (${user.email}) joined as ${user.role}.</p>`,
    });
  } catch (err) {
    console.error('Failed to notify admin of new user:', err);
  }
};

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your SADS password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    throw err; // Re-throw to be handled by the calling function
  }
};

// New function to notify managers when admin updates their credentials
exports.notifyManagerCredentialUpdate = async (manager, admin) => {
  try {
    await sendEmail({
      to: manager.email,
      subject: 'Your SADS Account Credentials Have Been Updated',
      html: `
        <h2>Credentials Updated</h2>
        <p>Hello ${manager.name},</p>
        <p>Your SADS account credentials have been updated by an administrator (${admin.name}).</p>
        <p>If you did not request this change or if you have any concerns, please contact your system administrator immediately.</p>
        <p>Best regards,<br/>SADS Security Team</p>
      `,
    });
  } catch (err) {
    console.error('Failed to notify manager of credential update:', err);
  }
};

// New function to notify managers when admin updates their permissions/activities
exports.notifyManagerPermissionUpdate = async (manager, admin, permissionChanges) => {
  try {
    let changesHtml = '<ul>';
    for (const [permission, status] of Object.entries(permissionChanges)) {
      changesHtml += `<li><strong>${permission}:</strong> ${status ? 'Enabled' : 'Disabled'}</li>`;
    }
    changesHtml += '</ul>';
    
    await sendEmail({
      to: manager.email,
      subject: 'Your SADS Account Permissions Have Been Updated',
      html: `
        <h2>Permissions Updated</h2>
        <p>Hello ${manager.name},</p>
        <p>Your SADS account permissions have been updated by an administrator (${admin.name}).</p>
        <p><strong>Changes made:</strong></p>
        ${changesHtml}
        <p>If you did not request these changes or if you have any concerns, please contact your system administrator immediately.</p>
        <p>Best regards,<br/>SADS Security Team</p>
      `,
    });
  } catch (err) {
    console.error('Failed to notify manager of permission update:', err);
  }
};

// New function to send system maintenance notifications
exports.notifySystemMaintenance = async (maintenanceInfo, recipients) => {
  try {
    const recipientEmails = recipients.filter(r => r.email).map(r => r.email);
    if (recipientEmails.length === 0) return;
    
    await sendEmail({
      to: recipientEmails.join(','),
      subject: `SADS System Maintenance: ${maintenanceInfo.type}`,
      html: `
        <h2>System Maintenance Notification</h2>
        <p>Hello,</p>
        <p>This is to notify you of upcoming system maintenance:</p>
        <ul>
          <li><strong>Type:</strong> ${maintenanceInfo.type}</li>
          <li><strong>Description:</strong> ${maintenanceInfo.description}</li>
          <li><strong>Scheduled Start:</strong> ${new Date(maintenanceInfo.startTime).toLocaleString()}</li>
          <li><strong>Estimated Duration:</strong> ${maintenanceInfo.duration}</li>
          <li><strong>Impact:</strong> ${maintenanceInfo.impact}</li>
        </ul>
        <p>Please plan accordingly. We apologize for any inconvenience this may cause.</p>
        <p>Best regards,<br/>SADS Operations Team</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send system maintenance notification:', err);
  }
};

// New function to send device status alerts
exports.notifyDeviceStatus = async (device, status, recipients) => {
  try {
    const recipientEmails = recipients.filter(r => r.email).map(r => r.email);
    if (recipientEmails.length === 0) return;
    
    const statusLabels = {
      'offline': 'Offline',
      'maintenance': 'Under Maintenance',
      'error': 'Error Detected',
      'online': 'Back Online'
    };
    
    await sendEmail({
      to: recipientEmails.join(','),
      subject: `Device Status Alert: ${device.name}`,
      html: `
        <h2>Device Status Alert</h2>
        <p>Hello,</p>
        <p>The status of device <strong>${device.name}</strong> has changed:</p>
        <ul>
          <li><strong>Device ID:</strong> ${device.id}</li>
          <li><strong>New Status:</strong> ${statusLabels[status] || status}</li>
          <li><strong>Location:</strong> ${device.location}</li>
          <li><strong>Last Updated:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        ${status === 'offline' || status === 'error' ? '<p>Please investigate and take appropriate action.</p>' : ''}
        <p>Best regards,<br/>SADS Device Monitoring System</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send device status notification:', err);
  }
};

// New function to send report generation notifications
exports.notifyReportGeneration = async (reportInfo, recipient) => {
  try {
    if (!recipient.email) return;
    
    await sendEmail({
      to: recipient.email,
      subject: `SADS Report Ready: ${reportInfo.title}`,
      html: `
        <h2>Report Generation Complete</h2>
        <p>Hello ${recipient.name},</p>
        <p>Your requested report has been generated:</p>
        <ul>
          <li><strong>Report Title:</strong> ${reportInfo.title}</li>
          <li><strong>Generated:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>Period:</strong> ${reportInfo.period}</li>
          <li><strong>Type:</strong> ${reportInfo.type}</li>
        </ul>
        ${reportInfo.downloadLink ? `<p><a href="${reportInfo.downloadLink}" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Download Report</a></p>` : ''}
        <p>Best regards,<br/>SADS Reporting System</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send report generation notification:', err);
  }
};

// New function to notify managers when their account status is changed
exports.notifyManagerStatusChange = async (manager, admin, isActive) => {
  try {
    console.log('📧 notifyManagerStatusChange called:', {
      managerName: manager.name,
      managerEmail: manager.email,
      managerId: manager.userId || manager._id,
      isActive,
      adminName: admin.name
    });
    
    if (!manager.email) {
      console.error('❌ Cannot send status change email: Manager has no email address');
      return;
    }
    
    const statusText = isActive ? 'activated' : 'blocked';
    const statusColor = isActive ? '#10b981' : '#ef4444';
    const actionText = isActive ? 'Activated' : 'Blocked';
    
    console.log(`📨 Sending ${statusText} notification to:`, manager.email);
    
    await sendEmail({
      to: manager.email,
      subject: `🔔 Your SADS Account Has Been ${actionText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${statusColor}; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">Account Status Update</h2>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border: 2px solid ${statusColor}; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hello <strong>${manager.name}</strong>,</p>
            
            <div style="background-color: ${isActive ? '#d1fae5' : '#fee2e2'}; padding: 15px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">
                Your SADS account has been <strong style="color: ${statusColor}">${statusText.toUpperCase()}</strong> 
                by Administrator <strong>${admin.name}</strong>.
              </p>
            </div>
            
            ${isActive ? `
              <p style="color: #059669; font-weight: bold;">✅ You can now access the SADS system with your existing credentials.</p>
              <p>Your User ID: <strong>${manager.userId || 'N/A'}</strong></p>
              <p>Your Email: <strong>${manager.email}</strong></p>
            ` : `
              <p style="color: #dc2626; font-weight: bold;">⚠️ Your account access has been temporarily restricted.</p>
              <p>If you believe this is an error, please contact your system administrator immediately.</p>
            `}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Changed by:</strong> ${admin.name} (${admin.email})<br>
              <strong>Changed at:</strong> ${new Date().toLocaleString('en-US', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
              })}
            </p>
            
            <p>If you have any questions or concerns, please contact your system administrator.</p>
            <p>Best regards,<br/><strong>SADS Security Team</strong></p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Status change notification email sent successfully to:', manager.email);
  } catch (err) {
    console.error('❌ Failed to notify manager of status change:', err);
    console.error('Error details:', err.message);
    throw err; // Re-throw to be caught by controller
  }
};

// Notify admins and a manager when an animal is detected
exports.notifyAnimalDetection = async (detection, manager, admins) => {
  try {
    const animalName = detection.label.charAt(0).toUpperCase() + detection.label.slice(1);
    const subject = `🚨 ${animalName} Detected - Immediate Action Required`;
    
    const detectionTime = new Date(detection.detectedAt).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 24px;">🚨 Wildlife Detection Alert</h2>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 2px solid #dc2626; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
            <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 20px;">Detected Animal: ${animalName}</h3>
          </div>
          
          <div style="margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151; width: 40%;">🏢 Property:</td>
                <td style="padding: 12px 0; color: #1f2937;">${detection.propertyName || 'Unknown Property'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">📍 Location:</td>
                <td style="padding: 12px 0; color: #1f2937;">${detection.location || 'Not specified'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">⏰ Time:</td>
                <td style="padding: 12px 0; color: #1f2937;">${detectionTime}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">📷 Source:</td>
                <td style="padding: 12px 0; color: #1f2937;">${detection.source === 'video' ? 'Live Camera' : 'Uploaded Image'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">⚠️ Please take immediate action to ensure safety and activate appropriate deterrent measures.</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This is an automated notification from your SADS Wildlife Detection System. 
            Please log in to your dashboard for more details and to manage deterrent responses.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} SADS - Smart Animal Detection System</p>
          <p style="margin: 5px 0 0 0;">Protecting your property with intelligent wildlife monitoring</p>
        </div>
      </div>
    `;

    // Notify the manager
    if (manager?.email) {
      await sendEmail({ 
        to: manager.email, 
        subject: subject,
        html: html
      });
    }

    // Notify all admins
    for (const admin of admins || []) {
      if (admin.email) {
        await sendEmail({ 
          to: admin.email, 
          subject: `[Admin Alert] ${subject}`,
          html: html
        });
      }
    }
  } catch (err) {
    console.error('Failed to send animal detection email notifications:', err);
  }
};

// New function to notify managers when assigned to a plantation
exports.notifyManagerPlantationAssignment = async (manager, property, admin) => {
  try {
    await sendEmail({
      to: manager.email,
      subject: `You Have Been Assigned to ${property.name}`,
      html: `
        <h2>Plantation Assignment</h2>
        <p>Hello ${manager.name},</p>
        <p>You have been assigned to manage a new plantation by an administrator (${admin.name}).</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #2d3748;">Property Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Property Name:</strong> ${property.name}</li>
            <li><strong>Address:</strong> ${property.address}</li>
            <li><strong>Cameras:</strong> ${property.cameraCount}</li>
            <li><strong>Status:</strong> ${property.status}</li>
            ${property.plantation?.name ? `<li><strong>Plantation:</strong> ${property.plantation.name}</li>` : ''}
          </ul>
        </div>
        <p>You can now access and manage this property through your SADS dashboard.</p>
        <p>If you have any questions about this assignment, please contact your system administrator.</p>
        <p>Best regards,<br/>SADS Property Management Team</p>
      `,
    });
  } catch (err) {
    console.error('Failed to notify manager of plantation assignment:', err);
  }
};

// New function to send custom notifications to managers
exports.sendManagerNotification = async (email, name, subject, message) => {
  try {
    await sendEmail({
      to: email,
      subject: `[SADS Notification] ${subject}`,
      html: `
        <h2>${subject}</h2>
        <p>Hello ${name},</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <p>This is an official notification from your SADS system administrator.</p>
        <p>If you have any questions or concerns, please contact your system administrator.</p>
        <p>Best regards,<br/>SADS Administration Team</p>
      `,
    });
    console.log('Manager notification sent successfully to:', email);
  } catch (err) {
    console.error('Failed to send manager notification:', err);
    throw err;
  }
};