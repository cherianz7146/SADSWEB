/**
 * Script to create Property documents for existing users who have plantation data
 * but no corresponding Property document
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Property = require('./models/property');

async function fixProperties() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all managers who have plantation data
    const managers = await User.find({ 
      role: 'manager',
      'plantation.name': { $exists: true, $ne: null }
    });

    console.log(`Found ${managers.length} managers with plantation data\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const manager of managers) {
      console.log(`\nProcessing: ${manager.name} (${manager.email})`);
      console.log(`  User ID: ${manager.userId}`);
      console.log(`  Plantation: ${manager.plantation.name}`);

      // Check if property already exists for this manager
      const existingProperty = await Property.findOne({ managerId: manager._id });
      
      if (existingProperty) {
        console.log(`  ⏭️  Property already exists: ${existingProperty.name}`);
        skipped++;
        continue;
      }

      // Create property
      try {
        const property = await Property.create({
          name: manager.plantation.name,
          managerId: manager._id,
          address: manager.plantation.location || 'Location to be updated',
          description: `Property for ${manager.name}`,
          cameraCount: 0,
          status: 'active',
          plantation: {
            name: manager.plantation.name,
            location: manager.plantation.location || '',
            fields: manager.plantation.fields || [],
            assignedBy: manager._id
          }
        });

        console.log(`  ✅ Created property: ${property.name} (ID: ${property._id})`);
        created++;
      } catch (error) {
        console.error(`  ❌ Failed to create property:`, error.message);
        errors++;
      }
    }

    console.log('\n========================================');
    console.log('SUMMARY:');
    console.log(`  Total managers with plantation: ${managers.length}`);
    console.log(`  Properties created: ${created}`);
    console.log(`  Already existed (skipped): ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('========================================\n');

    // List all properties
    const allProperties = await Property.find().populate('managerId', 'userId name email');
    console.log('\nAll Properties in Database:');
    console.log('========================================');
    for (const prop of allProperties) {
      console.log(`  ${prop.name}`);
      console.log(`    Manager: ${prop.managerId.name} (User ID: ${prop.managerId.userId})`);
      console.log(`    Address: ${prop.address}`);
      console.log(`    Status: ${prop.status}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

// Run the script
fixProperties();





