# SADS Project - UML Diagrams Documentation

This directory contains comprehensive UML diagrams for the Smart Animal Detection System (SADS) project, including the new modules: IoT Device Health, Field Management, and Manager Profile.

## Diagram Types Included

1. **Use Case Diagram** - Shows all system actors and use cases
2. **Sequence Diagrams** - Device heartbeat flow and manager profile view
3. **State Chart Diagrams** - Device status and field status state machines
4. **Activity Diagrams** - Field assignment process and animal detection flow
5. **Class Diagram** - Complete class structure with relationships
6. **Object Diagram** - Example system state with actual objects
7. **Component Diagram** - System architecture and component interactions
8. **Deployment Diagram** - Physical deployment architecture

## How to View/Edit Diagrams

### Option 1: PlantUML Online Editor
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the diagram code from `UML_DIAGRAMS.puml`
3. Paste and render

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open `UML_DIAGRAMS.puml`
3. Press `Alt+D` to preview

### Option 3: Local PlantUML Installation
```bash
# Install Java (required)
# Download plantuml.jar from http://plantuml.com/download

# Generate PNG images
java -jar plantuml.jar UML_DIAGRAMS.puml

# Generate SVG
java -jar plantuml.jar -tsvg UML_DIAGRAMS.puml
```

### Option 4: Online Tools
- **PlantText**: https://www.planttext.com/
- **PlantUML Server**: http://www.plantuml.com/plantuml/uml/

## Diagram Descriptions

### 1. Use Case Diagram
Shows all actors (Admin, Manager, IoT Device, ML Service) and their interactions with the system. Includes use cases for:
- Authentication
- Manager Profile management
- IoT Device Health monitoring
- Field Management
- Detection & Monitoring
- Property Management
- Notification System

### 2. Sequence Diagrams

#### Device Heartbeat Flow
Shows the complete flow when an IoT device sends a heartbeat:
1. Device sends heartbeat to controller
2. Controller updates device status
3. Health service calculates health score
4. Response sent back to device

#### Manager Profile View
Shows how a manager views their profile:
1. Manager navigates to profile page
2. System fetches profile data
3. Performance stats are calculated
4. Profile displayed to manager

### 3. State Chart Diagrams

#### Device Status
Shows device lifecycle states:
- Offline → Online → Maintenance
- Online states: Normal, LowBattery, LowSignal, Critical

#### Field Status
Shows field management states:
- Unassigned → Active → Inactive/Maintenance
- Active states: Monitoring, Alert

### 4. Activity Diagrams

#### Field Assignment Process
Shows the complete process of assigning a manager to a field:
1. Admin selects property and manager
2. Admin enters plantation and field information
3. System validates and saves
4. Notification sent to manager

#### Animal Detection Flow
Shows the detection and alert process:
1. Camera captures image
2. ML service processes
3. Detection saved
4. Alerts sent based on confidence and animal type

### 5. Class Diagram
Complete class structure showing:
- **User Management**: User, ManagerProfile
- **Device Management**: Device, DeviceHealth
- **Field Management**: Field, Property
- **Detection System**: Detection, Notification

All relationships and attributes are included.

### 6. Object Diagram
Example system state showing:
- A manager with profile
- Assigned property and field
- Device with health metrics
- All relationships between objects

### 7. Component Diagram
System architecture showing:
- **Frontend Layer**: React components, pages, contexts
- **Backend Layer**: Express API, routes, controllers
- **Business Logic**: Services for each module
- **Data Access Layer**: All models
- **External Services**: MongoDB, ML Service, Twilio, Email
- **IoT Layer**: Devices (cameras, sensors, deterrents)

### 8. Deployment Diagram
Physical deployment showing:
- **Client Browser**: React frontend
- **Web Server**: Nginx/Apache with static files
- **Application Server**: Node.js with Express API
- **Database Server**: MongoDB Atlas with collections
- **ML Service Server**: Python server with YOLO model
- **External Services**: Twilio, Email, Google OAuth
- **IoT Devices**: Cameras, sensors, deterrents

## New Modules Coverage

### IoT Device Health Module
- **Use Cases**: Device registration, heartbeat, monitoring, maintenance
- **Sequence**: Heartbeat flow diagram
- **State Chart**: Device status lifecycle
- **Class**: DeviceHealth class with all attributes
- **Component**: Device Health Service component
- **Deployment**: IoT devices and health monitoring

### Field Management Module
- **Use Cases**: Create, assign, view, update, delete fields
- **Activity**: Field assignment process
- **State Chart**: Field status lifecycle
- **Class**: Field class with relationships
- **Component**: Field Management Service
- **Deployment**: Field data in MongoDB

### Manager Profile Module
- **Use Cases**: View profile, performance stats, activity history, achievements
- **Sequence**: Manager profile view flow
- **Class**: ManagerProfile class with metrics
- **Component**: Manager Profile Service
- **Deployment**: Profile data in MongoDB

## Database Tables Reference

Refer to `TABLE_DESIGNS.md` for detailed database schema:
- Manager Profile Table (18 fields)
- IoT Device Health Table (21 fields)
- Field Management Table (18 fields)

## Notes

- All diagrams use PlantUML syntax
- Diagrams are modular and can be extracted individually
- Relationships follow actual codebase structure
- New modules are fully integrated into all diagrams
- All foreign key relationships are shown

## Updates

When adding new features:
1. Update relevant diagrams
2. Maintain consistency across all diagrams
3. Update this README if new diagram types are added







