# Codebase Structure Documentation

## 1. TENDER MANAGEMENT SYSTEM (Current Directory)
**Location:** C:\Users\admin\Desktop\TENDER MNAGEMENT

### Project Overview
This is a tender management platform with TypeScript/JavaScript implementation, containerized with Docker and Kubernetes orchestration.

### Files Organization:

#### 📁 Root Level Files
```
├── 📄 Documentation & Guides
│   ├── AVGC Tender Management Platform.pdf
│   ├── DETAIL.pdf
│   ├── TENDER.pdf
│   ├── WORK FLOW.pdf
│   ├── KUBER DEPL.pdf
│   └── readme-main.txt
│
├── 🖼️ Images & Screenshots
│   ├── 111.png
│   ├── TENDER.png
│   └── Screenshot 2025-07-25 111455.png
│
├── 🔧 Configuration Files
│   ├── env-example.sh
│   ├── env-example.txt
│   ├── backend-package-json.json
│   └── frontend-package-json.json
```

#### 📂 Backend Components (TypeScript)
```
├── 🎯 Controllers
│   ├── analytics-controller.ts
│   ├── auth-controller.ts
│   ├── document-controller.ts
│   ├── emd-controller.ts
│   ├── notification-controller.ts
│   ├── pricing-controller.ts
│   ├── reporting-controller.ts
│   ├── security-controller.ts
│   └── tender-controller.ts
│
├── 🔧 Services
│   ├── api-service.ts
│   ├── auth-service.ts
│   ├── auth-service1.ts
│   ├── emd-calculation-service.ts
│   ├── logger-config.ts
│   ├── metrics-service.ts
│   ├── report-builder-service.ts
│   ├── security-calculation-service.ts
│   └── websocket-service.ts
│
├── 📊 Data Models & DTOs
│   ├── auth-dto.ts
│   ├── tender-dto.ts
│   ├── tender-entity.ts
│   └── user-entity.ts
│
├── 🔌 WebSocket & Real-time
│   └── websocket-gateway.ts
│
├── 📱 Application Structure
│   └── app-module.ts
```

#### 📂 Frontend Components (TypeScript)
```
├── 🎨 UI Components
│   ├── bid-security-component.ts
│   ├── digital-signature.ts
│   ├── emd-calculator-component.ts
│   ├── executive-dashboard-component.ts
│   ├── login-form-component.ts
│   ├── login-form-component1.ts
│   ├── mfa-verification.ts
│   ├── report-builder-component.ts
│   ├── search-filters.ts
│   ├── tender-discovery.ts
│   └── tender-discovery-component.ts
│
├── 🎯 State Management
│   └── auth-store-slice.ts
│
├── 🔗 Hooks
│   ├── use-auth-hook.ts
│   ├── use-permissions-hook.ts
│   └── use-session-hook.ts
│
├── 🔐 Security & Session
│   ├── session-manager.ts
│   └── token-manager.ts
│
├── 🎨 Styling
│   ├── login-form-styles.ts
│   └── login-form-index.ts
│
├── 🧪 Tests
│   └── login-form-test.ts
│
├── 🚀 Entry Point
│   └── main-ts.ts
```

#### 📂 Database Schemas (SQL)
```
├── 💾 Database Scripts
│   ├── database-schema-emd.sql
│   ├── database-schema-reporting.sql
│   └── database-schema-security.sql
```

#### 📂 DevOps & Infrastructure
```
├── 🐳 Docker Configuration
│   ├── docker-compose-full.txt
│   ├── dockerfile-backend.txt
│   └── dockerfile-frontend.txt
│
├── ☸️ Kubernetes Manifests
│   ├── k8s-api-gateway.txt
│   ├── k8s-auth-service.txt
│   ├── k8s-cleanup-script.txt
│   ├── k8s-configmap.txt
│   ├── k8s-deployment.txt
│   ├── k8s-deployment1.txt
│   ├── k8s-deploy-script.txt
│   ├── k8s-document-service.txt
│   ├── k8s-elasticsearch.txt
│   ├── k8s-frontend.txt
│   ├── k8s-grafana.txt
│   ├── k8s-helm-values.txt
│   ├── k8s-ingress.txt
│   ├── k8s-kustomization.txt
│   ├── k8s-mongodb.txt
│   ├── k8s-namespace.txt
│   ├── k8s-network-policies.txt
│   ├── k8s-notification-service.txt
│   ├── k8s-postgres.txt
│   ├── k8s-prometheus.txt
│   ├── k8s-rabbitmq.txt
│   ├── k8s-rbac.txt
│   ├── k8s-redis.txt
│   ├── k8s-reporting-service.txt
│   ├── k8s-secrets.txt
│   ├── k8s-security-service.txt
│   └── k8s-tender-service.txt
│
├── 📊 Monitoring & Metrics
│   ├── grafana-dashboard.json
│   ├── prometheus-alerts.txt
│   └── prometheus-config.txt
```

---

## 2. EMPLOYEE MANAGEMENT SYSTEM (H:\employee)
**Location:** H:\employee

### Project Overview
Flutter-based cross-platform employee management application with Firebase backend, supporting web, mobile (iOS/Android), and desktop platforms.

### Folder Structure:

#### 📁 Root Level
```
employee/
├── 📄 Configuration Files
│   ├── .env
│   ├── .firebaserc
│   ├── .flutter-plugins-dependencies
│   ├── .metadata
│   ├── analysis_options.yaml
│   ├── devtools_options.yaml
│   ├── firebase.json
│   ├── firebase_database_rules.json
│   ├── pubspec.yaml
│   ├── pubspec.lock
│   ├── package.json
│   └── package-lock.json
│
├── 📚 Documentation
│   ├── README.md
│   ├── README_ENTERPRISE_APP.md
│   └── UPDATE_SUMMARY.md
│
├── 🔧 Utilities
│   ├── add_hr_manager_user.dart
│   ├── test_notifications.dart
│   └── lib.zip
```

#### 📂 lib/ - Main Application Code
```
lib/
├── 🎯 Core Layer
│   ├── config/
│   │   └── ai_config.dart
│   ├── constants/
│   │   └── error_types.dart
│   ├── di/
│   │   └── injection_container.dart
│   ├── errors/
│   │   ├── app_error.dart
│   │   └── error_handler.dart
│   ├── models/
│   │   ├── attendance_model.dart
│   │   ├── auth_models.dart
│   │   ├── employee_model.dart
│   │   ├── hr_approval_model.dart
│   │   ├── leave_model.dart
│   │   └── user_model.dart
│   ├── providers/
│   │   ├── async_state.dart
│   │   ├── attendance_provider.dart
│   │   ├── auth_provider.dart
│   │   ├── dashboard_data_provider.dart
│   │   ├── employee_provider.dart
│   │   ├── firm_provider.dart
│   │   ├── hr_approval_provider.dart
│   │   ├── leave_provider.dart
│   │   ├── location_provider.dart
│   │   ├── location_tracking_provider.dart
│   │   ├── organization_provider.dart
│   │   ├── organization_state_provider.dart
│   │   ├── providers.dart
│   │   └── user_provider.dart
│   ├── repositories/
│   │   ├── attendance_repository.dart
│   │   └── employee_repository.dart
│   ├── security/
│   │   ├── permission_manager.dart
│   │   └── security_service.dart
│   ├── services/
│   │   ├── ai_service.dart
│   │   ├── analytics_service.dart
│   │   ├── attendance_analytics_service.dart
│   │   ├── auth_service.dart
│   │   ├── background_location_service.dart
│   │   ├── biometric_service.dart
│   │   ├── cache_manager.dart
│   │   ├── connectivity_service.dart
│   │   ├── crashlytics_service.dart
│   │   ├── export_service.dart
│   │   ├── geofence_notification_service.dart
│   │   ├── location_tracking_service.dart
│   │   ├── notification_service.dart
│   │   ├── offline_sync_service.dart
│   │   ├── optimized_location_service.dart
│   │   ├── realtime_notification_service.dart
│   │   ├── security_service.dart
│   │   └── team_collaboration_service.dart
│   ├── theme/
│   │   ├── app_colors.dart
│   │   ├── app_spacing.dart
│   │   ├── app_theme.dart
│   │   └── app_typography.dart
│   ├── usecases/
│   │   └── usecase.dart
│   ├── utils/
│   │   ├── async_state.dart
│   │   ├── auth_state_adapter.dart
│   │   ├── color_extensions.dart
│   │   ├── date_time_utils.dart
│   │   ├── employee_adapter.dart
│   │   ├── extensions.dart
│   │   ├── helpers.dart
│   │   ├── shared_preferences_helper.dart
│   │   └── validators.dart
│   ├── validators/
│   │   └── validators.dart
│   └── widgets/
│       ├── custom_app_bar.dart
│       ├── custom_button.dart
│       ├── custom_text_field.dart
│       ├── error_widget.dart
│       └── loading_widget.dart
│
├── 📊 Data Layer
│   ├── datasources/
│   │   ├── firebase_auth_datasource.dart
│   │   ├── firebase_database_datasource.dart
│   │   ├── firm_local_data_source.dart
│   │   ├── firm_remote_data_source.dart
│   │   ├── shared_preferences_datasource.dart
│   │   ├── local/
│   │   │   └── shared_preferences_datasource.dart
│   │   └── remote/
│   │       ├── firebase_auth_datasource.dart
│   │       └── firebase_database_datasource.dart
│   ├── models/
│   │   └── form_builder_models.dart
│   └── repositories/
│       ├── attendance_repository_impl.dart
│       ├── auth_repository_impl.dart
│       ├── employee_repository_impl.dart
│       ├── firm_repository_impl.dart
│       ├── form_builder_repository_impl.dart
│       ├── leave_repository_impl.dart
│       ├── location_repository_impl.dart
│       └── organization_repository_impl.dart
│
├── 🏢 Domain Layer
│   ├── entities/
│   │   ├── attendance.dart
│   │   ├── employee.dart
│   │   ├── firm.dart
│   │   ├── firm_extensions.dart
│   │   ├── form_builder.dart
│   │   ├── leave.dart
│   │   ├── location.dart
│   │   ├── organization.dart
│   │   └── user.dart
│   ├── repositories/
│   │   ├── attendance_repository.dart
│   │   ├── auth_repository.dart
│   │   ├── employee_repository.dart
│   │   ├── firm_repository.dart
│   │   ├── form_builder_repository.dart
│   │   ├── leave_repository.dart
│   │   ├── location_repository.dart
│   │   └── organization_repository.dart
│   └── usecases/
│       ├── attendance/
│       │   ├── check_in_usecase.dart
│       │   ├── check_out_usecase.dart
│       │   └── get_attendance_summary_usecase.dart
│       ├── auth/
│       │   ├── get_current_user_usecase.dart
│       │   ├── login_usecase.dart
│       │   ├── logout_usecase.dart
│       │   ├── sign_in_usecase.dart
│       │   └── sign_out_usecase.dart
│       ├── employee/
│       │   ├── get_employee_usecase.dart
│       │   ├── get_team_members_usecase.dart
│       │   └── update_employee_usecase.dart
│       ├── location/
│       │   ├── check_geofence_usecase.dart
│       │   └── track_location_usecase.dart
│       └── base_usecase.dart
│
├── 🎨 Features/Screens
│   ├── auth/
│   │   ├── auth_wrapper.dart
│   │   ├── enhanced_login_screen.dart
│   │   ├── login.dart
│   │   ├── register.dart
│   │   └── secure_auth_system.dart
│   └── screens/
│       ├── admin/
│       │   ├── admin_dashboard.dart
│       │   ├── admin_settings_panel.dart
│       │   └── enhanced_admin_dashboard.dart
│       ├── ai/
│       │   └── ai_assistant_screen.dart
│       ├── analytics/
│       │   └── analytics_dashboard.dart
│       ├── common/
│       │   └── firm_selection_screen.dart
│       ├── employee/
│       │   ├── employee_attendance.dart
│       │   ├── employee_dashboard.dart
│       │   ├── employee_location.dart
│       │   ├── employee_settings.dart
│       │   ├── employee_team.dart
│       │   ├── enhanced_attendance_system.dart
│       │   ├── enhanced_location_tracking.dart
│       │   ├── location_test_utility.dart
│       │   ├── location_tracking_example.dart
│       │   ├── real_time_gps_tracking.dart
│       │   ├── timesheet_reports.dart
│       │   └── widgets/
│       │       ├── employee_appbar.dart
│       │       └── employee_appdrawer.dart
│       ├── hr/
│       │   └── hr_approval_screen.dart
│       ├── leave/
│       │   ├── leave_application_screen.dart
│       │   ├── leave_approval_screen.dart
│       │   ├── leave_dashboard_screen.dart
│       │   ├── leave_details_screen.dart
│       │   └── leave_list_screen.dart
│       ├── manager/
│       │   ├── analytical_dashboard.dart
│       │   ├── hr_analytics/
│       │   │   ├── components/
│       │   │   │   ├── analytics_charts.dart
│       │   │   │   ├── employee_profile.dart
│       │   │   │   ├── filters.dart
│       │   │   │   ├── performance_table.dart
│       │   │   │   └── stats_overview.dart
│       │   │   └── models/
│       │   │       └── employee.dart
│       │   ├── hr_dashboard.dart
│       │   ├── location_tracker.dart
│       │   ├── manage_employee.dart
│       │   ├── manager_dashboard.dart
│       │   ├── notifications.dart
│       │   ├── profile.dart
│       │   └── real_time_employee_monitor.dart
│       ├── organization/
│       │   ├── department_form_screen.dart
│       │   ├── department_list_screen.dart
│       │   ├── employee_assignment_screen.dart
│       │   ├── organization_details_screen.dart
│       │   ├── organization_form_screen.dart
│       │   ├── organization_hierarchy_screen.dart
│       │   ├── organization_list_screen.dart
│       │   ├── organization_selection_screen.dart
│       │   ├── role_form_screen.dart
│       │   └── role_list_screen.dart
│       ├── notifications.dart
│       └── profile.dart
│
├── 🎭 Presentation Layer
│   ├── providers/
│   │   └── form_builder_provider.dart
│   ├── screens/
│   │   └── form_builder/
│   │       ├── form_builder_screen.dart
│   │       ├── form_editor_screen.dart
│   │       ├── form_list_screen.dart
│   │       └── widgets/
│   │           ├── field_config_dialog.dart
│   │           ├── field_type_selector.dart
│   │           ├── form_field_widget.dart
│   │           └── form_settings_dialog.dart
│   ├── state/
│   │   └── app_state_notifier.dart
│   └── widgets/
│       ├── app_bars/
│       │   ├── app_app_bar.dart
│       │   └── custom_app_bar.dart
│       ├── buttons/
│       │   ├── app_button.dart
│       │   └── custom_button.dart
│       ├── cards/
│       │   └── app_card.dart
│       ├── dialogs/
│       │   └── app_dialog.dart
│       ├── empty/
│       │   └── app_empty_state.dart
│       ├── error/
│       │   └── error_widget.dart
│       ├── inputs/
│       │   ├── app_text_field.dart
│       │   └── custom_text_field.dart
│       ├── lists/
│       │   └── app_list_tile.dart
│       ├── loading/
│       │   ├── app_loading_indicator.dart
│       │   └── loading_widget.dart
│       ├── navigation/
│       │   └── app_drawer.dart
│       ├── search/
│       │   └── app_search_bar.dart
│       └── sheets/
│           └── app_bottom_sheet.dart
│
├── 🔥 Firebase Configuration
│   ├── firebase_options.dart
│   └── main.dart
```

#### 📂 Platform-Specific Code
```
├── 📱 Android
│   ├── app/
│   │   ├── google-services.json
│   │   └── src/
│   │       ├── debug/
│   │       ├── main/
│   │       └── profile/
│   └── gradle configuration files
│
├── 🍎 iOS
│   ├── Flutter/
│   ├── Runner/
│   ├── Runner.xcodeproj/
│   └── Runner.xcworkspace/
│
├── 🖥️ Web
│   ├── index.html
│   ├── manifest.json
│   └── icons/
│
├── 💻 Windows
│   ├── flutter/
│   └── runner/
│
├── 🐧 Linux
│   ├── flutter/
│   └── runner/
│
├── 🍎 macOS
│   ├── Flutter/
│   ├── Runner/
│   ├── Runner.xcodeproj/
│   └── Runner.xcworkspace/
```

#### 📂 Backend Functions (Firebase Functions)
```
functions/
├── 📄 Configuration
│   ├── .eslintrc.js
│   ├── eslint.config.js
│   ├── package.json
│   └── package-lock.json
│
├── 🔧 Main Function
│   └── index.js
│
└── 📦 node_modules/
```

#### 📂 Tests
```
test/
├── core/
│   ├── services/
│   │   └── security_service_test.dart
│   └── validators/
│       └── validators_test.dart
├── domain/
│   ├── entities/
│   │   ├── attendance_test.dart
│   │   ├── employee_test.dart
│   │   └── user_test.dart
│   └── usecases/
│       ├── attendance/
│       │   └── check_in_usecase_test.dart
│       ├── auth/
│       │   ├── login_usecase_test.dart
│       │   └── logout_usecase_test.dart
│       └── employee/
│           └── get_employees_usecase_test.dart
├── integration/
│   └── auth_flow_test.dart
├── presentation/
│   └── widgets/
│       └── buttons/
│           └── app_button_test.dart
├── README.md
├── test_config.dart
└── widget_test.dart
```

---

## Summary

### Tender Management System
- **Technology Stack**: TypeScript, Node.js, Docker, Kubernetes
- **Architecture**: Microservices with container orchestration
- **Key Features**: 
  - Tender discovery and management
  - EMD calculations
  - Security and authentication
  - Real-time notifications via WebSocket
  - Analytics and reporting
  - Multi-database support (MongoDB, PostgreSQL, Redis)

### Employee Management System
- **Technology Stack**: Flutter, Dart, Firebase
- **Architecture**: Clean Architecture (Domain-Driven Design)
- **Platforms**: iOS, Android, Web, Windows, Linux, macOS
- **Key Features**:
  - Employee attendance tracking
  - Real-time location tracking
  - Leave management
  - HR approvals
  - Organization hierarchy
  - Form builder
  - AI assistant integration
  - Analytics dashboard

Both systems demonstrate enterprise-level architecture with proper separation of concerns, comprehensive testing, and deployment configurations.
