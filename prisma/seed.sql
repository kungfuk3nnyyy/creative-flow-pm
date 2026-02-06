-- CreativeFlow PM - Seed Data
-- Kilibasi Design Studio portfolio projects
-- 3 projects from the portfolio at different lifecycle stages
-- 5 users demonstrating each role type

BEGIN;

-- ──────────────────────────────────────
-- Organization
-- ──────────────────────────────────────
INSERT INTO "Organization" ("id", "name", "slug", "address", "phone", "email", "website", "currency", "taxRateBasisPoints", "invoicePrefix", "invoiceNextNumber", "createdAt", "updatedAt")
VALUES (
  'org_kilibasi',
  'Kilibasi Design Studio',
  'kilibasi-design-studio',
  'Nairobi, Kenya',
  '+254 700 000 000',
  'studio@kilibasi.co.ke',
  'https://kilibasi.co.ke',
  'KES',
  1600,
  'KDS',
  4,
  NOW(),
  NOW()
);

-- ──────────────────────────────────────
-- Users (one per role)
-- password: password123 (bcrypt hash)
-- ──────────────────────────────────────
INSERT INTO "User" ("id", "organizationId", "email", "name", "passwordHash", "role", "isActive", "lastLoginAt", "createdAt", "updatedAt") VALUES
  ('user_admin',   'org_kilibasi', 'amani@kilibasi.co.ke',  'Amani Ochieng',  '$2a$12$LJ3a5FRiVMwbSwBm3MUOOO9dME.jkYMBjGcR9FLg9OORfpIYfVy.y', 'ADMIN',   true, '2026-02-05 10:00:00', NOW(), NOW()),
  ('user_manager', 'org_kilibasi', 'fatima@kilibasi.co.ke', 'Fatima Wanjiku',  '$2a$12$LJ3a5FRiVMwbSwBm3MUOOO9dME.jkYMBjGcR9FLg9OORfpIYfVy.y', 'MANAGER', true, '2026-02-04 14:30:00', NOW(), NOW()),
  ('user_finance', 'org_kilibasi', 'kwame@kilibasi.co.ke',  'Kwame Mwangi',   '$2a$12$LJ3a5FRiVMwbSwBm3MUOOO9dME.jkYMBjGcR9FLg9OORfpIYfVy.y', 'FINANCE', true, '2026-02-05 08:15:00', NOW(), NOW()),
  ('user_member',  'org_kilibasi', 'zuri@kilibasi.co.ke',   'Zuri Kamau',     '$2a$12$LJ3a5FRiVMwbSwBm3MUOOO9dME.jkYMBjGcR9FLg9OORfpIYfVy.y', 'MEMBER',  true, '2026-02-03 16:45:00', NOW(), NOW()),
  ('user_viewer',  'org_kilibasi', 'jabari@kilibasi.co.ke', 'Jabari Otieno',  '$2a$12$LJ3a5FRiVMwbSwBm3MUOOO9dME.jkYMBjGcR9FLg9OORfpIYfVy.y', 'VIEWER',  true, '2026-01-28 11:00:00', NOW(), NOW());

-- ──────────────────────────────────────
-- Teams
-- ──────────────────────────────────────
INSERT INTO "Team" ("id", "organizationId", "name", "description", "createdAt", "updatedAt") VALUES
  ('team_design',      'org_kilibasi', 'Design',            'Spatial design, interiors, and visual identity', NOW(), NOW()),
  ('team_fabrication', 'org_kilibasi', 'Fabrication',       'Build, installation, and on-site execution',     NOW(), NOW()),
  ('team_events',      'org_kilibasi', 'Events & Logistics','Event coordination, vendor management, and logistics', NOW(), NOW());

INSERT INTO "TeamMember" ("id", "teamId", "userId", "joinedAt") VALUES
  ('tm_1', 'team_design',      'user_admin',   NOW()),
  ('tm_2', 'team_design',      'user_member',  NOW()),
  ('tm_3', 'team_fabrication', 'user_manager', NOW()),
  ('tm_4', 'team_fabrication', 'user_member',  NOW()),
  ('tm_5', 'team_events',      'user_manager', NOW()),
  ('tm_6', 'team_events',      'user_admin',   NOW());

-- ──────────────────────────────────────
-- Vendors
-- ──────────────────────────────────────
INSERT INTO "Vendor" ("id", "organizationId", "name", "category", "email", "phone", "contactName", "rating", "isActive", "createdAt", "updatedAt") VALUES
  ('vendor_fab',       'org_kilibasi', 'Artisan Metalworks',        'FABRICATION',  'info@artisanmetal.co.ke',       '+254 711 111 111', 'Daniel Kiprono', 5, true, NOW(), NOW()),
  ('vendor_print',     'org_kilibasi', 'Nairobi Print House',       'PRINTING',     'orders@nairobiprinthouse.co.ke','+254 722 222 222', 'Grace Njeri',    4, true, NOW(), NOW()),
  ('vendor_av',        'org_kilibasi', 'SoundStage East Africa',    'AV',           'bookings@soundstage.co.ke',     '+254 733 333 333', 'Brian Omondi',   4, true, NOW(), NOW()),
  ('vendor_furniture', 'org_kilibasi', 'Heritage Timber & Craft',   'FURNITURE',    'sales@heritagetimber.co.ke',    '+254 744 444 444', 'Peter Mutua',    5, true, NOW(), NOW()),
  ('vendor_lighting',  'org_kilibasi', 'Lumen Studio Nairobi',      'LIGHTING',     'hello@lumenstudio.co.ke',       '+254 755 555 555', 'Aisha Hassan',   4, true, NOW(), NOW()),
  ('vendor_signage',   'org_kilibasi', 'SignCraft Kenya',           'SIGNAGE',      'info@signcraft.co.ke',          '+254 766 666 666', 'Joseph Wekesa',  3, true, NOW(), NOW()),
  ('vendor_catering',  'org_kilibasi', 'Savanna Kitchen Catering',  'CATERING',     'events@savannakitchen.co.ke',   '+254 777 777 777', 'Rose Wambui',    5, true, NOW(), NOW()),
  ('vendor_photo',     'org_kilibasi', 'Lens & Light Photography',  'PHOTOGRAPHY',  'book@lensandlight.co.ke',       '+254 788 888 888', 'Samuel Njoroge', 5, true, NOW(), NOW());


-- ================================================================
-- PROJECT 1: assembly event design & logistics (COMPLETED)
-- Fully completed project lifecycle with paid invoices
-- ================================================================
INSERT INTO "Project" ("id", "organizationId", "name", "description", "type", "status", "clientName", "clientEmail", "clientPhone", "clientAddress", "startDate", "endDate", "createdAt", "updatedAt")
VALUES (
  'proj_assembly_event', 'org_kilibasi',
  'assembly event design & logistics',
  'Full event design and logistics coordination for the Assembly conference. Includes venue spatial design, branded environments, schedule wall graphics, pop-up layout, and on-site coordination across a two-day programme.',
  'EXPERIENTIAL', 'COMPLETED',
  'Assembly Nairobi', 'partnerships@assembly.co.ke', '+254 700 100 100', 'The Alchemist, Westlands, Nairobi',
  '2025-09-01', '2025-10-15',
  NOW(), NOW()
);

INSERT INTO "ProjectTeam" ("id", "projectId", "teamId") VALUES
  ('pt_1a', 'proj_assembly_event', 'team_design'),
  ('pt_1b', 'proj_assembly_event', 'team_events');

INSERT INTO "ProjectVendor" ("id", "projectId", "vendorId") VALUES
  ('pv_1a', 'proj_assembly_event', 'vendor_print'),
  ('pv_1b', 'proj_assembly_event', 'vendor_av'),
  ('pv_1c', 'proj_assembly_event', 'vendor_signage'),
  ('pv_1d', 'proj_assembly_event', 'vendor_catering'),
  ('pv_1e', 'proj_assembly_event', 'vendor_photo');

-- Project 1 milestones
INSERT INTO "Milestone" ("id", "projectId", "name", "description", "sortOrder", "dueDate", "completedAt", "createdAt", "updatedAt") VALUES
  ('ms_1_concept',    'proj_assembly_event', 'Concept & spatial planning',     'Initial venue walkthrough, concept development, and spatial layout planning',               0, '2025-09-10', '2025-09-09', NOW(), NOW()),
  ('ms_1_production', 'proj_assembly_event', 'Production & fabrication',       'Produce all branded elements, schedule wall, signage, and rug layout',                       1, '2025-09-28', '2025-09-27', NOW(), NOW()),
  ('ms_1_event',      'proj_assembly_event', 'Event execution & wrap-up',      'On-site installation, event day coordination, and post-event teardown',                       2, '2025-10-15', '2025-10-14', NOW(), NOW());

-- Project 1 tasks (all DONE)
INSERT INTO "Task" ("id", "milestoneId", "title", "status", "priority", "assigneeId", "creatorId", "dueDate", "completedAt", "sortOrder", "createdAt", "updatedAt") VALUES
  ('task_1_1',  'ms_1_concept',    'Venue site survey and measurements',                       'DONE', 'HIGH',   'user_admin',   'user_admin',   '2025-09-03', '2025-09-02', 0, NOW(), NOW()),
  ('task_1_2',  'ms_1_concept',    'Develop spatial layout for ground floor zones',             'DONE', 'HIGH',   'user_member',  'user_admin',   '2025-09-07', '2025-09-06', 1, NOW(), NOW()),
  ('task_1_3',  'ms_1_concept',    'Present concept boards to client',                         'DONE', 'MEDIUM', 'user_admin',   'user_admin',   '2025-09-10', '2025-09-09', 2, NOW(), NOW()),
  ('task_1_4',  'ms_1_production', 'Design and produce schedule wall graphics',                'DONE', 'HIGH',   'user_member',  'user_admin',   '2025-09-18', '2025-09-17', 0, NOW(), NOW()),
  ('task_1_5',  'ms_1_production', 'Order large-format prints for branded walls',              'DONE', 'HIGH',   'user_manager', 'user_admin',   '2025-09-15', '2025-09-14', 1, NOW(), NOW()),
  ('task_1_6',  'ms_1_production', 'Coordinate AV setup requirements with venue',              'DONE', 'MEDIUM', 'user_manager', 'user_manager', '2025-09-20', '2025-09-19', 2, NOW(), NOW()),
  ('task_1_7',  'ms_1_production', 'Source and arrange patterned rugs for courtyard',          'DONE', 'MEDIUM', 'user_member',  'user_admin',   '2025-09-25', '2025-09-24', 3, NOW(), NOW()),
  ('task_1_8',  'ms_1_event',      'On-site installation day 1 (signage, rugs, furniture)',    'DONE', 'URGENT', 'user_manager', 'user_admin',   '2025-10-03', '2025-10-03', 0, NOW(), NOW()),
  ('task_1_9',  'ms_1_event',      'Event day coordination and troubleshooting',               'DONE', 'URGENT', 'user_manager', 'user_manager', '2025-10-05', '2025-10-05', 1, NOW(), NOW()),
  ('task_1_10', 'ms_1_event',      'Post-event teardown and asset return',                     'DONE', 'HIGH',   'user_member',  'user_manager', '2025-10-08', '2025-10-07', 2, NOW(), NOW()),
  ('task_1_11', 'ms_1_event',      'Final photo documentation and client handover',            'DONE', 'MEDIUM', 'user_admin',   'user_admin',   '2025-10-15', '2025-10-14', 3, NOW(), NOW());

-- Project 1 budget (KES 1,850,000)
INSERT INTO "Budget" ("id", "projectId", "totalAmountCents", "approvedAt", "approvedById", "notes", "createdAt", "updatedAt")
VALUES ('budget_1', 'proj_assembly_event', 185000000, '2025-09-02', 'user_admin', 'Approved budget for full event design and logistics scope', NOW(), NOW());

INSERT INTO "BudgetCategory" ("id", "budgetId", "name", "allocatedCents", "sortOrder") VALUES
  ('bc_1_print',       'budget_1', 'Printing & graphics',            45000000, 0),
  ('bc_1_av',          'budget_1', 'AV equipment',                   35000000, 1),
  ('bc_1_catering',    'budget_1', 'Catering & hospitality',         40000000, 2),
  ('bc_1_signage',     'budget_1', 'Signage & wayfinding',           25000000, 3),
  ('bc_1_photo',       'budget_1', 'Photography & documentation',    15000000, 4),
  ('bc_1_contingency', 'budget_1', 'Contingency',                    25000000, 5);

-- Project 1 expenses (all approved/reimbursed)
INSERT INTO "Expense" ("id", "organizationId", "projectId", "budgetCategoryId", "vendorId", "description", "amountCents", "date", "status", "submittedById", "approvedById", "approvedAt", "createdAt", "updatedAt") VALUES
  ('exp_1_1', 'org_kilibasi', 'proj_assembly_event', 'bc_1_print',    'vendor_print',    'Large-format wall prints (schedule wall, branded panels)',                        42000000, '2025-09-15', 'REIMBURSED', 'user_manager', 'user_finance', '2025-09-16', NOW(), NOW()),
  ('exp_1_2', 'org_kilibasi', 'proj_assembly_event', 'bc_1_av',       'vendor_av',       'PA system and stage lighting rental (2-day event)',                               32000000, '2025-09-28', 'REIMBURSED', 'user_manager', 'user_finance', '2025-09-29', NOW(), NOW()),
  ('exp_1_3', 'org_kilibasi', 'proj_assembly_event', 'bc_1_catering', 'vendor_catering', 'Catering for 2-day event (day 1 and day 2 lunch, mixer refreshments)',            38500000, '2025-10-01', 'REIMBURSED', 'user_manager', 'user_finance', '2025-10-02', NOW(), NOW()),
  ('exp_1_4', 'org_kilibasi', 'proj_assembly_event', 'bc_1_signage',  'vendor_signage',  'Directional signage, entrance banner, and floor plan boards',                     22000000, '2025-09-20', 'APPROVED',   'user_member',  'user_finance', '2025-09-21', NOW(), NOW()),
  ('exp_1_5', 'org_kilibasi', 'proj_assembly_event', 'bc_1_photo',    'vendor_photo',    'Event photography (2 days) and edited deliverables',                              14000000, '2025-10-05', 'REIMBURSED', 'user_admin',   'user_finance', '2025-10-08', NOW(), NOW());

-- Project 1 invoice (fully paid)
INSERT INTO "Invoice" ("id", "organizationId", "projectId", "invoiceNumber", "clientName", "clientEmail", "clientAddress", "issueDate", "dueDate", "paymentTerms", "status", "subtotalCents", "taxRateBasisPoints", "taxAmountCents", "totalCents", "balanceDueCents", "sentAt", "viewedAt", "paidAt", "notes", "createdAt", "updatedAt")
VALUES (
  'inv_1', 'org_kilibasi', 'proj_assembly_event',
  'KDS-001', 'Assembly Nairobi', 'finance@assembly.co.ke', 'The Alchemist, Westlands, Nairobi',
  '2025-10-10', '2025-11-09', 'NET_30', 'PAID',
  215000000, 1600, 34400000, 249400000, 0,
  '2025-10-10', '2025-10-11', '2025-10-28',
  'Final invoice for Assembly event design and logistics',
  NOW(), NOW()
);

INSERT INTO "InvoiceLineItem" ("id", "invoiceId", "description", "quantityThousandths", "unitPriceCents", "amountCents", "sortOrder") VALUES
  ('ili_1_1', 'inv_1', 'Event spatial design and concept development',         1000, 75000000, 75000000, 0),
  ('ili_1_2', 'inv_1', 'Production management and vendor coordination',        1000, 50000000, 50000000, 1),
  ('ili_1_3', 'inv_1', 'On-site event coordination (2 days)',                  2000, 25000000, 50000000, 2),
  ('ili_1_4', 'inv_1', 'Branded environment elements and installation',        1000, 40000000, 40000000, 3);

INSERT INTO "Payment" ("id", "invoiceId", "amountCents", "paymentDate", "paymentMethod", "reference", "notes", "createdAt")
VALUES ('pay_1_1', 'inv_1', 249400000, '2025-10-28', 'bank_transfer', 'TXN-ASM-2025-1028', 'Full payment received', NOW());

-- Project 1 comments
INSERT INTO "Comment" ("id", "projectId", "authorId", "content", "createdAt", "updatedAt") VALUES
  ('comment_1_1', 'proj_assembly_event', 'user_admin',   'Site walkthrough completed. The courtyard works well for the main gathering space. Patterned rugs will define the zones effectively.',                 '2025-09-02 14:30:00', NOW()),
  ('comment_1_2', 'proj_assembly_event', 'user_manager', 'Schedule wall graphics are at the printer. Turnaround is 5 business days. We should have them by the 20th.',                                           '2025-09-15 09:00:00', NOW()),
  ('comment_1_3', 'proj_assembly_event', 'user_finance', 'All vendor invoices processed and reconciled. Project came in under budget by KES 370,000.',                                                            '2025-10-20 11:00:00', NOW());


-- ================================================================
-- PROJECT 2: adidas x assembly design lab (ACTIVE)
-- Active in-progress project with mixed task statuses
-- ================================================================
INSERT INTO "Project" ("id", "organizationId", "name", "description", "type", "status", "clientName", "clientEmail", "clientPhone", "clientAddress", "startDate", "endDate", "createdAt", "updatedAt")
VALUES (
  'proj_adidas_lab', 'org_kilibasi',
  'adidas x assembly design lab',
  'Collaborative design lab activation in partnership with adidas Originals at the Assembly venue. Features a screen printing workshop, custom apparel station, brand installation wall, and creative lounge space.',
  'EXHIBITION', 'ACTIVE',
  'adidas East Africa', 'activations@adidas.co.ke', '+254 700 200 200', 'adidas East Africa, Westlands, Nairobi',
  '2026-01-15', '2026-03-15',
  NOW(), NOW()
);

INSERT INTO "ProjectTeam" ("id", "projectId", "teamId") VALUES
  ('pt_2a', 'proj_adidas_lab', 'team_design'),
  ('pt_2b', 'proj_adidas_lab', 'team_fabrication');

INSERT INTO "ProjectVendor" ("id", "projectId", "vendorId") VALUES
  ('pv_2a', 'proj_adidas_lab', 'vendor_fab'),
  ('pv_2b', 'proj_adidas_lab', 'vendor_print'),
  ('pv_2c', 'proj_adidas_lab', 'vendor_photo'),
  ('pv_2d', 'proj_adidas_lab', 'vendor_signage');

-- Project 2 milestones
INSERT INTO "Milestone" ("id", "projectId", "name", "description", "sortOrder", "dueDate", "completedAt", "createdAt", "updatedAt") VALUES
  ('ms_2_design', 'proj_adidas_lab', 'Creative direction & design',  'Develop visual identity and spatial design for the design lab',                                    0, '2026-01-31', '2026-01-29', NOW(), NOW()),
  ('ms_2_build',  'proj_adidas_lab', 'Build & fabrication',          'Screen print station setup, brand wall construction, and furniture sourcing',                        1, '2026-02-15', NULL,          NOW(), NOW()),
  ('ms_2_launch', 'proj_adidas_lab', 'Lab launch & activation',      'Opening event, workshop facilitation, and content capture',                                          2, '2026-03-01', NULL,          NOW(), NOW());

-- Project 2 tasks (mixed statuses)
INSERT INTO "Task" ("id", "milestoneId", "title", "status", "priority", "assigneeId", "creatorId", "dueDate", "completedAt", "sortOrder", "createdAt", "updatedAt") VALUES
  ('task_2_1',  'ms_2_design', 'Research adidas Originals brand guidelines and trefoil identity',   'DONE',        'HIGH',   'user_admin',   'user_admin',   '2026-01-20', '2026-01-19', 0, NOW(), NOW()),
  ('task_2_2',  'ms_2_design', 'Design lab spatial layout and zone mapping',                        'DONE',        'HIGH',   'user_member',  'user_admin',   '2026-01-25', '2026-01-24', 1, NOW(), NOW()),
  ('task_2_3',  'ms_2_design', 'Create mood boards for workshop and lounge areas',                  'DONE',        'MEDIUM', 'user_member',  'user_admin',   '2026-01-28', '2026-01-27', 2, NOW(), NOW()),
  ('task_2_4',  'ms_2_build',  'Fabricate custom screen printing station',                          'IN_PROGRESS', 'HIGH',   'user_manager', 'user_admin',   '2026-02-08', NULL,          0, NOW(), NOW()),
  ('task_2_5',  'ms_2_build',  'Construct trefoil brand wall (large-scale logo installation)',      'IN_PROGRESS', 'HIGH',   'user_member',  'user_manager', '2026-02-10', NULL,          1, NOW(), NOW()),
  ('task_2_6',  'ms_2_build',  'Source vintage leather sofa and lounge furniture',                  'DONE',        'MEDIUM', 'user_manager', 'user_admin',   '2026-02-05', '2026-02-04', 2, NOW(), NOW()),
  ('task_2_7',  'ms_2_build',  'Print custom t-shirt blanks with adidas co-branding',              'REVIEW',      'HIGH',   'user_member',  'user_manager', '2026-02-12', NULL,          3, NOW(), NOW()),
  ('task_2_8',  'ms_2_build',  'Install patterned rugs and floor treatment',                       'TODO',        'MEDIUM', 'user_member',  'user_admin',   '2026-02-14', NULL,          4, NOW(), NOW()),
  ('task_2_9',  'ms_2_launch', 'Coordinate launch event guest list and invitations',               'TODO',        'HIGH',   'user_manager', 'user_admin',   '2026-02-20', NULL,          0, NOW(), NOW()),
  ('task_2_10', 'ms_2_launch', 'Brief photographer and videographer for content capture',          'TODO',        'MEDIUM', 'user_admin',   'user_admin',   '2026-02-22', NULL,          1, NOW(), NOW()),
  ('task_2_11', 'ms_2_launch', 'Prepare workshop materials (screens, inks, stencils)',             'TODO',        'HIGH',   'user_member',  'user_manager', '2026-02-25', NULL,          2, NOW(), NOW());

-- Project 2 budget (KES 2,400,000)
INSERT INTO "Budget" ("id", "projectId", "totalAmountCents", "approvedAt", "approvedById", "notes", "createdAt", "updatedAt")
VALUES ('budget_2', 'proj_adidas_lab', 240000000, '2026-01-16', 'user_admin', 'Approved budget includes adidas co-funding contribution', NOW(), NOW());

INSERT INTO "BudgetCategory" ("id", "budgetId", "name", "allocatedCents", "sortOrder") VALUES
  ('bc_2_fab',         'budget_2', 'Fabrication & build',         80000000, 0),
  ('bc_2_print',       'budget_2', 'Print & apparel production',  55000000, 1),
  ('bc_2_furniture',   'budget_2', 'Furniture & fixtures',        35000000, 2),
  ('bc_2_signage',     'budget_2', 'Signage & branding',          30000000, 3),
  ('bc_2_photo',       'budget_2', 'Photography & content',       20000000, 4),
  ('bc_2_contingency', 'budget_2', 'Contingency',                 20000000, 5);

-- Project 2 expenses (mixed statuses)
INSERT INTO "Expense" ("id", "organizationId", "projectId", "budgetCategoryId", "vendorId", "description", "amountCents", "date", "status", "submittedById", "approvedById", "approvedAt", "notes", "createdAt", "updatedAt") VALUES
  ('exp_2_1', 'org_kilibasi', 'proj_adidas_lab', 'bc_2_fab',       'vendor_fab',     'Screen printing station - steel frame fabrication',                      35000000, '2026-01-25', 'APPROVED',  'user_manager', 'user_finance', '2026-01-26', NULL,                                                      NOW(), NOW()),
  ('exp_2_2', 'org_kilibasi', 'proj_adidas_lab', 'bc_2_print',     'vendor_print',   'Custom blank t-shirts (200 units, black and white)',                     28000000, '2026-01-30', 'APPROVED',  'user_member',  'user_finance', '2026-01-31', NULL,                                                      NOW(), NOW()),
  ('exp_2_3', 'org_kilibasi', 'proj_adidas_lab', 'bc_2_furniture', 'vendor_furniture','Vintage leather sofa and wooden side tables for lounge area',            32000000, '2026-02-03', 'SUBMITTED', 'user_manager', NULL,           NULL,          NULL,                                                      NOW(), NOW()),
  ('exp_2_4', 'org_kilibasi', 'proj_adidas_lab', 'bc_2_signage',   'vendor_signage', 'Large-scale trefoil logo vinyl cut and brand wall elements',             18000000, '2026-02-04', 'DRAFT',     'user_member',  NULL,           NULL,          'Waiting for final artwork approval from adidas brand team', NOW(), NOW());

-- Project 2 invoice (partially paid)
INSERT INTO "Invoice" ("id", "organizationId", "projectId", "invoiceNumber", "clientName", "clientEmail", "clientAddress", "issueDate", "dueDate", "paymentTerms", "status", "subtotalCents", "taxRateBasisPoints", "taxAmountCents", "totalCents", "balanceDueCents", "sentAt", "viewedAt", "notes", "createdAt", "updatedAt")
VALUES (
  'inv_2', 'org_kilibasi', 'proj_adidas_lab',
  'KDS-002', 'adidas East Africa', 'accounts@adidas.co.ke', 'adidas East Africa, Westlands, Nairobi',
  '2026-01-20', '2026-02-19', 'MILESTONE', 'PARTIALLY_PAID',
  280000000, 1600, 44800000, 324800000, 162400000,
  '2026-01-20', '2026-01-21',
  'Milestone-based billing: 50% on design approval, 50% on lab launch',
  NOW(), NOW()
);

INSERT INTO "InvoiceLineItem" ("id", "invoiceId", "description", "quantityThousandths", "unitPriceCents", "amountCents", "sortOrder") VALUES
  ('ili_2_1', 'inv_2', 'Design lab creative direction and spatial design',                  1000, 90000000, 90000000, 0),
  ('ili_2_2', 'inv_2', 'Fabrication and build (screen print station, brand wall)',          1000, 85000000, 85000000, 1),
  ('ili_2_3', 'inv_2', 'Workshop facilitation and activation management',                   1000, 60000000, 60000000, 2),
  ('ili_2_4', 'inv_2', 'Content production and documentation',                              1000, 45000000, 45000000, 3);

INSERT INTO "Payment" ("id", "invoiceId", "amountCents", "paymentDate", "paymentMethod", "reference", "notes", "createdAt")
VALUES ('pay_2_1', 'inv_2', 162400000, '2026-01-30', 'bank_transfer', 'TXN-ADI-2026-0130', 'Milestone 1 payment - design phase completion (50%)', NOW());

-- Project 2 comments
INSERT INTO "Comment" ("id", "projectId", "authorId", "content", "createdAt", "updatedAt") VALUES
  ('comment_2_1', 'proj_adidas_lab', 'user_admin',   'adidas brand team approved the spatial layout and mood boards. Moving to fabrication phase. The trefoil wall piece needs to be at minimum 2m tall for visual impact.',                    '2026-01-29 16:00:00', NOW()),
  ('comment_2_2', 'proj_adidas_lab', 'user_manager', 'Screen printing station frame is with the fabricator. Expected delivery Feb 8. We need to coordinate the vinyl graphics timeline with SignCraft to align.',                                '2026-02-03 10:30:00', NOW()),
  ('comment_2_3', 'proj_adidas_lab', 'user_member',  'T-shirt blanks arrived - 100 black, 100 white. Quality is good. Need to finalize the screen print designs with the adidas team before we start production.',                              '2026-02-05 14:15:00', NOW());


-- ================================================================
-- PROJECT 3: mid century style bar & boutique design & build
-- for kaliworks (DRAFT)
-- Early-stage project with budget planning, no expenses
-- ================================================================
INSERT INTO "Project" ("id", "organizationId", "name", "description", "type", "status", "clientName", "clientEmail", "clientPhone", "clientAddress", "startDate", "endDate", "createdAt", "updatedAt")
VALUES (
  'proj_kaliworks', 'org_kilibasi',
  'mid century style bar & boutique design & build for kaliworks',
  'Full interior design and build-out for Kaliworks, a mid-century modern style bar and boutique space. Includes arched ceiling detail work, Portuguese-inspired tile bar front, custom timber furniture, brass fixture sourcing, and full fit-out.',
  'INTERIOR_DESIGN', 'DRAFT',
  'Kaliworks Ltd', 'hello@kaliworks.co.ke', '+254 700 300 300', 'Industrial Area, Nairobi',
  '2026-02-15', '2026-06-30',
  NOW(), NOW()
);

INSERT INTO "ProjectTeam" ("id", "projectId", "teamId") VALUES
  ('pt_3a', 'proj_kaliworks', 'team_design'),
  ('pt_3b', 'proj_kaliworks', 'team_fabrication');

INSERT INTO "ProjectVendor" ("id", "projectId", "vendorId") VALUES
  ('pv_3a', 'proj_kaliworks', 'vendor_fab'),
  ('pv_3b', 'proj_kaliworks', 'vendor_furniture'),
  ('pv_3c', 'proj_kaliworks', 'vendor_lighting');

-- Project 3 milestones
INSERT INTO "Milestone" ("id", "projectId", "name", "description", "sortOrder", "dueDate", "completedAt", "createdAt", "updatedAt") VALUES
  ('ms_3_design',      'proj_kaliworks', 'Design development & client approval',  'Concept refinement, material selection, and client sign-off on design direction',   0, '2026-03-15', NULL, NOW(), NOW()),
  ('ms_3_procurement', 'proj_kaliworks', 'Procurement & custom fabrication',       'Order materials, begin custom furniture fabrication and fixture sourcing',           1, '2026-04-30', NULL, NOW(), NOW()),
  ('ms_3_install',     'proj_kaliworks', 'Installation & fit-out',                 'On-site build, installation, and final styling',                                    2, '2026-06-15', NULL, NOW(), NOW());

-- Project 3 tasks (all TODO - early stage)
INSERT INTO "Task" ("id", "milestoneId", "title", "description", "status", "priority", "assigneeId", "creatorId", "dueDate", "sortOrder", "createdAt", "updatedAt") VALUES
  ('task_3_1',  'ms_3_design',      'Site survey and existing conditions documentation',              NULL,                                                                                                              'TODO', 'HIGH',   'user_admin',   'user_admin',   '2026-02-20', 0, NOW(), NOW()),
  ('task_3_2',  'ms_3_design',      'Develop mid-century design concept and material palette',        'Focus on Portuguese-inspired tile patterns, warm timber tones, brass accents, and arched architectural details',   'TODO', 'HIGH',   'user_member',  'user_admin',   '2026-02-28', 1, NOW(), NOW()),
  ('task_3_3',  'ms_3_design',      'Source Portuguese ceramic tile samples for bar front',           NULL,                                                                                                              'TODO', 'MEDIUM', 'user_manager', 'user_admin',   '2026-03-05', 2, NOW(), NOW()),
  ('task_3_4',  'ms_3_design',      'Present design package to client for approval',                  NULL,                                                                                                              'TODO', 'HIGH',   'user_admin',   'user_admin',   '2026-03-15', 3, NOW(), NOW()),
  ('task_3_5',  'ms_3_procurement', 'Order Portuguese ceramic tiles for bar front and floor accent',  NULL,                                                                                                              'TODO', 'HIGH',   'user_manager', 'user_admin',   '2026-03-20', 0, NOW(), NOW()),
  ('task_3_6',  'ms_3_procurement', 'Commission custom timber tables and bench seating',              NULL,                                                                                                              'TODO', 'HIGH',   'user_manager', 'user_admin',   '2026-03-25', 1, NOW(), NOW()),
  ('task_3_7',  'ms_3_procurement', 'Source brass light fixtures and wall sconces',                   NULL,                                                                                                              'TODO', 'MEDIUM', 'user_member',  'user_admin',   '2026-04-05', 2, NOW(), NOW()),
  ('task_3_8',  'ms_3_procurement', 'Fabricate custom bar counter with tile inlay',                   NULL,                                                                                                              'TODO', 'HIGH',   'user_manager', 'user_manager', '2026-04-25', 3, NOW(), NOW()),
  ('task_3_9',  'ms_3_install',     'Arch ceiling detail construction and finishing',                  NULL,                                                                                                              'TODO', 'HIGH',   'user_manager', 'user_admin',   '2026-05-15', 0, NOW(), NOW()),
  ('task_3_10', 'ms_3_install',     'Tile installation (bar front and floor accents)',                 NULL,                                                                                                              'TODO', 'HIGH',   'user_manager', 'user_admin',   '2026-05-25', 1, NOW(), NOW()),
  ('task_3_11', 'ms_3_install',     'Furniture placement and lighting installation',                   NULL,                                                                                                              'TODO', 'MEDIUM', 'user_member',  'user_admin',   '2026-06-05', 2, NOW(), NOW()),
  ('task_3_12', 'ms_3_install',     'Final styling, accessorizing, and client walkthrough',            NULL,                                                                                                              'TODO', 'MEDIUM', 'user_admin',   'user_admin',   '2026-06-15', 3, NOW(), NOW());

-- Project 3 budget (KES 4,200,000)
INSERT INTO "Budget" ("id", "projectId", "totalAmountCents", "notes", "createdAt", "updatedAt")
VALUES ('budget_3', 'proj_kaliworks', 420000000, 'Preliminary budget - pending client approval before project activation', NOW(), NOW());

INSERT INTO "BudgetCategory" ("id", "budgetId", "name", "allocatedCents", "sortOrder") VALUES
  ('bc_3_tile',        'budget_3', 'Ceramic tiles and floor materials',  85000000,  0),
  ('bc_3_furniture',   'budget_3', 'Custom furniture and seating',       95000000,  1),
  ('bc_3_lighting',    'budget_3', 'Lighting and electrical fixtures',   45000000,  2),
  ('bc_3_build',       'budget_3', 'Construction and build-out',         120000000, 3),
  ('bc_3_design',      'budget_3', 'Design fees',                        50000000,  4),
  ('bc_3_contingency', 'budget_3', 'Contingency',                        25000000,  5);

-- Project 3 draft invoice (deposit, not yet sent)
INSERT INTO "Invoice" ("id", "organizationId", "projectId", "invoiceNumber", "clientName", "clientEmail", "clientAddress", "issueDate", "dueDate", "paymentTerms", "status", "subtotalCents", "taxRateBasisPoints", "taxAmountCents", "totalCents", "balanceDueCents", "notes", "createdAt", "updatedAt")
VALUES (
  'inv_3', 'org_kilibasi', 'proj_kaliworks',
  'KDS-003', 'Kaliworks Ltd', 'accounts@kaliworks.co.ke', 'Industrial Area, Nairobi',
  '2026-02-10', '2026-02-24', 'DUE_ON_RECEIPT', 'DRAFT',
  150000000, 1600, 24000000, 174000000, 174000000,
  'Deposit invoice - 30% of estimated project value. To be sent upon client sign-off.',
  NOW(), NOW()
);

INSERT INTO "InvoiceLineItem" ("id", "invoiceId", "description", "quantityThousandths", "unitPriceCents", "amountCents", "sortOrder") VALUES
  ('ili_3_1', 'inv_3', 'Design development deposit (30% of design fees)',                        1000, 50000000,  50000000,  0),
  ('ili_3_2', 'inv_3', 'Material procurement deposit (advance for tile and timber orders)',       1000, 100000000, 100000000, 1);

-- Project 3 comments
INSERT INTO "Comment" ("id", "projectId", "authorId", "content", "createdAt", "updatedAt") VALUES
  ('comment_3_1', 'proj_kaliworks', 'user_admin',  'Met with the Kaliworks team on-site. The space has great bones - the arched ceiling is original and sets the tone for the mid-century direction. Need to work around the existing plumbing layout for the bar position.', '2026-02-01 15:00:00', NOW()),
  ('comment_3_2', 'proj_kaliworks', 'user_viewer', 'Reviewing the initial budget breakdown. The ceramic tile allocation looks reasonable but we should get at least 3 quotes for the Portuguese imports to ensure competitive pricing.',                                       '2026-02-04 09:30:00', NOW());


-- ──────────────────────────────────────
-- Activity Logs
-- ──────────────────────────────────────
INSERT INTO "ActivityLog" ("id", "organizationId", "projectId", "userId", "action", "entityType", "entityId", "metadata", "createdAt") VALUES
  ('al_1', 'org_kilibasi', 'proj_assembly_event', 'user_admin',   'project.created',        'Project', 'proj_assembly_event', NULL,                                                           '2025-09-01 09:00:00'),
  ('al_2', 'org_kilibasi', 'proj_assembly_event', 'user_admin',   'project.status_changed', 'Project', 'proj_assembly_event', '{"from": "DRAFT", "to": "ACTIVE"}',                           '2025-09-01 09:05:00'),
  ('al_3', 'org_kilibasi', 'proj_assembly_event', 'user_finance', 'expense.approved',       'Expense', 'exp_1_1',             NULL,                                                           '2025-09-16 10:00:00'),
  ('al_4', 'org_kilibasi', 'proj_assembly_event', 'user_admin',   'project.status_changed', 'Project', 'proj_assembly_event', '{"from": "ACTIVE", "to": "COMPLETED"}',                       '2025-10-15 17:00:00'),
  ('al_5', 'org_kilibasi', 'proj_adidas_lab',     'user_admin',   'project.created',        'Project', 'proj_adidas_lab',     NULL,                                                           '2026-01-15 08:00:00'),
  ('al_6', 'org_kilibasi', 'proj_adidas_lab',     'user_admin',   'project.status_changed', 'Project', 'proj_adidas_lab',     '{"from": "DRAFT", "to": "ACTIVE"}',                           '2026-01-15 08:10:00'),
  ('al_7', 'org_kilibasi', 'proj_adidas_lab',     'user_finance', 'payment.recorded',       'Payment', 'pay_2_1',             '{"amountCents": 162400000, "invoiceNumber": "KDS-002"}',       '2026-01-30 14:00:00'),
  ('al_8', 'org_kilibasi', 'proj_kaliworks',      'user_admin',   'project.created',        'Project', 'proj_kaliworks',      NULL,                                                           '2026-02-01 10:00:00');

COMMIT;
