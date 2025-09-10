# Tasks: Photo Album Organizer

**Input**: Design documents from `/specs/001-build-an-application/`
**Prerequisites**: plan.md (required), spec.md, data-model.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Vite, vanilla JS, SQLite
   → Structure: Web application (frontend/)
2. Load design documents:
   → data-model.md: Photo, Album, Metadata entities
   → Internal contracts for local app
3. Generate tasks by category:
   → Setup: Vite project, SQLite, dependencies
   → Tests: Integration tests for user stories
   → Core: Models, services, UI components
   → Integration: Database, drag-drop, file handling
   → Polish: Performance, docs, validation
4. Apply task rules:
   → Different files = [P] for parallel
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T030)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- Web app structure: `frontend/src/`, `frontend/tests/`, `db/`

## Phase 3.1: Setup
- [ ] T001 Create project structure with frontend/, db/ directories
- [ ] T002 Initialize Vite project with vanilla JS in frontend/
- [ ] T003 [P] Install better-sqlite3 and configure for browser use
- [ ] T004 [P] Set up Vitest for testing framework
- [ ] T005 [P] Configure ESLint and Prettier

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Integration test for photo loading in frontend/tests/integration/test_photo_loading.js
- [ ] T007 [P] Integration test for album creation in frontend/tests/integration/test_album_creation.js
- [ ] T008 [P] Integration test for drag-drop reordering in frontend/tests/integration/test_drag_drop.js
- [ ] T009 [P] Integration test for photo tile display in frontend/tests/integration/test_photo_tiles.js
- [ ] T010 [P] E2E test for complete user flow in frontend/tests/e2e/test_user_flow.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
### Database Layer
- [ ] T011 Create SQLite schema in db/schema.sql
- [ ] T012 [P] Photo model in frontend/src/models/Photo.js
- [ ] T013 [P] Album model in frontend/src/models/Album.js
- [ ] T014 [P] Metadata model in frontend/src/models/Metadata.js

### Service Layer
- [ ] T015 [P] DatabaseManager service in frontend/src/services/DatabaseManager.js
- [ ] T016 [P] PhotoManager service in frontend/src/services/PhotoManager.js
- [ ] T017 [P] AlbumOrganizer service in frontend/src/services/AlbumOrganizer.js
- [ ] T018 [P] DragHandler service in frontend/src/services/DragHandler.js

### UI Components
- [ ] T019 MainPage component in frontend/src/pages/MainPage.js
- [ ] T020 AlbumGrid component in frontend/src/components/AlbumGrid.js
- [ ] T021 [P] PhotoTile component in frontend/src/components/PhotoTile.js
- [ ] T022 [P] DragHandle component in frontend/src/components/DragHandle.js
- [ ] T023 AlbumView page in frontend/src/pages/AlbumView.js

## Phase 3.4: Integration
- [ ] T024 Wire File System API for photo selection
- [ ] T025 Connect services to UI components
- [ ] T026 Implement drag-drop event handlers
- [ ] T027 Add photo metadata extraction (EXIF)
- [ ] T028 Implement album persistence to SQLite

## Phase 3.5: Polish
- [ ] T029 [P] Add CSS styling in frontend/src/styles/main.css
- [ ] T030 [P] Performance optimization for large photo sets
- [ ] T031 [P] Create user documentation in docs/user-guide.md
- [ ] T032 Run quickstart validation
- [ ] T033 Browser compatibility testing

## Dependencies
- Setup (T001-T005) blocks all other tasks
- Tests (T006-T010) before implementation (T011-T023)
- Database schema (T011) blocks models (T012-T014)
- Models block services (T015-T018)
- Services block UI components (T019-T023)
- UI components block integration (T024-T028)
- All implementation before polish (T029-T033)

## Parallel Example
```bash
# Launch T006-T010 together (all test files):
Task: "Integration test for photo loading in frontend/tests/integration/test_photo_loading.js"
Task: "Integration test for album creation in frontend/tests/integration/test_album_creation.js"
Task: "Integration test for drag-drop reordering in frontend/tests/integration/test_drag_drop.js"
Task: "Integration test for photo tile display in frontend/tests/integration/test_photo_tiles.js"
Task: "E2E test for complete user flow in frontend/tests/e2e/test_user_flow.js"

# Launch T012-T014 together (all model files):
Task: "Photo model in frontend/src/models/Photo.js"
Task: "Album model in frontend/src/models/Album.js"
Task: "Metadata model in frontend/src/models/Metadata.js"

# Launch T015-T018 together (all service files):
Task: "DatabaseManager service in frontend/src/services/DatabaseManager.js"
Task: "PhotoManager service in frontend/src/services/PhotoManager.js"
Task: "AlbumOrganizer service in frontend/src/services/AlbumOrganizer.js"
Task: "DragHandler service in frontend/src/services/DragHandler.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Use File System Access API for photos (no upload)
- SQLite runs in browser via sql.js
- All data stored locally

## Validation Checklist
*GATE: Checked before execution*

- [x] All user stories have integration tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Database schema created before models
- [x] Services created before UI components