# IntelliFlow Architecture

This document explains the IntelliFlow codebase from top to bottom: folder structure, frontend and backend responsibilities, how data moves between client and server, and where the workflow/task logic lives.


## 1. High-Level System
<img width="1240" height="690" alt="Architecture" src="https://github.com/user-attachments/assets/60c3a776-e979-40c2-9b7d-7c98bd4563ec" />


IntelliFlow is a full-stack workflow and task-management app.

The application has two main parts:

- `client/`: React + Vite frontend. It renders pages, stores auth state, calls API services, and shows workflow/task/analytics UI.
- `server/`: Express + MongoDB backend. It owns validation, authentication, authorization, database models, business logic, notifications, workflow movement, task assignment, and analytics aggregation.

The main request flow is:

1. A user opens a page in the React app.
2. React route renders the page through `client/src/routes/AppRoutes.jsx`.
3. Protected pages check auth through `AuthContext`, `ProtectedRoute`, and `RoleGuard`.
4. The page calls a frontend service in `client/src/services/*Service.js`.
5. The service calls the backend through `client/src/services/api.js`.
6. Express receives the request through `server/server.js`.
7. Express routes forward to validators, auth middleware, role middleware, and controllers.
8. Controllers call service functions.
9. Services use Mongoose models to read/write MongoDB.
10. The response travels back to the frontend service and updates page state.

## 2. Root Folder Structure

<img width="824" height="372" alt="image" src="https://github.com/user-attachments/assets/b3b7f4ef-0b7c-4206-a25a-86c9d9612a66" />


`README.md` contains general project setup notes. This file explains internals.

## 3. Backend Architecture

### 3.1 Backend Entry Point

`server/server.js`

- Loads environment variables with `dotenv`.
- Creates the Express app.
- Enables CORS, JSON parsing, and request logging through `morgan`.
- Connects MongoDB through `connectDB()`.
- Mounts all API route groups:
  - `/api/auth`
  - `/api/analytics`
  - `/api/users`
  - `/api/groups`
  - `/api/workflows`
  - `/api/tasks`
  - `/api/inbox`
- Adds `notFoundHandler` and `errorHandler`.
- Starts the server on `process.env.PORT || 5000`.

### 3.2 Backend Config
<img width="224" height="135" alt="image" src="https://github.com/user-attachments/assets/b73a1242-1594-4657-a537-6b3bc13fa7af" />

    
`server/config/db.js`

- Connects Mongoose to MongoDB.
- Used once from `server/server.js`.

`server/config/logger.js`

- Provides a logger used by controller/error flows.

### 3.3 Backend Models

<img width="274" height="220" alt="image" src="https://github.com/user-attachments/assets/b2f28317-d497-4cf9-9b87-fbb79cd0687b" />

-Models define MongoDB collections and database shape.

`server/models/Organization.js`

- Stores a company/workspace.
- Fields: `name`, `orgCode`, `isActive`.
- `orgCode` is unique and used during login/registration.

`server/models/User.js`

- Stores users inside an organization.
- Fields: `organizationId`, `name`, `email`, `password`, `authProvider`, `googleSubject`, `emailVerified`, `role`, `isActive`.
- Supports both password auth and Google-backed auth.
- Unique indexes:
  - one email per organization
  - one Google subject per organization when present

`server/models/Group.js`

- Stores a team.
- Fields: `organizationId`, `name`, `code`, `description`, `isActive`.
- `name` and `code` are unique inside an organization.

`server/models/GroupMembership.js`

- Joins users to groups.
- Fields: `organizationId`, `groupId`, `userId`, `roleInGroup`, `isActive`.
- `roleInGroup` is either `member` or `team_lead`.
- Used for task assignment, manual assignment permission, and team lead notifications.

`server/models/Workflow.js`

- Stores workflow definitions.
- Fields: `organizationId`, `name`, `stages`, `isActive`.
- Each stage has:
  - `name`
  - `order`
  - `groupId`
  - `assignmentType`: `auto` or `manual`
- A workflow is a template. Tasks are the running instances.

`server/models/Task.js`

- Stores active or completed work.
- Can be workflow-driven or standalone.
- Workflow fields:
  - `workflowId`
  - `stageName`
  - `stageOrder`
- Assignment fields:
  - `assignedGroupId`
  - `assignedTo`
- Work fields:
  - `title`
  - `description`
  - `status`
- Stage history:
  - `completedStages[]`
  - Each entry records stage name, assigned user/team, started/completed time, completed-by user, notes, and duration.
- Indexed by organization, assigned user, assigned group, and status.

`server/models/Notification.js`

- Stores inbox notifications.
- Fields: organization, task, recipient, type, message, read status.
- Created when tasks reach stages, are assigned, rejected, or completed.

`server/models/AuditLog.js`

- Stores audit events.
- Currently the model and service exist, and the frontend has an audit page/service, but no audit route is mounted in `server/server.js`.

### 3.4 Backend Middleware

<img width="254" height="180" alt="image" src="https://github.com/user-attachments/assets/e6060c3c-1b8e-4725-a0de-7d644ac7614a" />

`server/middleware/authMiddleware.js`

- Reads JWT from the `Authorization: Bearer <token>` header.
- Decodes user identity and attaches `req.user`.
- Required by protected backend routes.

`server/middleware/rbacMiddleware.js`

- Exposes role checks such as `authorizeRoles("admin")`.
- Blocks users without required roles.

`server/middleware/validateRequest.js`

- Generic validation middleware helper.

`server/middleware/errorHandler.js`

- Provides 404 and centralized error responses.
- Used at the end of `server/server.js`.

### 3.5 Backend Controller Pattern

<img width="200" height="253"  alt="image" src="https://github.com/user-attachments/assets/57eb0bf3-592d-400b-a812-9985cf7a0746" />


`server/controllers/controllerHandler.js`

- Wraps controller functions.
- Converts request data into service arguments.
- Calls the service.
- Sends success or error responses.

Most controllers are thin wrappers. The real business logic is in `server/services`.

Controller files:

- `server/controllers/authController.js`: auth and organization registration.
- `server/controllers/userController.js`: admin user CRUD and status updates.
- `server/controllers/groupController.js`: team and membership operations.
- `server/controllers/workflowController.js`: workflow CRUD.
- `server/controllers/taskController.js`: task CRUD and stage actions.
- `server/controllers/inboxController.js`: notification inbox.
- `server/controllers/analyticsController.js`: analytics dashboard summary.
- `server/controllers/controllerHandler.js`: reusable controller wrapper.

### 3.6 Backend Routes

<img width="200" height="253" alt="image" src="https://github.com/user-attachments/assets/94cdcfc3-d8f8-4f04-8c2a-63509faee6a8" />



-Routes define public API URLs.

`server/routes/authRoutes.js`

- `POST /api/auth/register-org`
- `POST /api/auth/register-org/google`
- `POST /api/auth/verify-org`
- `POST /api/auth/login`
- `POST /api/auth/login/google`

`server/routes/userRoutes.js`

- Admin-only user management.
- `POST /api/users`
- `GET /api/users`
- `PATCH /api/users/:userId`
- `PATCH /api/users/:userId/status`
- `DELETE /api/users/:userId`

`server/routes/groupRoutes.js`

- Team and membership management.
- `POST /api/groups`
- `GET /api/groups`
- `PATCH /api/groups/:groupId`
- `GET /api/groups/:groupId/members`
- `POST /api/groups/:groupId/members`
- `PATCH /api/groups/:groupId/members/:userId/role`
- `DELETE /api/groups/:groupId/members/:userId`
- `GET /api/groups/users/:userId`
- `POST /api/groups/:groupId/assign-task`

`server/routes/workflowRoutes.js`

- Workflow definition management.
- `POST /api/workflows`
- `GET /api/workflows`
- `GET /api/workflows/:workflowId`
- `PATCH /api/workflows/:workflowId`

`server/routes/taskRoutes.js`

- Task lifecycle.
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `POST /api/tasks/:taskId/complete-stage`
- `POST /api/tasks/:taskId/reject-stage`
- `DELETE /api/tasks/:taskId`

`server/routes/inboxRoutes.js`

- Notification inbox.
- `GET /api/inbox`
- `GET /api/inbox/unread-count`
- `PATCH /api/inbox/:notificationId/read`
- `PATCH /api/inbox/read-all`

`server/routes/analyticsRoutes.js`

- Admin analytics.
- `GET /api/analytics/summary`

### 3.7 Backend Validators

Validators sanitize and reject invalid inputs before controllers reach services.

<img width="265" height="290" alt="image" src="https://github.com/user-attachments/assets/02ba94f9-5fab-474d-b846-d78f161126ca" />





- `server/validators/authValidator.js`: organization registration/login/Google credential payloads.
- `server/validators/userValidator.js`: admin user create/update payloads.
- `server/validators/groupValidator.js`: team, membership, role, and task-assignment payloads.
- `server/validators/workflowValidator.js`: workflow names, stages, group IDs, and workflow IDs.
- `server/validators/taskValidator.js`: task create/update/query/stage-action payloads.
- `server/validators/inboxValidator.js`: inbox query and notification ID validation.
- `server/validators/analyticsValidator.js`: lookback-days query validation.
- `server/validators/validatorHelpers.js`: shared string/ObjectId normalization helpers.

### 3.8 Backend Constants
<img width="190" height="160" alt="image" src="https://github.com/user-attachments/assets/f152030c-995d-4ca7-bb39-fc5f93e7c46f" />

- `server/constants/roles.js`: system role constants.
- `server/constants/permissions.js`: permission names.
- `server/constants/taskStatus.js`: task statuses and active-status list.
- `server/constants/auditActions.js`: allowed audit actions.

### 3.9 Backend Utilities
<img width="190" height="160" alt="image" src="https://github.com/user-attachments/assets/5801e135-166d-495e-9e57-f47cbbe38d57" />

`server/utils/responseHandler.js`

- Sends success, created, error, and paginated responses.

`server/utils/systemRole.js`

- Normalizes system roles to known values.

`server/utils/helpers.js`

- Shared general helpers.

### 3.10 Backend Services

<img width="220" height="305" alt="image" src="https://github.com/user-attachments/assets/045d7bfd-6818-467a-994c-b25f541c36c5" />

Services contain the application logic.

`server/services/serviceHelpers.js`

- Creates service errors.
- Ensures entities belong to the current organization.
- Selects the least-loaded active group member for workload balancing.

`server/services/authService.js`

- Registers organizations and admin users.
- Supports password registration/login.
- Supports Google registration/login through `googleAuthService.js`.
- Generates JWTs containing user ID, organization ID, and role.

`server/services/googleAuthService.js`

- Verifies Google Identity Services credentials.
- Checks issuer, audience, expiry, and verified email.
- Depends on `GOOGLE_CLIENT_ID`.

`server/services/userService.js`

- Creates users under an organization.
- Lists users without passwords.
- Updates user details, password, role, and active status.
- Prevents admins from deleting/deactivating/changing their own role.

`server/services/groupService.js`

- Creates and updates teams.
- Adds/removes members.
- Updates team roles.
- Lists group members and user groups.
- Assigns a task to the least-loaded active member in a team.

`server/services/workflowService.js`

- Creates workflow definitions.
- Validates stage order is sequential.
- Validates all stage groups exist in the organization.
- Normalizes stage order and assignment type.
- Reads workflows and attaches task stats:
  - total tasks
  - active tasks
  - completed tasks
  - average cycle days
- Updates workflow name, stages, and active state.

`server/services/taskService.helpers.js`

- Checks whether a user can manually assign a task.
- Checks whether a user/admin can complete/reject the current stage.
- Resolves the current workflow stage from `stageName` or `stageOrder`.
- Resolves the next assignee:
  - manual stage with preferred user: use preferred user after membership validation
  - otherwise: use least-loaded member
- Sends notifications when a task reaches a team stage.

`server/services/taskService.js`

- Creates tasks.
- Lists tasks.
- Reads a task by ID with populated workflow/team/user/stage history.
- Updates task fields and assignment.
- Completes workflow stages.
- Rejects workflow stages back to the previous stage.
- Deletes tasks.
- Records stage completion history for analytics.

`server/services/notificationService.js`

- Creates notification documents for specific users or all members of a group.
- Used by task assignment and stage movement.

`server/services/inboxService.js`

- Lists notifications for the logged-in user.
- Counts unread notifications.
- Marks one or all notifications as read.

`server/services/analyticsService.js`

- Builds the analytics dashboard payload.
- Counts tasks by status, stage, and workflow.
- Counts active workflows/groups/users.
- Builds time series:
  - tasks created over time
  - task completion/cycle-time series
- Builds bottleneck-stage data from time spent in stages.
- Builds team and employee performance from completed stage history and active task ownership.

`server/services/getAnalyticsSummaryService.js`

- Older/alternate analytics summary implementation.
- It is not imported by `analyticsController.js`; the active file is `server/services/analyticsService.js`.

`server/services/auditService.js`

- Creates and reads audit logs.
- The server currently has no mounted audit route, so this service is not reachable unless a route is added.

`server/services/orgService.js`

- Organization-related helper/service area.

## 4. Frontend Architecture


### 4.1 Frontend Entry

`client/src/main.jsx`

- React entry point.
- Mounts `<App />` into `#root`.
- Imports `index.css`.

`client/src/App.jsx`

- Wraps the app in:
  - `AuthProvider`
  - `ThemeProvider`
  - `OrgProvider`
- Renders `AppRoutes`.

`client/index.html`

- Vite HTML shell.

`client/vite.config.js`

- Vite build/dev-server config.

`client/tailwind.config.cjs`

- Tailwind configuration.

`client/postcss.config.cjs`

- PostCSS/Tailwind pipeline config.

`client/eslint.config.js`

- Frontend lint configuration.

`client/vercel.json`

- Deployment routing/config for Vercel.

### 4.2 Frontend Styling

`client/src/index.css`

- Imports Google fonts.
- Loads Tailwind base/components/utilities.
- Defines app background and global body styles.

`client/src/App.css`

- Contains Vite starter CSS. Not central to current app layout.

### 4.3 Frontend Contexts
<img width="235" height="160" alt="image" src="https://github.com/user-attachments/assets/640b4cd3-eabb-4f1d-8db3-799e604420ad" />

`client/src/context/AuthContext.jsx`

- Source of truth for auth in the browser.
- Reads/writes `token` and `user` in `localStorage`.
- Exposes `login`, `logout`, `isAuthenticated`, `token`, and `user`.
- Dispatches/listens to `auth:changed`.

`client/src/context/ThemeContext.jsx`

- Stores theme-related state used by components such as `Loader`.

`client/src/context/OrgContext.jsx`

- Stores organization-related context for the frontend.

### 4.4 Frontend Hooks
<img width="225" height="150" alt="image" src="https://github.com/user-attachments/assets/a059c54e-f64a-4975-aae7-6c825b537504" />


`client/src/hooks/useAuth.js`

- Convenience wrapper around `AuthContext`.

`client/src/hooks/useRole.js`

- Reads the logged-in user's role and exposes booleans such as admin status.

`client/src/hooks/useFetch.js`

- Generic fetch-state helper.

### 4.5 Frontend Routing

`client/src/routes/AppRoutes.jsx`

- Defines all browser routes.
- Public routes:
  - `/`
  - `/login`
  - `/register`
- Protected routes inside `MainLayout`:
  - `/dashboard`
  - `/inbox`
  - `/workflows`
  - `/workflows/create`
  - `/workflows/:workflowId`
  - `/tasks`
  - `/tasks/create`
  - `/tasks/:taskId`
  - `/analytics`
  - `/users`
  - `/groups`
  - `/teams`
  - `/audit`
- Uses `ProtectedRoute` for logged-in users.
- Uses `RoleGuard` for admin/user role access.

### 4.6 Frontend Layouts

`client/src/layouts/MainLayout.jsx`

- Main authenticated shell.
- Renders background layers, `Sidebar`, mobile `Navbar`, and page `<Outlet />`.

`client/src/layouts/AuthLayout.jsx`

- Shared auth-page layout.

### 4.7 Frontend Common Components
<img width="220" height="305" alt="image" src="https://github.com/user-attachments/assets/ba94c4ba-6e45-4b55-99f7-17ac80e7776c" />

`client/src/components/common/Sidebar.jsx`

- Left navigation for authenticated pages.
- Contains links to dashboard, workflows, tasks, analytics, users, groups/teams, inbox, audit, etc.

`client/src/components/common/Navbar.jsx`

- Mobile/top navigation.
- Shows current section labels and sidebar toggle.

`client/src/components/common/ProtectedRoute.jsx`

- Redirects unauthenticated users to `/login`.

`client/src/components/common/RoleGuard.jsx`

- Redirects users whose role is not allowed.

`client/src/components/common/Loader.jsx`

- Reusable loading indicator.

`client/src/components/common/Modal.jsx`

- Reusable modal shell.

`client/src/components/common/Pagination.jsx`

- Shared pagination UI.

`client/src/components/common/ToggleButton.jsx`

- Reusable toggle control.

### 4.8 Frontend Service Layer
<img width="220" height="310" alt="image" src="https://github.com/user-attachments/assets/67250ea6-7ee0-4e78-b5e3-71fd0c9e1131" />

All frontend services use `client/src/services/api.js`.

`client/src/services/api.js`

- Axios instance.
- Base URL is `VITE_API_URL` or `http://localhost:5000/api`.
- Adds `Authorization: Bearer <token>` from `localStorage`.

Service files:

- `client/src/services/authService.js`: auth API calls.
- `client/src/services/userService.js`: user-management API calls.
- `client/src/services/groupService.js`: group/team/membership/task-balancing API calls.
- `client/src/services/workflowService.js`: workflow API calls.
- `client/src/services/taskService.js`: task API calls.
- `client/src/services/analyticsService.js`: analytics summary API call and response normalization.
- `client/src/services/notificationService.js`: inbox update event and notification helpers.
- `client/src/services/inboxService.js`: inbox API calls.
- `client/src/services/auditService.js`: audit API calls.

### 4.9 Frontend Utilities
<img width="210" height="170" alt="image" src="https://github.com/user-attachments/assets/a3393456-b599-452e-9e9c-8de26341695b" />

`client/src/utils/constants.js`

- Shared frontend options such as task statuses.

`client/src/utils/formatDate.js`

- Date/time/duration formatting helpers.

`client/src/utils/validators.js`

- Frontend validation helpers.

## 5. Page-by-Page Frontend Flow

### 5.1 Home

`client/src/pages/home/Home.jsx`

- Public landing page.
- Uses assets in `client/src/pages/home/image.png` and `img.png`.

### 5.2 Auth Pages

`client/src/pages/auth/Login.jsx`

- Login page.
- Verifies organization first.
- Supports password login and Google login.
- Calls `authService.verifyOrganization`, `authService.loginUser`, and `authService.loginUserWithGoogle`.
- On success stores token/user through `AuthContext.login`.

`client/src/pages/auth/Register.jsx`

- Organization registration page.
- Supports password admin registration and Google admin registration.
- Calls `authService.registerOrganization` and `authService.registerOrganizationWithGoogle`.

`client/src/components/auth/GoogleSignInButton.jsx`

- Renders Google Identity Services sign-in.
- Uses `VITE_GOOGLE_CLIENT_ID`.
- Sends Google credential to frontend callback, which then calls backend auth service.

### 5.3 Dashboard

`client/src/pages/dashboard/Dashboard.jsx`

- Main authenticated landing/dashboard screen.

### 5.4 Workflows

`client/src/pages/workflows/WorkflowList.jsx`

- Lists workflows and workflow stats.
- Loads workflows and groups.
- Lets admin create/edit workflows.
- Shows workflow structure, stage cards, total tasks, active tasks, completed tasks, and average cycle.

`client/src/pages/workflows/WorkflowCreate.jsx`

- Admin workflow creation page.
- Loads groups.
- Uses `WorkflowForm`.
- Submits to `workflowService.createWorkflow`.

`client/src/pages/workflows/WorkflowDetails.jsx`

- Admin workflow edit page.
- Loads workflow by ID and groups.
- Uses `WorkflowForm`.
- Submits to `workflowService.updateWorkflow`.

`client/src/components/workflows/WorkflowForm.jsx`

- Shared create/edit form.
- Keeps local workflow name, active state, and stages.
- Builds normalized stage payload with sequential order.

`client/src/components/workflows/WorkflowStageEditor.jsx`

- Lets users add/remove/reorder-by-position stages.
- Each stage selects:
  - stage name
  - team/group
  - assignment type (`auto` or `manual`)

`client/src/components/workflows/WorkflowCard.jsx`

- Reusable workflow summary card.

### 5.5 Tasks

`client/src/pages/tasks/TaskList.jsx`

- Lists tasks.
- Supports status filtering.
- Admins can quick-update status.
- If an admin selects `done` for a workflow task, the frontend calls `completeTaskStage` so the task advances stages rather than only changing status.
- Passes current user ID to `TaskTable` so current-stage tasks can be highlighted.

`client/src/pages/tasks/TaskCreate.jsx`

- Creates workflow-driven or standalone tasks.
- Workflow mode:
  - user selects a workflow
  - first stage is inferred from the workflow
  - if first stage is manual, user may choose initial assignee
  - otherwise backend auto-assigns least-loaded member
- Standalone mode:
  - admin may select a team
  - task has no workflow lifecycle

`client/src/pages/tasks/TaskDetails.jsx`

- Detailed task page.
- Loads task, workflows, groups, and users/members.
- Admin can edit task fields, mode, workflow, stage, assignee, and status.
- Shows stage action panel and timeline.
- Allows stage completion, rejection, and team load balancing.
- Stage completion calls `taskService.completeTaskStage`.
- Stage rejection calls `taskService.rejectTaskStage`.
- Team load balancing calls `groupService.assignTaskToGroup`.

`client/src/components/tasks/TaskTable.jsx`

- Card grid for tasks.
- Shows title, status, workflow, stage, team, and assignee.
- Highlights cards where the logged-in user is the current assignee.

`client/src/components/tasks/TaskStageButtons.jsx`

- Stage action panel.
- Shows current stage, next stage, previous reject target, stage notes, and optional next-assignee selector.
- Enables completion/rejection only when allowed by page state.

`client/src/components/tasks/TaskTimeline.jsx`

- Displays workflow stages as completed/current/upcoming.
- Reads `task.completedStages`.

`client/src/components/tasks/TaskFilters.jsx`

- Shared task filtering UI.

### 5.6 Analytics

`client/src/pages/analytics/AnalyticsDashboard.jsx`

- Admin-only analytics dashboard.
- Calls `analyticsService.fetchAnalyticsDashboard`.
- Displays:
  - KPI stat cards
  - tasks created over time
  - average cycle time
  - task status chart
  - workflow mix
  - bottleneck stages
  - workflow status cards
  - team performance
  - employee performance

`client/src/components/charts/BarChart.jsx`

- Reusable bar-chart component.

`client/src/components/charts/LineChart.jsx`

- Reusable line-chart component.

`client/src/components/charts/PieChart.jsx`

- Reusable pie/donut chart component.

### 5.7 Organization/Admin Pages

`client/src/pages/org/UserManagement.jsx`

- Admin user CRUD.
- Creates users, edits users, deletes users, toggles active state.
- Supports password field for created users.

`client/src/pages/org/GroupManagement.jsx`

- Team/group management page.
- Works with groups and memberships.

`client/src/pages/org/GroupManagementModals.jsx`

- Modal components used by group management.

`client/src/pages/org/TeamManagement.jsx`

- Team-focused management view.

### 5.8 Inbox

`client/src/pages/inbox/Inbox.jsx`

- Shows notifications for logged-in user.
- Lets user mark notifications read.

### 5.9 Audit

`client/src/pages/audit/AuditLogs.jsx`

- UI for audit logs.
- Calls `auditService.fetchAuditLogs`.
- Backend audit model/service exist, but no audit route is currently mounted in `server/server.js`, so this page needs backend route wiring to fully work.

`client/src/components/audit/AuditTable.jsx`

- Displays audit log rows.

## 6. Workflow Logic: End-to-End

A workflow is a reusable ordered process. It does not itself move. Tasks move through workflow stages.

### 6.1 Workflow Creation

Frontend:

1. Admin opens `/workflows/create`.
2. `WorkflowCreate.jsx` loads teams through `groupService.fetchGroups`.
3. `WorkflowForm.jsx` collects workflow name, active state, and stage list.
4. `WorkflowStageEditor.jsx` collects each stage name, team, and assignment type.
5. `workflowService.createWorkflow` sends payload to `POST /api/workflows`.

Backend:

1. `workflowRoutes.js` protects route for admin.
2. `workflowValidator.js` validates payload.
3. `workflowController.js` calls `createWorkflowService`.
4. `workflowService.js` checks duplicate workflow name.
5. It checks stage order is sequential.
6. It checks each stage group exists.
7. It stores workflow in `Workflow`.

### 6.2 Workflow Display

Frontend:

1. `/workflows` renders `WorkflowList.jsx`.
2. It calls `workflowService.fetchWorkflows(true)` and `groupService.fetchGroups`.
3. The backend returns workflows enriched with task stats.
4. The page shows workflow picker, overview, stages, health, and task counts.

Backend:

1. `getWorkflowsService` queries workflows for the organization.
2. `attachTaskStats` aggregates tasks for each workflow.
3. Response includes extra fields like `totalTasks`, `activeTasks`, `completedTasks`, `avgCycleDays`.

## 7. Task Logic: End-to-End

Tasks can be:

- Workflow tasks: attached to a workflow and current stage.
- Standalone tasks: no workflow, optionally assigned to a team/user.

### 7.1 Workflow Task Creation

Frontend:

1. User opens `/tasks/create`.
2. `TaskCreate.jsx` loads active workflows.
3. User selects workflow.
4. First workflow stage is derived on the client for display.
5. If the first stage is manual, client can show assignee dropdown from that stage's group.
6. `taskService.createTask` posts to `/api/tasks`.

Backend:

1. `taskRoutes.js` validates and protects route.
2. `taskController.js` calls `createTaskService`.
3. `createTaskService` loads workflow.
4. `resolveWorkflowStage` picks provided stage or first stage.
5. Task stores workflow ID, stage name/order, and stage group.
6. Assignment:
   - if `assignedTo` is provided, validate user and membership.
   - if not provided, call `resolveStageAssignee`.
   - `resolveStageAssignee` uses preferred manual user or least-loaded member.
7. Task is created.
8. Notifications are sent to assignee and team leads.

### 7.2 Standalone Task Creation

Frontend:

1. User chooses standalone mode in `TaskCreate.jsx`.
2. User enters title/description and optional team.
3. `taskService.createTask` posts no workflow ID.

Backend:

1. If `assignedGroupId` exists, backend validates group.
2. If no assignee is provided, backend chooses least-loaded active group member.
3. Task is stored with `workflowId: null`.

### 7.3 Completing a Stage

Frontend:

1. User opens `/tasks/:taskId`.
2. `TaskDetails.jsx` loads task with workflow stages and completed history.
3. `TaskStageButtons.jsx` shows current stage and next stage.
4. User/admin clicks "Mark Stage Complete".
5. `taskService.completeTaskStage` posts to `/api/tasks/:taskId/complete-stage`.

Backend:

1. `completeTaskStageService` ensures task is workflow-driven and not done.
2. Loads workflow and resolves current stage.
3. Checks permission:
   - admin can complete
   - otherwise current assignee can complete
4. Adds a `completedStages` entry:
   - current stage
   - assigned user/team
   - completed-by user
   - timestamps
   - duration
   - notes
5. If there is no next stage:
   - task status becomes `done`
   - admins are notified
6. If there is a next stage:
   - task stage name/order move to next stage
   - task group changes to next stage group
   - next assignee is resolved
   - status becomes `in_progress`
   - assignee and team leads are notified

### 7.4 Rejecting a Stage

Frontend:

1. User/admin clicks "Mark Stage Rejected" in `TaskStageButtons`.
2. Client calls `taskService.rejectTaskStage`.

Backend:

1. `rejectTaskStageService` validates workflow task.
2. Resolves current and previous stage.
3. Requires admin or current assignee.
4. Moves task back to previous stage.
5. Reassigns based on previous stage.
6. Removes completed stage entries at or after the target stage.
7. Sends notification if notes are supplied.

### 7.5 Admin Status Update From Task List

Frontend:

1. Admin changes a task status in `TaskTable`.
2. `TaskList.jsx` handles quick status update.
3. If selected status is `done` and the task is workflow-driven, it calls `completeTaskStage`.
4. Otherwise it calls `updateTask`.

Backend:

- Generic update goes through `updateTaskService`.
- Workflow `done` status also records stage completion and advances to the next stage when applicable.

### 7.6 Team Load Balancing

Frontend:

1. In `TaskDetails.jsx`, admins/team leads can rebalance current team tasks.
2. Client calls `groupService.assignTaskToGroup`.

Backend:

1. `assignTaskToGroupService` verifies admin or team lead.
2. Ensures task belongs to that team.
3. Calls `selectLeastLoadedMemberService`.
4. Sets task assignee to least-loaded active member.

## 8. Analytics Logic

Frontend:

1. `/analytics` renders `AnalyticsDashboard.jsx`.
2. It calls `analyticsService.fetchAnalyticsDashboard`.
3. The service calls `GET /api/analytics/summary`.
4. It normalizes response values to safe arrays/numbers.
5. The page renders charts and tables.

Backend:

1. `analyticsRoutes.js` allows admins only.
2. `analyticsController.js` calls `getAnalyticsSummaryService` from `analyticsService.js`.
3. Service aggregates:
   - total tasks
   - active tasks
   - active workflows/groups/users
   - unread notifications
   - tasks by status
   - stage load
   - workflow mix
   - workflow status cards
   - task-created series
   - task-completed/cycle-time series
   - bottleneck stages
   - team performance
   - employee performance
4. Employee/team metrics use `Task.completedStages` and current assignment.

## 9. Client-Server Connection

The connection layer is:

```text
React page
  -> client/src/services/<domain>Service.js
    -> client/src/services/api.js
      -> HTTP request to VITE_API_URL or http://localhost:5000/api
        -> server/server.js route mount
          -> route middleware
            -> validator
              -> controller
                -> service
                  -> Mongoose model
```

Authentication:

1. Login/register response includes `token` and `user`.
2. `AuthContext.login` stores both in `localStorage`.
3. `api.js` adds token to every request.
4. Backend `protect` middleware validates JWT and sets `req.user`.
5. Role middleware checks `req.user.role`.

## 10. Complete File Inventory

### Root

- `README.md`: setup/project notes.
- `architechture.md`: this architecture guide.

### Server Files

- `server/package.json`: backend dependencies and scripts.
- `server/package-lock.json`: locked backend dependency versions.
- `server/server.js`: Express app entry, route mounting, DB connection.
- `server/config/db.js`: MongoDB connection.
- `server/config/logger.js`: logging utility.

Models:

- `server/models/Organization.js`: organization schema.
- `server/models/User.js`: user/auth schema.
- `server/models/Group.js`: team schema.
- `server/models/GroupMembership.js`: team membership schema.
- `server/models/Workflow.js`: workflow/stage schema.
- `server/models/Task.js`: task/stage-history schema.
- `server/models/Notification.js`: inbox notification schema.
- `server/models/AuditLog.js`: audit log schema.

Middleware:

- `server/middleware/authMiddleware.js`: JWT protection.
- `server/middleware/rbacMiddleware.js`: role authorization.
- `server/middleware/validateRequest.js`: validation middleware helper.
- `server/middleware/errorHandler.js`: 404/error handling.

Routes:

- `server/routes/authRoutes.js`: auth endpoints.
- `server/routes/userRoutes.js`: user admin endpoints.
- `server/routes/groupRoutes.js`: team/member endpoints.
- `server/routes/workflowRoutes.js`: workflow endpoints.
- `server/routes/taskRoutes.js`: task endpoints.
- `server/routes/inboxRoutes.js`: inbox endpoints.
- `server/routes/analyticsRoutes.js`: analytics endpoint.

Controllers:

- `server/controllers/controllerHandler.js`: controller wrapper.
- `server/controllers/authController.js`: auth controller.
- `server/controllers/userController.js`: user controller.
- `server/controllers/groupController.js`: group controller.
- `server/controllers/workflowController.js`: workflow controller.
- `server/controllers/taskController.js`: task controller.
- `server/controllers/inboxController.js`: inbox controller.
- `server/controllers/analyticsController.js`: analytics controller.

Services:

- `server/services/serviceHelpers.js`: shared service helpers.
- `server/services/authService.js`: auth and token logic.
- `server/services/googleAuthService.js`: Google credential verification.
- `server/services/userService.js`: user CRUD/status logic.
- `server/services/groupService.js`: group/member/load-balancing logic.
- `server/services/workflowService.js`: workflow create/read/update and stats.
- `server/services/taskService.helpers.js`: task-stage helper logic.
- `server/services/taskService.js`: task lifecycle logic.
- `server/services/notificationService.js`: notification creation.
- `server/services/inboxService.js`: inbox read/unread logic.
- `server/services/analyticsService.js`: active analytics implementation.
- `server/services/getAnalyticsSummaryService.js`: older duplicate analytics implementation, not currently imported.
- `server/services/auditService.js`: audit service, currently not route-mounted.
- `server/services/orgService.js`: organization service area.

Validators:

- `server/validators/validatorHelpers.js`: validation helpers.
- `server/validators/authValidator.js`: auth validation.
- `server/validators/userValidator.js`: user validation.
- `server/validators/groupValidator.js`: group validation.
- `server/validators/workflowValidator.js`: workflow validation.
- `server/validators/taskValidator.js`: task validation.
- `server/validators/inboxValidator.js`: inbox validation.
- `server/validators/analyticsValidator.js`: analytics query validation.

Constants:

- `server/constants/roles.js`: role constants.
- `server/constants/permissions.js`: permission constants.
- `server/constants/taskStatus.js`: task status constants.
- `server/constants/auditActions.js`: audit action constants.

Utils:

- `server/utils/responseHandler.js`: response helpers.
- `server/utils/systemRole.js`: role normalization.
- `server/utils/helpers.js`: general helpers.

### Client Files

- `client/package.json`: frontend dependencies and scripts.
- `client/package-lock.json`: locked frontend dependency versions.
- `client/index.html`: Vite HTML entry.
- `client/vite.config.js`: Vite config.
- `client/vercel.json`: Vercel config.
- `client/tailwind.config.cjs`: Tailwind config.
- `client/postcss.config.cjs`: PostCSS config.
- `client/eslint.config.js`: ESLint config.
- `client/README.md`: Vite/client notes.

Public/static:

- `client/public/vite.svg`: default Vite asset.
- `client/public/img.png`: public image asset.
- `client/public/image.png`: public image asset.
- `client/src/assets/logo.png`: app logo asset.
- `client/src/pages/home/img.png`: homepage image asset.
- `client/src/pages/home/image.png`: homepage/logo image asset used by branding.

Entry/layout/routing:

- `client/src/main.jsx`: React mount.
- `client/src/App.jsx`: provider composition.
- `client/src/index.css`: global styles/Tailwind.
- `client/src/App.css`: legacy starter CSS.
- `client/src/routes/AppRoutes.jsx`: route table.
- `client/src/layouts/MainLayout.jsx`: protected app layout.
- `client/src/layouts/AuthLayout.jsx`: auth layout.

Context/hooks:

- `client/src/context/AuthContext.jsx`: auth state.
- `client/src/context/ThemeContext.jsx`: theme state.
- `client/src/context/OrgContext.jsx`: organization state.
- `client/src/hooks/useAuth.js`: auth hook.
- `client/src/hooks/useRole.js`: role hook.
- `client/src/hooks/useFetch.js`: fetch hook.

Services:

- `client/src/services/api.js`: Axios instance and auth header.
- `client/src/services/authService.js`: auth API.
- `client/src/services/userService.js`: user API.
- `client/src/services/groupService.js`: group/team API.
- `client/src/services/workflowService.js`: workflow API.
- `client/src/services/taskService.js`: task API.
- `client/src/services/analyticsService.js`: analytics API normalization.
- `client/src/services/notificationService.js`: inbox event helpers.
- `client/src/services/inboxService.js`: inbox API.
- `client/src/services/auditService.js`: audit API.

Utils:

- `client/src/utils/constants.js`: frontend constants/options.
- `client/src/utils/formatDate.js`: formatting helpers.
- `client/src/utils/validators.js`: frontend validators.

Common components:

- `client/src/components/common/Sidebar.jsx`: side navigation.
- `client/src/components/common/Navbar.jsx`: mobile/top nav.
- `client/src/components/common/ProtectedRoute.jsx`: auth guard.
- `client/src/components/common/RoleGuard.jsx`: role guard.
- `client/src/components/common/Loader.jsx`: loading UI.
- `client/src/components/common/Modal.jsx`: modal shell.
- `client/src/components/common/Pagination.jsx`: pagination UI.
- `client/src/components/common/ToggleButton.jsx`: toggle UI.

Auth components/pages:

- `client/src/pages/auth/Login.jsx`: login flow.
- `client/src/pages/auth/Register.jsx`: registration flow.
- `client/src/components/auth/GoogleSignInButton.jsx`: Google sign-in button.

Home/dashboard:

- `client/src/pages/home/Home.jsx`: public home page.
- `client/src/pages/dashboard/Dashboard.jsx`: protected dashboard.

Workflow files:

- `client/src/pages/workflows/WorkflowList.jsx`: workflow listing/overview.
- `client/src/pages/workflows/WorkflowCreate.jsx`: workflow create page.
- `client/src/pages/workflows/WorkflowDetails.jsx`: workflow edit page.
- `client/src/components/workflows/WorkflowForm.jsx`: workflow form.
- `client/src/components/workflows/WorkflowStageEditor.jsx`: stage editor.
- `client/src/components/workflows/WorkflowCard.jsx`: workflow card.

Task files:

- `client/src/pages/tasks/TaskList.jsx`: task list.
- `client/src/pages/tasks/TaskCreate.jsx`: task creation.
- `client/src/pages/tasks/TaskDetails.jsx`: task details/edit/stage action.
- `client/src/components/tasks/TaskTable.jsx`: task card grid.
- `client/src/components/tasks/TaskStageButtons.jsx`: stage action controls.
- `client/src/components/tasks/TaskTimeline.jsx`: stage timeline.
- `client/src/components/tasks/TaskFilters.jsx`: task filters.

Organization files:

- `client/src/pages/org/UserManagement.jsx`: admin user management.
- `client/src/pages/org/GroupManagement.jsx`: group/team management.
- `client/src/pages/org/GroupManagementModals.jsx`: group modal UI.
- `client/src/pages/org/TeamManagement.jsx`: team management.

Analytics/chart files:

- `client/src/pages/analytics/AnalyticsDashboard.jsx`: analytics page.
- `client/src/components/charts/BarChart.jsx`: bar chart.
- `client/src/components/charts/LineChart.jsx`: line chart.
- `client/src/components/charts/PieChart.jsx`: pie chart.

Inbox/audit:

- `client/src/pages/inbox/Inbox.jsx`: notification inbox.
- `client/src/pages/audit/AuditLogs.jsx`: audit page.
- `client/src/components/audit/AuditTable.jsx`: audit table.

## 11. Where To Change Common Things

Change auth behavior:

- Frontend: `client/src/pages/auth/Login.jsx`, `Register.jsx`, `GoogleSignInButton.jsx`, `services/authService.js`.
- Backend: `server/routes/authRoutes.js`, `authController.js`, `authService.js`, `googleAuthService.js`, `authValidator.js`, `User.js`.

Change workflow creation/stages:

- Frontend: `WorkflowCreate.jsx`, `WorkflowDetails.jsx`, `WorkflowForm.jsx`, `WorkflowStageEditor.jsx`.
- Backend: `workflowRoutes.js`, `workflowController.js`, `workflowService.js`, `workflowValidator.js`, `Workflow.js`.

Change task movement:

- Frontend: `TaskDetails.jsx`, `TaskStageButtons.jsx`, `TaskTimeline.jsx`, `TaskList.jsx`.
- Backend: `taskRoutes.js`, `taskController.js`, `taskService.js`, `taskService.helpers.js`, `Task.js`.

Change assignment/load balancing:

- Frontend: `TaskCreate.jsx`, `TaskDetails.jsx`, `groupService.js`.
- Backend: `groupService.js`, `serviceHelpers.js`, `taskService.helpers.js`.

Change analytics:

- Frontend: `AnalyticsDashboard.jsx`, `analyticsService.js`, chart components.
- Backend: `analyticsRoutes.js`, `analyticsController.js`, `analyticsService.js`, `Task.js`.

Change notifications/inbox:

- Frontend: `Inbox.jsx`, `notificationService.js`, `inboxService.js`.
- Backend: `notificationService.js`, `inboxService.js`, `Notification.js`, task services that emit notifications.

Change navigation:

- `client/src/routes/AppRoutes.jsx`
- `client/src/components/common/Sidebar.jsx`
- `client/src/components/common/Navbar.jsx`

## 12. Important Current Notes

- The active analytics service is `server/services/analyticsService.js`.
- `server/services/getAnalyticsSummaryService.js` appears to be an older duplicate and is not currently imported by the analytics controller.
- The frontend audit page exists, and audit model/service exist, but no audit route is mounted in `server/server.js`.
- Frontend API calls require the backend running on `VITE_API_URL` or `http://localhost:5000/api`.
- Google auth requires matching client/server env values:
  - client: `VITE_GOOGLE_CLIENT_ID`
  - server: `GOOGLE_CLIENT_ID`
- Backend auth also requires `JWT_SECRET` and MongoDB config.
